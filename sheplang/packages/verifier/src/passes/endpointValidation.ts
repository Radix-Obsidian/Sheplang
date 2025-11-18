/**
 * Endpoint Validation Pass
 * 
 * Validates that all API calls match backend endpoints
 * Part of Phase 3: Catches 20% of bugs (endpoint mismatches)
 */

import type { AppModel } from '@sheplang/language';
import type { Diagnostic } from '../types.js';
import type { ShepThonBackend } from '../solvers/shepthonParser.js';
import { findEndpoint } from '../solvers/shepthonParser.js';

/**
 * Check that all call/load statements match backend endpoints
 * 
 * @param appModel - Parsed ShepLang application
 * @param backend - Parsed ShepThon backend
 * @returns Array of diagnostics
 */
export function checkEndpointValidation(
  appModel: AppModel,
  backend: ShepThonBackend
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  // Warn if no backend defined
  if (backend.endpoints.length === 0) {
    diagnostics.push({
      severity: 'warning',
      line: 1,
      column: 1,
      message: 'No backend defined. API calls cannot be validated.',
      type: 'endpoint-validation',
      suggestion: 'Create a .shepthon file to define your backend endpoints'
    });
    return diagnostics;
  }
  
  // Check each action
  for (const action of appModel.actions) {
    for (const op of action.ops) {
      // Validate 'call' statements
      if (op.kind === 'call') {
        const endpoint = findEndpoint(backend, op.method, op.path);
        
        if (!endpoint) {
          diagnostics.push({
            severity: 'error',
            line: action.__location?.startLine ?? 1,
            column: action.__location?.startColumn ?? 1,
            message: `Endpoint not found: ${op.method} ${op.path}`,
            type: 'endpoint-validation',
            suggestion: generateEndpointSuggestion(backend, op.method, op.path)
          });
        }
      }
      
      // Validate 'load' statements
      else if (op.kind === 'load') {
        const endpoint = findEndpoint(backend, op.method, op.path);
        
        if (!endpoint) {
          diagnostics.push({
            severity: 'error',
            line: action.__location?.startLine ?? 1,
            column: action.__location?.startColumn ?? 1,
            message: `Endpoint not found: ${op.method} ${op.path}`,
            type: 'endpoint-validation',
            suggestion: generateEndpointSuggestion(backend, op.method, op.path)
          });
        } else if (op.method !== 'GET') {
          // Warn about loading from non-GET endpoints
          diagnostics.push({
            severity: 'warning',
            line: action.__location?.startLine ?? 1,
            column: action.__location?.startColumn ?? 1,
            message: `'load' typically uses GET endpoints. Found: ${op.method} ${op.path}`,
            type: 'endpoint-validation',
            suggestion: `Consider using 'call ${op.method} "${op.path}"' instead`
          });
        }
      }
    }
  }
  
  return diagnostics;
}

/**
 * Generate helpful suggestion for missing endpoint
 */
function generateEndpointSuggestion(
  backend: ShepThonBackend,
  method: string,
  path: string
): string {
  const suggestions: string[] = [];
  
  // Find similar endpoints (same method)
  const sameMethod = backend.endpoints.filter(ep => ep.method === method);
  if (sameMethod.length > 0) {
    suggestions.push(`Available ${method} endpoints: ${sameMethod.map(ep => ep.path).join(', ')}`);
  }
  
  // Find similar paths (different method)
  const samePath = backend.endpoints.filter(ep => ep.path === path);
  if (samePath.length > 0) {
    suggestions.push(`Endpoint ${path} exists but with method(s): ${samePath.map(ep => ep.method).join(', ')}`);
  }
  
  // Find similar paths (fuzzy match)
  const pathParts = path.split('/').filter(p => p.length > 0);
  const similarPaths = backend.endpoints.filter(ep => {
    const epParts = ep.path.split('/').filter(p => p.length > 0);
    return pathParts.some(part => epParts.some(epPart => epPart.includes(part) || part.includes(epPart)));
  });
  
  if (similarPaths.length > 0 && suggestions.length === 0) {
    suggestions.push(`Did you mean one of: ${similarPaths.map(ep => `${ep.method} ${ep.path}`).join(', ')}?`);
  }
  
  // Default suggestion
  if (suggestions.length === 0) {
    suggestions.push(`Available endpoints: ${backend.endpoints.map(ep => `${ep.method} ${ep.path}`).join(', ')}`);
  }
  
  return suggestions.join('. ');
}
