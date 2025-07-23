import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import path from "path"; // ✅ Required for static/catch-all paths

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve streaming video/audio assets
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
  }),
);

// API request logger
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

// ✅ Root route for direct check (optional)
app.get("/", (req, res) => {
  console.log("📩 GET / hit");
  res.send("✅ App is working and responding from Railway! 🚀");
});

// ✅ Serve static frontend files (dist or build folder)
const staticPath = path.resolve(__dirname, "../dist/public"); // Adjust if needed
app.use(express.static(staticPath));

// ✅ Catch-all to serve index.html for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

(async () => {
  try {
    console.log("🚀 Starting server setup...");

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

    // 👇 Create server explicitly (important for Railway + Vite)
    const server = createServer(app);

    // Setup Vite in development
    if (app.get("env") === "development") {
      console.log("⚙️ Setting up Vite dev server...");
      await setupVite(app, server);
    } else {
      serveStatic(app); // Already serving dist above, still useful
    }

    const port = parseInt(process.env.PORT || "3000", 10);
    console.log("Port is:", port);
    server.listen({ port, host: "0.0.0.0" }, () => {
      log(`✅ Server is running and listening on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Fatal error during startup:", err);
    process.exit(1);
  }
})();
