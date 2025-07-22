// Professional console silencer for production websites
export const silenceConsole = () => {
  // Override all console methods to be completely silent
  const noop = () => {};
  
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
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

// Initialize console silencing for production
if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
  silenceConsole();
}