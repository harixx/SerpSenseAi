import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only create database connection if DATABASE_URL is available
export let pool: Pool | null = null;
export let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log("Database connection established");
  } catch (error) {
    console.warn("Failed to connect to database:", error);
    pool = null;
    db = null;
  }
} else {
  console.log("No DATABASE_URL found, database will not be available");
}