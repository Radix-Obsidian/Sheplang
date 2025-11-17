/**
 * @sheplang/shepthon - Backend DSL for Non-Technical Founders
 * 
 * ShepThon is a Python-like backend language that runs on Node/Edge runtime.
 * It's designed to be written and explained by AI, making backend development
 * accessible to founders who don't know traditional programming.
 * 
 * Phase 0: Exports types and stub parser
 * Future phases: Full parser, runtime, scheduler, Shipyard integration
 * 
 * @see Project-scope/PRD_ShepThon_Alpha.md
 * @see Project-scope/TTD_ShepThon_Core.md
 */

// Export types
export type {
  ShepThonApp,
  ModelDefinition,
  FieldDefinition,
  FieldType,
  EndpointDefinition,
  HttpMethod,
  ParameterDefinition,
  ReturnType,
  JobDefinition,
  ScheduleExpression,
  Statement,
  LetStatement,
  ReturnStatement,
  ForStatement,
  IfStatement,
  ExpressionStatement,
  Expression,
  CallExpression,
  MemberExpression,
  Identifier,
  Literal,
  BinaryExpression,
  ParseResult,
  Diagnostic
} from './types.js';

// Export parser
export { parseShepThon } from './parser.js';
export { checkShepThon, type CheckResult } from './checker.js';
export type * from './types.js';

// Export lexer for token inspection
export { Lexer, TokenType } from './lexer.js';
export type { Token } from './lexer.js';

// Export smart error recovery
export { SmartErrorRecovery, createEnhancedDiagnostic } from './SmartErrorRecovery.js';
export type { ParseError, ErrorSuggestion } from './SmartErrorRecovery.js';

export { ShepThonRuntime } from './runtime/index.js';
