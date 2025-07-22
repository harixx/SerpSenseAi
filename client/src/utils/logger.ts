// Centralized logging system that only works in development
class Logger {
  private isDevelopment = false; // Force production mode - completely silent

  log(...args: any[]) {
    // Completely silent in production
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: any[]) {
    // Completely silent in production
    if (this.isDevelopment) {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    // Completely silent in production
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    // Completely silent in production
    if (this.isDevelopment) {
      console.info(...args);
    }
  }
}

export const logger = new Logger();