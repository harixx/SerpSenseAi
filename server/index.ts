import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// Global path safety wrapper to prevent undefined path arguments
const originalResolve = path.resolve;
path.resolve = (...paths: string[]) => {
  // Filter out any undefined or null values and convert to strings
  const safePaths = paths
    .filter(p => p != null)
    .map(p => String(p || ''));
  
  if (safePaths.length === 0) {
    console.warn("⚠️ path.resolve called with no valid paths, using current directory");
    return originalResolve(process.cwd() || "/app");
  }
  
  return originalResolve(...safePaths);
};

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production-safe logger
const log = (message: string, source = "express") => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
};

// Conditional vite imports for development only
let setupVite: any, serveStatic: any;

const initializeDevDependencies = async () => {
  if (process.env.NODE_ENV === "development") {
    try {
      const { setupVite: devSetupVite, serveStatic: devServeStatic } = await import("./vite.js");
      setupVite = devSetupVite;
      serveStatic = devServeStatic;
    } catch (error) {
      console.warn("Development dependencies not available:", error);
    }
  }
};



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

// Remove the conflicting root route - let static serving handle the frontend

// Production-only static file serving (Railway deployment)
if (process.env.NODE_ENV === "production") {
  // Bulletproof path resolution for production environments
  const getProductionPaths = () => {
    try {
      // Multiple fallback strategies for different deployment environments
      const workingDirectory = process.cwd() || process.env.PWD || "/app" || __dirname;
      
      // Ensure all path variables are strings and never undefined
      const safeWorkingDir = String(workingDirectory || "/app");
      const staticPath = path.resolve(safeWorkingDir, "dist", "public");
      const indexPath = path.resolve(staticPath, "index.html");
      
      // Validation logging to catch any undefined variables
      console.log("🔍 Path Validation:");
      console.log("  - workingDirectory type:", typeof workingDirectory, "value:", workingDirectory);
      console.log("  - safeWorkingDir type:", typeof safeWorkingDir, "value:", safeWorkingDir);
      console.log("  - staticPath type:", typeof staticPath, "value:", staticPath);
      console.log("  - indexPath type:", typeof indexPath, "value:", indexPath);
      
      console.log("🔍 Production Path Resolution:");
      console.log("  - Working Directory:", workingDirectory);
      console.log("  - Static Path:", staticPath);
      console.log("  - Index Path:", indexPath);
      
      return { staticPath, indexPath };
    } catch (error) {
      console.error("❌ Path resolution failed:", error);
      // Ultimate fallback for extreme edge cases - ensure strings
      const fallbackStatic = String("/app/dist/public");
      const fallbackIndex = String("/app/dist/public/index.html");
      console.log("🆘 Using fallback paths:", { fallbackStatic, fallbackIndex });
      
      // Double-check these are valid strings
      if (typeof fallbackStatic !== "string" || typeof fallbackIndex !== "string") {
        throw new Error("Critical: Fallback paths are not strings");
      }
      
      return { staticPath: fallbackStatic, indexPath: fallbackIndex };
    }
  };

  const { staticPath, indexPath } = getProductionPaths();
  
  app.use(express.static(staticPath, {
    // Add robust error handling for static file serving
    fallthrough: true,
    index: false, // We'll handle index.html separately
  }));
  
  // ✅ Catch-all to serve index.html for frontend routing with error handling
  app.get("*", (req, res, next) => {
    try {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("❌ Error serving index.html:", err);
          res.status(500).send("Server configuration error - please contact support");
        }
      });
    } catch (error) {
      console.error("❌ Critical error in route handler:", error);
      res.status(500).send("Server configuration error - please contact support");
      next(error);
    }
  });
}

(async () => {
  try {
    console.log("🚀 Starting server setup...");
    
    // Initialize development dependencies if needed
    await initializeDevDependencies();

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
      // Skip serveStatic in production to avoid vite config issues
      console.log("✅ Production mode - static serving configured above");
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    console.log("Port is:", port);
    server.listen({ port, host: "0.0.0.0" }, () => {
      log(`✅ Server is running and listening on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Fatal error during startup:", err);
    process.exit(1);
  }
})();
