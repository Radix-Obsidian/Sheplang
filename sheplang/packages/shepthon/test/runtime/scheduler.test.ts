/**
 * JobScheduler Tests
 * 
 * Comprehensive test suite for job scheduling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JobScheduler } from '../../src/runtime/scheduler.js';
import { InMemoryDatabase } from '../../src/runtime/database.js';
import type { RuntimeContext } from '../../src/runtime/evaluator.js';
import type { JobDefinition, ScheduleExpression } from '../../src/types.js';

describe('JobScheduler', () => {
  let db: InMemoryDatabase;
  let context: RuntimeContext;
  let scheduler: JobScheduler;
  let logOutput: any[];

  beforeEach(() => {
    db = new InMemoryDatabase();
    logOutput = [];
    
    context = {
      db,
      log: (...args: any[]) => logOutput.push(args),
      now: () => new Date('2025-01-15T12:00:00Z')
    };
    
    scheduler = new JobScheduler(context);
    vi.useFakeTimers();
  });

  afterEach(() => {
    scheduler.stopAll();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Registration', () => {
    it('should register a job', () => {
      const schedule: ScheduleExpression = { every: 5, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test-job',
        schedule,
        body: []
      };

      scheduler.register('test-job', schedule, job);
      
      expect(scheduler.has('test-job')).toBe(true);
    });

    it('should throw error when registering duplicate job', () => {
      const schedule: ScheduleExpression = { every: 5, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test-job',
        schedule,
        body: []
      };

      scheduler.register('test-job', schedule, job);
      
      expect(() => scheduler.register('test-job', schedule, job))
        .toThrow('Job already registered: test-job');
    });

    it('should allow registering multiple different jobs', () => {
      const schedule: ScheduleExpression = { every: 5, unit: 'minutes' };
      const job1: JobDefinition = {
        name: 'job1',
        schedule,
        body: []
      };
      const job2: JobDefinition = {
        name: 'job2',
        schedule,
        body: []
      };

      scheduler.register('job1', schedule, job1);
      scheduler.register('job2', schedule, job2);
      
      expect(scheduler.has('job1')).toBe(true);
      expect(scheduler.has('job2')).toBe(true);
    });
  });

  describe('Schedule Parsing', () => {
    it('should parse minutes schedule', async () => {
      const schedule: ScheduleExpression = { every: 5, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'executed' }]
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      // Job should execute every 5 minutes (300000ms)
      await vi.advanceTimersByTimeAsync(300000);
      expect(logOutput).toHaveLength(1);
      
      await vi.advanceTimersByTimeAsync(300000);
      expect(logOutput).toHaveLength(2);
    });

    it('should parse hours schedule', async () => {
      const schedule: ScheduleExpression = { every: 2, unit: 'hours' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'executed' }]
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      // Job should execute every 2 hours (7200000ms)
      await vi.advanceTimersByTimeAsync(7200000);
      expect(logOutput).toHaveLength(1);
    });

    it('should parse days schedule', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'days' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'executed' }]
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      // Job should execute every day (86400000ms)
      await vi.advanceTimersByTimeAsync(86400000);
      expect(logOutput).toHaveLength(1);
    });
  });

  describe('Job Execution', () => {
    it('should start a job', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      scheduler.register('test', schedule, job);
      expect(scheduler.isRunning('test')).toBe(false);
      
      scheduler.start('test');
      
      expect(scheduler.isRunning('test')).toBe(true);
    });

    it('should throw error when starting non-existent job', () => {
      expect(() => scheduler.start('nonexistent'))
        .toThrow('Job not found: nonexistent');
    });

    it('should throw error when starting already running job', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');
      
      expect(() => scheduler.start('test'))
        .toThrow('Job already running: test');
    });

    it('should execute job body', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'job executed' }]
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      // Advance time by 1 minute
      await vi.advanceTimersByTimeAsync(60000);
      
      expect(logOutput[0][0]).toBe('job executed');
    });

    it('should execute job multiple times', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'tick' }]
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      // Execute 3 times
      await vi.advanceTimersByTimeAsync(60000);
      await vi.advanceTimersByTimeAsync(60000);
      await vi.advanceTimersByTimeAsync(60000);
      
      expect(logOutput).toHaveLength(3);
      expect(logOutput[0][0]).toBe('tick');
      expect(logOutput[1][0]).toBe('tick');
      expect(logOutput[2][0]).toBe('tick');
    });

    it('should inject context into job', async () => {
      db.create('Counter', { count: 0 });

      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'let',
            name: 'counter',
            value: {
              type: 'call',
              callee: {
                type: 'member',
                object: {
                  type: 'member',
                  object: { type: 'identifier', name: 'db' },
                  property: 'Counter'
                },
                property: 'findAll'
              },
              arguments: []
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      await vi.advanceTimersByTimeAsync(60000);
      
      // Job should have access to db
      expect(db.count('Counter')).toBe(1);
    });
  });

  describe('Job Control', () => {
    it('should stop a job', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'tick' }]
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      await vi.advanceTimersByTimeAsync(60000);
      expect(logOutput).toHaveLength(1);
      
      scheduler.stop('test');
      expect(scheduler.isRunning('test')).toBe(false);

      // Job should not execute after stopped
      await vi.advanceTimersByTimeAsync(60000);
      expect(logOutput).toHaveLength(1);
    });

    it('should throw error when stopping non-existent job', () => {
      expect(() => scheduler.stop('nonexistent'))
        .toThrow('Job not found: nonexistent');
    });

    it('should allow stopping already stopped job', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      scheduler.register('test', schedule, job);
      
      expect(() => scheduler.stop('test')).not.toThrow();
    });

    it('should start all jobs', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job1: JobDefinition = {
        name: 'job1',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'job1' }]
            }
          }
        ]
      };
      const job2: JobDefinition = {
        name: 'job2',
        schedule,
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'job2' }]
            }
          }
        ]
      };

      scheduler.register('job1', schedule, job1);
      scheduler.register('job2', schedule, job2);
      scheduler.startAll();

      expect(scheduler.isRunning('job1')).toBe(true);
      expect(scheduler.isRunning('job2')).toBe(true);

      await vi.advanceTimersByTimeAsync(60000);
      
      expect(logOutput).toHaveLength(2);
    });

    it('should stop all jobs', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job1: JobDefinition = {
        name: 'job1',
        schedule,
        body: []
      };
      const job2: JobDefinition = {
        name: 'job2',
        schedule,
        body: []
      };

      scheduler.register('job1', schedule, job1);
      scheduler.register('job2', schedule, job2);
      scheduler.startAll();

      expect(scheduler.isRunning('job1')).toBe(true);
      expect(scheduler.isRunning('job2')).toBe(true);

      scheduler.stopAll();

      expect(scheduler.isRunning('job1')).toBe(false);
      expect(scheduler.isRunning('job2')).toBe(false);
    });
  });

  describe('Enable/Disable', () => {
    it('should be enabled by default', () => {
      expect(scheduler.isEnabled()).toBe(true);
    });

    it('should allow disabling', () => {
      scheduler.disable();
      expect(scheduler.isEnabled()).toBe(false);
    });

    it('should allow enabling', () => {
      scheduler.disable();
      scheduler.enable();
      expect(scheduler.isEnabled()).toBe(true);
    });

    it('should not start jobs when disabled', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      scheduler.disable();
      scheduler.register('test', schedule, job);
      scheduler.start('test');

      expect(scheduler.isRunning('test')).toBe(false);
    });

    it('should allow stopping jobs when disabled', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');
      expect(scheduler.isRunning('test')).toBe(true);

      scheduler.disable();
      scheduler.stop('test');
      
      expect(scheduler.isRunning('test')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should log errors but not crash', async () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: [
          {
            type: 'return',
            value: {
              type: 'identifier',
              name: 'undefinedVariable'
            }
          }
        ]
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');

      await vi.advanceTimersByTimeAsync(60000);
      
      // Should log error
      expect(logOutput.length).toBeGreaterThan(0);
      expect(logOutput[0][0]).toContain('Error in job "test"');
      
      // Should still be running
      expect(scheduler.isRunning('test')).toBe(true);

      // Should continue executing after error
      await vi.advanceTimersByTimeAsync(60000);
      expect(logOutput.length).toBeGreaterThan(1);
    });
  });

  describe('Utility Methods', () => {
    it('should check if job exists', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      expect(scheduler.has('test')).toBe(false);
      
      scheduler.register('test', schedule, job);
      
      expect(scheduler.has('test')).toBe(true);
    });

    it('should get all job names', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job1: JobDefinition = {
        name: 'job1',
        schedule,
        body: []
      };
      const job2: JobDefinition = {
        name: 'job2',
        schedule,
        body: []
      };

      scheduler.register('job1', schedule, job1);
      scheduler.register('job2', schedule, job2);

      const names = scheduler.getJobNames();
      
      expect(names).toContain('job1');
      expect(names).toContain('job2');
      expect(names).toHaveLength(2);
    });

    it('should clear all jobs', () => {
      const schedule: ScheduleExpression = { every: 1, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'test',
        schedule,
        body: []
      };

      scheduler.register('test', schedule, job);
      scheduler.start('test');
      expect(scheduler.has('test')).toBe(true);
      expect(scheduler.isRunning('test')).toBe(true);

      scheduler.clear();

      expect(scheduler.has('test')).toBe(false);
      expect(scheduler.getJobNames()).toHaveLength(0);
    });
  });

  describe('Dog Reminders Example', () => {
    it('should execute mark-due-as-done job', async () => {
      // Setup: Create test data
      db.create('Reminder', { id: 'r1', text: 'Task 1', done: false });
      db.create('Reminder', { id: 'r2', text: 'Task 2', done: false });
      db.create('Reminder', { id: 'r3', text: 'Task 3', done: false });

      // Job: mark-due-as-done every 5 minutes
      const schedule: ScheduleExpression = { every: 5, unit: 'minutes' };
      const job: JobDefinition = {
        name: 'mark-due-as-done',
        schedule,
        body: [
          {
            type: 'let',
            name: 'due',
            value: {
              type: 'call',
              callee: {
                type: 'member',
                object: {
                  type: 'member',
                  object: { type: 'identifier', name: 'db' },
                  property: 'Reminder'
                },
                property: 'findAll'
              },
              arguments: []
            }
          },
          {
            type: 'for',
            item: 'r',
            collection: { type: 'identifier', name: 'due' },
            body: [
              {
                type: 'expression',
                expression: {
                  type: 'call',
                  callee: {
                    type: 'member',
                    object: {
                      type: 'member',
                      object: { type: 'identifier', name: 'db' },
                      property: 'Reminder'
                    },
                    property: 'update'
                  },
                  arguments: [
                    {
                      type: 'member',
                      object: { type: 'identifier', name: 'r' },
                      property: 'id'
                    },
                    {
                      type: 'literal',
                      value: { done: true }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      scheduler.register('mark-due-as-done', schedule, job);
      scheduler.start('mark-due-as-done');

      // Advance time by 5 minutes
      await vi.advanceTimersByTimeAsync(300000);

      // All reminders should be marked as done
      const allReminders = db.findAll('Reminder');
      expect(allReminders.every(r => r.done === true)).toBe(true);
    });
  });
});
