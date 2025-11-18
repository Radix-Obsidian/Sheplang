import { parseShep, type Diagnostic, type CompilationResult } from '@goldensheepai/sheplang-language';
import { transpile } from './transpiler.js';

/**
 * Result of generating an app from ShepLang code
 */
export interface GeneratedApp {
  files: Record<string, string>;
  entryPoint: string;
}

/**
 * Generate a complete application from ShepLang source code
 * @param source ShepLang source code
 * @param filePath Optional file path for better error messages
 * @returns Compilation result with generated app files or error diagnostics
 */
export async function generateApp(source: string, filePath = 'input.shep'): Promise<CompilationResult<GeneratedApp>> {
  try {
    // Parse ShepLang source
    const parseResult = await parseShep(source, filePath);
    
    // If there were parse errors, return them
    if (!parseResult.success) {
      return {
        output: null,
        diagnostics: parseResult.diagnostics,
        success: false
      };
    }
    
    try {
      // Use existing transpile with the app model
      const genResult = transpile(parseResult.appModel);
      
      // Convert file array to record for easier access
      const files: Record<string, string> = {};
      for (const file of genResult.files) {
        files[file.path] = file.content;
      }
      
      // Find the entry point (default to index.ts)
      const entryPoint = genResult.files.find(f => f.path === 'index.ts')?.path || 'index.ts';
      
      return {
        output: {
          files,
          entryPoint
        },
        diagnostics: parseResult.diagnostics, // Include any warnings
        success: true
      };
    } catch (error: any) {
      // Handle compilation errors
      const diagnostic: Diagnostic = {
        message: `App generation error: ${error.message}`,
        severity: 'error',
        start: { line: 1, column: 1, offset: 0 },
        code: 'APP_GENERATION_ERROR',
        source: 'sheplang-compiler'
      };
      
      return {
        output: null,
        diagnostics: [...parseResult.diagnostics, diagnostic],
        success: false
      };
    }
  } catch (error: any) {
    // Handle unexpected errors
    const diagnostic: Diagnostic = {
      message: `Unexpected error: ${error.message}`,
      severity: 'error',
      start: { line: 1, column: 1, offset: 0 },
      code: 'UNEXPECTED_ERROR',
      source: 'sheplang-compiler'
    };
    
    return {
      output: null,
      diagnostics: [diagnostic],
      success: false
    };
  }
}
