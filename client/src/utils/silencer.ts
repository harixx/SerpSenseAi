// Professional console silencer for production websites
export const silenceConsole = () => {
  // Override all console methods to be completely silent
  const noop = () => {};
  
  // Store original console methods
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Override console methods with filtering
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    // Block React DevTools and other development messages
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience')) {
      return;
    }
    // In production, silence everything
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      return;
    }
    originalLog(...args);
  };
  
  console.info = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience')) {
      return;
    }
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      return;
    }
    originalInfo(...args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience')) {
      return;
    }
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      return;
    }
    originalWarn(...args);
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience')) {
      return;
    }
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      return;
    }
    originalError(...args);
  };
  
  console.debug = noop;
  console.trace = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.table = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.count = noop;
  console.clear = noop;
};

// Initialize console silencing immediately
silenceConsole();