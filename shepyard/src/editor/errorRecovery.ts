/**
 * Smart Error Recovery Engine
 * 
 * Transforms cryptic parser errors into founder-friendly suggestions
 * with auto-fixes and contextual examples.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ParseError {
  message: string;
  line: number;
  column: number;
  token?: string;
  expected?: string[];
  context?: string; // The line of code where error occurred
}

export interface ErrorSuggestion {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  endColumn?: number;
  
  // Suggestions
  didYouMean?: string[];
  autoFix?: AutoFix;
  examples?: CodeExample[];
  learnMore?: string;
  
  // Metadata
  errorType: ErrorType;
  confidence: number; // 0-1, how confident we are in the suggestion
}

export interface AutoFix {
  title: string;
  description: string;
  changes: CodeChange[];
}

export interface CodeChange {
  line: number;
  startColumn: number;
  endColumn: number;
  newText: string;
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
}

export type ErrorType = 
  | 'typo'
  | 'missing_token'
  | 'unexpected_token'
  | 'syntax_error'
  | 'semantic_error'
  | 'unknown';

// ============================================================================
// KEYWORD DICTIONARIES
// ============================================================================

const SHEPLANG_KEYWORDS = [
  'app', 'data', 'view', 'action', 'fields', 'rules',
  'list', 'button', 'show', 'add', 'update', 'delete',
  'load', 'call', 'where', 'if', 'else', 'for', 'in',
  'found', 'with', 'set', 'into', 'GET', 'POST', 'PUT', 'DELETE',
  'text', 'number', 'datetime', 'date', 'yes/no', 'id',
];

const SHEPTHON_KEYWORDS = [
  'app', 'model', 'endpoint', 'job', 'every',
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH',
  'string', 'number', 'bool', 'datetime', 'id',
  'let', 'for', 'in', 'if', 'else', 'return',
  'db', 'find', 'findAll', 'create', 'update', 'delete',
  'minutes', 'hours', 'days', 'weeks',
];

const COMMON_TYPOS: Record<string, string[]> = {
  'endpoint': ['endpoit', 'enpoint', 'endponit', 'edpoint'],
  'action': ['actoin', 'acton', 'acion'],
  'return': ['retrun', 'retrn', 'retur'],
  'model': ['modle', 'modl', 'mdoel'],
  'string': ['strin', 'strng', 'stirng'],
  'number': ['nubmer', 'numbr', 'numbre'],
  'datetime': ['datetiem', 'dattime', 'datetme'],
  'button': ['buton', 'buttn', 'buttom'],
  'update': ['updte', 'updaet', 'udpate'],
};

// ============================================================================
// LEVENSHTEIN DISTANCE (for typo detection)
// ============================================================================

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================================================
// CORE ERROR RECOVERY CLASS
// ============================================================================

export class SmartErrorRecovery {
  private language: 'sheplang' | 'shepthon';
  private keywords: string[];

  constructor(language: 'sheplang' | 'shepthon' = 'sheplang') {
    this.language = language;
    this.keywords = language === 'sheplang' ? SHEPLANG_KEYWORDS : SHEPTHON_KEYWORDS;
  }

  /**
   * Main entry point: converts a raw ParseError into actionable ErrorSuggestion
   */
  analyze(error: ParseError): ErrorSuggestion {
    const token = error.token?.toLowerCase() || '';
    
    // Try typo detection first
    const typoSuggestion = this.detectTypo(token, error);
    if (typoSuggestion) {
      return typoSuggestion;
    }

    // Try missing token detection
    const missingTokenSuggestion = this.detectMissingToken(error);
    if (missingTokenSuggestion) {
      return missingTokenSuggestion;
    }

    // Try unexpected token
    const unexpectedSuggestion = this.detectUnexpectedToken(error);
    if (unexpectedSuggestion) {
      return unexpectedSuggestion;
    }

    // Fallback: generic error
    return this.createGenericSuggestion(error);
  }

  /**
   * Detect if token is a typo of a known keyword
   */
  private detectTypo(token: string, error: ParseError): ErrorSuggestion | null {
    if (!token || token.length < 2) return null;

    // Check common typos first (faster)
    for (const [correct, typos] of Object.entries(COMMON_TYPOS)) {
      if (typos.includes(token)) {
        return this.createTypoSuggestion(error, token, correct, 0.95);
      }
    }

    // Check Levenshtein distance for all keywords
    const suggestions: Array<{ keyword: string; distance: number }> = [];
    
    for (const keyword of this.keywords) {
      const distance = levenshteinDistance(token, keyword);
      const threshold = Math.max(2, Math.floor(keyword.length * 0.3));
      
      if (distance <= threshold) {
        suggestions.push({ keyword, distance });
      }
    }

    if (suggestions.length === 0) return null;

    // Sort by distance (closest first)
    suggestions.sort((a, b) => a.distance - b.distance);
    
    const bestMatch = suggestions[0];
    const confidence = 1 - (bestMatch.distance / bestMatch.keyword.length);

    return this.createTypoSuggestion(
      error,
      token,
      bestMatch.keyword,
      confidence,
      suggestions.slice(1, 3).map(s => s.keyword)
    );
  }

  /**
   * Create a typo-specific error suggestion
   */
  private createTypoSuggestion(
    error: ParseError,
    wrongToken: string,
    correctToken: string,
    confidence: number,
    alternatives: string[] = []
  ): ErrorSuggestion {
    const didYouMean = [correctToken, ...alternatives];
    
    return {
      severity: 'error',
      message: `Unknown keyword '${wrongToken}'`,
      line: error.line,
      column: error.column,
      endColumn: error.column + wrongToken.length,
      didYouMean,
      autoFix: {
        title: `Replace with '${correctToken}'`,
        description: `Change '${wrongToken}' to '${correctToken}'`,
        changes: [{
          line: error.line,
          startColumn: error.column,
          endColumn: error.column + wrongToken.length,
          newText: correctToken,
        }],
      },
      examples: this.getExamplesForKeyword(correctToken),
      learnMore: this.getLearnMoreLink(correctToken),
      errorType: 'typo',
      confidence,
    };
  }

  /**
   * Detect missing tokens (e.g., missing closing brace)
   */
  private detectMissingToken(error: ParseError): ErrorSuggestion | null {
    if (!error.expected || error.expected.length === 0) return null;

    const expected = error.expected[0];
    
    // Common missing token patterns
    const missingPatterns: Record<string, AutoFix> = {
      ':': {
        title: 'Add colon',
        description: 'Field definitions need a colon',
        changes: [{
          line: error.line,
          startColumn: error.column,
          endColumn: error.column,
          newText: ':',
        }],
      },
    };

    const fix = missingPatterns[expected];
    if (!fix) return null;

    return {
      severity: 'error',
      message: `Missing ${expected}`,
      line: error.line,
      column: error.column,
      autoFix: fix,
      examples: this.getExamplesForMissingToken(expected),
      errorType: 'missing_token',
      confidence: 0.8,
    };
  }

  /**
   * Detect unexpected tokens
   */
  private detectUnexpectedToken(error: ParseError): ErrorSuggestion | null {
    if (!error.token) return null;

    return {
      severity: 'error',
      message: `Unexpected '${error.token}'`,
      line: error.line,
      column: error.column,
      endColumn: error.column + error.token.length,
      examples: this.getContextualExamples(error),
      learnMore: 'Check the syntax guide for correct usage',
      errorType: 'unexpected_token',
      confidence: 0.6,
    };
  }

  /**
   * Generic fallback suggestion
   */
  private createGenericSuggestion(error: ParseError): ErrorSuggestion {
    return {
      severity: 'error',
      message: error.message || 'Syntax error',
      line: error.line,
      column: error.column,
      examples: [
        {
          title: 'Basic structure',
          description: this.language === 'sheplang' 
            ? 'ShepLang apps have this structure'
            : 'ShepThon apps have this structure',
          code: this.language === 'sheplang'
            ? 'app MyApp\n\nview Home:\n  show "Hello World"'
            : 'app MyApp {\n  model Item {\n    id: id\n    name: string\n  }\n}',
        },
      ],
      errorType: 'syntax_error',
      confidence: 0.3,
    };
  }

  /**
   * Get examples for a specific keyword
   */
  private getExamplesForKeyword(keyword: string): CodeExample[] {
    const examples: Record<string, CodeExample[]> = {
      action: [{
        title: 'Simple action',
        description: 'An action that gets triggered',
        code: 'action AddTask(title):\n  add Todo with title\n  show Dashboard',
      }],
      endpoint: [{
        title: 'GET endpoint',
        description: 'Fetch data from your backend',
        code: 'endpoint GET "/items" -> [Item] {\n  return db.Item.findAll()\n}',
      }],
      model: [{
        title: 'Basic model',
        description: 'Define your data structure',
        code: 'model User {\n  id: id\n  name: string\n  email: string\n}',
      }],
      data: [{
        title: 'Data definition',
        description: 'Define your data structure',
        code: 'data Todo:\n  fields:\n    title: text\n    done: yes/no',
      }],
      view: [{
        title: 'Simple view',
        description: 'Create a screen in your app',
        code: 'view Dashboard:\n  list Todo\n  button "Add Task" -> CreateTodo',
      }],
      job: [{
        title: 'Scheduled job',
        description: 'Run tasks in the background',
        code: 'job "cleanup" every 1 hour {\n  // your code here\n}',
      }],
    };

    return examples[keyword] || [];
  }

  /**
   * Get examples for missing tokens
   */
  private getExamplesForMissingToken(token: string): CodeExample[] {
    if (token === ':') {
      return [{
        title: 'Field syntax',
        description: 'Fields need a colon and type',
        code: 'fields:\n  title: text\n  done: yes/no',
      }];
    }

    return [];
  }

  /**
   * Get contextual examples based on error location
   */
  private getContextualExamples(error: ParseError): CodeExample[] {
    return [{
      title: 'Common syntax',
      description: 'Check if your code matches these patterns',
      code: this.language === 'sheplang'
        ? 'app Name\n\ndata Item:\n  fields:\n    name: text\n\nview Home:\n  list Item'
        : 'app Name {\n  model Item {\n    id: id\n    name: string\n  }\n}',
    }];
  }

  /**
   * Get documentation link for a keyword
   */
  private getLearnMoreLink(keyword: string): string {
    const baseUrl = this.language === 'sheplang' 
      ? 'https://sheplang.dev/docs/sheplang'
      : 'https://sheplang.dev/docs/shepthon';
    
    return `${baseUrl}/${keyword}`;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Batch analyze multiple errors and prioritize them
 */
export function analyzeErrors(
  errors: ParseError[],
  language: 'sheplang' | 'shepthon' = 'sheplang'
): ErrorSuggestion[] {
  const recovery = new SmartErrorRecovery(language);
  
  return errors
    .map(error => recovery.analyze(error))
    .sort((a, b) => {
      // Prioritize by confidence, then by line number
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      return a.line - b.line;
    });
}

/**
 * Check if an auto-fix is safe to apply automatically
 */
export function isSafeAutoFix(suggestion: ErrorSuggestion): boolean {
  // Only auto-apply fixes with high confidence
  if (suggestion.confidence < 0.85) return false;
  
  // Only auto-apply typo fixes
  if (suggestion.errorType !== 'typo') return false;
  
  // Only if there's exactly one suggestion
  if (!suggestion.didYouMean || suggestion.didYouMean.length > 1) return false;
  
  return true;
}

/**
 * Apply an auto-fix to source code
 */
export function applyAutoFix(
  sourceCode: string,
  autoFix: AutoFix
): string {
  const lines = sourceCode.split('\n');
  
  // Sort changes by line (descending) to avoid offset issues
  const sortedChanges = [...autoFix.changes].sort((a, b) => b.line - a.line);
  
  for (const change of sortedChanges) {
    const lineIndex = change.line - 1; // Convert to 0-based
    if (lineIndex < 0 || lineIndex >= lines.length) continue;
    
    const line = lines[lineIndex];
    const before = line.substring(0, change.startColumn - 1);
    const after = line.substring(change.endColumn - 1);
    
    lines[lineIndex] = before + change.newText + after;
  }
  
  return lines.join('\n');
}

export default SmartErrorRecovery;
