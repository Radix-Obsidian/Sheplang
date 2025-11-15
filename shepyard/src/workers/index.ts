/**
 * Web Workers Registry
 * 
 * Central location for all Comlink workers.
 * Pattern: Centralized worker management (recommended by vite-plugin-comlink)
 */

/* eslint-disable no-undef */
const shepthonWorker = new ComlinkWorker<typeof import('./shepthon/worker')>(
  new URL('./shepthon/worker', import.meta.url)
);

export { shepthonWorker };
