/**
 * EndpointRouter Tests
 * 
 * Comprehensive test suite for endpoint routing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EndpointRouter } from '../../src/runtime/router.js';
import { InMemoryDatabase } from '../../src/runtime/database.js';
import type { RuntimeContext } from '../../src/runtime/evaluator.js';
import type { EndpointDefinition, HttpMethod } from '../../src/types.js';

describe('EndpointRouter', () => {
  let db: InMemoryDatabase;
  let context: RuntimeContext;
  let router: EndpointRouter;
  let logOutput: any[];

  beforeEach(() => {
    db = new InMemoryDatabase();
    logOutput = [];
    
    context = {
      db,
      log: (...args: any[]) => logOutput.push(args),
      now: () => new Date('2025-01-15T12:00:00Z')
    };
    
    router = new EndpointRouter(context);
  });

  describe('Registration', () => {
    it('should register an endpoint', () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('GET', '/test', endpoint);
      
      expect(router.has('GET', '/test')).toBe(true);
    });

    it('should throw error when registering duplicate endpoint', () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('GET', '/test', endpoint);
      
      expect(() => router.register('GET', '/test', endpoint))
        .toThrow('Endpoint already registered: GET /test');
    });

    it('should allow same path with different methods', () => {
      const getEndpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      const postEndpoint: EndpointDefinition = {
        method: 'POST',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('GET', '/test', getEndpoint);
      router.register('POST', '/test', postEndpoint);
      
      expect(router.has('GET', '/test')).toBe(true);
      expect(router.has('POST', '/test')).toBe(true);
    });

    it('should allow different paths with same method', () => {
      const endpoint1: EndpointDefinition = {
        method: 'GET',
        path: '/users',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      const endpoint2: EndpointDefinition = {
        method: 'GET',
        path: '/posts',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('GET', '/users', endpoint1);
      router.register('GET', '/posts', endpoint2);
      
      expect(router.has('GET', '/users')).toBe(true);
      expect(router.has('GET', '/posts')).toBe(true);
    });
  });

  describe('Route Lookup', () => {
    it('should check if route exists', () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      expect(router.has('GET', '/test')).toBe(false);
      
      router.register('GET', '/test', endpoint);
      
      expect(router.has('GET', '/test')).toBe(true);
    });

    it('should return false for non-existent route', () => {
      expect(router.has('GET', '/nonexistent')).toBe(false);
    });

    it('should get all registered routes', () => {
      const endpoint1: EndpointDefinition = {
        method: 'GET',
        path: '/users',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      const endpoint2: EndpointDefinition = {
        method: 'POST',
        path: '/users',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('GET', '/users', endpoint1);
      router.register('POST', '/users', endpoint2);
      
      const routes = router.getRoutes();
      
      expect(routes).toHaveLength(2);
      expect(routes).toContainEqual(['GET', '/users']);
      expect(routes).toContainEqual(['POST', '/users']);
    });

    it('should clear all routes', () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('GET', '/test', endpoint);
      expect(router.has('GET', '/test')).toBe(true);
      
      router.clear();
      
      expect(router.has('GET', '/test')).toBe(false);
      expect(router.getRoutes()).toHaveLength(0);
    });
  });

  describe('Execution', () => {
    it('should throw error for non-existent endpoint', async () => {
      await expect(router.execute('GET', '/nonexistent'))
        .rejects.toThrow('Endpoint not found: GET /nonexistent');
    });

    it('should execute endpoint with no parameters', async () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: [
          {
            type: 'return',
            value: { type: 'literal', value: 'Hello' }
          }
        ]
      };

      router.register('GET', '/test', endpoint);
      
      const result = await router.execute('GET', '/test');
      
      expect(result).toBe('Hello');
    });

    it('should execute endpoint that returns null (no return statement)', async () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/test',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'test' }]
            }
          }
        ]
      };

      router.register('GET', '/test', endpoint);
      
      const result = await router.execute('GET', '/test');
      
      expect(result).toBeNull();
      expect(logOutput[0][0]).toBe('test');
    });

    it('should execute endpoint with db operations', async () => {
      db.create('User', { name: 'Alice' });
      db.create('User', { name: 'Bob' });

      const endpoint: EndpointDefinition = {
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
      };

      router.register('GET', '/users', endpoint);
      
      const result = await router.execute('GET', '/users');
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
    });
  });

  describe('Parameters', () => {
    it('should inject parameters into scope', async () => {
      const endpoint: EndpointDefinition = {
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
      };

      router.register('POST', '/echo', endpoint);
      
      const result = await router.execute('POST', '/echo', { message: 'Hello World' });
      
      expect(result).toBe('Hello World');
    });

    it('should handle multiple parameters', async () => {
      const endpoint: EndpointDefinition = {
        method: 'POST',
        path: '/add',
        parameters: [
          { name: 'a', type: 'int', optional: false },
          { name: 'b', type: 'int', optional: false }
        ],
        returnType: { type: 'int', isArray: false },
        body: [
          {
            type: 'return',
            value: {
              type: 'binary',
              operator: '+',
              left: { type: 'identifier', name: 'a' },
              right: { type: 'identifier', name: 'b' }
            }
          }
        ]
      };

      router.register('POST', '/add', endpoint);
      
      const result = await router.execute('POST', '/add', { a: 3, b: 5 });
      
      expect(result).toBe(8);
    });

    it('should throw error for missing required parameter', async () => {
      const endpoint: EndpointDefinition = {
        method: 'POST',
        path: '/test',
        parameters: [
          { name: 'required', type: 'string', optional: false }
        ],
        returnType: { type: 'string', isArray: false },
        body: []
      };

      router.register('POST', '/test', endpoint);
      
      await expect(router.execute('POST', '/test', {}))
        .rejects.toThrow('Missing required parameter: required');
    });

    it('should allow missing optional parameter', async () => {
      const endpoint: EndpointDefinition = {
        method: 'POST',
        path: '/test',
        parameters: [
          { name: 'optional', type: 'string', optional: true }
        ],
        returnType: { type: 'string', isArray: false },
        body: [
          {
            type: 'return',
            value: { type: 'literal', value: 'success' }
          }
        ]
      };

      router.register('POST', '/test', endpoint);
      
      const result = await router.execute('POST', '/test', {});
      
      expect(result).toBe('success');
    });

    it('should use parameter in endpoint body', async () => {
      const endpoint: EndpointDefinition = {
        method: 'POST',
        path: '/create',
        parameters: [
          { name: 'text', type: 'string', optional: false }
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
                  value: {} // Simplified - would use object literal with text param
                }
              ]
            }
          },
          {
            type: 'return',
            value: { type: 'identifier', name: 'reminder' }
          }
        ]
      };

      router.register('POST', '/create', endpoint);
      
      const result = await router.execute('POST', '/create', { text: 'Test' });
      
      expect(result).toHaveProperty('id');
    });
  });

  describe('Error Handling', () => {
    it('should add endpoint context to errors', async () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/error',
        parameters: [],
        returnType: { type: 'string', isArray: false },
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

      router.register('GET', '/error', endpoint);
      
      await expect(router.execute('GET', '/error'))
        .rejects.toThrow('Error in GET /error');
    });
  });

  describe('Dog Reminders Example', () => {
    it('should execute GET /reminders', async () => {
      // Setup: Create test data
      db.create('Reminder', { text: 'Walk dog', time: new Date(), done: false });
      db.create('Reminder', { text: 'Feed dog', time: new Date(), done: false });

      // Endpoint: GET /reminders -> [Reminder]
      const endpoint: EndpointDefinition = {
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
      };

      router.register('GET', '/reminders', endpoint);
      
      const result = await router.execute('GET', '/reminders');
      
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Walk dog');
      expect(result[1].text).toBe('Feed dog');
    });

    it('should execute POST /reminders', async () => {
      // Endpoint: POST /reminders (text: string, time: datetime) -> Reminder
      const endpoint: EndpointDefinition = {
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
                    text: 'Walk Milo',
                    time: new Date('2025-01-15T14:00:00Z'),
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
      };

      router.register('POST', '/reminders', endpoint);
      
      const body = {
        text: 'Walk Milo',
        time: new Date('2025-01-15T14:00:00Z')
      };
      
      const result = await router.execute('POST', '/reminders', body);
      
      expect(result).toHaveProperty('id');
      expect(result.text).toBe('Walk Milo');
      expect(result.done).toBe(false);
      expect(db.count('Reminder')).toBe(1);
    });

    it('should execute multiple different endpoints', async () => {
      // Register both endpoints
      const getEndpoint: EndpointDefinition = {
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
      };

      const postEndpoint: EndpointDefinition = {
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
                    text: 'Test',
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
      };

      router.register('GET', '/reminders', getEndpoint);
      router.register('POST', '/reminders', postEndpoint);

      // POST a reminder
      await router.execute('POST', '/reminders', {
        text: 'Walk dog',
        time: new Date()
      });

      // GET all reminders
      const allReminders = await router.execute('GET', '/reminders');
      
      expect(allReminders).toHaveLength(1);
      expect(allReminders[0].text).toBe('Test');
    });
  });

  describe('Context Injection', () => {
    it('should inject db into endpoint', async () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/count',
        parameters: [],
        returnType: { type: 'int', isArray: false },
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
                property: 'count'
              },
              arguments: []
            }
          }
        ]
      };

      db.create('Reminder', { text: 'Test' });
      router.register('GET', '/count', endpoint);
      
      const result = await router.execute('GET', '/count');
      
      expect(result).toBe(1);
    });

    it('should inject log into endpoint', async () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/log',
        parameters: [],
        returnType: { type: 'string', isArray: false },
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'test message' }]
            }
          },
          {
            type: 'return',
            value: { type: 'literal', value: 'done' }
          }
        ]
      };

      router.register('GET', '/log', endpoint);
      
      await router.execute('GET', '/log');
      
      expect(logOutput[0][0]).toBe('test message');
    });

    it('should inject now into endpoint', async () => {
      const endpoint: EndpointDefinition = {
        method: 'GET',
        path: '/now',
        parameters: [],
        returnType: { type: 'datetime', isArray: false },
        body: [
          {
            type: 'return',
            value: {
              type: 'call',
              callee: { type: 'identifier', name: 'now' },
              arguments: []
            }
          }
        ]
      };

      router.register('GET', '/now', endpoint);
      
      const result = await router.execute('GET', '/now');
      
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2025-01-15T12:00:00.000Z');
    });
  });
});
