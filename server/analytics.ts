import { db } from "./db";
import { 
  userSessions, 
  pageEvents, 
  abTests, 
  abTestAssignments, 
  leadScores, 
  leadActions,
  waitlistEntries,
  type InsertUserSession,
  type InsertPageEvent,
  type InsertLeadAction
} from "@shared/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export class AnalyticsService {
  // Session Management
  async createSession(sessionData: InsertUserSession) {
    try {
      const [session] = await db
        .insert(userSessions)
        .values(sessionData)
        .returning();
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }

  async updateSessionActivity(sessionId: string) {
    try {
      await db
        .update(userSessions)
        .set({ lastActivity: new Date() })
        .where(eq(userSessions.sessionId, sessionId));
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  // Event Tracking
  async trackEvent(eventData: InsertPageEvent) {
    try {
      const [event] = await db
        .insert(pageEvents)
        .values(eventData)
        .returning();
      
      // Update session activity
      await this.updateSessionActivity(eventData.sessionId);
      
      return event;
    } catch (error) {
      console.error('Failed to track event:', error);
      return null;
    }
  }

  // A/B Testing
  async getActiveTests() {
    try {
      return await db
        .select()
        .from(abTests)
        .where(eq(abTests.isActive, true));
    } catch (error) {
      console.error('Failed to get active tests:', error);
      return [];
    }
  }

  async assignToTest(sessionId: string, testId: number, variant: string) {
    try {
      const [assignment] = await db
        .insert(abTestAssignments)
        .values({ sessionId, testId, variant })
        .returning();
      return assignment;
    } catch (error) {
      console.error('Failed to assign to test:', error);
      return null;
    }
  }

  async getTestAssignment(sessionId: string, testName: string) {
    try {
      const [assignment] = await db
        .select({
          variant: abTestAssignments.variant,
          testName: abTests.testName,
        })
        .from(abTestAssignments)
        .innerJoin(abTests, eq(abTestAssignments.testId, abTests.id))
        .where(
          and(
            eq(abTestAssignments.sessionId, sessionId),
            eq(abTests.testName, testName),
            eq(abTests.isActive, true)
          )
        );
      return assignment?.variant || null;
    } catch (error) {
      console.error('Failed to get test assignment:', error);
      return null;
    }
  }

  // Lead Scoring and Qualification
  async trackLeadAction(actionData: InsertLeadAction) {
    try {
      // Calculate score impact based on action type
      const scoreImpact = this.calculateScoreImpact(actionData.actionType, actionData.actionValue);
      
      const [action] = await db
        .insert(leadActions)
        .values({ ...actionData, scoreImpact })
        .returning();

      // Update lead score
      await this.updateLeadScore(actionData.sessionId);
      
      return action;
    } catch (error) {
      console.error('Failed to track lead action:', error);
      return null;
    }
  }

  private calculateScoreImpact(actionType: string, actionValue?: string | null): number {
    const scoreMap: Record<string, number> = {
      'page_view': 1,
      'scroll_50': 3,
      'scroll_75': 5,
      'calculator_use': 15,
      'form_focus': 8,
      'cta_click': 12,
      'email_fill': 25,
      'video_watch': 10,
      'multiple_pages': 7,
      'return_visit': 10,
    };

    let baseScore = scoreMap[actionType] || 0;

    // Bonus for quality indicators
    if (actionType === 'email_fill' && actionValue) {
      const domain = actionValue.split('@')[1]?.toLowerCase() || '';
      const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      if (!businessDomains.includes(domain)) {
        baseScore += 15; // Bonus for business email
      }
    }

    return baseScore;
  }

  async updateLeadScore(sessionId: string) {
    try {
      // Calculate total score from all actions
      const [scoreData] = await db
        .select({
          totalScore: sql<number>`SUM(${leadActions.scoreImpact})`,
          actionCount: sql<number>`COUNT(*)`,
        })
        .from(leadActions)
        .where(eq(leadActions.sessionId, sessionId));

      const totalScore = Math.round(scoreData?.totalScore || 0);
      const engagementScore = Math.min(totalScore, 100); // Cap at 100
      const intentScore = Math.round(await this.calculateIntentScoreAsync(sessionId));
      const qualityScore = Math.round(await this.calculateQualityScore(sessionId));

      // Upsert lead score
      const existingScore = await db
        .select()
        .from(leadScores)
        .where(eq(leadScores.sessionId, sessionId))
        .limit(1);

      if (existingScore.length > 0) {
        await db
          .update(leadScores)
          .set({
            totalScore,
            engagementScore,
            intentScore,
            qualityScore,
            lastCalculated: new Date(),
          })
          .where(eq(leadScores.sessionId, sessionId));
      } else {
        await db
          .insert(leadScores)
          .values({
            sessionId,
            totalScore,
            engagementScore,
            intentScore,
            qualityScore,
          });
      }

    } catch (error) {
      console.error('Failed to update lead score:', error);
    }
  }

  private async calculateIntentScoreAsync(sessionId: string): Promise<number> {
    try {
      const [intentData] = await db
        .select({
          ctaClicks: sql<number>`COUNT(CASE WHEN ${pageEvents.eventType} = 'cta_click' THEN 1 END)`,
          formFocus: sql<number>`COUNT(CASE WHEN ${pageEvents.eventType} = 'form_focus' THEN 1 END)`,
          calculatorUse: sql<number>`COUNT(CASE WHEN ${pageEvents.elementId} LIKE '%calculator%' THEN 1 END)`,
        })
        .from(pageEvents)
        .where(eq(pageEvents.sessionId, sessionId));

      const ctaScore = (intentData?.ctaClicks || 0) * 20;
      const formScore = (intentData?.formFocus || 0) * 15;
      const calcScore = (intentData?.calculatorUse || 0) * 25;

      return Math.min(ctaScore + formScore + calcScore, 100);
    } catch (error) {
      console.error('Failed to calculate intent score:', error);
      return 0;
    }
  }

  private async calculateQualityScore(sessionId: string): Promise<number> {
    try {
      const [qualityData] = await db
        .select({
          timeOnSite: sql<number>`EXTRACT(EPOCH FROM (MAX(${pageEvents.timestamp}) - MIN(${pageEvents.timestamp})))`,
          pageViews: sql<number>`COUNT(DISTINCT CASE WHEN ${pageEvents.eventType} = 'page_view' THEN ${pageEvents.pagePath} END)`,
          maxScroll: sql<number>`MAX(${pageEvents.scrollDepth})`,
        })
        .from(pageEvents)
        .where(eq(pageEvents.sessionId, sessionId));

      const timeScore = Math.min((qualityData?.timeOnSite || 0) / 60 * 10, 40); // 10 points per minute, max 40
      const pageScore = Math.min((qualityData?.pageViews || 0) * 15, 30); // 15 points per page, max 30
      const scrollScore = Math.min((qualityData?.maxScroll || 0) / 10, 30); // Max 30 for full scroll

      return Math.round(Math.min(timeScore + pageScore + scrollScore, 100));
    } catch (error) {
      console.error('Failed to calculate quality score:', error);
      return 0;
    }
  }

  // Analytics Queries
  async getSessionAnalytics(timeframe: 'day' | 'week' | 'month' = 'day') {
    try {
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [analytics] = await db
        .select({
          totalSessions: sql<number>`COUNT(*)::int`,
          uniqueUsers: sql<number>`COUNT(DISTINCT ${userSessions.userId})::int`,
          avgTimeOnSite: sql<number>`ROUND(AVG(EXTRACT(EPOCH FROM (${userSessions.lastActivity} - ${userSessions.createdAt}))))::int`,
          bounceRate: sql<number>`ROUND(COUNT(CASE WHEN ${userSessions.lastActivity} = ${userSessions.createdAt} THEN 1 END) * 100.0 / COUNT(*))::int`,
        })
        .from(userSessions)
        .where(gte(userSessions.createdAt, since));

      return analytics;
    } catch (error) {
      console.error('Failed to get session analytics:', error);
      return {
        totalSessions: 0,
        uniqueUsers: 0,
        avgTimeOnSite: 0,
        bounceRate: 0,
      };
    }
  }

  async getConversionAnalytics() {
    try {
      // Get basic conversion metrics from waitlist entries
      const [sessionCount] = await db
        .select({
          totalVisitors: sql<number>`COUNT(*)::int`,
        })
        .from(userSessions)
        .where(gte(userSessions.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

      const [signupCount] = await db
        .select({
          signups: sql<number>`COUNT(*)::int`,
        })
        .from(waitlistEntries)
        .where(gte(waitlistEntries.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

      const totalVisitors = sessionCount?.totalVisitors || 0;
      const signups = signupCount?.signups || 0;
      const conversionRate = totalVisitors > 0 ? Math.round((signups / totalVisitors) * 100) : 0;

      return {
        totalVisitors,
        signups,
        conversionRate,
        avgTimeToConvert: 180, // Default 3 minutes
      };
    } catch (error) {
      console.error('Failed to get conversion analytics:', error);
      return {
        totalVisitors: 0,
        signups: 0,
        conversionRate: 0,
        avgTimeToConvert: 0,
      };
    }
  }

  async getTopPerformingElements() {
    try {
      return await db
        .select({
          elementId: pageEvents.elementId,
          elementText: pageEvents.elementText,
          clicks: sql<number>`COUNT(*)::int`,
          conversionRate: sql<number>`ROUND(COALESCE(AVG(CASE WHEN ${pageEvents.eventType} = 'click' THEN 1 ELSE 0 END) * 100, 0))::int`,
        })
        .from(pageEvents)
        .where(eq(pageEvents.eventType, 'click'))
        .groupBy(pageEvents.elementId, pageEvents.elementText)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);
    } catch (error) {
      console.error('Failed to get top performing elements:', error);
      return [];
    }
  }
}