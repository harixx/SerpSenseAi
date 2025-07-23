import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { compare, hash } from "bcryptjs";
import { storage } from "./storage";
import { AdminUser, loginAdminSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends AdminUser {}
  }
}

// Setup secure admin authentication
export function setupAdminAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Setup session store
  const pgStore = connectPg(session);
  const sessionStore = process.env.DATABASE_URL 
    ? new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "admin_sessions",
      })
    : new (MemoryStore(session))({
        checkPeriod: 86400000, // prune expired entries every 24h
      });

  const sessionSecret = process.env.SESSION_SECRET || 'imperius-admin-secret-' + Math.random().toString(36);
  
  app.set("trust proxy", 1);
  app.use(session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'imperius_admin_session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy for admin users
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getAdminUserByUsername(username);
      if (!user || !user.isActive) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Update last login
      await storage.updateAdminLastLogin(user.id);
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getAdminUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res, next) => {
    try {
      const result = loginAdminSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      passport.authenticate("local", (err: any, user: AdminUser | false, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message || "Invalid credentials" });

        req.logIn(user, (err) => {
          if (err) return next(err);
          res.json({ 
            success: true, 
            user: { 
              id: user.id, 
              username: user.username, 
              email: user.email, 
              role: user.role 
            } 
          });
        });
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  app.get("/api/admin/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as AdminUser;
    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role,
      lastLogin: user.lastLogin 
    });
  });
}

// Middleware to protect admin routes
export function requireAdminAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  const user = req.user as AdminUser;
  if (!user.isActive || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

// Utility function to create the first admin user
export async function createDefaultAdminUser() {
  try {
    // Check if any admin users exist
    const existingAdmin = await storage.getAdminUserByUsername('admin');
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const hashedPassword = await hash(defaultPassword, 12);
    
    await storage.createAdminUser({
      username: 'admin',
      email: 'admin@imperius.local',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('✓ Created default admin user:');
    console.log('  Username: admin');
    console.log(`  Password: ${defaultPassword}`);
    console.log('  ⚠️  Please change the password immediately after first login!');
  } catch (error) {
    console.error('Failed to create default admin user:', error);
  }
}