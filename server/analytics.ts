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
    } catch (error) {
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
        error: error.message
      };
    }
  }
}

export const analyticsService = new AnalyticsService();