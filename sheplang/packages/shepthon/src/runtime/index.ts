/**
 * ShepThonRuntime - Main runtime orchestrator
 * 
 * Ties together all runtime components:
 * - InMemoryDatabase (data storage)
 * - EndpointRouter (HTTP request handling)
 * - JobScheduler (periodic job execution)
 * - StatementExecutor (code execution)
 * 
 * Provides single entry point for ShepThon application execution.
 */

import type { ShepThonApp, HttpMethod } from '../types.js';
import { InMemoryDatabase } from './database.js';
import { EndpointRouter } from './router.js';
import { JobScheduler } from './scheduler.js';
import type { RuntimeContext } from './evaluator.js';

/**
 * ShepThonRuntime orchestrates all runtime components
 * 
 * Usage:
 * ```typescript
 * const ast = parseShepThon(source);
 * const runtime = new ShepThonRuntime(ast.app);
 * 
 * // Call endpoints
 * const result = await runtime.callEndpoint('GET', '/reminders');
 * 
 * // Start background jobs
 * runtime.startJobs();
 * ```
 */
export class ShepThonRuntime {
  private db: InMemoryDatabase;
  private router: EndpointRouter;
  private scheduler: JobScheduler;
  private context: RuntimeContext;

  /**
   * Create a new ShepThon runtime from parsed AST
   * Initializes database, registers endpoints and jobs
   * 
   * @param app The parsed ShepThon application AST
   */
  constructor(app: ShepThonApp) {
    // Initialize database
    this.db = new InMemoryDatabase();

    // Create runtime context
    this.context = {
      db: this.db,
      log: (...args: any[]) => console.log('[ShepThon]', ...args),
      now: () => new Date()
    };

    // Initialize router and scheduler
    this.router = new EndpointRouter(this.context);
    this.scheduler = new JobScheduler(this.context);

    // Bootstrap from AST
    this.bootstrap(app);
  }

  /**
   * Call an endpoint
   * Returns the result from the endpoint's return statement
   * 
   * @example
   * const reminders = await runtime.callEndpoint('GET', '/reminders');
   * 
   * @example
   * const reminder = await runtime.callEndpoint('POST', '/reminders', {
   *   text: 'Walk dog',
   *   time: new Date()
   * });
   */
  async callEndpoint(method: HttpMethod, path: string, body?: any): Promise<any> {
    return await this.router.execute(method, path, body);
  }

  /**
   * Start all background jobs
   * Jobs will execute on their scheduled intervals
   * 
   * @example
   * runtime.startJobs();
   */
  startJobs(): void {
    this.scheduler.startAll();
  }

  /**
   * Stop all background jobs
   * Useful for cleanup or testing
   * 
   * @example
   * runtime.stopJobs();
   */
  stopJobs(): void {
    this.scheduler.stopAll();
  }

  /**
   * Get the database instance
   * Useful for testing or direct data access
   * 
   * @example
   * const db = runtime.getDatabase();
   * const count = db.count('Reminder');
   */
  getDatabase(): InMemoryDatabase {
    return this.db;
  }

  /**
   * Get the endpoint router
   * Useful for testing or inspecting registered routes
   */
  getRouter(): EndpointRouter {
    return this.router;
  }

  /**
   * Get the job scheduler
   * Useful for testing or inspecting registered jobs
   */
  getScheduler(): JobScheduler {
    return this.scheduler;
  }

  /**
   * Bootstrap the runtime from parsed AST
   * - Initialize database tables from models
   * - Register all endpoints
   * - Register all jobs
   */
  private bootstrap(app: ShepThonApp): void {
    // Initialize database tables for each model
    for (const model of app.models) {
      this.db.initializeTable(model.name);
    }

    // Register all endpoints
    for (const endpoint of app.endpoints) {
      this.router.register(endpoint.method, endpoint.path, endpoint);
    }

    // Register all jobs
    for (const job of app.jobs) {
      this.scheduler.register(job.name, job.schedule, job);
    }
  }
}

/**
 * Export all runtime components for advanced usage
 */
export { InMemoryDatabase } from './database.js';
export { EndpointRouter } from './router.js';
export { JobScheduler } from './scheduler.js';
export { StatementExecutor, ReturnValue } from './executor.js';
export { ExpressionEvaluator, type RuntimeContext, type Scope } from './evaluator.js';
