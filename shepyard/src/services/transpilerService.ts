/**
 * Transpiler Service for ShepYard
 * 
 * Wrapper around the sheplang-to-boba adapter that provides
 * transpilation services with error handling and caching.
 * 
 * Phase 2: Live Preview Renderer
 * 
 * Note: We import from the built adapter using relative path since
 * shepyard is outside the sheplang workspace
 */

// @ts-ignore - Import from built adapter dist (sibling directory)
import { transpileShepToBoba } from '../../../adapters/sheplang-to-boba/dist/index.js';

interface BobaOutput {
  code: string;
  canonicalAst: any;
}

export interface TranspileResult {
  success: boolean;
  bobaCode?: string;
  canonicalAst?: any;
  error?: string;
}

/**
 * Transpiles ShepLang source code to BobaScript
 * 
 * @param source - ShepLang source code
 * @returns TranspileResult with success status and output or error
 */
export async function transpileShepLang(source: string): Promise<TranspileResult> {
  if (!source || source.trim().length === 0) {
    return {
      success: false,
      error: 'Source code is empty'
    };
  }

  try {
    const result: BobaOutput = await transpileShepToBoba(source);
    
    return {
      success: true,
      bobaCode: result.code,
      canonicalAst: result.canonicalAst
    };
  } catch (error) {
    // Extract user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown transpilation error';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validates ShepLang syntax without full transpilation
 * Useful for quick syntax checks during editing
 * 
 * @param source - ShepLang source code
 * @returns true if valid, false otherwise
 */
export async function validateShepLang(source: string): Promise<boolean> {
  const result = await transpileShepLang(source);
  return result.success;
}
