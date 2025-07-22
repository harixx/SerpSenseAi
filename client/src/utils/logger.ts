// Centralized logging system that only works in development
class Logger {
  private isDevelopment = import.meta.env.NODE_ENV === "development" || import.meta.env.DEV || import.meta.env.MODE === "development";

  log(...args: any[]) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: any[]) {
    if (this.isDevelopment) {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }
}

export const logger = new Logger();