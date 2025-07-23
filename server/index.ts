import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http"; // 👈 required

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static assets with streaming headers
app.use(
  "/attached_assets",
  express.static("attached_assets", {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.setHeader("Access-Control-Allow-Origin", "*");
      } else if (path.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
    },
  })
);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// ✅ Root route
app.get("/", (req, res) => {
  console.log("📩 GET / hit");
  res.send("✅ App is working and responding from Railway! 🚀");
});

(async () => {
  try {
    console.log("🚀 Starting server setup...");

    // Make sure routes are registered
    await registerRoutes(app);
    console.log("✅ Routes registered successfully.");

    // Error middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      if (!res.headersSent) res.status(status).json({ message });

      if (process.env.NODE_ENV === "development") {
        console.error(`❌ Error ${status}:`, message, err);
      } else {
        console.error(`❌ Error ${status}:`, message);
      }
    });

    // Create the HTTP server manually ✅
    const server = createServer(app);

    // Setup Vite in dev mode, or static in prod
    if (app.get("env") === "development") {
      console.log("⚙️ Setting up Vite dev server...");
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({ port, host: "0.0.0.0" }, () => {
      log(`✅ Server is running and listening on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Fatal error during startup:", err);
    process.exit(1);
  }
})();
