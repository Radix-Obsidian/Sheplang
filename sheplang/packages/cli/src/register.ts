/**
 * Source map support for better error stack traces
 */
import sourceMapSupport from 'source-map-support/register.js';

/**
 * Setup global error handling for uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('\n\x1b[31m\u2718 Uncaught exception:\x1b[0m', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n\x1b[31m\u2718 Unhandled rejection\x1b[0m', reason);
  process.exit(1);
});

// Set some helpful environment variables
if (!process.env.SHEPLANG_ENV) {
  process.env.SHEPLANG_ENV = process.env.NODE_ENV || 'development';
}

// Use a deterministic performance timing API in Node.js
if (!globalThis.performance) {
  const { performance: nodePerformance } = require('perf_hooks');
  globalThis.performance = nodePerformance;
}

// Export initialization success
export const isInitialized = true;
