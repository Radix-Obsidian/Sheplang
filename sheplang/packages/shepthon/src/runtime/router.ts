/**
 * EndpointRouter - Routes HTTP requests to ShepThon endpoint handlers
 * 
 * Pattern: Registry pattern with method+path as key
 * Reference: TTD_ShepThon_Core.md C2.2
 * 
 * Features:
 * - Register endpoints from AST
 * - Route by method+path
 * - Inject context (db, log, now)
 * - Execute endpoint body with StatementExecutor
 * - Handle parameters from request body
 * - Catch ReturnValue and return result
 */

import type { EndpointDefinition, HttpMethod } from '../types.js';
import { StatementExecutor, ReturnValue } from './executor.js';
import type { RuntimeContext, Scope } from './evaluator.js';

/**
 * Route key combining method and path
 * Example: "GET:/reminders"
 */
type RouteKey = string;

/**
 * EndpointRouter manages HTTP endpoint registration and execution
 */
export class EndpointRouter {
  private routes: Map<RouteKey, EndpointDefinition> = new Map();

  constructor(private context: RuntimeContext) {}

  /**
   * Register an endpoint
   * 
   * @example
   * router.register('GET', '/reminders', endpointDefinition)
   */
  register(method: HttpMethod, path: string, endpoint: EndpointDefinition): void {
    const key = this.makeRouteKey(method, path);
    
    if (this.routes.has(key)) {
      throw new Error(`Endpoint already registered: ${method} ${path}`);
    }
    
    this.routes.set(key, endpoint);
  }

  /**
   * Execute an endpoint
   * Returns the result from the endpoint's return statement
   * Returns null if no return statement
   * 
   * @example
   * const result = await router.execute('GET', '/reminders')
   * // → [{ id: "r1", text: "Walk dog", ... }]
   * 
   * @example
   * const result = await router.execute('POST', '/reminders', { text: "Walk dog", time: new Date() })
   * // → { id: "r1", text: "Walk dog", ... }
   */
  async execute(method: HttpMethod, path: string, body?: any): Promise<any> {
    // Find endpoint
    const key = this.makeRouteKey(method, path);
    const endpoint = this.routes.get(key);
    
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${method} ${path}`);
    }

    try {
      // Create scope with parameters
      const scope = this.createScopeWithParameters(endpoint, body);
      
      // Create executor
      const executor = new StatementExecutor(this.context, scope);
      
      // Execute endpoint body
      const result = await executor.executeBlock(endpoint.body);
      
      return result;
    } catch (e) {
      // Add endpoint context to error
      if (e instanceof Error && !(e instanceof ReturnValue)) {
        throw new Error(`Error in ${method} ${path}: ${e.message}`);
      }
      throw e;
    }
  }

  /**
   * Check if an endpoint is registered
   */
  has(method: HttpMethod, path: string): boolean {
    const key = this.makeRouteKey(method, path);
    return this.routes.has(key);
  }

  /**
   * Get all registered routes
   * Returns array of [method, path] tuples
   */
  getRoutes(): Array<[HttpMethod, string]> {
    return Array.from(this.routes.keys()).map((key) => {
      const [method, path] = key.split(':');
      return [method as HttpMethod, path];
    });
  }

  /**
   * Clear all registered routes
   * Useful for testing
   */
  clear(): void {
    this.routes.clear();
  }

  /**
   * Create route key from method and path
   * Format: "METHOD:path"
   */
  private makeRouteKey(method: HttpMethod, path: string): RouteKey {
    return `${method}:${path}`;
  }

  /**
   * Create scope with parameters from request body
   * Parameters are extracted from body object and added to scope
   * 
   * @example
   * // Endpoint parameters: [{ name: "text", type: "string" }, { name: "time", type: "datetime" }]
   * // Body: { text: "Walk dog", time: Date }
   * // Scope: { text: "Walk dog", time: Date }
   */
  private createScopeWithParameters(endpoint: EndpointDefinition, body?: any): Scope {
    const scope: Scope = new Map();
    
    // If no parameters defined, return empty scope
    if (!endpoint.parameters || endpoint.parameters.length === 0) {
      return scope;
    }
    
    // Extract parameters from body
    for (const param of endpoint.parameters) {
      const value = body?.[param.name];
      
      // Check required parameters
      if (value === undefined && !param.optional) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }
      
      // Add to scope if provided
      if (value !== undefined) {
        scope.set(param.name, value);
      }
    }
    
    return scope;
  }
}
