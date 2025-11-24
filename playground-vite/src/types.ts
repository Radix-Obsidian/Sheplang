/**
 * Types for ShepLang Playground
 */

export interface ShepLangDiagnostic {
  message: string;
  severity: 'error' | 'warning' | 'info';
  range?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  code?: string;
  source?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface AnalysisResult {
  diagnostics: ShepLangDiagnostic[];
  parseTime: number;
}

export interface PreviewResult {
  html: string;
  generationTime: number;
}
