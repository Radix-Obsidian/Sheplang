/**
 * @sheplang/verifier - Formal Verification Engine for ShepLang
 * 
 * This is our MOAT. Only possible because ShepLang is constrained.
 */

import type { AppModel } from '@sheplang/language';
import type { Diagnostic, VerificationResult } from './types.js';
import { checkTypeSafety } from './passes/typeSafety.js';
import { checkNullSafety } from './passes/nullSafety.js';

// Export types
export type { Type, Diagnostic, VerificationResult, TypeEnvironment } from './types.js';

// Export utilities
export { isCompatible, isNullable, removeNull, makeNullable, formatType } from './utils/typeUtils.js';

// Export type inference
export { 
  parseTypeString, 
  inferFieldValueType, 
  buildTypeEnvironment, 
  getModelFieldType,
  inferLoadReturnType,
  inferListReturnType 
} from './solvers/typeInference.js';

// Export control flow
export { 
  createFlowEnvironment,
  cloneEnvironment,
  refineTypes,
  isNonNull,
  markAsChecked,
  type FlowEnvironment
} from './solvers/controlFlow.js';

// Export passes
export { checkTypeSafety } from './passes/typeSafety.js';
export { checkNullSafety } from './passes/nullSafety.js';

/**
 * Main verification function.
 * Runs multiple verification passes:
 * - Pass 1: Type Safety (40% of bugs)
 * - Pass 2: Null Safety (30% of bugs)
 * 
 * @param appModel - Parsed ShepLang application model
 * @returns Verification result with diagnostics
 * 
 * @example
 * ```typescript
 * import { parseShep } from '@sheplang/language';
 * import { verify } from '@sheplang/verifier';
 * 
 * const { appModel } = await parseShep(shepCode);
 * const result = verify(appModel);
 * 
 * if (!result.passed) {
 *   console.error('Verification errors:', result.errors);
 * }
 * ```
 */
export function verify(appModel: AppModel): VerificationResult {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  const info: Diagnostic[] = [];
  
  // Pass 1: Type Safety
  const typeDiagnostics = checkTypeSafety(appModel);
  for (const d of typeDiagnostics) {
    if (d.severity === 'error') errors.push(d);
    else if (d.severity === 'warning') warnings.push(d);
    else info.push(d);
  }
  
  // Pass 2: Null Safety
  const nullDiagnostics = checkNullSafety(appModel);
  for (const d of nullDiagnostics) {
    if (d.severity === 'error') errors.push(d);
    else if (d.severity === 'warning') warnings.push(d);
    else info.push(d);
  }
  
  // Calculate summary
  const totalChecks = 2;  // Type Safety + Null Safety
  const errorCount = errors.length;
  const warningCount = warnings.length;
  const passed = errorCount === 0;
  
  // Confidence score: 100 if no errors, scaled down by warnings
  const confidenceScore = passed ? Math.max(85, 100 - warningCount * 3) : 0;
  
  return {
    passed,
    errors,
    warnings,
    info,
    summary: {
      totalChecks,
      errorCount,
      warningCount,
      confidenceScore
    }
  };
}
