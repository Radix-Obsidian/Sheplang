/**
 * JobScheduler - Schedules and executes ShepThon jobs periodically
 * 
 * Pattern: setInterval-based scheduling with enable/disable for tests
 * Reference: Node.js timers API, TTD_ShepThon_Core.md C2.3
 * 
 * Features:
 * - Parse schedule expressions (every N minutes/hours/days)
 * - Execute jobs periodically with setInterval
 * - Inject context (db, log, now)
 * - Handle errors gracefully (log, don't crash)
 * - Enable/disable for tests
 */

import type { JobDefinition, ScheduleExpression } from '../types.js';
import { StatementExecutor } from './executor.js';
import type { RuntimeContext } from './evaluator.js';

/**
 * Job information including timer handle
 */
interface RegisteredJob {
  name: string;
  definition: JobDefinition;
  intervalId: NodeJS.Timeout | null;
}

/**
 * JobScheduler manages periodic job execution
 */
export class JobScheduler {
  private jobs: Map<string, RegisteredJob> = new Map();
  private enabled: boolean = true;

  constructor(private context: RuntimeContext) {}

  /**
   * Register a job
   * Does not start automatically - call start() or startAll()
   * 
   * @example
   * scheduler.register('cleanup', schedule, jobDefinition)
   */
  register(name: string, schedule: ScheduleExpression, definition: JobDefinition): void {
    if (this.jobs.has(name)) {
      throw new Error(`Job already registered: ${name}`);
    }

    this.jobs.set(name, {
      name,
      definition,
      intervalId: null
    });
  }

  /**
   * Start a specific job
   * Parses schedule and sets up setInterval
   * 
   * @example
   * scheduler.start('cleanup')
   */
  start(name: string): void {
    const job = this.jobs.get(name);
    
    if (!job) {
      throw new Error(`Job not found: ${name}`);
    }

    if (job.intervalId !== null) {
      throw new Error(`Job already running: ${name}`);
    }

    // Don't start if scheduler is disabled
    if (!this.enabled) {
      return;
    }

    // Parse schedule to milliseconds
    const intervalMs = this.parseSchedule(job.definition.schedule);

    // Create job handler
    const handler = async () => {
      try {
        await this.executeJob(job.definition);
      } catch (error) {
        // Log error but don't crash scheduler
        this.context.log(`Error in job "${name}":`, error);
      }
    };

    // Set up interval
    job.intervalId = setInterval(handler, intervalMs);
  }

  /**
   * Stop a specific job
   * Clears the setInterval timer
   * 
   * @example
   * scheduler.stop('cleanup')
   */
  stop(name: string): void {
    const job = this.jobs.get(name);
    
    if (!job) {
      throw new Error(`Job not found: ${name}`);
    }

    if (job.intervalId !== null) {
      clearInterval(job.intervalId);
      job.intervalId = null;
    }
  }

  /**
   * Start all registered jobs
   */
  startAll(): void {
    for (const name of this.jobs.keys()) {
      // Skip jobs that are already running
      const job = this.jobs.get(name);
      if (job && job.intervalId === null) {
        try {
          this.start(name);
        } catch (error) {
          // If job fails to start, log but continue with others
          this.context.log(`Failed to start job "${name}":`, error);
        }
      }
    }
  }

  /**
   * Stop all running jobs
   */
  stopAll(): void {
    for (const name of this.jobs.keys()) {
      try {
        this.stop(name);
      } catch (error) {
        // Ignore errors (job might not be running)
      }
    }
  }

  /**
   * Enable the scheduler
   * Jobs can be started when enabled
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable the scheduler
   * Prevents jobs from starting (useful for tests)
   * Does not stop currently running jobs
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if scheduler is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if a job is registered
   */
  has(name: string): boolean {
    return this.jobs.has(name);
  }

  /**
   * Check if a job is running
   */
  isRunning(name: string): boolean {
    const job = this.jobs.get(name);
    return job ? job.intervalId !== null : false;
  }

  /**
   * Get all registered job names
   */
  getJobNames(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Clear all registered jobs
   * Stops all running jobs first
   */
  clear(): void {
    this.stopAll();
    this.jobs.clear();
  }

  /**
   * Execute a job's body statements
   * Creates new StatementExecutor for each run
   * 
   * @example
   * await executeJob(jobDefinition)
   */
  private async executeJob(definition: JobDefinition): Promise<void> {
    // Create executor with empty scope
    const executor = new StatementExecutor(this.context, new Map());
    
    // Execute job body
    await executor.executeBlock(definition.body);
  }

  /**
   * Parse schedule expression to milliseconds
   * Supports: minutes, hours, days
   * 
   * @example
   * parseSchedule({ every: 5, unit: 'minutes' })
   * // → 300000 (5 * 60 * 1000)
   */
  private parseSchedule(schedule: ScheduleExpression): number {
    const { every, unit } = schedule;

    if (every <= 0) {
      throw new Error(`Invalid schedule interval: ${every} (must be > 0)`);
    }

    switch (unit) {
      case 'minutes':
        return every * 60 * 1000;
      
      case 'hours':
        return every * 60 * 60 * 1000;
      
      case 'days':
        return every * 24 * 60 * 60 * 1000;
      
      default:
        throw new Error(`Invalid schedule unit: ${unit}`);
    }
  }
}
