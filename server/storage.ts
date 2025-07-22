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
}

export class MemStorage implements IStorage {
  private adminUsers: Map<number, AdminUser>;
  private waitlist: Map<number, WaitlistEntry>;
  private currentAdminUserId: number;
  private currentWaitlistId: number;

  constructor() {
    this.adminUsers = new Map();
    this.waitlist = new Map();
    this.currentAdminUserId = 1;
    this.currentWaitlistId = 1;
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
