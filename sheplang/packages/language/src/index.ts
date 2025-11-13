import { createShepServices } from './shep-module.js';
import { preprocessWithMap } from './preprocessor.js';
import type { ShepFile } from '../generated/ast.js';
import { EmptyFileSystem, URI } from 'langium';
import { mapToAppModel } from './mapper.js';
import type { AppModel } from './types.js';
import { formatFriendlyError, formatErrorMessage } from './error-formatter.js';
import type { Diagnostic, CompilationResult } from './types/diagnostics';

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
export async function parseShep(source: string, filePath = 'input.shep'): Promise<ParsedResult> {
  const { text: preprocessed, map } = preprocessWithMap(source);
  const services = createShepServices(EmptyFileSystem).Shep;
  const document = services.shared.workspace.LangiumDocumentFactory.fromString(preprocessed, URI.file(filePath));
  await services.shared.workspace.DocumentBuilder.build([document], { validation: true });
  const parseResult = document.parseResult;
  const ast = parseResult.value as ShepFile;
  const diagnostics = (document.diagnostics ?? []).map((d: any) => {
    const outLine = d.range.start.line + 1;
    const originalLine = map[outLine - 1] ?? outLine;
    return {
      message: d.message,
      severity: d.severity === 1 ? 'error' : 'warning',
      start: {
        line: originalLine,
        column: d.range.start.character + 1,
        offset: d.range.start.offset
      },
      end: {
        line: d.range.end ? (map[d.range.end.line] ?? d.range.end.line + 1) : originalLine,
        column: d.range.end ? d.range.end.character + 1 : d.range.start.character + 1,
        offset: d.range.end ? d.range.end.offset : d.range.start.offset
      },
      code: d.code,
      source: 'sheplang'
    } as Diagnostic;
  });

  // Only try to build model if we don't have parse errors
  let appModel: AppModel | null = null;
  const success = !diagnostics.some(d => d.severity === 'error');
  
  if (success) {
    try {
      appModel = mapToAppModel(ast);
    } catch (error: any) {
      // Add model mapping errors as diagnostics
      diagnostics.push({
        message: `Model mapping error: ${error.message}`,
        severity: 'error',
        start: { line: 1, column: 1, offset: 0 },
        code: 'MODEL_MAPPING_ERROR',
        source: 'sheplang'
      });
      return { ast, appModel: null as unknown as AppModel, diagnostics, success: false };
    }
  }

  return { 
    ast, 
    appModel: appModel as AppModel, // We know it's not null if success is true
    diagnostics,
    success
  };
}

// Helper used by tests to mirror expected API that directly returns appModel
export async function parseAndMap(source: string, filePath = 'input.shep') {
  const { ast, appModel, diagnostics, success } = await parseShep(source, filePath);
  return { diagnostics, appModel, success };
}

export { mapToAppModel };
export { preprocessIndentToBraces, preprocessWithMap } from './preprocessor.js';
export type { AppModel } from './types';
export type { Diagnostic, CompilationResult } from './types/diagnostics';
