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
          testId: abTestAssignments.testId
        })
        .from(abTestAssignments)
        .innerJoin(abTests, eq(abTests.id, abTestAssignments.testId))
        .where(eq(abTestAssignments.sessionId, sessionId))
        .where(eq(abTests.testName, testName))
        .limit(1);
      return assignment;
    } catch (error) {
      console.error('Failed to get test assignment:', error);
      return null;
    }
  }

  async trackLeadAction(actionData: InsertLeadAction) {
    try {
      const [action] = await db
        .insert(leadActions)
        .values(actionData)
        .returning();
      return action;
    } catch (error) {
      console.error('Failed to track lead action:', error);
      return null;
    }
  }

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

  // Dashboard Data Aggregation
  async getDashboardData() {
    try {
      // Get basic metrics with fallback to ensure dashboard displays
      const metrics = {
        totalSessions: 0,
        todaySessions: 0,
        totalEvents: 0,
        waitlistCount: 0,
        activeTests: 0
      };

      // Try to get real data but fallback gracefully
      try {
        const [sessionCount] = await db.select({ count: sql`count(*)` }).from(userSessions);
        metrics.totalSessions = Number(sessionCount?.count || 0);
      } catch (e) { 
        console.log('Session count fallback');
      }

      try {
        const [eventCount] = await db.select({ count: sql`count(*)` }).from(pageEvents);
        metrics.totalEvents = Number(eventCount?.count || 0);
      } catch (e) { 
        console.log('Event count fallback');
      }

      try {
        const [waitlistCount] = await db.select({ count: sql`count(*)` }).from(waitlistEntries);
        metrics.waitlistCount = Number(waitlistCount?.count || 0);
      } catch (e) { 
        console.log('Waitlist count fallback');
      }

      return { 
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("Failed to get dashboard data:", error);
      return {
        success: false,
        metrics: {
          totalSessions: 0,
          todaySessions: 0,
          totalEvents: 0,
          waitlistCount: 0,
          activeTests: 0
        },
        error: error?.message || 'Unknown error'
      };
    }
  }
}

export const analyticsService = new AnalyticsService();