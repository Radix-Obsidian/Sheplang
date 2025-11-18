import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

export async function validateDocument(document: TextDocument): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();

  try {
    if (document.languageId === 'sheplang') {
      const { parseShep } = await import('@sheplang/language');
      return validateShepLang(document, text, parseShep);
    } else if (document.languageId === 'shepthon') {
      const { parseShepThon } = await import('@sheplang/shepthon');
      return validateShepThon(document, text, parseShepThon);
    }
  } catch (error) {
    // Parser threw an error
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message: error instanceof Error ? error.message : 'Parse error',
      source: document.languageId
    });
  }

  return diagnostics;
}

async function validateShepLang(document: TextDocument, text: string, parseShep: any): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  
  try {
    // Parse using ShepLang parser from @sheplang/language
    const parseResult = await parseShep(text);
    
    // Convert parser diagnostics to LSP diagnostics
    if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
      for (const diag of parseResult.diagnostics) {
        const severity = 
          diag.severity === 'error' ? DiagnosticSeverity.Error :
          diag.severity === 'warning' ? DiagnosticSeverity.Warning :
          DiagnosticSeverity.Information;

        const line = Math.max(0, (diag.line || 1) - 1);
        const character = Math.max(0, (diag.column || 0));

        diagnostics.push({
          severity,
          range: {
            start: { line, character },
            end: { line, character: character + 1 }
          },
          message: diag.message,
          source: 'sheplang'
        });
      }
    }

    // Additional semantic validation can be added in Phase 2
  } catch (error) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message: error instanceof Error ? error.message : 'Parse error',
      source: 'sheplang'
    });
  }

  return diagnostics;
}

async function validateShepThon(document: TextDocument, text: string, parseShepThon: any): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  
  try {
    // Parse using ShepThon parser from @sheplang/shepthon
    const parseResult = parseShepThon(text);
    
    // Convert parser diagnostics to LSP diagnostics
    if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
      for (const diag of parseResult.diagnostics) {
        const severity = 
          diag.severity === 'error' ? DiagnosticSeverity.Error :
          diag.severity === 'warning' ? DiagnosticSeverity.Warning :
          DiagnosticSeverity.Information;

        const line = Math.max(0, (diag.line || 1) - 1);
        const character = Math.max(0, (diag.column || 0));

        diagnostics.push({
          severity,
          range: {
            start: { line, character },
            end: { line, character: character + 1 }
          },
          message: diag.message,
          source: 'shepthon'
        });
      }
    }

    // Additional semantic validation
    if (parseResult.app) {
      // Check for undefined model references in endpoints
      const modelNames = new Set(parseResult.app.models.map((m: any) => m.name));
      
      for (const endpoint of parseResult.app.endpoints || []) {
        const returnType = endpoint.returnType?.type;
        if (returnType && !['string', 'number', 'bool', 'id', 'datetime'].includes(returnType)) {
          if (!modelNames.has(returnType)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Error,
              range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 }
              },
              message: `Model '${returnType}' is not defined`,
              source: 'shepthon'
            });
          }
        }
      }
    }
  } catch (error) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message: error instanceof Error ? error.message : 'Parse error',
      source: 'shepthon'
    });
  }

  return diagnostics;
}
