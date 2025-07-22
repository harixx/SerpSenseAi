import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User behavior tracking
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: text("user_id"), // Anonymous user tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  country: text("country"),
  device: text("device"), // mobile, desktop, tablet
  browser: text("browser"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
});

// Page view and interaction tracking
export const pageEvents = pgTable("page_events", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(), // page_view, scroll, click, form_focus, form_submit
  elementId: text("element_id"), // For click tracking
  elementText: text("element_text"), // Button text, link text, etc.
  pagePath: text("page_path").notNull(),
  scrollDepth: integer("scroll_depth"), // Percentage
  timeOnPage: integer("time_on_page"), // Seconds
  metadata: jsonb("metadata"), // Additional event data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// A/B test variants and performance
export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  testName: text("test_name").notNull(),
  variant: text("variant").notNull(), // A, B, C, etc.
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endDate: timestamp("end_date"),
});

export const abTestAssignments = pgTable("ab_test_assignments", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  testId: integer("test_id").notNull(),
  variant: text("variant").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Lead scoring and qualification
export const leadScores = pgTable("lead_scores", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  email: text("email"), // When they provide it
  totalScore: integer("total_score").default(0),
  engagementScore: integer("engagement_score").default(0), // Time, interactions
  intentScore: integer("intent_score").default(0), // Form fills, CTA clicks
  qualityScore: integer("quality_score").default(0), // Email domain, behavior patterns
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
});

export const leadActions = pgTable("lead_actions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  actionType: text("action_type").notNull(), // email_fill, cta_click, video_watch, calculator_use
  actionValue: text("action_value"), // Email domain, button text, etc.
  scoreImpact: integer("score_impact").default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Enhanced waitlist with qualification data
export const qualifiedWaitlist = pgTable("qualified_waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull(),
  sessionId: text("session_id"),
  totalScore: integer("total_score").default(0),
  qualification: text("qualification"), // hot, warm, cold, unqualified
  timeToConvert: integer("time_to_convert"), // Seconds from first visit
  touchpoints: integer("touchpoints").default(1), // Number of interactions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema exports
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertPageEventSchema = createInsertSchema(pageEvents).omit({
  id: true,
  timestamp: true,
});

export const insertAbTestSchema = createInsertSchema(abTests).omit({
  id: true,
  createdAt: true,
});

export const insertLeadActionSchema = createInsertSchema(leadActions).omit({
  id: true,
  timestamp: true,
});

// Type exports
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type PageEvent = typeof pageEvents.$inferSelect;
export type InsertPageEvent = z.infer<typeof insertPageEventSchema>;
export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTest = z.infer<typeof insertAbTestSchema>;
export type LeadAction = typeof leadActions.$inferSelect;
export type InsertLeadAction = z.infer<typeof insertLeadActionSchema>;
export type LeadScore = typeof leadScores.$inferSelect;
export type QualifiedWaitlist = typeof qualifiedWaitlist.$inferSelect;