import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Waitlist endpoints
  app.post("/api/waitlist", async (req, res) => {
    try {
      const validatedData = insertWaitlistEntrySchema.parse(req.body);
      
      // Check if email already exists
      const emailExists = await storage.isEmailInWaitlist(validatedData.email);
      if (emailExists) {
        return res.status(409).json({ 
          message: "Email already registered for early access",
          success: false 
        });
      }

      const waitlistEntry = await storage.addToWaitlist(validatedData);
      res.status(201).json({ 
        message: "Successfully added to waitlist",
        success: true,
        id: waitlistEntry.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid email format",
          success: false,
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to add to waitlist",
          success: false 
        });
      }
    }
  });

  app.get("/api/waitlist/count", async (req, res) => {
    try {
      const entries = await storage.getWaitlistEntries();
      res.json({ count: entries.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to get waitlist count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
