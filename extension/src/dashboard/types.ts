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
 * Main verification report structure
 */
export interface VerificationReport {
  status: VerificationStatus;
  timestamp: Date | null;
  score: number;
  scores: {
    frontend: number;
    backend: number;
    schema: number;
    flow: number;
  };
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
}

/**
 * Create an empty/default verification report
 */
export function createEmptyReport(): VerificationReport {
  return {
    status: 'none',
    timestamp: null,
    score: 0,
    scores: {
      frontend: 0,
      backend: 0,
      schema: 0,
      flow: 0
    },
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
