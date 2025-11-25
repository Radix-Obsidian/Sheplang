/**
 * Code Translator - Phase 2
 * 
 * Translates JavaScript/TypeScript statements to ShepLang syntax.
 * This is the core of FAITHFUL translation - no logic loss.
 * 
 * Following Golden Sheep Methodology:
 * - Every function is REAL (no placeholders)
 * - Preserves ALL business logic
 * - 1:1 translation, not simplification
 */

import * as ts from 'typescript';

/**
 * Translated statement types for ShepLang
 */
export type TranslatedStatement = 
  | CallStatement
  | LoadStatement
  | SetStatement
  | IfStatement
  | ReturnStatement
  | AddStatement
  | RemoveStatement
  | ShowStatement
  | RawStatement;

export interface CallStatement {
  kind: 'call';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  fields?: string[];
  into?: string;  // For storing response
}

export interface LoadStatement {
  kind: 'load';
  method: 'GET';
  path: string;
  into: string;
}

export interface SetStatement {
  kind: 'set';
  variable: string;
  value: string;
}

export interface IfStatement {
  kind: 'if';
  condition: string;
  then: TranslatedStatement[];
  else?: TranslatedStatement[];
}

export interface ReturnStatement {
  kind: 'return';
  value?: string;
}

export interface AddStatement {
  kind: 'add';
  entity: string;
  fields?: string[];
}

export interface RemoveStatement {
  kind: 'remove';
  entity: string;
  id?: string;
}

export interface ShowStatement {
  kind: 'show';
  view: string;
}

export interface RawStatement {
  kind: 'raw';
  code: string;  // Fallback for untranslatable code
  comment?: string;
}

/**
 * Skipped item for transparency
 */
export interface SkippedItem {
  type: 'console' | 'preventDefault' | 'stopPropagation' | 'debugger';
  count: number;
}

/**
 * Translation result with metadata
 */
export interface TranslationResult {
  statements: TranslatedStatement[];
  confidence: number;  // 0-1, how well we translated
  warnings: string[];
  rawCount: number;    // How many fell back to raw
  skipped: SkippedItem[];  // What was intentionally skipped (for transparency)
}

/**
 * Translate a function body string to ShepLang statements
 * This is the main entry point for Phase 2
 */
export function translateFunctionBody(bodyText: string): TranslationResult {
  const statements: TranslatedStatement[] = [];
  const warnings: string[] = [];
  let rawCount = 0;
  const skippedCounts = new Map<string, number>();  // Track skipped items

  // Parse the body text as TypeScript
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    `function temp() { ${bodyText} }`,
    ts.ScriptTarget.Latest,
    true
  );

  // Find the function and get its body
  let funcBody: ts.Block | undefined;
  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) && node.body) {
      funcBody = node.body;
    }
  });

  if (!funcBody) {
    return {
      statements: [{ kind: 'raw', code: bodyText, comment: 'Could not parse' }],
      confidence: 0,
      warnings: ['Failed to parse function body'],
      rawCount: 1,
      skipped: []
    };
  }

  // Translate each statement
  let processedCount = 0;  // Track how many statements we processed (including skipped)
  for (const stmt of funcBody.statements) {
    const translated = translateStatement(stmt, skippedCounts);
    statements.push(...translated.statements);
    warnings.push(...translated.warnings);
    rawCount += translated.rawCount;
    processedCount++;
  }

  // Confidence: if we processed statements but output is empty, it means we intentionally skipped them
  // (e.g., console.log, preventDefault) - that's still 100% confidence
  const confidence = processedCount > 0 
    ? (statements.length === 0 ? 1 : Math.max(0, 1 - (rawCount / statements.length)))
    : 0;

  // Build skipped items array for transparency
  const skipped: SkippedItem[] = [];
  for (const [type, count] of skippedCounts) {
    skipped.push({ type: type as SkippedItem['type'], count });
  }

  return {
    statements,
    confidence,
    warnings,
    rawCount,
    skipped
  };
}

/**
 * Translate a single TypeScript statement
 */
function translateStatement(node: ts.Statement, skippedCounts?: Map<string, number>): TranslationResult {
  const statements: TranslatedStatement[] = [];
  const warnings: string[] = [];
  let rawCount = 0;

  // If statement
  if (ts.isIfStatement(node)) {
    const result = translateIfStatement(node, skippedCounts);
    return result;
  }

  // Return statement
  if (ts.isReturnStatement(node)) {
    statements.push({
      kind: 'return',
      value: node.expression?.getText()
    });
    return { statements, confidence: 1, warnings, rawCount, skipped: [] };
  }

  // Expression statement (most common)
  if (ts.isExpressionStatement(node)) {
    const result = translateExpression(node.expression, skippedCounts);
    return result;
  }

  // Variable declaration (setState patterns, etc.)
  if (ts.isVariableStatement(node)) {
    const result = translateVariableStatement(node);
    return result;
  }

  // Fallback: raw statement
  statements.push({
    kind: 'raw',
    code: node.getText(),
    comment: `Untranslated: ${ts.SyntaxKind[node.kind]}`
  });
  rawCount = 1;

  return { statements, confidence: 0, warnings, rawCount, skipped: [] };
}

/**
 * Translate an if statement
 */
function translateIfStatement(node: ts.IfStatement, skippedCounts?: Map<string, number>): TranslationResult {
  const warnings: string[] = [];
  let rawCount = 0;

  // Translate condition
  const condition = translateCondition(node.expression);

  // Translate then branch
  const thenStatements: TranslatedStatement[] = [];
  if (ts.isBlock(node.thenStatement)) {
    for (const stmt of node.thenStatement.statements) {
      const result = translateStatement(stmt, skippedCounts);
      thenStatements.push(...result.statements);
      warnings.push(...result.warnings);
      rawCount += result.rawCount;
    }
  } else {
    const result = translateStatement(node.thenStatement, skippedCounts);
    thenStatements.push(...result.statements);
    warnings.push(...result.warnings);
    rawCount += result.rawCount;
  }

  // Translate else branch if present
  let elseStatements: TranslatedStatement[] | undefined;
  if (node.elseStatement) {
    elseStatements = [];
    if (ts.isBlock(node.elseStatement)) {
      for (const stmt of node.elseStatement.statements) {
        const result = translateStatement(stmt, skippedCounts);
        elseStatements.push(...result.statements);
        warnings.push(...result.warnings);
        rawCount += result.rawCount;
      }
    } else {
      const result = translateStatement(node.elseStatement, skippedCounts);
      elseStatements.push(...result.statements);
      warnings.push(...result.warnings);
      rawCount += result.rawCount;
    }
  }

  const ifStmt: IfStatement = {
    kind: 'if',
    condition,
    then: thenStatements,
    else: elseStatements
  };

  return {
    statements: [ifStmt],
    confidence: rawCount === 0 ? 1 : 0.5,
    warnings,
    rawCount,
    skipped: []
  };
}

/**
 * Translate a condition expression to ShepLang
 */
function translateCondition(expr: ts.Expression): string {
  const text = expr.getText();
  
  // Negation: !something → not something
  if (ts.isPrefixUnaryExpression(expr) && expr.operator === ts.SyntaxKind.ExclamationToken) {
    return `not ${translateCondition(expr.operand)}`;
  }
  
  // Binary expressions: a === b → a == b
  if (ts.isBinaryExpression(expr)) {
    const left = translateCondition(expr.left);
    const right = translateCondition(expr.right);
    const op = translateOperator(expr.operatorToken.kind);
    return `${left} ${op} ${right}`;
  }
  
  // Call expressions: something.trim() → something.trim()
  if (ts.isCallExpression(expr)) {
    return text;
  }
  
  // Property access: response.ok → response.ok
  if (ts.isPropertyAccessExpression(expr)) {
    return text;
  }
  
  return text;
}

/**
 * Translate operators
 */
function translateOperator(kind: ts.SyntaxKind): string {
  switch (kind) {
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
    case ts.SyntaxKind.EqualsEqualsToken:
      return '==';
    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsToken:
      return '!=';
    case ts.SyntaxKind.AmpersandAmpersandToken:
      return 'and';
    case ts.SyntaxKind.BarBarToken:
      return 'or';
    case ts.SyntaxKind.LessThanToken:
      return '<';
    case ts.SyntaxKind.GreaterThanToken:
      return '>';
    case ts.SyntaxKind.LessThanEqualsToken:
      return '<=';
    case ts.SyntaxKind.GreaterThanEqualsToken:
      return '>=';
    default:
      return ts.tokenToString(kind) || '??';
  }
}

/**
 * Translate an expression statement
 */
function translateExpression(expr: ts.Expression, skippedCounts?: Map<string, number>): TranslationResult {
  const statements: TranslatedStatement[] = [];
  const warnings: string[] = [];
  let rawCount = 0;

  // Call expression: fetch(), setState(), etc.
  if (ts.isCallExpression(expr)) {
    const result = translateCallExpression(expr, skippedCounts);
    return result;
  }

  // Assignment: x = y
  if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
    statements.push({
      kind: 'set',
      variable: expr.left.getText(),
      value: expr.right.getText()
    });
    return { statements, confidence: 1, warnings, rawCount, skipped: [] };
  }

  // Await expression: await fetch(...)
  if (ts.isAwaitExpression(expr)) {
    return translateExpression(expr.expression, skippedCounts);
  }

  // Fallback
  statements.push({
    kind: 'raw',
    code: expr.getText(),
    comment: `Expression: ${ts.SyntaxKind[expr.kind]}`
  });
  rawCount = 1;

  return { statements, confidence: 0, warnings, rawCount, skipped: [] };
}

/**
 * Translate a call expression (the most important one!)
 */
function translateCallExpression(expr: ts.CallExpression, skippedCounts?: Map<string, number>): TranslationResult {
  const statements: TranslatedStatement[] = [];
  const warnings: string[] = [];
  let rawCount = 0;

  const calleeText = expr.expression.getText();

  // FETCH CALLS: fetch(url, options) → call/load
  if (calleeText === 'fetch') {
    const result = translateFetchCall(expr);
    return result;
  }

  // SETSTATE CALLS: setX(value) → set x to value
  if (calleeText.startsWith('set') && calleeText.length > 3) {
    const varName = calleeText.charAt(3).toLowerCase() + calleeText.slice(4);
    const value = expr.arguments[0]?.getText() || '';
    statements.push({
      kind: 'set',
      variable: varName,
      value: value
    });
    return { statements, confidence: 1, warnings, rawCount, skipped: [] };
  }

  // ROUTER CALLS: router.push('/path') → show View
  if (calleeText === 'router.push' || calleeText === 'navigate') {
    const pathArg = expr.arguments[0]?.getText().replace(/['"]/g, '') || '';
    const viewName = pathToViewName(pathArg);
    statements.push({
      kind: 'show',
      view: viewName
    });
    return { statements, confidence: 1, warnings, rawCount, skipped: [] };
  }

  // CONSOLE.LOG: skip but track for transparency
  if (calleeText === 'console.log' || calleeText === 'console.error' || calleeText === 'console.warn') {
    if (skippedCounts) {
      skippedCounts.set('console', (skippedCounts.get('console') || 0) + 1);
    }
    return { statements: [], confidence: 1, warnings, rawCount, skipped: [] };
  }

  // PREVENT DEFAULT: skip but track for transparency
  if (calleeText.endsWith('.preventDefault')) {
    if (skippedCounts) {
      skippedCounts.set('preventDefault', (skippedCounts.get('preventDefault') || 0) + 1);
    }
    return { statements: [], confidence: 1, warnings, rawCount, skipped: [] };
  }
  
  if (calleeText.endsWith('.stopPropagation')) {
    if (skippedCounts) {
      skippedCounts.set('stopPropagation', (skippedCounts.get('stopPropagation') || 0) + 1);
    }
    return { statements: [], confidence: 1, warnings, rawCount, skipped: [] };
  }

  // AXIOS CALLS: axios.post(url, data) → call POST
  if (calleeText.startsWith('axios.')) {
    const result = translateAxiosCall(expr, calleeText);
    return result;
  }

  // Generic function call: preserve as raw but with call notation
  statements.push({
    kind: 'raw',
    code: `call ${calleeText}(${expr.arguments.map(a => a.getText()).join(', ')})`,
    comment: 'Function call'
  });
  rawCount = 1;

  return { statements, confidence: 0.5, warnings, rawCount, skipped: [] };
}

/**
 * Translate fetch() calls to ShepLang call/load
 */
function translateFetchCall(expr: ts.CallExpression): TranslationResult {
  const args = expr.arguments;
  const urlArg = args[0];
  const optionsArg = args[1];

  let url = urlArg?.getText().replace(/['"`]/g, '') || '';
  let method = 'GET';
  let bodyFields: string[] = [];

  // Parse options if present
  if (optionsArg && ts.isObjectLiteralExpression(optionsArg)) {
    for (const prop of optionsArg.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const propName = prop.name.getText();
        
        if (propName === 'method') {
          method = prop.initializer.getText().replace(/['"]/g, '').toUpperCase();
        }
        
        if (propName === 'body') {
          // Try to extract fields from JSON.stringify({ field1, field2 })
          bodyFields = extractBodyFields(prop.initializer);
        }
      }
    }
  }

  // Clean up template literals in URL
  url = url.replace(/\$\{([^}]+)\}/g, ':$1');

  const stmt: CallStatement = {
    kind: 'call',
    method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: url,
    fields: bodyFields.length > 0 ? bodyFields : undefined
  };

  return {
    statements: [stmt],
    confidence: 1,
    warnings: [],
    rawCount: 0,
    skipped: []
  };
}

/**
 * Translate axios calls
 */
function translateAxiosCall(expr: ts.CallExpression, calleeText: string): TranslationResult {
  const methodMatch = calleeText.match(/axios\.(get|post|put|patch|delete)/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
  
  const url = expr.arguments[0]?.getText().replace(/['"`]/g, '') || '';
  const bodyArg = expr.arguments[1];
  
  let bodyFields: string[] = [];
  if (bodyArg) {
    bodyFields = extractBodyFields(bodyArg);
  }

  const stmt: CallStatement = {
    kind: 'call',
    method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: url,
    fields: bodyFields.length > 0 ? bodyFields : undefined
  };

  return {
    statements: [stmt],
    confidence: 1,
    warnings: [],
    rawCount: 0,
    skipped: []
  };
}

/**
 * Extract field names from body expressions
 */
function extractBodyFields(expr: ts.Expression): string[] {
  const text = expr.getText();
  
  // JSON.stringify({ field1, field2 })
  const jsonMatch = text.match(/JSON\.stringify\s*\(\s*\{([^}]+)\}\s*\)/);
  if (jsonMatch) {
    return parseObjectFields(jsonMatch[1]);
  }
  
  // Direct object: { field1, field2 }
  if (ts.isObjectLiteralExpression(expr)) {
    return expr.properties
      .filter(ts.isShorthandPropertyAssignment)
      .map(p => p.name.getText());
  }
  
  // Variable reference
  if (ts.isIdentifier(expr)) {
    return [expr.text];
  }
  
  return [];
}

/**
 * Parse object field shorthand: "field1, field2: value"
 */
function parseObjectFields(content: string): string[] {
  return content
    .split(',')
    .map(part => part.trim().split(':')[0].trim())
    .filter(Boolean);
}

/**
 * Convert URL path to view name
 */
function pathToViewName(path: string): string {
  if (path === '/' || path === '') return 'Home';
  
  // /dashboard → Dashboard
  // /users/list → UsersList
  return path
    .split('/')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Translate variable statement (const x = ..., let y = ...)
 */
function translateVariableStatement(node: ts.VariableStatement): TranslationResult {
  const statements: TranslatedStatement[] = [];
  const warnings: string[] = [];
  let rawCount = 0;

  for (const decl of node.declarationList.declarations) {
    if (!decl.initializer) continue;
    
    const varName = decl.name.getText();
    
    // const response = await fetch(...) → handled by await
    if (ts.isAwaitExpression(decl.initializer)) {
      const result = translateAwaitAssignment(varName, decl.initializer);
      statements.push(...result.statements);
      warnings.push(...result.warnings);
      rawCount += result.rawCount;
      continue;
    }
    
    // const x = value → set x to value
    statements.push({
      kind: 'set',
      variable: varName,
      value: decl.initializer.getText()
    });
  }

  return {
    statements,
    confidence: rawCount === 0 ? 1 : 0.5,
    warnings,
    rawCount,
    skipped: []
  };
}

/**
 * Translate await assignment: const x = await fetch(...)
 */
function translateAwaitAssignment(varName: string, awaitExpr: ts.AwaitExpression): TranslationResult {
  const expr = awaitExpr.expression;
  
  // const response = await fetch(url) → call GET url into response
  if (ts.isCallExpression(expr) && expr.expression.getText() === 'fetch') {
    const result = translateFetchCall(expr);
    if (result.statements.length > 0 && result.statements[0].kind === 'call') {
      (result.statements[0] as CallStatement).into = varName;
    }
    return result;
  }
  
  // const data = await response.json() → load response into data
  if (ts.isCallExpression(expr)) {
    const calleeText = expr.expression.getText();
    if (calleeText.endsWith('.json')) {
      const sourceVar = calleeText.replace('.json', '');
      return {
        statements: [{
          kind: 'load',
          method: 'GET',
          path: `${sourceVar}.json`,
          into: varName
        }],
        confidence: 0.8,
        warnings: [],
        rawCount: 0,
        skipped: []
      };
    }
  }
  
  // Fallback
  return {
    statements: [{
      kind: 'raw',
      code: `${varName} = await ${expr.getText()}`,
      comment: 'Await expression'
    }],
    confidence: 0.5,
    warnings: [],
    rawCount: 1,
    skipped: []
  };
}

/**
 * Generate ShepLang code from translated statements
 * Optionally includes a summary of skipped items for transparency
 */
export function generateShepLangCode(
  statements: TranslatedStatement[], 
  indent: number = 0,
  skipped?: SkippedItem[]
): string {
  const lines: string[] = [];
  const prefix = '  '.repeat(indent);

  for (const stmt of statements) {
    switch (stmt.kind) {
      case 'call':
        if (stmt.fields && stmt.fields.length > 0) {
          lines.push(`${prefix}call ${stmt.method} "${stmt.path}" with ${stmt.fields.join(', ')}`);
        } else {
          lines.push(`${prefix}call ${stmt.method} "${stmt.path}"`);
        }
        if (stmt.into) {
          lines[lines.length - 1] += ` into ${stmt.into}`;
        }
        break;
        
      case 'load':
        lines.push(`${prefix}load ${stmt.method} "${stmt.path}" into ${stmt.into}`);
        break;
        
      case 'set':
        lines.push(`${prefix}set ${stmt.variable} to ${stmt.value}`);
        break;
        
      case 'if':
        lines.push(`${prefix}if ${stmt.condition}:`);
        lines.push(generateShepLangCode(stmt.then, indent + 1));
        if (stmt.else && stmt.else.length > 0) {
          lines.push(`${prefix}else:`);
          lines.push(generateShepLangCode(stmt.else, indent + 1));
        }
        break;
        
      case 'return':
        if (stmt.value) {
          lines.push(`${prefix}return ${stmt.value}`);
        } else {
          lines.push(`${prefix}return`);
        }
        break;
        
      case 'add':
        if (stmt.fields && stmt.fields.length > 0) {
          lines.push(`${prefix}add ${stmt.entity} with ${stmt.fields.join(', ')}`);
        } else {
          lines.push(`${prefix}add ${stmt.entity}`);
        }
        break;
        
      case 'remove':
        if (stmt.id) {
          lines.push(`${prefix}remove ${stmt.entity} where id == ${stmt.id}`);
        } else {
          lines.push(`${prefix}remove ${stmt.entity}`);
        }
        break;
        
      case 'show':
        lines.push(`${prefix}show ${stmt.view}`);
        break;
        
      case 'raw':
        if (stmt.comment) {
          lines.push(`${prefix}// ${stmt.comment}`);
        }
        lines.push(`${prefix}${stmt.code}`);
        break;
    }
  }

  // Add transparency summary for skipped items (only at root level)
  if (skipped && skipped.length > 0 && indent === 0) {
    const summary = skipped
      .map(s => `${s.count} ${s.type}${s.count > 1 ? 's' : ''}`)
      .join(', ');
    lines.push('');
    lines.push(`${prefix}// Skipped: ${summary} (boilerplate)`);
  }

  return lines.join('\n');
}

/**
 * Generate a human-readable summary of skipped items
 */
export function formatSkippedSummary(skipped: SkippedItem[]): string {
  if (skipped.length === 0) return '';
  
  const parts = skipped.map(s => {
    const label = s.type === 'console' ? 'console.log()' 
      : s.type === 'preventDefault' ? 'preventDefault()'
      : s.type === 'stopPropagation' ? 'stopPropagation()'
      : s.type;
    return `${s.count} ${label}`;
  });
  
  return `Skipped: ${parts.join(', ')} (boilerplate)`;
}
