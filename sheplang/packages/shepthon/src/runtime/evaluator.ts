/**
 * ExpressionEvaluator - Evaluates ShepThon AST expressions
 * 
 * Pattern: Recursive evaluation with context injection
 * Reference: Interpreter pattern for AST evaluation
 * 
 * Handles:
 * - Literals (string, number, boolean, null)
 * - Identifiers (variable lookup from scope)
 * - Member access (db.Reminder, reminder.text)
 * - Function calls (db.Reminder.findAll(), now())
 * - Binary operations (<=, >=, ==, &&, ||)
 */

import type {
  Expression,
  CallExpression,
  MemberExpression,
  Identifier,
  Literal,
  BinaryExpression,
} from '../types.js';
import type { InMemoryDatabase } from './database.js';

/**
 * Runtime context injected into evaluator
 */
export interface RuntimeContext {
  db: InMemoryDatabase;
  log: (...args: any[]) => void;
  now: () => Date;
}

/**
 * Variable scope for statement execution
 */
export type Scope = Map<string, any>;

/**
 * ExpressionEvaluator evaluates expressions to values
 */
export class ExpressionEvaluator {
  constructor(
    private context: RuntimeContext,
    private scope: Scope
  ) {}

  /**
   * Evaluate an expression to a value
   * 
   * @example
   * await evaluate({ type: 'literal', value: 42 })
   * // → 42
   * 
   * @example
   * await evaluate({ type: 'identifier', name: 'x' })
   * // → (value of x from scope)
   * 
   * @example
   * await evaluate({ type: 'call', callee: ..., arguments: [] })
   * // → (result of function call)
   */
  async evaluate(expr: Expression): Promise<any> {
    switch (expr.type) {
      case 'literal':
        return this.evaluateLiteral(expr as Literal);
      
      case 'identifier':
        return this.evaluateIdentifier(expr as Identifier);
      
      case 'member':
        return this.evaluateMember(expr as MemberExpression);
      
      case 'call':
        return this.evaluateCall(expr as CallExpression);
      
      case 'binary':
        return this.evaluateBinary(expr as BinaryExpression);
      
      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  /**
   * Evaluate a literal value
   * 
   * @example
   * evaluateLiteral({ type: 'literal', value: "hello" })
   * // → "hello"
   */
  private evaluateLiteral(expr: Literal): any {
    return expr.value;
  }

  /**
   * Evaluate an identifier (variable lookup)
   * 
   * @example
   * // Scope: { x: 42 }
   * evaluateIdentifier({ type: 'identifier', name: 'x' })
   * // → 42
   */
  private evaluateIdentifier(expr: Identifier): any {
    const name = expr.name;

    // Check local scope first
    if (this.scope.has(name)) {
      return this.scope.get(name);
    }

    // Check context (db, log, now)
    if (name === 'db') {
      return this.context.db;
    }
    if (name === 'log') {
      return this.context.log;
    }
    if (name === 'now') {
      return this.context.now;
    }

    throw new Error(`Undefined variable: ${name}`);
  }

  /**
   * Evaluate member access (object.property)
   * 
   * @example
   * // db.Reminder → { create: fn, findAll: fn, ... }
   * evaluateMember({ type: 'member', object: { type: 'identifier', name: 'db' }, property: 'Reminder' })
   * // → Model proxy with CRUD methods
   * 
   * @example
   * // reminder.text → "Walk dog"
   * evaluateMember({ type: 'member', object: ..., property: 'text' })
   * // → "Walk dog"
   */
  private async evaluateMember(expr: MemberExpression): Promise<any> {
    const obj = await this.evaluate(expr.object);
    const property = expr.property;

    // Special case: db.ModelName → return model proxy
    if (obj === this.context.db) {
      return this.createModelProxy(property);
    }

    // Regular property access
    if (obj === null || obj === undefined) {
      throw new Error(`Cannot access property '${property}' of ${obj}`);
    }

    return obj[property];
  }

  /**
   * Create a model proxy for db.ModelName
   * Returns an object with CRUD methods bound to the model
   * 
   * @example
   * const Reminder = createModelProxy('Reminder');
   * Reminder.findAll() → db.findAll('Reminder')
   * Reminder.create({ ... }) → db.create('Reminder', { ... })
   */
  private createModelProxy(modelName: string): any {
    const db = this.context.db;

    return {
      // CRUD methods bound to this model
      create: (data: any) => db.create(modelName, data),
      findAll: () => db.findAll(modelName),
      findById: (id: string) => db.findById(modelName, id),
      find: (predicate: (item: any) => boolean) => db.find(modelName, predicate),
      findOne: (predicate: (item: any) => boolean) => db.findOne(modelName, predicate),
      update: (id: string, updates: any) => db.update(modelName, id, updates),
      delete: (id: string) => db.delete(modelName, id),
      deleteWhere: (predicate: (item: any) => boolean) => db.deleteWhere(modelName, predicate),
      count: () => db.count(modelName),
    };
  }

  /**
   * Evaluate a function call
   * 
   * @example
   * // db.Reminder.findAll()
   * evaluateCall({ type: 'call', callee: { type: 'member', ... }, arguments: [] })
   * // → [{ id: "r1", ... }, ...]
   * 
   * @example
   * // now()
   * evaluateCall({ type: 'call', callee: { type: 'identifier', name: 'now' }, arguments: [] })
   * // → Date object
   */
  private async evaluateCall(expr: CallExpression): Promise<any> {
    const callee = await this.evaluate(expr.callee);

    // Evaluate arguments
    const args = await Promise.all(
      expr.arguments.map((arg) => this.evaluate(arg))
    );

    // Call the function
    if (typeof callee !== 'function') {
      throw new Error(`Cannot call non-function: ${typeof callee}`);
    }

    return await callee(...args);
  }

  /**
   * Evaluate a binary operation
   * 
   * @example
   * // x <= 10
   * evaluateBinary({ type: 'binary', operator: '<=', left: ..., right: ... })
   * // → true or false
   * 
   * @example
   * // a && b
   * evaluateBinary({ type: 'binary', operator: '&&', left: ..., right: ... })
   * // → boolean
   */
  private async evaluateBinary(expr: BinaryExpression): Promise<any> {
    const operator = expr.operator;

    // Short-circuit evaluation for logical operators
    if (operator === '&&') {
      const left = await this.evaluate(expr.left);
      if (!left) return false;
      return await this.evaluate(expr.right);
    }

    if (operator === '||') {
      const left = await this.evaluate(expr.left);
      if (left) return true;
      return await this.evaluate(expr.right);
    }

    // Evaluate both sides for other operators
    const left = await this.evaluate(expr.left);
    const right = await this.evaluate(expr.right);

    // Comparison operators
    switch (operator) {
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '===':
        return left === right;
      case '!==':
        return left !== right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      
      // Arithmetic operators
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;
      
      default:
        throw new Error(`Unknown binary operator: ${operator}`);
    }
  }

  /**
   * Create a new evaluator with the same context but different scope
   * Useful for nested scopes (like for loop body, if block)
   */
  withScope(newScope: Scope): ExpressionEvaluator {
    return new ExpressionEvaluator(this.context, newScope);
  }

  /**
   * Create a child scope that inherits from parent
   * Variables can be added to child without affecting parent
   */
  createChildScope(): Scope {
    const childScope = new Map(this.scope);
    return childScope;
  }
}
