/**
 * ShepVerify Type System
 * 
 * Represents types in the ShepLang type system for formal verification.
 */

/**
 * Represents a type in the ShepLang type system.
 * 
 * ShepLang has a simple, constrained type system:
 * - Primitives: text, number, yes/no, datetime, id
 * - Model types: User, Product, etc.
 * - Nullable types: User | null (from database queries)
 * - Array types: [User]
 */
export type Type = 
  | { kind: 'text' }
  | { kind: 'number' }
  | { kind: 'yes/no' }
  | { kind: 'datetime' }
  | { kind: 'id' }
  | { kind: 'model'; name: string }
  | { kind: 'array'; elementType: Type }
  | { kind: 'nullable'; baseType: Type }
  | { kind: 'unknown' };  // For error recovery

/**
 * Diagnostic message produced by verification.
 */
export interface Diagnostic {
  /** Error, warning, or info */
  severity: 'error' | 'warning' | 'info';
  
  /** 1-indexed line number */
  line: number;
  
  /** 1-indexed column number */
  column: number;
  
  /** Human-readable message */
  message: string;
  
  /** Category of diagnostic */
  type: 'type-safety' | 'null-safety' | 'endpoint' | 'exhaustiveness';
  
  /** Optional code fix suggestion */
  suggestion?: string;
}

/**
 * Result of running verification.
 */
export interface VerificationResult {
  /** True if no errors found */
  passed: boolean;
  
  /** Errors that must be fixed */
  errors: Diagnostic[];
  
  /** Warnings that should be fixed */
  warnings: Diagnostic[];
  
  /** Informational messages */
  info: Diagnostic[];
  
  /** Summary statistics */
  summary: {
    totalChecks: number;
    errorCount: number;
    warningCount: number;
    /** Confidence score 0-100 */
    confidenceScore: number;
  };
}

/**
 * Type environment tracks types of variables in scope.
 */
export interface TypeEnvironment {
  variables: Map<string, Type>;
}
