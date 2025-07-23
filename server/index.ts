import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static assets including video files with proper headers for video streaming
app.use(
  "/attached_assets",
  express.static("attached_assets", {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
        res.setHeader("Access-Control-Allow-Origin", "*");
      } else if (path.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
    },
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

app.get("/", (req, res) => {
  console.log("📩 GET / hit");
  res.send("✅ App is working and responding from Railway! 🚀");
});

(async () => {
  try {
    console.log("🚀 Starting server setup...");

    // Register your routes (including API and WebSocket)
    const server = await registerRoutes(app);
    console.log("✅ Routes registered successfully.");

    // Error handler middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      if (!res.headersSent) {
        res.status(status).json({ message });
      }

      if (process.env.NODE_ENV === "development") {
        console.error(`❌ Error ${status}: ${message}`, err);
      } else {
        console.error(`❌ Error ${status}: ${message}`);
      }
    });

    // Dev only: Setup Vite
    if (app.get("env") === "development") {
      console.log("⚙️  Setting up Vite (dev mode)...");
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server and listen on Railway-provided port
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
      {
        port,
        host: "0.0.0.0", // Required for Railway
        reusePort: true,
      },
      () => {
        log(`✅ Server is running and listening on port ${port}`);
      },
    );
  } catch (error) {
    console.error("❌ Fatal error during app startup:", error);
    process.exit(1);
  }
})();
