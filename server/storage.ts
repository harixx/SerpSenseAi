import { 
  users, 
  waitlistEntries, 
  userSessions,
  pageEvents,
  abTests,
  abTestAssignments,
  leadActions,
  type User, 
  type UpsertUser, 
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
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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
  private users: Map<string, User>;
  private waitlist: Map<number, WaitlistEntry>;
  private currentWaitlistId: number;

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id!, user);
    return user;
  }

  constructor() {
    this.users = new Map();
    this.waitlist = new Map();
    this.currentUserId = 1;
    this.currentWaitlistId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
