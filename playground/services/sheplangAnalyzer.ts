/**
 * ShepLang Code Analyzer Service
 * 
 * Handles communication with the ShepLang analysis API
 * and converts responses to Monaco-compatible diagnostic format
 */

export interface ShepLangDiagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

export interface AnalysisResponse {
  success: boolean;
  diagnostics: ShepLangDiagnostic[];
  parseTime: number;
  metadata?: {
    codeLength: number;
    lines: number;
  };
  error?: string;
  details?: string;
}

/**
 * Analyzes ShepLang code by sending it to the API
 * @param code The ShepLang code to analyze
 * @returns Analysis response with diagnostics
 */
export async function analyzeCode(code: string): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        diagnostics: [{
          severity: 'error',
          message: errorData.error || `API error: ${response.status}`,
          line: 1,
          column: 1,
        }],
        parseTime: 0,
      };
    }
    
    const data: AnalysisResponse = await response.json();
    return data;
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('Failed to analyze code:', errorMessage);
    return {
      success: false,
      diagnostics: [{
        severity: 'error',
        message: `Analysis failed: ${errorMessage}`,
        line: 1,
        column: 1,
      }],
      parseTime: 0,
    };
  }
}

/**
 * Converts ShepLang diagnostics to Monaco editor marker format
 * @param diagnostics Array of ShepLang diagnostics
 * @returns Array of Monaco markers
 */
export function convertToMonacoMarkers(diagnostics: ShepLangDiagnostic[]) {
  return diagnostics.map(diagnostic => ({
    startLineNumber: diagnostic.line,
    startColumn: diagnostic.column,
    endLineNumber: diagnostic.endLine || diagnostic.line,
    endColumn: diagnostic.endColumn || diagnostic.column + 1,
    message: diagnostic.message,
    severity: getMonacoSeverity(diagnostic.severity),
  }));
}

/**
 * Maps ShepLang severity to Monaco severity
 * @param severity ShepLang severity level
 * @returns Monaco severity number
 */
function getMonacoSeverity(severity: 'error' | 'warning' | 'info'): number {
  // Monaco severity levels:
  // 1 = Hint, 2 = Info, 4 = Warning, 8 = Error
  switch (severity) {
    case 'error':
      return 8;
    case 'warning':
      return 4;
    case 'info':
      return 2;
    default:
      return 2;
  }
}
