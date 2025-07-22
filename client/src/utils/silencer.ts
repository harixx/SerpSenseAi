// Professional console silencer for production websites
export const silenceConsole = () => {
  // Override all console methods to be completely silent
  const noop = () => {};
  
  // Store original console methods
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Override console methods with comprehensive filtering
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    // Block all development and framework messages
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience') ||
        message.includes('ReactDevTools') ||
        message.includes('https://reactjs.org/link/react-devtools') ||
        message.includes('AudioContext was not allowed') ||
        message.includes('autoplay') ||
        message.includes('user gesture')) {
      return;
    }
    return; // Silence everything for professional website
  };
  
  console.info = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience') ||
        message.includes('ReactDevTools') ||
        message.includes('https://reactjs.org/link/react-devtools') ||
        message.includes('AudioContext was not allowed') ||
        message.includes('autoplay') ||
        message.includes('user gesture')) {
      return;
    }
    return; // Silence everything for professional website
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience') ||
        message.includes('ReactDevTools') ||
        message.includes('https://reactjs.org/link/react-devtools') ||
        message.includes('AudioContext was not allowed') ||
        message.includes('autoplay') ||
        message.includes('user gesture')) {
      return;
    }
    return; // Silence everything for professional website
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools') || 
        message.includes('react-devtools') ||
        message.includes('development experience') ||
        message.includes('ReactDevTools') ||
        message.includes('https://reactjs.org/link/react-devtools') ||
        message.includes('AudioContext was not allowed') ||
        message.includes('autoplay') ||
        message.includes('user gesture')) {
      return;
    }
    return; // Silence everything for professional website
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