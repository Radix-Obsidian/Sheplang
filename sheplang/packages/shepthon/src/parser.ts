/**
 * ShepThon Parser (Phase 1 - Recursive Descent)
 * 
 * Full recursive descent parser for ShepThon language.
 * Parses models, endpoints, jobs, statements, and expressions.
 * 
 * Based on official recursive descent parsing patterns:
 * https://thunderseethe.dev/posts/parser-base/
 * 
 * Features:
 * - Error recovery at synchronization points
 * - Position tracking for diagnostics
 * - Supports Dog Reminders example completely
 */

import { Lexer, TokenType } from './lexer.js';
import type { Token } from './lexer.js';
import type {
  ParseResult,
  ShepThonApp,
  ModelDefinition,
  EndpointDefinition,
  JobDefinition,
  FieldDefinition,
  FieldType,
  ParameterDefinition,
  ReturnType,
  Statement,
  LetStatement,
  ReturnStatement,
  ForStatement,
  IfStatement,
  Expression,
  Diagnostic,
  HttpMethod
} from './types.js';

/**
 * ShepThon Parser
 */
class Parser {
  private tokens: Token[];
  private current: number = 0;
  private diagnostics: Diagnostic[] = [];
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  
  /**
   * Parse the entire ShepThon source
   */
  parse(): ParseResult {
    try {
      const app = this.parseApp();
      return {
        app,
        diagnostics: this.diagnostics
      };
    } catch (error) {
      // Fatal parsing error
      return {
        app: null,
        diagnostics: this.diagnostics
      };
    }
  }
  
  /**
   * Parse app block: app <Name> { ... }
   */
  private parseApp(): ShepThonApp | null {
    // Skip any leading newlines
    this.skipNewlines();
    
    if (!this.match(TokenType.APP)) {
      this.error('Expected "app" keyword');
      return null;
    }
    
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected app name');
    const appName = nameToken.value;
    
    this.skipNewlines();
    this.consume(TokenType.LBRACE, 'Expected "{"');
    this.skipNewlines();
    
    const models: ModelDefinition[] = [];
    const endpoints: EndpointDefinition[] = [];
    const jobs: JobDefinition[] = [];
    
    // Safety check to prevent infinite loops
    let maxIterations = 1000;
    let iterations = 0;
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // Infinite loop protection
      if (++iterations > maxIterations) {
        this.error('Parser exceeded maximum iterations - possible infinite loop');
        break;
      }
      
      this.skipNewlines();
      
      if (this.match(TokenType.MODEL)) {
        const model = this.parseModel();
        if (model) models.push(model);
      } else if (this.match(TokenType.ENDPOINT)) {
        const endpoint = this.parseEndpoint();
        if (endpoint) endpoints.push(endpoint);
      } else if (this.match(TokenType.JOB)) {
        const job = this.parseJob();
        if (job) jobs.push(job);
      } else if (this.check(TokenType.RBRACE)) {
        break;
      } else {
        // Unexpected token - advance to prevent infinite loop
        this.error(`Unexpected token: ${this.peek().value}`);
        this.advance(); // Force advance!
        this.synchronize();
      }
      
      this.skipNewlines();
    }
    
    this.consume(TokenType.RBRACE, 'Expected "}"');
    
    return {
      name: appName,
      models,
      endpoints,
      jobs
    };
  }
  
  /**
   * Parse model: model <Name> { field: type, ... }
   */
  private parseModel(): ModelDefinition | null {
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected model name');
    const modelName = nameToken.value;
    
    this.skipNewlines();
    this.consume(TokenType.LBRACE, 'Expected "{"');
    this.skipNewlines();
    
    const fields: FieldDefinition[] = [];
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      this.skipNewlines();
      if (this.check(TokenType.RBRACE)) break;
      
      const field = this.parseField();
      if (field) fields.push(field);
      this.skipNewlines();
    }
    
    this.consume(TokenType.RBRACE, 'Expected "}"');
    
    return {
      name: modelName,
      fields
    };
  }
  
  /**
   * Parse field: name: type [= default]
   */
  private parseField(): FieldDefinition | null {
    const nameToken = this.consumeIdentifierOrKeyword('Expected field name');
    const fieldName = nameToken.value;
    
    this.consume(TokenType.COLON, 'Expected ":"');
    
    const typeToken = this.advance();
    const fieldType = this.tokenToFieldType(typeToken);
    
    let defaultValue: string | number | boolean | undefined;
    
    if (this.match(TokenType.EQUALS)) {
      const valueToken = this.advance();
      defaultValue = this.tokenToLiteralValue(valueToken);
    }
    
    return {
      name: fieldName,
      type: fieldType,
      defaultValue
    };
  }
  
  /**
   * Parse endpoint: endpoint <METHOD> "<path>" [(params)] -> ReturnType { statements }
   */
  private parseEndpoint(): EndpointDefinition | null {
    // Parse HTTP method
    const methodToken = this.advance();
    let method: HttpMethod;
    
    if (methodToken.type === TokenType.GET) {
      method = 'GET';
    } else if (methodToken.type === TokenType.POST) {
      method = 'POST';
    } else {
      this.error('Expected HTTP method (GET or POST)');
      return null;
    }
    
    // Parse path
    const pathToken = this.consume(TokenType.STRING_LITERAL, 'Expected endpoint path');
    const path = pathToken.value;
    
    // Parse optional parameters
    const parameters: ParameterDefinition[] = [];
    if (this.match(TokenType.LPAREN)) {
      if (!this.check(TokenType.RPAREN)) {
        do {
          const param = this.parseParameter();
          if (param) parameters.push(param);
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, 'Expected ")"');
    }
    
    // Parse return type
    this.consume(TokenType.ARROW, 'Expected "->"');
    const returnType = this.parseReturnType();
    
    // Parse body
    this.skipNewlines();
    this.consume(TokenType.LBRACE, 'Expected "{"');
    this.skipNewlines();
    
    const body = this.parseStatements();
    
    this.consume(TokenType.RBRACE, 'Expected "}"');
    
    return {
      method,
      path,
      parameters,
      returnType,
      body
    };
  }
  
  /**
   * Parse parameter: name: type or name?: type
   */
  private parseParameter(): ParameterDefinition | null {
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected parameter name');
    const paramName = nameToken.value;
    
    const optional = this.match(TokenType.QUESTION);
    
    this.consume(TokenType.COLON, 'Expected ":"');
    
    const typeToken = this.advance();
    const paramType = this.tokenToFieldType(typeToken);
    
    return {
      name: paramName,
      type: paramType,
      optional
    };
  }
  
  /**
   * Parse return type: Type or [Type]
   */
  private parseReturnType(): ReturnType {
    let isArray = false;
    
    if (this.match(TokenType.LBRACKET)) {
      isArray = true;
    }
    
    const typeToken = this.advance();
    const typeName = typeToken.value;
    
    if (isArray) {
      this.consume(TokenType.RBRACKET, 'Expected "]"');
    }
    
    return {
      type: typeName,
      isArray
    };
  }
  
  /**
   * Parse job: job "<name>" every <N> <unit> { statements }
   */
  private parseJob(): JobDefinition | null {
    const nameToken = this.consume(TokenType.STRING_LITERAL, 'Expected job name');
    const jobName = nameToken.value;
    
    this.consume(TokenType.EVERY, 'Expected "every"');
    
    const numberToken = this.consume(TokenType.NUMBER_LITERAL, 'Expected number');
    const every = parseInt(numberToken.value, 10);
    
    const unitToken = this.advance();
    let unit: 'minutes' | 'hours' | 'days';
    
    if (unitToken.type === TokenType.MINUTES) {
      unit = 'minutes';
    } else if (unitToken.type === TokenType.HOURS) {
      unit = 'hours';
    } else if (unitToken.type === TokenType.DAYS) {
      unit = 'days';
    } else {
      this.error('Expected time unit (minutes, hours, days)');
      unit = 'minutes';
    }
    
    this.skipNewlines();
    this.consume(TokenType.LBRACE, 'Expected "{"');
    this.skipNewlines();
    
    const body = this.parseStatements();
    
    this.consume(TokenType.RBRACE, 'Expected "}"');
    
    return {
      name: jobName,
      schedule: { every, unit },
      body
    };
  }
  
  /**
   * Parse statements until closing brace
   */
  private parseStatements(): Statement[] {
    const statements: Statement[] = [];
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      this.skipNewlines();
      
      if (this.check(TokenType.RBRACE)) break;
      
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
      
      this.skipNewlines();
    }
    
    return statements;
  }
  
  /**
   * Parse a single statement
   */
  private parseStatement(): Statement | null {
    if (this.match(TokenType.LET)) {
      return this.parseLetStatement();
    }
    
    if (this.match(TokenType.RETURN)) {
      return this.parseReturnStatement();
    }
    
    if (this.match(TokenType.FOR)) {
      return this.parseForStatement();
    }
    
    if (this.match(TokenType.IF)) {
      return this.parseIfStatement();
    }
    
    // Expression statement
    const expr = this.parseExpression();
    return {
      type: 'expression',
      expression: expr
    };
  }
  
  /**
   * Parse let statement: let name = expression
   */
  private parseLetStatement(): LetStatement {
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected variable name');
    const name = nameToken.value;
    
    this.consume(TokenType.EQUALS, 'Expected "="');
    
    const value = this.parseExpression();
    
    return {
      type: 'let',
      name,
      value
    };
  }
  
  /**
   * Parse return statement: return expression
   */
  private parseReturnStatement(): ReturnStatement {
    const value = this.parseExpression();
    
    return {
      type: 'return',
      value
    };
  }
  
  /**
   * Parse for statement: for item in collection { statements }
   */
  private parseForStatement(): ForStatement {
    const itemToken = this.consume(TokenType.IDENTIFIER, 'Expected loop variable');
    const item = itemToken.value;
    
    this.consume(TokenType.IN, 'Expected "in"');
    
    const collection = this.parseExpression();
    
    this.skipNewlines();
    this.consume(TokenType.LBRACE, 'Expected "{"');
    this.skipNewlines();
    
    const body = this.parseStatements();
    
    this.consume(TokenType.RBRACE, 'Expected "}"');
    
    return {
      type: 'for',
      item,
      collection,
      body
    };
  }
  
  /**
   * Parse if statement: if condition { statements } [else { statements }]
   */
  private parseIfStatement(): IfStatement {
    const condition = this.parseExpression();
    
    this.skipNewlines();
    this.consume(TokenType.LBRACE, 'Expected "{"');
    this.skipNewlines();
    
    const thenBody = this.parseStatements();
    
    this.consume(TokenType.RBRACE, 'Expected "}"');
    
    let elseBody: Statement[] | undefined;
    
    this.skipNewlines();
    if (this.match(TokenType.ELSE)) {
      this.skipNewlines();
      this.consume(TokenType.LBRACE, 'Expected "{"');
      this.skipNewlines();
      
      elseBody = this.parseStatements();
      
      this.consume(TokenType.RBRACE, 'Expected "}"');
    }
    
    return {
      type: 'if',
      condition,
      thenBody,
      elseBody
    };
  }
  
  /**
   * Parse expression (calls, member access, literals, binary ops)
   */
  private parseExpression(): Expression {
    return this.parseBinaryExpression();
  }
  
  /**
   * Parse binary expression: a <= b, a == b, etc
   */
  private parseBinaryExpression(): Expression {
    let left = this.parseCallExpression();
    
    while (this.check(TokenType.LE) || this.check(TokenType.GE) || 
           this.check(TokenType.LT) || this.check(TokenType.GT) ||
           this.check(TokenType.EQ) || this.check(TokenType.NE)) {
      const operator = this.advance();
      const right = this.parseCallExpression();
      
      left = {
        type: 'binary',
        operator: operator.value,
        left,
        right
      };
    }
    
    return left;
  }
  
  /**
   * Parse call expression: func(args)
   */
  private parseCallExpression(): Expression {
    let expr = this.parseMemberExpression();
    
    while (this.match(TokenType.LPAREN)) {
      const args: Expression[] = [];
      
      if (!this.check(TokenType.RPAREN)) {
        do {
          args.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
      }
      
      this.consume(TokenType.RPAREN, 'Expected ")"');
      
      expr = {
        type: 'call',
        callee: expr,
        arguments: args
      };
    }
    
    return expr;
  }
  
  /**
   * Parse member expression: obj.prop
   */
  private parseMemberExpression(): Expression {
    let expr = this.parsePrimaryExpression();
    
    while (this.match(TokenType.DOT)) {
      const property = this.consume(TokenType.IDENTIFIER, 'Expected property name');
      
      expr = {
        type: 'member',
        object: expr,
        property: property.value
      };
    }
    
    return expr;
  }
  
  /**
   * Parse primary expression: literals, identifiers, grouped expressions
   */
  private parsePrimaryExpression(): Expression {
    // String literal
    if (this.check(TokenType.STRING_LITERAL)) {
      const token = this.advance();
      return {
        type: 'literal',
        value: token.value
      };
    }
    
    // Number literal
    if (this.check(TokenType.NUMBER_LITERAL)) {
      const token = this.advance();
      const value = token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value, 10);
      return {
        type: 'literal',
        value
      };
    }
    
    // Boolean literals
    if (this.match(TokenType.TRUE)) {
      return {
        type: 'literal',
        value: true
      };
    }
    
    if (this.match(TokenType.FALSE)) {
      return {
        type: 'literal',
        value: false
      };
    }
    
    // NOT operator
    if (this.match(TokenType.NOT)) {
      const operand = this.parsePrimaryExpression();
      return {
        type: 'call',
        callee: {
          type: 'identifier',
          name: 'not'
        },
        arguments: [operand]
      };
    }
    
    // Object literal: { key: value, ... }
    if (this.match(TokenType.LBRACE)) {
      // For Phase 1, we'll represent object literals as call expressions
      // This is a simplification; full implementation would have ObjectLiteral type
      const properties: Expression[] = [];
      
      if (!this.check(TokenType.RBRACE)) {
        do {
          this.skipNewlines();
          const key = this.consume(TokenType.IDENTIFIER, 'Expected property name');
          this.consume(TokenType.COLON, 'Expected ":"');
          const value = this.parseExpression();
          
          properties.push({
            type: 'literal',
            value: `${key.value}:${JSON.stringify(value)}`
          });
        } while (this.match(TokenType.COMMA));
      }
      
      this.skipNewlines();
      this.consume(TokenType.RBRACE, 'Expected "}"');
      
      return {
        type: 'literal',
        value: `{object with ${properties.length} properties}`
      };
    }
    
    // Identifier
    if (this.check(TokenType.IDENTIFIER)) {
      const token = this.advance();
      return {
        type: 'identifier',
        name: token.value
      };
    }
    
    // Error
    this.error(`Unexpected token in expression: ${this.peek().value}`);
    return {
      type: 'literal',
      value: null
    };
  }
  
  // ========== Helper Methods ==========
  
  /**
   * Convert token type to field type
   */
  private tokenToFieldType(token: Token): FieldType {
    switch (token.type) {
      case TokenType.ID: return 'id';
      case TokenType.STRING: return 'string';
      case TokenType.INT: return 'int';
      case TokenType.FLOAT: return 'float';
      case TokenType.BOOL: return 'bool';
      case TokenType.DATETIME: return 'datetime';
      case TokenType.JSON: return 'json';
      default:
        this.error(`Invalid field type: ${token.value}`);
        return 'string';
    }
  }
  
  /**
   * Convert token to literal value
   */
  private tokenToLiteralValue(token: Token): string | number | boolean {
    if (token.type === TokenType.STRING_LITERAL) {
      return token.value;
    }
    if (token.type === TokenType.NUMBER_LITERAL) {
      return token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value, 10);
    }
    if (token.type === TokenType.TRUE) {
      return true;
    }
    if (token.type === TokenType.FALSE) {
      return false;
    }
    return token.value;
  }
  
  /**
   * Skip newline tokens
   */
  private skipNewlines(): void {
    while (this.match(TokenType.NEWLINE)) {
      // Skip
    }
  }
  
  /**
   * Check if current token matches type
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  
  /**
   * Match and consume token if type matches
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  
  /**
   * Consume token of expected type or error
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    
    this.error(message);
    return this.peek();
  }
  
  /**
   * Consume identifier or keyword (for contexts where keywords are allowed as identifiers)
   * This allows field names like "id", "string", etc. which are lexed as keywords
   */
  private consumeIdentifierOrKeyword(message: string): Token {
    const token = this.peek();
    
    // Check if current token is IDENTIFIER or any keyword that can be used as identifier
    if (token.type === TokenType.IDENTIFIER ||
        token.type === TokenType.ID ||
        token.type === TokenType.STRING ||
        token.type === TokenType.INT ||
        token.type === TokenType.FLOAT ||
        token.type === TokenType.BOOL ||
        token.type === TokenType.DATETIME ||
        token.type === TokenType.JSON ||
        token.type === TokenType.MODEL ||
        token.type === TokenType.ENDPOINT ||
        token.type === TokenType.JOB ||
        token.type === TokenType.LET ||
        token.type === TokenType.RETURN ||
        token.type === TokenType.FOR ||
        token.type === TokenType.IF ||
        token.type === TokenType.ELSE ||
        token.type === TokenType.IN ||
        token.type === TokenType.EVERY ||
        token.type === TokenType.TRUE ||
        token.type === TokenType.FALSE ||
        token.type === TokenType.GET ||
        token.type === TokenType.POST ||
        token.type === TokenType.APP) {
      return this.advance();
    }
    
    this.error(message);
    return this.peek();
  }
  
  /**
   * Advance to next token
   */
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }
  
  /**
   * Get current token
   */
  private peek(): Token {
    return this.tokens[this.current];
  }
  
  /**
   * Get previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }
  
  /**
   * Check if at end of tokens
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }
  
  /**
   * Report an error
   */
  private error(message: string): void {
    const token = this.peek();
    this.diagnostics.push({
      severity: 'error',
      message,
      line: token.line,
      column: token.column
    });
  }
  
  /**
   * Synchronize parser after error (error recovery)
   */
  private synchronize(): void {
    this.advance();
    
    while (!this.isAtEnd()) {
      // Stop at statement boundaries
      if (this.previous().type === TokenType.NEWLINE) {
        return;
      }
      
      // Stop at declaration keywords
      if (this.check(TokenType.MODEL) || 
          this.check(TokenType.ENDPOINT) || 
          this.check(TokenType.JOB)) {
        return;
      }
      
      this.advance();
    }
  }
}

/**
 * Parse ShepThon source code into an AST
 * 
 * @param source - ShepThon source code string
 * @returns Parse result with AST and diagnostics
 */
export function parseShepThon(source: string): ParseResult {
  // Lex the source
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  
  // Parse the tokens
  const parser = new Parser(tokens);
  return parser.parse();
}
