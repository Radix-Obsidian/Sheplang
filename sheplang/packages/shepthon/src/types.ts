/**
 * ShepThon Core Types (Phase 0)
 * 
 * Minimal type definitions for ShepThon language AST.
 * Based on PRD_ShepThon_Alpha.md specification.
 */

/**
 * Top-level ShepThon application
 */
export interface ShepThonApp {
  name: string;
  models: ModelDefinition[];
  endpoints: EndpointDefinition[];
  jobs: JobDefinition[];
}

/**
 * Model definition (like a database table)
 */
export interface ModelDefinition {
  name: string;
  fields: FieldDefinition[];
}

/**
 * Field within a model
 */
export interface FieldDefinition {
  name: string;
  type: FieldType;
  defaultValue?: string | number | boolean | null;
}

/**
 * Supported field types in Alpha
 */
export type FieldType = 'id' | 'string' | 'int' | 'float' | 'bool' | 'datetime' | 'json';

/**
 * HTTP endpoint definition
 */
export interface EndpointDefinition {
  method: HttpMethod;
  path: string;
  parameters: ParameterDefinition[];
  returnType: ReturnType;
  body: Statement[];
}

/**
 * HTTP methods supported in Alpha
 */
export type HttpMethod = 'GET' | 'POST';

/**
 * Endpoint parameter
 */
export interface ParameterDefinition {
  name: string;
  type: FieldType;
  optional?: boolean;
}

/**
 * Return type for endpoints
 */
export interface ReturnType {
  type: string; // Model name
  isArray: boolean;
}

/**
 * Scheduled job definition
 */
export interface JobDefinition {
  name: string;
  schedule: ScheduleExpression;
  body: Statement[];
}

/**
 * Job schedule expression
 */
export interface ScheduleExpression {
  every: number;
  unit: 'minutes' | 'hours' | 'days';
}

/**
 * Statement types (Alpha subset)
 */
export type Statement = 
  | LetStatement
  | ReturnStatement
  | ForStatement
  | IfStatement
  | ExpressionStatement;

export interface LetStatement {
  type: 'let';
  name: string;
  value: Expression;
}

export interface ReturnStatement {
  type: 'return';
  value: Expression;
}

export interface ForStatement {
  type: 'for';
  item: string;
  collection: Expression;
  body: Statement[];
}

export interface IfStatement {
  type: 'if';
  condition: Expression;
  thenBody: Statement[];
  elseBody?: Statement[];
}

export interface ExpressionStatement {
  type: 'expression';
  expression: Expression;
}

/**
 * Expression types (Alpha subset)
 */
export type Expression =
  | CallExpression
  | MemberExpression
  | Identifier
  | Literal
  | BinaryExpression;

export interface CallExpression {
  type: 'call';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression {
  type: 'member';
  object: Expression;
  property: string;
}

export interface Identifier {
  type: 'identifier';
  name: string;
}

export interface Literal {
  type: 'literal';
  value: any; // Can be any JSON-serializable value (primitives, objects, arrays)
}

export interface BinaryExpression {
  type: 'binary';
  operator: string;
  left: Expression;
  right: Expression;
}

/**
 * Parse result
 */
export interface ParseResult {
  app: ShepThonApp | null;
  diagnostics: Diagnostic[];
}

/**
 * Diagnostic message
 */
export interface Diagnostic {
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
}
