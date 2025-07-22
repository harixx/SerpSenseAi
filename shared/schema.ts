import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp,
  varchar,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull(), // 'hero' or 'final_cta'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  source: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;

// Analytics tables for behavior tracking, A/B testing, and lead qualification
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: text("user_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
});

export const pageEvents = pgTable("page_events", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(),
  elementId: text("element_id"),
  elementText: text("element_text"),
  pagePath: text("page_path").notNull(),
  scrollDepth: integer("scroll_depth"),
  timeOnPage: integer("time_on_page"),
  metadata: text("metadata"), // JSON string
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  testName: text("test_name").notNull(),
  variant: text("variant").notNull(),
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

export const leadScores = pgTable("lead_scores", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  email: text("email"),
  totalScore: integer("total_score").default(0),
  engagementScore: integer("engagement_score").default(0),
  intentScore: integer("intent_score").default(0),
  qualityScore: integer("quality_score").default(0),
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
});

export const leadActions = pgTable("lead_actions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  actionType: text("action_type").notNull(),
  actionValue: text("action_value"),
  scoreImpact: integer("score_impact").default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Analytics schemas
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertPageEventSchema = createInsertSchema(pageEvents).omit({
  id: true,
  timestamp: true,
});

export const insertLeadActionSchema = createInsertSchema(leadActions).omit({
  id: true,
  timestamp: true,
});

// Analytics types
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type PageEvent = typeof pageEvents.$inferSelect;
export type InsertPageEvent = z.infer<typeof insertPageEventSchema>;
export type LeadAction = typeof leadActions.$inferSelect;
export type InsertLeadAction = z.infer<typeof insertLeadActionSchema>;
export type LeadScore = typeof leadScores.$inferSelect;
