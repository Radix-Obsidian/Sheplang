/**
 * StatementExecutor - Executes ShepThon AST statements
 * 
 * Pattern: Interpreter pattern with recursive execution
 * Reference: https://sbcode.net/typescript/interpreter/
 * 
 * Handles:
 * - let statements (variable assignment)
 * - return statements (early return from functions)
 * - for statements (iterate over collections)
 * - if/else statements (conditional execution)
 * - expression statements (standalone expressions)
 */

import type {
  Statement,
  LetStatement,
  ReturnStatement,
  ForStatement,
  IfStatement,
  ExpressionStatement,
} from '../types.js';
import { ExpressionEvaluator, type RuntimeContext, type Scope } from './evaluator.js';

/**
 * ReturnValue exception for early returns
 * Thrown when a return statement is executed
 * Caught by endpoint/job handlers
 * 
 * Pattern: Control flow exception (like Java's checked exceptions)
 * Reference: TypeScript error handling best practices
 */
export class ReturnValue extends Error {
  constructor(public value: any) {
    super('Return value');
    this.name = 'ReturnValue';
    
    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReturnValue);
    }
  }
}

/**
 * StatementExecutor executes statement nodes from AST
 * Uses ExpressionEvaluator for all expression evaluation
 * Manages scope correctly (child scopes for blocks)
 */
export class StatementExecutor {
  private evaluator: ExpressionEvaluator;

  constructor(
    private context: RuntimeContext,
    private scope: Scope = new Map()
  ) {
    this.evaluator = new ExpressionEvaluator(context, scope);
  }

  /**
   * Execute a single statement
   * Returns void for most statements, never for return
   * 
   * @example
   * await execute({ type: 'let', name: 'x', value: ... })
   * // Adds 'x' to scope
   * 
   * @example
   * await execute({ type: 'return', value: ... })
   * // Throws ReturnValue exception
   */
  async execute(statement: Statement): Promise<void> {
    try {
      switch (statement.type) {
        case 'let':
          await this.executeLet(statement as LetStatement);
          break;
        
        case 'return':
          await this.executeReturn(statement as ReturnStatement);
          break;
        
        case 'for':
          await this.executeFor(statement as ForStatement);
          break;
        
        case 'if':
          await this.executeIf(statement as IfStatement);
          break;
        
        case 'expression':
          await this.executeExpression(statement as ExpressionStatement);
          break;
        
        default:
          throw new Error(`Unknown statement type: ${(statement as any).type}`);
      }
    } catch (e) {
      // Re-throw ReturnValue exceptions (normal control flow)
      if (e instanceof ReturnValue) {
        throw e;
      }
      
      // Wrap other errors with context
      throw new Error(`Error executing statement: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Execute a block of statements
   * Returns the result if a return statement is executed
   * Returns null if no return statement
   * 
   * @example
   * await executeBlock([
   *   { type: 'let', name: 'x', value: ... },
   *   { type: 'return', value: ... }
   * ])
   * // Returns the value from return statement
   */
  async executeBlock(statements: Statement[]): Promise<any> {
    try {
      for (const statement of statements) {
        await this.execute(statement);
      }
      
      // No explicit return - return null
      return null;
    } catch (e) {
      if (e instanceof ReturnValue) {
        return e.value;
      }
      throw e;
    }
  }

  /**
   * Execute a let statement (variable assignment)
   * 
   * @example
   * let x = 10
   * // Adds 'x' → 10 to scope
   * 
   * @example
   * let reminder = db.Reminder.create({ text: "Test" })
   * // Evaluates expression, adds 'reminder' to scope
   */
  private async executeLet(statement: LetStatement): Promise<void> {
    const value = await this.evaluator.evaluate(statement.value);
    this.scope.set(statement.name, value);
  }

  /**
   * Execute a return statement (early exit)
   * Throws ReturnValue exception with the result
   * 
   * @example
   * return db.Reminder.findAll()
   * // Evaluates expression, throws ReturnValue
   */
  private async executeReturn(statement: ReturnStatement): Promise<never> {
    const value = await this.evaluator.evaluate(statement.value);
    throw new ReturnValue(value);
  }

  /**
   * Execute a for loop (iterate over collection)
   * Creates child scope for each iteration
   * Item variable is added to child scope
   * 
   * @example
   * for r in reminders {
   *   log(r.text)
   * }
   * // Iterates over reminders, 'r' available in loop body
   */
  private async executeFor(statement: ForStatement): Promise<void> {
    // Evaluate collection
    const collection = await this.evaluator.evaluate(statement.collection);
    
    // Ensure it's iterable
    if (!Array.isArray(collection)) {
      throw new Error(`For loop collection must be an array, got ${typeof collection}`);
    }
    
    // Iterate over collection
    for (const item of collection) {
      // Create child scope
      const childScope = this.evaluator.createChildScope();
      childScope.set(statement.item, item);
      
      // Create child executor with child scope
      const childExecutor = new StatementExecutor(this.context, childScope);
      
      // Execute body statements directly (don't catch ReturnValue)
      for (const stmt of statement.body) {
        await childExecutor.execute(stmt);
      }
    }
  }

  /**
   * Execute an if statement (conditional execution)
   * Creates child scopes for then and else blocks
   * 
   * @example
   * if x > 10 {
   *   log("Greater than 10")
   * } else {
   *   log("Not greater than 10")
   * }
   */
  private async executeIf(statement: IfStatement): Promise<void> {
    // Evaluate condition
    const condition = await this.evaluator.evaluate(statement.condition);
    
    // Execute then or else block
    if (condition) {
      // Create child scope for then block
      const thenScope = this.evaluator.createChildScope();
      const thenExecutor = new StatementExecutor(this.context, thenScope);
      
      // Execute statements directly (don't catch ReturnValue)
      for (const stmt of statement.thenBody) {
        await thenExecutor.execute(stmt);
      }
    } else if (statement.elseBody) {
      // Create child scope for else block
      const elseScope = this.evaluator.createChildScope();
      const elseExecutor = new StatementExecutor(this.context, elseScope);
      
      // Execute statements directly (don't catch ReturnValue)
      for (const stmt of statement.elseBody) {
        await elseExecutor.execute(stmt);
      }
    }
  }

  /**
   * Execute an expression statement (standalone expression)
   * Evaluates the expression and discards the result
   * 
   * @example
   * db.Reminder.create({ text: "Test" })
   * // Evaluates but doesn't assign to variable
   * 
   * @example
   * log("Hello world")
   * // Calls log function
   */
  private async executeExpression(statement: ExpressionStatement): Promise<void> {
    await this.evaluator.evaluate(statement.expression);
    // Result is discarded
  }

  /**
   * Get the current scope
   * Useful for testing and debugging
   */
  getScope(): Scope {
    return this.scope;
  }

  /**
   * Create a new executor with a different scope
   * Useful for creating child executors
   */
  withScope(newScope: Scope): StatementExecutor {
    return new StatementExecutor(this.context, newScope);
  }
}
