import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWaitlistEntrySchema } from "@shared/schema";
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
