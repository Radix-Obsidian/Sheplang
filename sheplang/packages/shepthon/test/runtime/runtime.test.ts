/**
 * ShepThonRuntime Tests
 * 
 * Comprehensive test suite for full runtime orchestration
 * Includes Dog Reminders E2E integration test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ShepThonRuntime } from '../../src/runtime/index.js';
import type { ShepThonApp } from '../../src/types.js';

describe('ShepThonRuntime', () => {
  describe('Initialization', () => {
    it('should initialize with empty app', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      
      expect(runtime).toBeDefined();
      expect(runtime.getDatabase()).toBeDefined();
      expect(runtime.getRouter()).toBeDefined();
      expect(runtime.getScheduler()).toBeDefined();
    });

    it('should initialize database tables from models', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [
          {
            name: 'User',
            fields: [
              { name: 'id', type: 'id', defaultValue: null },
              { name: 'name', type: 'string', defaultValue: null }
            ]
          },
          {
            name: 'Post',
            fields: [
              { name: 'id', type: 'id', defaultValue: null },
              { name: 'title', type: 'string', defaultValue: null }
            ]
          }
        ],
        endpoints: [],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const db = runtime.getDatabase();
      
      expect(db.hasTable('User')).toBe(true);
      expect(db.hasTable('Post')).toBe(true);
    });

    it('should register endpoints from app', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [
          {
            method: 'GET',
            path: '/test',
            parameters: [],
            returnType: { type: 'string', isArray: false },
            body: []
          }
        ],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const router = runtime.getRouter();
      
      expect(router.has('GET', '/test')).toBe(true);
    });

    it('should register jobs from app', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: [
          {
            name: 'test-job',
            schedule: { every: 5, unit: 'minutes' },
            body: []
          }
        ]
      };

      const runtime = new ShepThonRuntime(app);
      const scheduler = runtime.getScheduler();
      
      expect(scheduler.has('test-job')).toBe(true);
    });
  });

  describe('Endpoint Execution', () => {
    it('should call endpoint and return result', async () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [
          {
            method: 'GET',
            path: '/hello',
            parameters: [],
            returnType: { type: 'string', isArray: false },
            body: [
              {
                type: 'return',
                value: { type: 'literal', value: 'Hello World' }
              }
            ]
          }
        ],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const result = await runtime.callEndpoint('GET', '/hello');
      
      expect(result).toBe('Hello World');
    });

    it('should call endpoint with parameters', async () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [
          {
            method: 'POST',
            path: '/echo',
            parameters: [
              { name: 'message', type: 'string', optional: false }
            ],
            returnType: { type: 'string', isArray: false },
            body: [
              {
                type: 'return',
                value: { type: 'identifier', name: 'message' }
              }
            ]
          }
        ],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const result = await runtime.callEndpoint('POST', '/echo', { message: 'Test' });
      
      expect(result).toBe('Test');
    });

    it('should access database in endpoint', async () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [
          {
            name: 'User',
            fields: [
              { name: 'id', type: 'id', defaultValue: null },
              { name: 'name', type: 'string', defaultValue: null }
            ]
          }
        ],
        endpoints: [
          {
            method: 'GET',
            path: '/users',
            parameters: [],
            returnType: { type: 'User', isArray: true },
            body: [
              {
                type: 'return',
                value: {
                  type: 'call',
                  callee: {
                    type: 'member',
                    object: {
                      type: 'member',
                      object: { type: 'identifier', name: 'db' },
                      property: 'User'
                    },
                    property: 'findAll'
                  },
                  arguments: []
                }
              }
            ]
          }
        ],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const db = runtime.getDatabase();
      
      db.create('User', { name: 'Alice' });
      db.create('User', { name: 'Bob' });

      const result = await runtime.callEndpoint('GET', '/users');
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
    });
  });

  describe('Job Management', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should start all jobs', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: [
          {
            name: 'job1',
            schedule: { every: 1, unit: 'minutes' },
            body: []
          },
          {
            name: 'job2',
            schedule: { every: 1, unit: 'minutes' },
            body: []
          }
        ]
      };

      const runtime = new ShepThonRuntime(app);
      const scheduler = runtime.getScheduler();
      
      runtime.startJobs();
      
      expect(scheduler.isRunning('job1')).toBe(true);
      expect(scheduler.isRunning('job2')).toBe(true);
    });

    it('should stop all jobs', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: [
          {
            name: 'job1',
            schedule: { every: 1, unit: 'minutes' },
            body: []
          }
        ]
      };

      const runtime = new ShepThonRuntime(app);
      const scheduler = runtime.getScheduler();
      
      runtime.startJobs();
      expect(scheduler.isRunning('job1')).toBe(true);
      
      runtime.stopJobs();
      expect(scheduler.isRunning('job1')).toBe(false);
    });
  });

  describe('Dog Reminders E2E Integration', () => {
    let runtime: ShepThonRuntime;

    beforeEach(() => {
      // The complete Dog Reminders app AST
      const app: ShepThonApp = {
        name: 'DogReminders',
        models: [
          {
            name: 'Reminder',
            fields: [
              { name: 'id', type: 'id', defaultValue: null },
              { name: 'text', type: 'string', defaultValue: null },
              { name: 'time', type: 'datetime', defaultValue: null },
              { name: 'done', type: 'bool', defaultValue: false }
            ]
          }
        ],
        endpoints: [
          {
            method: 'GET',
            path: '/reminders',
            parameters: [],
            returnType: { type: 'Reminder', isArray: true },
            body: [
              {
                type: 'return',
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
              }
            ]
          },
          {
            method: 'POST',
            path: '/reminders',
            parameters: [
              { name: 'text', type: 'string', optional: false },
              { name: 'time', type: 'datetime', optional: false }
            ],
            returnType: { type: 'Reminder', isArray: false },
            body: [
              {
                type: 'let',
                name: 'reminder',
                value: {
                  type: 'call',
                  callee: {
                    type: 'member',
                    object: {
                      type: 'member',
                      object: { type: 'identifier', name: 'db' },
                      property: 'Reminder'
                    },
                    property: 'create'
                  },
                  arguments: [
                    {
                      type: 'literal',
                      value: {
                        text: 'placeholder',
                        time: new Date(),
                        done: false
                      }
                    }
                  ]
                }
              },
              {
                type: 'return',
                value: { type: 'identifier', name: 'reminder' }
              }
            ]
          }
        ],
        jobs: [
          {
            name: 'mark-due-as-done',
            schedule: { every: 5, unit: 'minutes' },
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
          }
        ]
      };

      runtime = new ShepThonRuntime(app);
      vi.useFakeTimers();
    });

    afterEach(() => {
      runtime.stopJobs();
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should execute GET /reminders (empty)', async () => {
      const reminders = await runtime.callEndpoint('GET', '/reminders');
      
      expect(reminders).toEqual([]);
    });

    it('should execute POST /reminders', async () => {
      const body = {
        text: 'Walk Milo',
        time: new Date('2025-01-15T14:00:00Z')
      };

      const reminder = await runtime.callEndpoint('POST', '/reminders', body);
      
      expect(reminder).toHaveProperty('id');
      expect(reminder.text).toBe('placeholder'); // Using placeholder from literal
      expect(reminder.done).toBe(false);
    });

    it('should execute GET /reminders (with data)', async () => {
      // Create reminders directly
      const db = runtime.getDatabase();
      db.create('Reminder', { text: 'Walk dog', time: new Date(), done: false });
      db.create('Reminder', { text: 'Feed dog', time: new Date(), done: false });

      const reminders = await runtime.callEndpoint('GET', '/reminders');
      
      expect(reminders).toHaveLength(2);
      expect(reminders[0].text).toBe('Walk dog');
      expect(reminders[1].text).toBe('Feed dog');
    });

    it('should execute mark-due-as-done job', async () => {
      // Create test data
      const db = runtime.getDatabase();
      db.create('Reminder', { id: 'r1', text: 'Task 1', done: false });
      db.create('Reminder', { id: 'r2', text: 'Task 2', done: false });
      db.create('Reminder', { id: 'r3', text: 'Task 3', done: false });

      // Start jobs
      runtime.startJobs();

      // Advance time by 5 minutes
      await vi.advanceTimersByTimeAsync(300000);

      // All reminders should be marked as done
      const allReminders = db.findAll('Reminder');
      expect(allReminders.every(r => r.done === true)).toBe(true);
    });

    it('should handle full workflow: POST → GET → Job', async () => {
      // 1. POST new reminder
      const body = {
        text: 'Walk Milo',
        time: new Date('2025-01-15T14:00:00Z')
      };
      await runtime.callEndpoint('POST', '/reminders', body);

      // 2. GET all reminders
      let reminders = await runtime.callEndpoint('GET', '/reminders');
      expect(reminders).toHaveLength(1);
      expect(reminders[0].done).toBe(false);

      // 3. Start job
      runtime.startJobs();

      // 4. Advance time by 5 minutes (job executes)
      await vi.advanceTimersByTimeAsync(300000);

      // 5. GET reminders again
      reminders = await runtime.callEndpoint('GET', '/reminders');
      expect(reminders).toHaveLength(1);
      expect(reminders[0].done).toBe(true);
    });

    it('should handle multiple reminders in workflow', async () => {
      const db = runtime.getDatabase();
      
      // Create multiple reminders
      db.create('Reminder', { text: 'Walk Milo', time: new Date(), done: false });
      db.create('Reminder', { text: 'Feed Milo', time: new Date(), done: false });
      db.create('Reminder', { text: 'Play with Milo', time: new Date(), done: false });

      // GET all reminders
      const beforeJob = await runtime.callEndpoint('GET', '/reminders');
      expect(beforeJob).toHaveLength(3);
      expect(beforeJob.every((r: any) => r.done === false)).toBe(true);

      // Start job
      runtime.startJobs();

      // Advance time
      await vi.advanceTimersByTimeAsync(300000);

      // GET all reminders after job
      const afterJob = await runtime.callEndpoint('GET', '/reminders');
      expect(afterJob).toHaveLength(3);
      expect(afterJob.every((r: any) => r.done === true)).toBe(true);
    });

    it('should verify database isolation between endpoints', async () => {
      const db = runtime.getDatabase();
      
      // Create reminder directly in database
      db.create('Reminder', { text: 'Direct', done: false });

      // Call endpoint
      await runtime.callEndpoint('POST', '/reminders', {
        text: 'Via endpoint',
        time: new Date()
      });

      // Both should be accessible
      const reminders = await runtime.callEndpoint('GET', '/reminders');
      expect(reminders).toHaveLength(2);
    });
  });

  describe('Component Access', () => {
    it('should provide access to database', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const db = runtime.getDatabase();
      
      expect(db).toBeDefined();
      expect(db.getTableNames).toBeDefined();
    });

    it('should provide access to router', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const router = runtime.getRouter();
      
      expect(router).toBeDefined();
      expect(router.getRoutes).toBeDefined();
    });

    it('should provide access to scheduler', () => {
      const app: ShepThonApp = {
        name: 'TestApp',
        models: [],
        endpoints: [],
        jobs: []
      };

      const runtime = new ShepThonRuntime(app);
      const scheduler = runtime.getScheduler();
      
      expect(scheduler).toBeDefined();
      expect(scheduler.getJobNames).toBeDefined();
    });
  });
});
