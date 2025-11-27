import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

export async function validateDocument(document: TextDocument): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();

  try {
    if (document.languageId === 'sheplang') {
      const { parseShep } = await import('@goldensheepai/sheplang-language');
      return validateShepLang(document, text, parseShep);
    } else if (document.languageId === 'shepthon') {
      // ShepThon support is optional - return empty diagnostics if not available
      try {
        // @ts-expect-error - ShepThon package is optional and may not be installed
        const { parseShepThon } = await import('@sheplang/shepthon');
        return validateShepThon(document, text, parseShepThon);
      } catch (importError) {
        // ShepThon package not available - return informational message
        return [{
          severity: DiagnosticSeverity.Information,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 }
          },
          message: 'ShepThon backend validation not available. Install @sheplang/shepthon package to enable.',
          source: 'shepthon'
        }];
      }
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
  
  // Use LENIENT validation for better UX
  // The strict Langium parser is too aggressive for editor feedback
  // Only show errors for things that will DEFINITELY break the app
  
  // Check 1: Must have app declaration
  if (!text.match(/^\s*app\s+\w+/m)) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      message: 'Missing app declaration. Start with: app MyAppName {',
      source: 'sheplang'
    });
    return diagnostics;
  }
  
  // Check 2: Balanced braces
  const openBraces = (text.match(/{/g) || []).length;
  const closeBraces = (text.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      message: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`,
      source: 'sheplang'
    });
  }
  
  // Check 3: Basic structure validation (warnings only)
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for common typos in keywords
    if (line.match(/^datsa\s/i)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: i, character: 0 }, end: { line: i, character: 5 } },
        message: 'Did you mean "data"?',
        source: 'sheplang'
      });
    }
    if (line.match(/^veiw\s/i) || line.match(/^vxiew\s/i)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: i, character: 0 }, end: { line: i, character: 5 } },
        message: 'Did you mean "view"?',
        source: 'sheplang'
      });
    }
    if (line.match(/^acton\s/i) || line.match(/^actoin\s/i)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: i, character: 0 }, end: { line: i, character: 6 } },
        message: 'Did you mean "action"?',
        source: 'sheplang'
      });
    }
  }
  
  // Optional: Try strict parsing and downgrade errors to hints
  try {
    const parseResult = await parseShep(text);
    if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
      for (const diag of parseResult.diagnostics) {
        // Downgrade parser errors to Hints - don't block the user
        diagnostics.push({
          severity: DiagnosticSeverity.Hint,
          range: {
            start: { line: Math.max(0, (diag.line || 1) - 1), character: Math.max(0, (diag.column || 0)) },
            end: { line: Math.max(0, (diag.line || 1) - 1), character: Math.max(0, (diag.column || 0)) + 1 }
          },
          message: `Parser: ${diag.message}`,
          source: 'sheplang-parser'
        });
      }
    }
  } catch (error) {
    // Silently ignore strict parser errors - the preview will show if it works
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
