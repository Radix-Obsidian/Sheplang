import type { ShepFile } from './generated/ast.js';
import { mapToAppModel } from './mapper.js';
import type { AppModel } from './types.js';
import type { Diagnostic } from './types/diagnostics.js';
export type ParsedResult = {
    ast: ShepFile;
    appModel: AppModel;
    diagnostics: Diagnostic[];
    success: boolean;
};
/**
 * Parse ShepLang source code
 * @param source Source code to parse
 * @param filePath Optional file path for better error messages
 * @returns Parsed result with AST, app model, and diagnostics
 */
export declare function parseShep(source: string, filePath?: string): Promise<ParsedResult>;
export declare function parseAndMap(source: string, filePath?: string): Promise<{
    diagnostics: Diagnostic[];
    appModel: AppModel;
    success: boolean;
}>;
export { mapToAppModel };
export { preprocessIndentToBraces, preprocessWithMap } from './preprocessor.js';
export type { AppModel } from './types.js';
export type { Diagnostic, CompilationResult } from './types/diagnostics.js';
