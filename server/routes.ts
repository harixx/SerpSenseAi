import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWaitlistEntrySchema, insertUserSessionSchema, insertPageEventSchema, insertLeadActionSchema } from "@shared/schema";
import { AnalyticsService } from "./analytics";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

// WebSocket connection management
let wss: WebSocketServer;
const connectedClients = new Set<WebSocket>();

// Broadcast function to send real-time updates to all connected clients
function broadcastUpdate(data: any) {
  const message = JSON.stringify(data);
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Initialize analytics service
const analyticsService = new AnalyticsService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
      
      // Get updated count for real-time broadcast
      const entries = await storage.getWaitlistEntries();
      const newCount = entries.length;
      
      // Broadcast real-time update to all connected clients
      broadcastUpdate({
        type: 'waitlist_update',
        count: newCount,
        newEntry: {
          id: waitlistEntry.id,
          source: waitlistEntry.source,
          timestamp: waitlistEntry.createdAt
        }
      });
      
      res.status(201).json({ 
        message: "Successfully added to waitlist",
        success: true,
        id: waitlistEntry.id,
        count: newCount
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

  // Health check endpoint for real-time system
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      connections: connectedClients.size,
      websocket: wss ? "active" : "inactive"
    });
  });

  // Protected Analytics endpoints  
  app.get("/api/analytics/dashboard", isAuthenticated, async (req, res) => {
    try {
      const dashboardData = await analyticsService.getDashboardData();
      res.json({ success: true, data: dashboardData });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.post("/api/analytics/session", async (req, res) => {
    try {
      const sessionData = insertUserSessionSchema.parse(req.body);
      // Add IP address from request
      sessionData.ipAddress = req.ip || req.connection.remoteAddress || '';
      
      const session = await analyticsService.createSession(sessionData);
      res.json({ success: true, session });
    } catch (error) {
      console.error('Analytics session error:', error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.post("/api/analytics/events", async (req, res) => {
    try {
      const { events } = req.body;
      if (!Array.isArray(events)) {
        return res.status(400).json({ error: "Events must be an array" });
      }

      const results = [];
      for (const eventData of events) {
        const validatedEvent = insertPageEventSchema.parse(eventData);
        const event = await analyticsService.trackEvent(validatedEvent);
        results.push(event);
      }

      res.json({ success: true, count: results.length });
    } catch (error) {
      console.error('Analytics events error:', error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.post("/api/analytics/lead-action", async (req, res) => {
    try {
      const actionData = insertLeadActionSchema.parse(req.body);
      const action = await analyticsService.trackLeadAction(actionData);
      res.json({ success: true, action });
    } catch (error) {
      console.error('Lead action error:', error);
      res.status(400).json({ error: "Invalid action data" });
    }
  });

  // A/B Testing endpoints
  app.post("/api/analytics/ab-tests/initialize", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const activeTests = await analyticsService.getActiveTests();
      const variants: Record<string, string> = {};

      for (const test of activeTests) {
        // Check if already assigned
        const existingVariant = await analyticsService.getTestAssignment(sessionId, test.testName);
        
        if (existingVariant) {
          variants[test.testName] = existingVariant;
        } else {
          // Assign random variant (A, B, C)
          const availableVariants = ['A', 'B', 'C'];
          const randomVariant = availableVariants[Math.floor(Math.random() * availableVariants.length)];
          
          await analyticsService.assignToTest(sessionId, test.id, randomVariant);
          variants[test.testName] = randomVariant;
        }
      }

      res.json({ success: true, variants });
    } catch (error) {
      console.error('A/B test initialization error:', error);
      res.status(500).json({ error: "Failed to initialize tests" });
    }
  });

  app.post("/api/analytics/ab-tests/conversion", async (req, res) => {
    try {
      const { sessionId, testName, conversionType, variant } = req.body;
      
      // Track conversion as a special lead action
      await analyticsService.trackLeadAction({
        sessionId,
        actionType: `ab_conversion_${testName}`,
        actionValue: `${variant}_${conversionType}`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('A/B conversion tracking error:', error);
      res.status(400).json({ error: "Failed to track conversion" });
    }
  });

  // Analytics dashboard endpoints
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as 'day' | 'week' | 'month' || 'week';
      
      const [sessionAnalytics, conversionAnalytics, topElements] = await Promise.all([
        analyticsService.getSessionAnalytics(timeframe),
        analyticsService.getConversionAnalytics(),
        analyticsService.getTopPerformingElements(),
      ]);

      res.json({
        success: true,
        data: {
          sessions: sessionAnalytics,
          conversions: conversionAnalytics,
          topElements,
        }
      });
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    connectedClients.add(ws);
    
    // Send current waitlist count to new connection
    storage.getWaitlistEntries().then(entries => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_count',
          count: entries.length
        }));
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      connectedClients.delete(ws);
    });
    
    // Handle connection errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
    
    // Handle incoming messages (for future expansion)
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle ping/pong for connection health
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
  });
  
  return httpServer;
}
