/**
 * ShepVerify Dashboard Types
 * 
 * Core type definitions for the verification dashboard.
 */

/**
 * Verification status
 */
export type VerificationStatus = 'passed' | 'warning' | 'failed' | 'none';

/**
 * Language-specific score categories
 */
export interface LanguageScores {
  // ShepLang scores
  frontend?: number;
  backend?: number;
  schema?: number;
  flow?: number;
  
  // TypeScript/JavaScript scores
  typeSafety?: number;
  nullSafety?: number;
  codeQuality?: number;
  reactPatterns?: number;
  
  // HTML scores
  accessibility?: number;
  seo?: number;
  semantics?: number;
  
  // CSS scores
  bestPractices?: number;
  performance?: number;
  maintainability?: number;
  
  // JSON scores
  syntax?: number;
  schemaCompliance?: number;
}

/**
 * Main verification report structure
 */
export interface VerificationReport {
  status: VerificationStatus;
  timestamp: Date | null;
  score: number;
  /** Language being verified */
  language?: string;
  /** Language-specific scores (flexible based on file type) */
  scores: LanguageScores;
  phases: {
    typeSafety: PhaseResult;
    nullSafety: PhaseResult;
    apiContracts: PhaseResult;
    exhaustiveness: PhaseResult;
  };
  history: HistoryEntry[];
}

/**
 * Result for a single verification phase
 */
export interface PhaseResult {
  status: VerificationStatus;
  passRate: number;
  errors: VerificationError[];
  warnings: VerificationWarning[];
  passed: number;
}

/**
 * Verification error details
 */
export interface VerificationError {
  id: string;
  message: string;
  file: string;
  line: number;
  column: number;
  severity: 'error';
  fixable: boolean;
  suggestion?: string;
}

/**
 * Verification warning details
 */
export interface VerificationWarning {
  id: string;
  message: string;
  file: string;
  line: number;
  column: number;
  severity: 'warning';
}

/**
 * History entry for past verification runs
 */
export interface HistoryEntry {
  timestamp: Date;
  status: VerificationStatus;
  errorCount: number;
  warningCount: number;
  projectPath: string;
  /** Stored errors for navigation - allows clicking history to jump to errors */
  errors?: VerificationError[];
  /** Stored warnings for navigation */
  warnings?: VerificationWarning[];
  /** The file that was verified */
  filePath?: string;
}

/**
 * Create an empty/default verification report
 */
export function createEmptyReport(language?: string): VerificationReport {
  return {
    status: 'none',
    timestamp: null,
    score: 0,
    language: language || 'sheplang',
    scores: getDefaultScoresForLanguage(language || 'sheplang'),
    phases: {
      typeSafety: createEmptyPhase(),
      nullSafety: createEmptyPhase(),
      apiContracts: createEmptyPhase(),
      exhaustiveness: createEmptyPhase()
    },
    history: []
  };
}

/**
 * Get default scores structure based on language
 */
export function getDefaultScoresForLanguage(language: string): LanguageScores {
  switch (language) {
    case 'typescript':
    case 'javascript':
    case 'typescriptreact':
    case 'javascriptreact':
      return {
        typeSafety: 0,
        nullSafety: 0,
        codeQuality: 0,
        reactPatterns: 0
      };
    case 'html':
      return {
        accessibility: 0,
        seo: 0,
        semantics: 0
      };
    case 'css':
    case 'scss':
    case 'less':
      return {
        bestPractices: 0,
        performance: 0,
        maintainability: 0
      };
    case 'json':
    case 'jsonc':
      return {
        syntax: 0,
        schemaCompliance: 0,
        bestPractices: 0
      };
    default: // sheplang
      return {
        frontend: 0,
        backend: 0,
        schema: 0,
        flow: 0
      };
  }
}

/**
 * Create an empty phase result
 */
export function createEmptyPhase(): PhaseResult {
  return {
    status: 'none',
    passRate: 0,
    errors: [],
    warnings: [],
    passed: 0
  };
}
