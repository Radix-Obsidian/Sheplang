import { createShepServices } from './shep-module.js';
import { preprocessWithMap } from './preprocessor.js';
import type { ShepFile } from '../generated/ast';
import { EmptyFileSystem, URI } from 'langium';
import { mapToAppModel } from './mapper.js';
import type { AppModel } from './types.js';
import { formatFriendlyError, formatErrorMessage } from './error-formatter.js';

export type ParsedResult = {
  ast: ShepFile;
  appModel: AppModel;
  diagnostics: { message: string; line: number; column: number; severity: 'error' | 'warning' }[];
};

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
      line: originalLine,
      column: d.range.start.character + 1,
      severity: d.severity === 1 ? 'error' as const : 'warning' as const
    };
  });
  if (diagnostics.some((d: any) => d.severity === 'error')) {
    // Use first diagnostic for friendly message
    const first: any = document.diagnostics?.[0];
    const friendly = formatFriendlyError(first);
    // Remap line to original
    const outLine = first.range.start.line + 1;
    const originalLine = map[outLine - 1] ?? outLine;
    const finalMsg = formatErrorMessage({ ...friendly, line: originalLine });
    throw new Error(finalMsg);
  }
  const appModel = mapToAppModel(ast);
  return { ast, appModel, diagnostics };
}

// Helper used by tests to mirror expected API that directly returns appModel
export async function parseAndMap(source: string, filePath = 'input.shep') {
  const { ast, appModel, diagnostics } = await parseShep(source, filePath);
  return { diagnostics, appModel };
}

export { mapToAppModel };
export { preprocessIndentToBraces, preprocessWithMap } from './preprocessor.js';
export type { AppModel } from './types';
