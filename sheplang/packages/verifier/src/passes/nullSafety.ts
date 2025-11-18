import type { Diagnostic } from '../types.js';
import type { AppModel } from '@sheplang/language';
import { 
  inferLoadReturnType,
  getModelFieldType,
  buildTypeEnvironment
} from '../solvers/typeInference.js';
import { isNullable } from '../utils/typeUtils.js';
import { 
  createFlowEnvironment,
  refineTypes,
  cloneEnvironment
} from '../solvers/controlFlow.js';

/**
 * Check null safety for all actions in the application.
 * 
 * Detects:
 * 1. Potential null pointer access
 * 2. Missing null checks after database queries
 * 3. Nullable field access without guards
 * 
 * @param appModel - Parsed application model
 * @returns Array of diagnostics (errors/warnings)
 * 
 * @example
 * // This would generate an error:
 * action loadUser(id: id):
 *   load user from /users/{id}  // Returns User | null
 *   show UserProfile with user  // Error: user might be null!
 * 
 * // This is safe:
 * action loadUser(id: id):
 *   load user from /users/{id}
 *   if user exists:
 *     show UserProfile with user  // OK: user is non-null here
 */
export function checkNullSafety(appModel: AppModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  for (const action of appModel.actions) {
    const env = createFlowEnvironment();
    
    // Initialize environment with parameters
    const paramEnv = buildTypeEnvironment(action.params);
    for (const [name, type] of paramEnv.variables) {
      env.variables.set(name, type);
    }
    
    // Track variables that might be null
    const nullableVars = new Map<string, string>(); // varName -> source
    
    // Analyze each operation
    for (let i = 0; i < action.ops.length; i++) {
      const op = action.ops[i];
      
      // Track load operations (database queries return nullable)
      if (op.kind === 'load') {
        const modelName = extractModelFromPath(op.path);
        if (modelName) {
          const returnType = inferLoadReturnType(modelName);
          env.variables.set(op.target, returnType);
          
          if (isNullable(returnType)) {
            nullableVars.set(op.target, `database query at line ${i + 1}`);
          }
        }
      }
      
      // Check for null checks (simplified - real impl would parse conditions)
      else if (op.kind === 'raw' && op.text.includes('if')) {
        const condition = op.text;
        
        // Look for null check patterns
        for (const [varName] of nullableVars) {
          if (condition.includes(`${varName} exists`) || 
              condition.includes(`${varName} != null`)) {
            // Create refined environments
            const thenEnv = cloneEnvironment(env);
            const elseEnv = cloneEnvironment(env);
            
            refineTypes(condition, varName, thenEnv, elseEnv);
            
            // For now, assume we're in the then branch
            // (Real implementation would track control flow properly)
            env.refined = thenEnv.refined;
            nullableVars.delete(varName); // Variable is now safe
          }
        }
      }
      
      // Check show operations for nullable access
      else if (op.kind === 'show') {
        // Check if any nullable variables are being used
        const opText = JSON.stringify(op);
        
        for (const [varName, source] of nullableVars) {
          if (opText.includes(varName)) {
            diagnostics.push({
              severity: 'error',
              line: action.__location?.startLine ?? 1,
              column: action.__location?.startColumn ?? 1,
              message: `Potential null pointer: '${varName}' might be null (from ${source})`,
              type: 'null-safety',
              suggestion: `Add null check:\n  if ${varName} exists:\n    show ${op.view} with ${varName}`
            });
          }
        }
      }
      
      // Check add operations for nullable field values
      else if (op.kind === 'add') {
        for (const [fieldName, fieldValue] of Object.entries(op.fields)) {
          // Check if field value is a nullable variable
          if (nullableVars.has(fieldValue)) {
            const modelFieldType = getModelFieldType(op.data, fieldName, appModel);
            
            // If model field is not nullable but value might be null
            if (modelFieldType && !isNullable(modelFieldType)) {
              diagnostics.push({
                severity: 'error',
                line: action.__location?.startLine ?? 1,
                column: action.__location?.startColumn ?? 1,
                message: `Cannot assign nullable value '${fieldValue}' to non-nullable field '${fieldName}'`,
                type: 'null-safety',
                suggestion: `Check for null before assignment:\n  if ${fieldValue} exists:\n    add ${op.data} with ${fieldName}: ${fieldValue}`
              });
            }
          }
        }
      }
    }
    
    // Warn about unchecked nullable variables at action end
    for (const [varName, source] of nullableVars) {
      diagnostics.push({
        severity: 'warning',
        line: action.__location?.endLine ?? 1,
        column: action.__location?.startColumn ?? 1,
        message: `Nullable variable '${varName}' (from ${source}) never checked for null`,
        type: 'null-safety',
        suggestion: `Consider adding null check or handling null case`
      });
    }
  }
  
  return diagnostics;
}

/**
 * Extract model name from API path.
 * 
 * @example
 * extractModelFromPath('/users/{id}') // 'User'
 * extractModelFromPath('/products') // 'Product'
 */
function extractModelFromPath(path: string): string | null {
  // Simple heuristic: extract first path segment
  const match = path.match(/^\/([a-z]+)/i);
  if (!match) return null;
  
  // Convert plural to singular and capitalize
  let modelName = match[1];
  if (modelName.endsWith('s')) {
    modelName = modelName.slice(0, -1);
  }
  return modelName.charAt(0).toUpperCase() + modelName.slice(1);
}
