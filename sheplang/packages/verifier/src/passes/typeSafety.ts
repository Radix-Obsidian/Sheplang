import type { Diagnostic } from '../types.js';
import type { AppModel } from '@sheplang/language';
import { 
  inferFieldValueType, 
  buildTypeEnvironment,
  getModelFieldType
} from '../solvers/typeInference.js';
import { isCompatible, formatType } from '../utils/typeUtils.js';

/**
 * Check type safety for all actions in the application.
 * 
 * Verifies:
 * 1. Action parameters match their declared types
 * 2. Field assignments in add statements match model field types
 * 3. All type conversions are valid
 * 
 * @param appModel - Parsed application model
 * @returns Array of diagnostics (errors/warnings)
 */
export function checkTypeSafety(appModel: AppModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  // Check each action
  for (const action of appModel.actions) {
    // Build type environment from parameters
    const env = buildTypeEnvironment(action.params);
    
    // Check each operation
    for (const op of action.ops) {
      if (op.kind === 'add') {
        // Verify field types match model definition
        const model = appModel.datas.find(d => d.name === op.data);
        
        if (!model) {
          diagnostics.push({
            severity: 'error',
            line: action.__location?.startLine ?? 1,
            column: action.__location?.startColumn ?? 1,
            message: `Model '${op.data}' not found`,
            type: 'type-safety'
          });
          continue;
        }
        
        // Check each field assignment
        for (const [fieldName, fieldValue] of Object.entries(op.fields)) {
          const expectedType = getModelFieldType(op.data, fieldName, appModel);
          
          if (!expectedType) {
            diagnostics.push({
              severity: 'error',
              line: action.__location?.startLine ?? 1,
              column: action.__location?.startColumn ?? 1,
              message: `Field '${fieldName}' not found in model '${op.data}'`,
              type: 'type-safety'
            });
            continue;
          }
          
          const actualType = inferFieldValueType(fieldValue, env);
          
          if (!isCompatible(expectedType, actualType)) {
            diagnostics.push({
              severity: 'error',
              line: action.__location?.startLine ?? 1,
              column: action.__location?.startColumn ?? 1,
              message: `Type mismatch in field '${fieldName}': expected ${formatType(expectedType)}, got ${formatType(actualType)}`,
              type: 'type-safety',
              suggestion: `Ensure ${fieldValue} is of type ${formatType(expectedType)}`
            });
          }
        }
        
        // Check for missing required fields
        for (const field of model.fields) {
          if (!op.fields[field.name]) {
            // Only warn for missing fields, as they might have defaults
            diagnostics.push({
              severity: 'warning',
              line: action.__location?.startLine ?? 1,
              column: action.__location?.startColumn ?? 1,
              message: `Missing field '${field.name}' in add ${op.data}`,
              type: 'type-safety',
              suggestion: `Add '${field.name}: ${field.type}' to the field list`
            });
          }
        }
      }
    }
  }
  
  return diagnostics;
}
