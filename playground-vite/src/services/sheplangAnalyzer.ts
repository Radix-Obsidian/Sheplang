import { parseShep } from '@goldensheepai/sheplang-language';
import type { ShepLangDiagnostic } from '@/types';

/**
 * Analyzes ShepLang code and returns diagnostics
 * @param code ShepLang source code
 * @returns Array of diagnostics (errors/warnings)
 */
export async function analyzeCode(code: string): Promise<ShepLangDiagnostic[]> {
  try {
    // Use the real ShepLang parser
    const result = await parseShep(code);
    
    if (!result) {
      return [{
        message: 'Failed to parse ShepLang code',
        severity: 'error'
      }];
    }
    
    // Convert ShepLang diagnostics to our format
    return (result.diagnostics || []).map((diag: any) => ({
      message: diag.message,
      severity: diag.severity === 1 ? 'error' : 'warning',
      range: diag.range ? {
        startLineNumber: diag.range.start.line,
        startColumn: diag.range.start.character,
        endLineNumber: diag.range.end.line,
        endColumn: diag.range.end.character
      } : undefined,
      code: diag.code,
      source: diag.source
    }));
  } catch (error: unknown) {
    console.error('Analysis error:', error instanceof Error ? error.message : String(error));
    return [{
      message: error instanceof Error ? error.message : 'Unknown error during analysis',
      severity: 'error'
    }];
  }
}
