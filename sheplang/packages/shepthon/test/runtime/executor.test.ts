/**
 * StatementExecutor Tests
 * 
 * Comprehensive test suite for statement execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StatementExecutor, ReturnValue } from '../../src/runtime/executor.js';
import { InMemoryDatabase } from '../../src/runtime/database.js';
import type { RuntimeContext, Scope } from '../../src/runtime/evaluator.js';
import type {
  Statement,
  LetStatement,
  ReturnStatement,
  ForStatement,
  IfStatement,
  ExpressionStatement,
} from '../../src/types.js';

describe('StatementExecutor', () => {
  let db: InMemoryDatabase;
  let context: RuntimeContext;
  let scope: Scope;
  let executor: StatementExecutor;
  let logOutput: any[];

  beforeEach(() => {
    db = new InMemoryDatabase();
    logOutput = [];
    
    context = {
      db,
      log: (...args: any[]) => logOutput.push(args),
      now: () => new Date('2025-01-15T12:00:00Z')
    };
    
    scope = new Map();
    executor = new StatementExecutor(context, scope);
  });

  describe('ReturnValue Exception', () => {
    it('should create ReturnValue with value', () => {
      const returnValue = new ReturnValue(42);
      
      expect(returnValue).toBeInstanceOf(Error);
      expect(returnValue.value).toBe(42);
      expect(returnValue.name).toBe('ReturnValue');
    });

    it('should have proper error message', () => {
      const returnValue = new ReturnValue('test');
      expect(returnValue.message).toBe('Return value');
    });
  });

  describe('Let Statement Execution', () => {
    it('should execute let with literal value', async () => {
      const stmt: LetStatement = {
        type: 'let',
        name: 'x',
        value: { type: 'literal', value: 42 }
      };

      await executor.execute(stmt);
      
      expect(scope.get('x')).toBe(42);
    });

    it('should execute let with expression', async () => {
      const stmt: LetStatement = {
        type: 'let',
        name: 'sum',
        value: {
          type: 'binary',
          operator: '+',
          left: { type: 'literal', value: 3 },
          right: { type: 'literal', value: 5 }
        }
      };

      await executor.execute(stmt);
      
      expect(scope.get('sum')).toBe(8);
    });

    it('should execute let with function call', async () => {
      db.create('Reminder', { text: 'Test' });

      const stmt: LetStatement = {
        type: 'let',
        name: 'reminders',
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
      };

      await executor.execute(stmt);
      
      const reminders = scope.get('reminders');
      expect(reminders).toHaveLength(1);
      expect(reminders[0].text).toBe('Test');
    });

    it('should overwrite existing variable', async () => {
      scope.set('x', 10);
      
      const stmt: LetStatement = {
        type: 'let',
        name: 'x',
        value: { type: 'literal', value: 20 }
      };

      await executor.execute(stmt);
      
      expect(scope.get('x')).toBe(20);
    });
  });

  describe('Return Statement Execution', () => {
    it('should throw ReturnValue with literal', async () => {
      const stmt: ReturnStatement = {
        type: 'return',
        value: { type: 'literal', value: 42 }
      };

      await expect(executor.execute(stmt)).rejects.toThrow(ReturnValue);
      
      try {
        await executor.execute(stmt);
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toBe(42);
        }
      }
    });

    it('should throw ReturnValue with expression', async () => {
      scope.set('x', 10);
      scope.set('y', 5);

      const stmt: ReturnStatement = {
        type: 'return',
        value: {
          type: 'binary',
          operator: '+',
          left: { type: 'identifier', name: 'x' },
          right: { type: 'identifier', name: 'y' }
        }
      };

      try {
        await executor.execute(stmt);
        throw new Error('Should have thrown ReturnValue');
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toBe(15);
        } else {
          throw e;
        }
      }
    });

    it('should throw ReturnValue with db query', async () => {
      db.create('Reminder', { text: 'First' });
      db.create('Reminder', { text: 'Second' });

      const stmt: ReturnStatement = {
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
      };

      try {
        await executor.execute(stmt);
        throw new Error('Should have thrown ReturnValue');
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toHaveLength(2);
        } else {
          throw e;
        }
      }
    });
  });

  describe('For Statement Execution', () => {
    it('should iterate over array', async () => {
      scope.set('items', [1, 2, 3]);
      const results: number[] = [];

      const stmt: ForStatement = {
        type: 'for',
        item: 'x',
        collection: { type: 'identifier', name: 'items' },
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: {
                type: 'identifier',
                name: 'log'
              },
              arguments: [{ type: 'identifier', name: 'x' }]
            }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(logOutput).toHaveLength(3);
      expect(logOutput[0][0]).toBe(1);
      expect(logOutput[1][0]).toBe(2);
      expect(logOutput[2][0]).toBe(3);
    });

    it('should create child scope for loop body', async () => {
      scope.set('items', ['a', 'b']);

      const stmt: ForStatement = {
        type: 'for',
        item: 'item',
        collection: { type: 'identifier', name: 'items' },
        body: [
          {
            type: 'let',
            name: 'inner',
            value: { type: 'literal', value: 'inside loop' }
          }
        ]
      };

      await executor.execute(stmt);
      
      // 'inner' should not leak to parent scope
      expect(scope.has('inner')).toBe(false);
    });

    it('should inherit parent scope variables', async () => {
      scope.set('multiplier', 10);
      scope.set('items', [1, 2, 3]);

      const stmt: ForStatement = {
        type: 'for',
        item: 'x',
        collection: { type: 'identifier', name: 'items' },
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [
                {
                  type: 'binary',
                  operator: '*',
                  left: { type: 'identifier', name: 'x' },
                  right: { type: 'identifier', name: 'multiplier' }
                }
              ]
            }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(logOutput).toHaveLength(3);
      expect(logOutput[0][0]).toBe(10);
      expect(logOutput[1][0]).toBe(20);
      expect(logOutput[2][0]).toBe(30);
    });

    it('should work with empty collection', async () => {
      scope.set('items', []);

      const stmt: ForStatement = {
        type: 'for',
        item: 'x',
        collection: { type: 'identifier', name: 'items' },
        body: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'identifier', name: 'x' }]
            }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(logOutput).toHaveLength(0);
    });

    it('should throw error for non-array collection', async () => {
      scope.set('notArray', 'string');

      const stmt: ForStatement = {
        type: 'for',
        item: 'x',
        collection: { type: 'identifier', name: 'notArray' },
        body: []
      };

      await expect(executor.execute(stmt)).rejects.toThrow('must be an array');
    });

    it('should propagate return from loop body', async () => {
      scope.set('items', [1, 2, 3]);

      const stmt: ForStatement = {
        type: 'for',
        item: 'x',
        collection: { type: 'identifier', name: 'items' },
        body: [
          {
            type: 'return',
            value: { type: 'identifier', name: 'x' }
          }
        ]
      };

      try {
        await executor.execute(stmt);
        throw new Error('Should have thrown ReturnValue');
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toBe(1); // First iteration
        } else {
          throw e;
        }
      }
    });
  });

  describe('If Statement Execution', () => {
    it('should execute then block when condition is true', async () => {
      const stmt: IfStatement = {
        type: 'if',
        condition: { type: 'literal', value: true },
        thenBody: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'then' }]
            }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0][0]).toBe('then');
    });

    it('should execute else block when condition is false', async () => {
      const stmt: IfStatement = {
        type: 'if',
        condition: { type: 'literal', value: false },
        thenBody: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'then' }]
            }
          }
        ],
        elseBody: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'else' }]
            }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0][0]).toBe('else');
    });

    it('should evaluate condition expression', async () => {
      scope.set('x', 15);

      const stmt: IfStatement = {
        type: 'if',
        condition: {
          type: 'binary',
          operator: '>',
          left: { type: 'identifier', name: 'x' },
          right: { type: 'literal', value: 10 }
        },
        thenBody: [
          {
            type: 'expression',
            expression: {
              type: 'call',
              callee: { type: 'identifier', name: 'log' },
              arguments: [{ type: 'literal', value: 'greater' }]
            }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(logOutput[0][0]).toBe('greater');
    });

    it('should create child scope for then block', async () => {
      const stmt: IfStatement = {
        type: 'if',
        condition: { type: 'literal', value: true },
        thenBody: [
          {
            type: 'let',
            name: 'inner',
            value: { type: 'literal', value: 'inside then' }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(scope.has('inner')).toBe(false);
    });

    it('should create child scope for else block', async () => {
      const stmt: IfStatement = {
        type: 'if',
        condition: { type: 'literal', value: false },
        thenBody: [],
        elseBody: [
          {
            type: 'let',
            name: 'inner',
            value: { type: 'literal', value: 'inside else' }
          }
        ]
      };

      await executor.execute(stmt);
      
      expect(scope.has('inner')).toBe(false);
    });

    it('should propagate return from then block', async () => {
      const stmt: IfStatement = {
        type: 'if',
        condition: { type: 'literal', value: true },
        thenBody: [
          {
            type: 'return',
            value: { type: 'literal', value: 'returned from then' }
          }
        ]
      };

      try {
        await executor.execute(stmt);
        throw new Error('Should have thrown ReturnValue');
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toBe('returned from then');
        } else {
          throw e;
        }
      }
    });

    it('should propagate return from else block', async () => {
      const stmt: IfStatement = {
        type: 'if',
        condition: { type: 'literal', value: false },
        thenBody: [],
        elseBody: [
          {
            type: 'return',
            value: { type: 'literal', value: 'returned from else' }
          }
        ]
      };

      try {
        await executor.execute(stmt);
        throw new Error('Should have thrown ReturnValue');
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toBe('returned from else');
        } else {
          throw e;
        }
      }
    });
  });

  describe('Expression Statement Execution', () => {
    it('should execute expression and discard result', async () => {
      const stmt: ExpressionStatement = {
        type: 'expression',
        expression: {
          type: 'call',
          callee: { type: 'identifier', name: 'log' },
          arguments: [{ type: 'literal', value: 'hello' }]
        }
      };

      await executor.execute(stmt);
      
      expect(logOutput[0][0]).toBe('hello');
    });

    it('should execute db operations', async () => {
      const stmt: ExpressionStatement = {
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
            property: 'create'
          },
          arguments: [
            { type: 'literal', value: { text: 'Test' } }
          ]
        }
      };

      await executor.execute(stmt);
      
      expect(db.count('Reminder')).toBe(1);
    });
  });

  describe('Block Execution', () => {
    it('should execute multiple statements in sequence', async () => {
      const statements: Statement[] = [
        {
          type: 'let',
          name: 'x',
          value: { type: 'literal', value: 10 }
        },
        {
          type: 'let',
          name: 'y',
          value: { type: 'literal', value: 20 }
        },
        {
          type: 'expression',
          expression: {
            type: 'call',
            callee: { type: 'identifier', name: 'log' },
            arguments: [
              {
                type: 'binary',
                operator: '+',
                left: { type: 'identifier', name: 'x' },
                right: { type: 'identifier', name: 'y' }
              }
            ]
          }
        }
      ];

      await executor.executeBlock(statements);
      
      expect(scope.get('x')).toBe(10);
      expect(scope.get('y')).toBe(20);
      expect(logOutput[0][0]).toBe(30);
    });

    it('should return null when no return statement', async () => {
      const statements: Statement[] = [
        {
          type: 'let',
          name: 'x',
          value: { type: 'literal', value: 42 }
        }
      ];

      const result = await executor.executeBlock(statements);
      
      expect(result).toBeNull();
    });

    it('should return value from return statement', async () => {
      const statements: Statement[] = [
        {
          type: 'let',
          name: 'x',
          value: { type: 'literal', value: 42 }
        },
        {
          type: 'return',
          value: { type: 'identifier', name: 'x' }
        }
      ];

      const result = await executor.executeBlock(statements);
      
      expect(result).toBe(42);
    });

    it('should stop execution after return', async () => {
      const statements: Statement[] = [
        {
          type: 'return',
          value: { type: 'literal', value: 'early' }
        },
        {
          type: 'expression',
          expression: {
            type: 'call',
            callee: { type: 'identifier', name: 'log' },
            arguments: [{ type: 'literal', value: 'should not execute' }]
          }
        }
      ];

      const result = await executor.executeBlock(statements);
      
      expect(result).toBe('early');
      expect(logOutput).toHaveLength(0);
    });
  });

  describe('Dog Reminders Example', () => {
    it('should execute GET /reminders endpoint', async () => {
      // Setup: Create test data
      db.create('Reminder', { text: 'Walk dog', time: new Date(), done: false });
      db.create('Reminder', { text: 'Feed dog', time: new Date(), done: false });

      // Endpoint body: return db.Reminder.findAll()
      const statements: Statement[] = [
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
      ];

      const result = await executor.executeBlock(statements);
      
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Walk dog');
      expect(result[1].text).toBe('Feed dog');
    });

    it('should execute POST /reminders endpoint', async () => {
      // Endpoint parameters
      scope.set('text', 'Walk Milo');
      scope.set('time', new Date('2025-01-15T14:00:00Z'));

      // Endpoint body:
      // let reminder = db.Reminder.create({ text, time })
      // return reminder
      const statements: Statement[] = [
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
      ];

      const result = await executor.executeBlock(statements);
      
      expect(result).toHaveProperty('id');
      expect(result.text).toBe('Walk Milo');
      expect(result.done).toBe(false);
      expect(db.count('Reminder')).toBe(1);
    });

    it('should execute mark-due-as-done job', async () => {
      // Setup: Create overdue reminders
      db.create('Reminder', { id: 'r1', text: 'Task 1', time: new Date('2025-01-15T10:00:00Z'), done: false });
      db.create('Reminder', { id: 'r2', text: 'Task 2', time: new Date('2025-01-15T11:00:00Z'), done: false });
      db.create('Reminder', { id: 'r3', text: 'Task 3', time: new Date('2025-01-15T18:00:00Z'), done: false });

      // Job body (simplified - no predicate):
      // let due = db.Reminder.find()
      // for r in due {
      //   db.Reminder.update(r.id, { done: true })
      // }
      const statements: Statement[] = [
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
      ];

      await executor.executeBlock(statements);
      
      // All reminders should be marked as done
      const allReminders = db.findAll('Reminder');
      expect(allReminders.every(r => r.done === true)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should wrap errors with context', async () => {
      const stmt: LetStatement = {
        type: 'let',
        name: 'x',
        value: {
          type: 'identifier',
          name: 'undefinedVariable'
        }
      };

      await expect(executor.execute(stmt)).rejects.toThrow('Error executing statement');
    });

    it('should not wrap ReturnValue exceptions', async () => {
      const stmt: ReturnStatement = {
        type: 'return',
        value: { type: 'literal', value: 42 }
      };

      await expect(executor.execute(stmt)).rejects.toThrow(ReturnValue);
    });
  });

  describe('Scope Management', () => {
    it('should get current scope', () => {
      scope.set('x', 42);
      const currentScope = executor.getScope();
      
      expect(currentScope.get('x')).toBe(42);
    });

    it('should create executor with new scope', async () => {
      const newScope = new Map([['y', 100]]);
      const newExecutor = executor.withScope(newScope);
      
      const stmt: ReturnStatement = {
        type: 'return',
        value: { type: 'identifier', name: 'y' }
      };

      try {
        await newExecutor.execute(stmt);
      } catch (e) {
        if (e instanceof ReturnValue) {
          expect(e.value).toBe(100);
        }
      }
    });
  });
});
