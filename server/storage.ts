import { 
  adminUsers,
  waitlistEntries, 
  userSessions,
  pageEvents,
  abTests,
  abTestAssignments,
  leadActions,
  type AdminUser, 
  type InsertAdminUser, 
  type WaitlistEntry, 
  type InsertWaitlistEntry,
  type UserSession,
  type InsertUserSession,
  type PageEvent,
  type InsertPageEvent,
  type ABTest,
  type InsertABTest,
  type ABTestAssignment,
  type InsertABTestAssignment,
  type LeadAction,
  type InsertLeadAction,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Admin user operations for secure authentication
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: number): Promise<void>;
  
  // Waitlist operations
  addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  isEmailInWaitlist(email: string): Promise<boolean>;

  // Analytics operations
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSession(sessionId: string): Promise<UserSession | undefined>;
  updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<void>;
  createPageEvent(event: InsertPageEvent): Promise<PageEvent>;
  getPageEvents(sessionId?: string): Promise<PageEvent[]>;
  createABTest(test: InsertABTest): Promise<ABTest>;
  getABTests(): Promise<ABTest[]>;
  getABTest(testName: string): Promise<ABTest | undefined>;
  createABTestAssignment(assignment: InsertABTestAssignment): Promise<ABTestAssignment>;
  getABTestAssignment(sessionId: string, testName: string): Promise<ABTestAssignment | undefined>;
  createLeadAction(action: InsertLeadAction): Promise<LeadAction>;
  getLeadActions(sessionId?: string): Promise<LeadAction[]>;
}

export class DatabaseStorage implements IStorage {
  // Admin user operations for secure authentication
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async createAdminUser(userData: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db
      .insert(adminUsers)
      .values(userData)
      .returning();
    return user;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db
      .insert(waitlistEntries)
      .values(entry)
      .returning();
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries);
  }

  async isEmailInWaitlist(email: string): Promise<boolean> {
    const [entry] = await db.select().from(waitlistEntries).where(eq(waitlistEntries.email, email));
    return !!entry;
  }

  // Analytics operations
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [userSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return userSession;
  }

  async getUserSession(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
    return session;
  }

  async updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<void> {
    await db
      .update(userSessions)
      .set(updates)
      .where(eq(userSessions.sessionId, sessionId));
  }

  async createPageEvent(event: InsertPageEvent): Promise<PageEvent> {
    const [pageEvent] = await db
      .insert(pageEvents)
      .values(event)
      .returning();
    return pageEvent;
  }

  async getPageEvents(sessionId?: string): Promise<PageEvent[]> {
    if (sessionId) {
      return await db.select().from(pageEvents).where(eq(pageEvents.sessionId, sessionId));
    }
    return await db.select().from(pageEvents);
  }

  async createABTest(test: InsertABTest): Promise<ABTest> {
    const [abTest] = await db
      .insert(abTests)
      .values(test)
      .returning();
    return abTest;
  }

  async getABTests(): Promise<ABTest[]> {
    return await db.select().from(abTests);
  }

  async getABTest(testName: string): Promise<ABTest | undefined> {
    const [test] = await db.select().from(abTests).where(eq(abTests.testName, testName));
    return test;
  }

  async createABTestAssignment(assignment: InsertABTestAssignment): Promise<ABTestAssignment> {
    const [abTestAssignment] = await db
      .insert(abTestAssignments)
      .values(assignment)
      .returning();
    return abTestAssignment;
  }

  async getABTestAssignment(sessionId: string, testName: string): Promise<ABTestAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(abTestAssignments)
      .innerJoin(abTests, eq(abTestAssignments.testId, abTests.id))
      .where(eq(abTestAssignments.sessionId, sessionId) && eq(abTests.testName, testName));
    return assignment;
  }

  async createLeadAction(action: InsertLeadAction): Promise<LeadAction> {
    const [leadAction] = await db
      .insert(leadActions)
      .values(action)
      .returning();
    return leadAction;
  }

  async getLeadActions(sessionId?: string): Promise<LeadAction[]> {
    if (sessionId) {
      return await db.select().from(leadActions).where(eq(leadActions.sessionId, sessionId));
    }
    return await db.select().from(leadActions);
  }
}

export class MemStorage implements IStorage {
  private adminUsers: Map<number, AdminUser>;
  private waitlist: Map<number, WaitlistEntry>;
  private userSessions: Map<string, UserSession>;
  private pageEvents: Map<number, PageEvent>;
  private abTests: Map<number, ABTest>;
  private abTestAssignments: Map<number, ABTestAssignment>;
  private leadActions: Map<number, LeadAction>;
  private currentAdminUserId: number;
  private currentWaitlistId: number;
  private currentSessionId: number;
  private currentPageEventId: number;
  private currentABTestId: number;
  private currentABTestAssignmentId: number;
  private currentLeadActionId: number;

  constructor() {
    this.adminUsers = new Map();
    this.waitlist = new Map();
    this.userSessions = new Map();
    this.pageEvents = new Map();
    this.abTests = new Map();
    this.abTestAssignments = new Map();
    this.leadActions = new Map();
    this.currentAdminUserId = 1;
    this.currentWaitlistId = 1;
    this.currentSessionId = 1;
    this.currentPageEventId = 1;
    this.currentABTestId = 1;
    this.currentABTestAssignmentId = 1;
    this.currentLeadActionId = 1;
  }

  // Admin user operations for secure authentication
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (user) => user.username === username,
    );
  }

  async createAdminUser(userData: InsertAdminUser): Promise<AdminUser> {
    const id = this.currentAdminUserId++;
    const user: AdminUser = {
      ...userData,
      id,
      role: userData.role || "admin",
      isActive: userData.isActive ?? true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adminUsers.set(id, user);
    return user;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    const user = this.adminUsers.get(id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      this.adminUsers.set(id, user);
    }
  }

  async addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const id = this.currentWaitlistId++;
    const waitlistEntry: WaitlistEntry = {
      ...entry,
      id,
      createdAt: new Date(),
    };
    this.waitlist.set(id, waitlistEntry);
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlist.values());
  }

  async isEmailInWaitlist(email: string): Promise<boolean> {
    return Array.from(this.waitlist.values()).some(entry => entry.email === email);
  }

  // Analytics operations
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const id = this.currentSessionId++;
    const userSession: UserSession = {
      id,
      sessionId: session.sessionId,
      userId: session.userId || null,
      ipAddress: session.ipAddress || null,
      userAgent: session.userAgent || null,
      referrer: session.referrer || null,
      utmSource: session.utmSource || null,
      utmMedium: session.utmMedium || null,
      utmCampaign: session.utmCampaign || null,
      country: session.country || null,
      device: session.device || null,
      browser: session.browser || null,
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    this.userSessions.set(session.sessionId, userSession);
    return userSession;
  }

  async getUserSession(sessionId: string): Promise<UserSession | undefined> {
    return this.userSessions.get(sessionId);
  }

  async updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<void> {
    const session = this.userSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      this.userSessions.set(sessionId, session);
    }
  }

  async createPageEvent(event: InsertPageEvent): Promise<PageEvent> {
    const id = this.currentPageEventId++;
    const pageEvent: PageEvent = {
      id,
      sessionId: event.sessionId,
      eventType: event.eventType,
      elementId: event.elementId || null,
      elementText: event.elementText || null,
      pagePath: event.pagePath,
      scrollDepth: event.scrollDepth || null,
      timeOnPage: event.timeOnPage || null,
      metadata: event.metadata || null,
      timestamp: new Date(),
    };
    this.pageEvents.set(id, pageEvent);
    return pageEvent;
  }

  async getPageEvents(sessionId?: string): Promise<PageEvent[]> {
    const events = Array.from(this.pageEvents.values());
    if (sessionId) {
      return events.filter(event => event.sessionId === sessionId);
    }
    return events;
  }

  async createABTest(test: InsertABTest): Promise<ABTest> {
    const id = this.currentABTestId++;
    const abTest: ABTest = {
      id,
      testName: test.testName,
      variant: test.variant,
      description: test.description || null,
      isActive: test.isActive ?? true,
      createdAt: new Date(),
      endDate: test.endDate || null,
    };
    this.abTests.set(id, abTest);
    return abTest;
  }

  async getABTests(): Promise<ABTest[]> {
    return Array.from(this.abTests.values());
  }

  async getABTest(testName: string): Promise<ABTest | undefined> {
    return Array.from(this.abTests.values()).find(test => test.testName === testName);
  }

  async createABTestAssignment(assignment: InsertABTestAssignment): Promise<ABTestAssignment> {
    const id = this.currentABTestAssignmentId++;
    const abTestAssignment: ABTestAssignment = {
      ...assignment,
      id,
      assignedAt: new Date(),
    };
    this.abTestAssignments.set(id, abTestAssignment);
    return abTestAssignment;
  }

  async getABTestAssignment(sessionId: string, testName: string): Promise<ABTestAssignment | undefined> {
    const test = await this.getABTest(testName);
    if (!test) return undefined;
    
    return Array.from(this.abTestAssignments.values()).find(
      assignment => assignment.sessionId === sessionId && assignment.testId === test.id
    );
  }

  async createLeadAction(action: InsertLeadAction): Promise<LeadAction> {
    const id = this.currentLeadActionId++;
    const leadAction: LeadAction = {
      id,
      sessionId: action.sessionId,
      actionType: action.actionType,
      actionValue: action.actionValue || null,
      scoreImpact: action.scoreImpact || null,
      timestamp: new Date(),
    };
    this.leadActions.set(id, leadAction);
    return leadAction;
  }

  async getLeadActions(sessionId?: string): Promise<LeadAction[]> {
    const actions = Array.from(this.leadActions.values());
    if (sessionId) {
      return actions.filter(action => action.sessionId === sessionId);
    }
    return actions;
  }
}

// Try to use database storage, fall back to memory storage if database is not available
let storage: IStorage;

try {
  if (process.env.DATABASE_URL) {
    storage = new DatabaseStorage();
  } else {
    console.log("No DATABASE_URL found, using in-memory storage");
    storage = new MemStorage();
  }
} catch (error) {
  console.log("Database connection failed, using in-memory storage:", error);
  storage = new MemStorage();
}

export { storage };
