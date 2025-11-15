/**
 * ExpressionEvaluator Tests
 * 
 * Comprehensive test suite for expression evaluation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExpressionEvaluator, type RuntimeContext, type Scope } from '../../src/runtime/evaluator.js';
import { InMemoryDatabase } from '../../src/runtime/database.js';
import type { Expression, Literal, Identifier, MemberExpression, CallExpression, BinaryExpression } from '../../src/types.js';

describe('ExpressionEvaluator', () => {
  let db: InMemoryDatabase;
  let context: RuntimeContext;
  let scope: Scope;
  let evaluator: ExpressionEvaluator;

  beforeEach(() => {
    db = new InMemoryDatabase();
    context = {
      db,
      log: (...args: any[]) => console.log(...args),
      now: () => new Date('2025-01-15T12:00:00Z')
    };
    scope = new Map();
    evaluator = new ExpressionEvaluator(context, scope);
  });

  describe('Literal Evaluation', () => {
    it('should evaluate string literal', async () => {
      const expr: Literal = { type: 'literal', value: 'hello' };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe('hello');
    });

    it('should evaluate number literal', async () => {
      const expr: Literal = { type: 'literal', value: 42 };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(42);
    });

    it('should evaluate boolean literal (true)', async () => {
      const expr: Literal = { type: 'literal', value: true };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(true);
    });

    it('should evaluate boolean literal (false)', async () => {
      const expr: Literal = { type: 'literal', value: false };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(false);
    });

    it('should evaluate null literal', async () => {
      const expr: Literal = { type: 'literal', value: null };
      const result = await evaluator.evaluate(expr);
      expect(result).toBeNull();
    });
  });

  describe('Identifier Evaluation', () => {
    it('should evaluate identifier from scope', async () => {
      scope.set('x', 42);
      const expr: Identifier = { type: 'identifier', name: 'x' };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(42);
    });

    it('should evaluate db identifier', async () => {
      const expr: Identifier = { type: 'identifier', name: 'db' };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(db);
    });

    it('should evaluate log identifier', async () => {
      const expr: Identifier = { type: 'identifier', name: 'log' };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(context.log);
    });

    it('should evaluate now identifier', async () => {
      const expr: Identifier = { type: 'identifier', name: 'now' };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe(context.now);
    });

    it('should throw error for undefined identifier', async () => {
      const expr: Identifier = { type: 'identifier', name: 'undefined' };
      await expect(evaluator.evaluate(expr)).rejects.toThrow('Undefined variable: undefined');
    });

    it('should prioritize scope over context', async () => {
      scope.set('db', 'overridden');
      const expr: Identifier = { type: 'identifier', name: 'db' };
      const result = await evaluator.evaluate(expr);
      expect(result).toBe('overridden');
    });
  });

  describe('Member Access Evaluation', () => {
    it('should access db.ModelName and return model proxy', async () => {
      const expr: MemberExpression = {
        type: 'member',
        object: { type: 'identifier', name: 'db' },
        property: 'Reminder'
      };

      const result = await evaluator.evaluate(expr);
      
      expect(result).toHaveProperty('create');
      expect(result).toHaveProperty('findAll');
      expect(result).toHaveProperty('find');
      expect(result).toHaveProperty('update');
      expect(result).toHaveProperty('delete');
    });

    it('should access object property', async () => {
      scope.set('user', { name: 'Alice', age: 30 });
      
      const expr: MemberExpression = {
        type: 'member',
        object: { type: 'identifier', name: 'user' },
        property: 'name'
      };

      const result = await evaluator.evaluate(expr);
      expect(result).toBe('Alice');
    });

    it('should access nested properties', async () => {
      scope.set('data', { user: { name: 'Bob' } });
      
      const expr: MemberExpression = {
        type: 'member',
        object: {
          type: 'member',
          object: { type: 'identifier', name: 'data' },
          property: 'user'
        },
        property: 'name'
      };

      const result = await evaluator.evaluate(expr);
      expect(result).toBe('Bob');
    });

    it('should throw error when accessing property of null', async () => {
      scope.set('x', null);
      
      const expr: MemberExpression = {
        type: 'member',
        object: { type: 'identifier', name: 'x' },
        property: 'prop'
      };

      await expect(evaluator.evaluate(expr)).rejects.toThrow('Cannot access property');
    });

    it('should throw error when accessing property of undefined', async () => {
      scope.set('x', undefined);
      
      const expr: MemberExpression = {
        type: 'member',
        object: { type: 'identifier', name: 'x' },
        property: 'prop'
      };

      await expect(evaluator.evaluate(expr)).rejects.toThrow('Cannot access property');
    });
  });

  describe('Model Proxy', () => {
    it('should call create on model proxy', async () => {
      const expr: CallExpression = {
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
          { type: 'literal', value: { text: 'Test', done: false } }
        ]
      };

      const result = await evaluator.evaluate(expr);
      
      expect(result).toHaveProperty('id');
      expect(result.text).toBe('Test');
      expect(result.done).toBe(false);
    });

    it('should call findAll on model proxy', async () => {
      db.create('Reminder', { text: 'First' });
      db.create('Reminder', { text: 'Second' });

      const expr: CallExpression = {
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
      };

      const result = await evaluator.evaluate(expr);
      
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('First');
      expect(result[1].text).toBe('Second');
    });

    it('should call find with predicate on model proxy', async () => {
      db.create('Reminder', { text: 'Task 1', done: true });
      db.create('Reminder', { text: 'Task 2', done: false });

      // Create a function in scope for the predicate
      scope.set('isDone', (r: any) => r.done === true);

      const expr: CallExpression = {
        type: 'call',
        callee: {
          type: 'member',
          object: {
            type: 'member',
            object: { type: 'identifier', name: 'db' },
            property: 'Reminder'
          },
          property: 'find'
        },
        arguments: [
          { type: 'identifier', name: 'isDone' }
        ]
      };

      const result = await evaluator.evaluate(expr);
      
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Task 1');
      expect(result[0].done).toBe(true);
    });

    it('should call update on model proxy', async () => {
      const created = db.create('Reminder', { text: 'Original', done: false });

      scope.set('reminderId', created.id);

      const expr: CallExpression = {
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
          { type: 'identifier', name: 'reminderId' },
          { type: 'literal', value: { done: true } }
        ]
      };

      const result = await evaluator.evaluate(expr);
      
      expect(result.id).toBe(created.id);
      expect(result.done).toBe(true);
    });
  });

  describe('Function Call Evaluation', () => {
    it('should call now() function', async () => {
      const expr: CallExpression = {
        type: 'call',
        callee: { type: 'identifier', name: 'now' },
        arguments: []
      };

      const result = await evaluator.evaluate(expr);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2025-01-15T12:00:00.000Z');
    });

    it('should call function from scope', async () => {
      scope.set('add', (a: number, b: number) => a + b);

      const expr: CallExpression = {
        type: 'call',
        callee: { type: 'identifier', name: 'add' },
        arguments: [
          { type: 'literal', value: 3 },
          { type: 'literal', value: 5 }
        ]
      };

      const result = await evaluator.evaluate(expr);
      expect(result).toBe(8);
    });

    it('should evaluate arguments before calling', async () => {
      scope.set('multiply', (a: number, b: number) => a * b);
      scope.set('x', 4);
      scope.set('y', 7);

      const expr: CallExpression = {
        type: 'call',
        callee: { type: 'identifier', name: 'multiply' },
        arguments: [
          { type: 'identifier', name: 'x' },
          { type: 'identifier', name: 'y' }
        ]
      };

      const result = await evaluator.evaluate(expr);
      expect(result).toBe(28);
    });

    it('should throw error when calling non-function', async () => {
      scope.set('notAFunction', 42);

      const expr: CallExpression = {
        type: 'call',
        callee: { type: 'identifier', name: 'notAFunction' },
        arguments: []
      };

      await expect(evaluator.evaluate(expr)).rejects.toThrow('Cannot call non-function');
    });
  });

  describe('Binary Expression Evaluation', () => {
    describe('Comparison Operators', () => {
      it('should evaluate == (loose equality)', async () => {
        scope.set('a', 5);
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '==',
          left: { type: 'identifier', name: 'a' },
          right: { type: 'literal', value: 5 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate === (strict equality)', async () => {
        scope.set('a', '5');
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '===',
          left: { type: 'identifier', name: 'a' },
          right: { type: 'literal', value: 5 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(false);
      });

      it('should evaluate !=', async () => {
        scope.set('a', 5);
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '!=',
          left: { type: 'identifier', name: 'a' },
          right: { type: 'literal', value: 10 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate <', async () => {
        scope.set('x', 5);
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '<',
          left: { type: 'identifier', name: 'x' },
          right: { type: 'literal', value: 10 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate <=', async () => {
        scope.set('x', 10);
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '<=',
          left: { type: 'identifier', name: 'x' },
          right: { type: 'literal', value: 10 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate >', async () => {
        scope.set('x', 15);
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '>',
          left: { type: 'identifier', name: 'x' },
          right: { type: 'literal', value: 10 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate >=', async () => {
        scope.set('x', 10);
        
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '>=',
          left: { type: 'identifier', name: 'x' },
          right: { type: 'literal', value: 10 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });
    });

    describe('Arithmetic Operators', () => {
      it('should evaluate +', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '+',
          left: { type: 'literal', value: 3 },
          right: { type: 'literal', value: 5 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(8);
      });

      it('should evaluate -', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '-',
          left: { type: 'literal', value: 10 },
          right: { type: 'literal', value: 3 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(7);
      });

      it('should evaluate *', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '*',
          left: { type: 'literal', value: 4 },
          right: { type: 'literal', value: 7 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(28);
      });

      it('should evaluate /', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '/',
          left: { type: 'literal', value: 20 },
          right: { type: 'literal', value: 4 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(5);
      });

      it('should evaluate %', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '%',
          left: { type: 'literal', value: 17 },
          right: { type: 'literal', value: 5 }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(2);
      });
    });

    describe('Logical Operators', () => {
      it('should evaluate && (both true)', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '&&',
          left: { type: 'literal', value: true },
          right: { type: 'literal', value: true }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate && (left false) - short circuit', async () => {
        scope.set('shouldNotEvaluate', () => {
          throw new Error('Should not be called');
        });

        const expr: BinaryExpression = {
          type: 'binary',
          operator: '&&',
          left: { type: 'literal', value: false },
          right: {
            type: 'call',
            callee: { type: 'identifier', name: 'shouldNotEvaluate' },
            arguments: []
          }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(false);
      });

      it('should evaluate || (left true) - short circuit', async () => {
        scope.set('shouldNotEvaluate', () => {
          throw new Error('Should not be called');
        });

        const expr: BinaryExpression = {
          type: 'binary',
          operator: '||',
          left: { type: 'literal', value: true },
          right: {
            type: 'call',
            callee: { type: 'identifier', name: 'shouldNotEvaluate' },
            arguments: []
          }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });

      it('should evaluate || (both false)', async () => {
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '||',
          left: { type: 'literal', value: false },
          right: { type: 'literal', value: false }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(false);
      });
    });

    describe('Complex Binary Expressions', () => {
      it('should evaluate nested binary expressions', async () => {
        scope.set('x', 5);
        scope.set('y', 10);

        // (x < 10) && (y > 5)
        const expr: BinaryExpression = {
          type: 'binary',
          operator: '&&',
          left: {
            type: 'binary',
            operator: '<',
            left: { type: 'identifier', name: 'x' },
            right: { type: 'literal', value: 10 }
          },
          right: {
            type: 'binary',
            operator: '>',
            left: { type: 'identifier', name: 'y' },
            right: { type: 'literal', value: 5 }
          }
        };

        const result = await evaluator.evaluate(expr);
        expect(result).toBe(true);
      });
    });

    it('should throw error for unknown operator', async () => {
      const expr: BinaryExpression = {
        type: 'binary',
        operator: '???',
        left: { type: 'literal', value: 1 },
        right: { type: 'literal', value: 2 }
      };

      await expect(evaluator.evaluate(expr)).rejects.toThrow('Unknown binary operator');
    });
  });

  describe('Scope Management', () => {
    it('should create child scope inheriting from parent', () => {
      scope.set('x', 42);
      
      const childScope = evaluator.createChildScope();
      
      expect(childScope.get('x')).toBe(42);
    });

    it('should allow child scope to add variables without affecting parent', () => {
      scope.set('x', 42);
      
      const childScope = evaluator.createChildScope();
      childScope.set('y', 100);
      
      expect(childScope.get('y')).toBe(100);
      expect(scope.has('y')).toBe(false);
    });

    it('should create evaluator with new scope', async () => {
      scope.set('x', 42);
      
      const newScope = new Map([['x', 100]]);
      const newEvaluator = evaluator.withScope(newScope);
      
      const expr: Identifier = { type: 'identifier', name: 'x' };
      const result = await newEvaluator.evaluate(expr);
      
      expect(result).toBe(100);
    });
  });

  describe('Dog Reminders Example', () => {
    it('should evaluate Dog Reminders expressions', async () => {
      // Create reminders
      db.create('Reminder', { text: 'Walk dog', time: new Date('2025-01-15T10:00:00Z'), done: false });
      db.create('Reminder', { text: 'Feed dog', time: new Date('2025-01-15T18:00:00Z'), done: false });

      // db.Reminder.findAll()
      const findAllExpr: CallExpression = {
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
      };

      const all = await evaluator.evaluate(findAllExpr);
      expect(all).toHaveLength(2);

      // now() <= reminder.time
      scope.set('reminder', all[0]);
      
      const timeCheckExpr: BinaryExpression = {
        type: 'binary',
        operator: '<=',
        left: {
          type: 'call',
          callee: { type: 'identifier', name: 'now' },
          arguments: []
        },
        right: {
          type: 'member',
          object: { type: 'identifier', name: 'reminder' },
          property: 'time'
        }
      };

      const isOverdue = await evaluator.evaluate(timeCheckExpr);
      expect(isOverdue).toBe(false); // now is 12:00, reminder is 10:00

      // !reminder.done
      const notDoneExpr: BinaryExpression = {
        type: 'binary',
        operator: '==',
        left: {
          type: 'member',
          object: { type: 'identifier', name: 'reminder' },
          property: 'done'
        },
        right: { type: 'literal', value: false }
      };

      const isNotDone = await evaluator.evaluate(notDoneExpr);
      expect(isNotDone).toBe(true);
    });
  });
});
