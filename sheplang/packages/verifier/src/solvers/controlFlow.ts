import type { Type } from '../types.js';
import { isNullable, removeNull } from '../utils/typeUtils.js';

/**
 * Type environment with variable type tracking.
 * Used to track type refinements through control flow.
 */
export interface FlowEnvironment {
  variables: Map<string, Type>;
  refined: Map<string, Type>; // Refined types from conditionals
}

/**
 * Create a new flow environment.
 */
export function createFlowEnvironment(): FlowEnvironment {
  return {
    variables: new Map(),
    refined: new Map()
  };
}

/**
 * Clone an environment (for branching).
 */
export function cloneEnvironment(env: FlowEnvironment): FlowEnvironment {
  return {
    variables: new Map(env.variables),
    refined: new Map(env.refined)
  };
}

/**
 * Get the current type of a variable (considering refinements).
 */
export function getVariableType(
  varName: string, 
  env: FlowEnvironment
): Type | undefined {
  // Refined type takes precedence
  return env.refined.get(varName) || env.variables.get(varName);
}

/**
 * Refine types based on a condition.
 * 
 * @param condition - The condition expression
 * @param thenEnv - Environment for then branch
 * @param elseEnv - Environment for else branch
 * 
 * @example
 * // if user exists
 * // then: user is non-null
 * // else: user remains nullable
 */
export function refineTypes(
  condition: string,
  variable: string,
  thenEnv: FlowEnvironment,
  elseEnv: FlowEnvironment
): void {
  const baseType = thenEnv.variables.get(variable);
  if (!baseType) return;
  
  // Pattern: "x exists" or "x != null"
  if (condition.includes('exists') || condition.includes('!= null')) {
    // In then branch: variable is non-null
    if (isNullable(baseType)) {
      thenEnv.refined.set(variable, removeNull(baseType));
    }
    // Else branch remains nullable
  }
  
  // Pattern: "x == null" or "!x" or "x is null"
  else if (condition.includes('== null') || condition.includes('is null')) {
    // In then branch: variable is definitely null
    thenEnv.refined.set(variable, { kind: 'null' });
    
    // In else branch: variable is non-null
    if (isNullable(baseType)) {
      elseEnv.refined.set(variable, removeNull(baseType));
    }
  }
}

/**
 * Check if a variable is safely non-null in the current environment.
 * 
 * @example
 * const env = createFlowEnvironment();
 * env.variables.set('user', { kind: 'nullable', baseType: { kind: 'model', name: 'User' } });
 * isNonNull('user', env); // false
 * 
 * refineTypes('user exists', 'user', env, elseEnv);
 * isNonNull('user', env); // true (after refinement)
 */
export function isNonNull(
  varName: string, 
  env: FlowEnvironment
): boolean {
  const type = getVariableType(varName, env);
  if (!type) return false;
  
  // Check if type is non-nullable
  return !isNullable(type) && type.kind !== 'null';
}

/**
 * Merge environments after branching (e.g., after if-else).
 * Conservative: if a type differs, use the more general (nullable) version.
 */
export function mergeEnvironments(
  env1: FlowEnvironment,
  env2: FlowEnvironment
): FlowEnvironment {
  const merged = createFlowEnvironment();
  
  // Copy all variables
  for (const [name, type] of env1.variables) {
    merged.variables.set(name, type);
  }
  
  // Merge refinements conservatively
  for (const [name, type1] of env1.refined) {
    const type2 = env2.refined.get(name);
    
    if (!type2) {
      // Only refined in one branch - don't carry forward
      continue;
    }
    
    // If both branches refine to same type, keep it
    if (JSON.stringify(type1) === JSON.stringify(type2)) {
      merged.refined.set(name, type1);
    }
    // Otherwise, refinement doesn't hold after merge
  }
  
  return merged;
}

/**
 * Track that a variable has been null-checked.
 * Used after explicit null checks in code.
 */
export function markAsChecked(
  varName: string,
  env: FlowEnvironment
): void {
  const type = env.variables.get(varName);
  if (type && isNullable(type)) {
    env.refined.set(varName, removeNull(type));
  }
}
