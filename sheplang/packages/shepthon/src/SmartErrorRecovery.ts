/**
 * Smart Error Recovery for ShepThon Parser
 * 
 * Provides intelligent error analysis, suggestions, and recovery
 * at the parser level. Enhances diagnostics with:
 * - Did-you-mean suggestions
 * - Context-aware error messages
 * - Auto-fix recommendations
 * 
 * Phase: Parser Enhancement
 */

import type { Diagnostic } from './types.js';
import type { Token } from './lexer.js';

/**
 * Parse error with additional context for analysis
 */
export interface ParseError extends Diagnostic {
  token?: Token;
  context?: string; // Line of code where error occurred
  expectedTokens?: string[]; // What tokens were expected
}

/**
 * Enhanced error suggestion with recovery information
 */
export interface ErrorSuggestion extends Diagnostic {
  didYouMean?: string[];
  autoFix?: {
    title: string;
    description: string;
    replacement?: string;
  };
  examples?: Array<{
    title: string;
    code: string;
  }>;
  confidence: number; // 0.0 to 1.0
}

/**
 * ShepThon/ShepLang Keywords
 */
const SHEPTHON_KEYWORDS = [
  'app', 'model', 'endpoint', 'job', 'let', 'return', 'if', 'else', 
  'for', 'in', 'not', 'and', 'or', 'error', 'true', 'false',
  'GET', 'POST', 'PUT', 'DELETE',
  'id', 'string', 'int', 'float', 'bool', 'datetime', 'json',
  'every', 'minutes', 'hours', 'days',
  'db', 'log', 'now'
];

/**
 * Calculate Levenshtein distance for typo detection
 */
function levenshtein(a: string, b: string): number {
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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find similar keywords for suggestions
 */
function findSimilarKeywords(word: string, keywords: string[] = SHEPTHON_KEYWORDS): string[] {
  return keywords
    .map(kw => ({ keyword: kw, distance: levenshtein(word.toLowerCase(), kw.toLowerCase()) }))
    .filter(({ distance }) => distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({ keyword }) => keyword);
}

/**
 * Smart Error Recovery service for parsers
 */
export class SmartErrorRecovery {
  private language: 'sheplang' | 'shepthon';

  constructor(language: 'sheplang' | 'shepthon' = 'shepthon') {
    this.language = language;
  }

  /**
   * Analyze a parse error and generate enhanced suggestion
   */
  analyze(error: ParseError): ErrorSuggestion {
    const message = error.message;

    // Check for unknown keyword/typo
    if (message.includes('Unexpected token') || message.includes('Invalid')) {
      const word = error.token?.value || this.extractWordFromMessage(message);
      if (word) {
        return this.handleUnknownKeyword(error, word);
      }
    }

    // Check for expected token errors
    if (message.includes('Expected')) {
      return this.handleExpectedToken(error);
    }

    // Check for missing end/bracket errors
    if (message.includes('missing') || message.includes('unclosed')) {
      return this.handleMissingToken(error);
    }

    // Generic error fallback
    return {
      ...error,
      confidence: 0.5
    };
  }

  /**
   * Handle unknown keyword with did-you-mean suggestions
   */
  private handleUnknownKeyword(error: ParseError, word: string): ErrorSuggestion {
    const similar = findSimilarKeywords(word);
    
    if (similar.length > 0) {
      const suggestion = similar[0];
      return {
        ...error,
        message: `Unknown keyword '${word}'`,
        didYouMean: similar,
        autoFix: {
          title: `Replace with '${suggestion}'`,
          description: `Change '${word}' to '${suggestion}'`,
          replacement: suggestion
        },
        examples: this.getExamplesForKeyword(suggestion),
        confidence: 0.95
      };
    }

    return {
      ...error,
      message: `Unknown token '${word}'`,
      confidence: 0.6
    };
  }

  /**
   * Handle expected token errors
   */
  private handleExpectedToken(error: ParseError): ErrorSuggestion {
    const message = error.message;

    // Extract what was expected
    const expectedMatch = message.match(/Expected (.+)/i);
    const expected = expectedMatch ? expectedMatch[1] : 'valid syntax';

    return {
      ...error,
      message: `Expected ${expected}`,
      examples: this.getExamplesForExpected(expected),
      confidence: 0.8
    };
  }

  /**
   * Handle missing token errors
   */
  private handleMissingToken(error: ParseError): ErrorSuggestion {
    return {
      ...error,
      autoFix: {
        title: 'Add missing token',
        description: 'Complete the syntax structure'
      },
      confidence: 0.85
    };
  }

  /**
   * Extract word from error message
   */
  private extractWordFromMessage(message: string): string | null {
    const match = message.match(/['"](.+?)['"]/);
    return match ? match[1] : null;
  }

  /**
   * Get code examples for a keyword
   */
  private getExamplesForKeyword(keyword: string): Array<{ title: string; code: string }> {
    const examples: Record<string, Array<{ title: string; code: string }>> = {
      endpoint: [
        {
          title: 'GET endpoint',
          code: 'endpoint GET "/items" -> [Item] {\n  return db.Item.findAll()\n}'
        },
        {
          title: 'POST endpoint',
          code: 'endpoint POST "/items" {\n  let item = db.Item.create(data)\n  return item\n}'
        }
      ],
      model: [
        {
          title: 'Model definition',
          code: 'model User {\n  id: id\n  name: string\n  email: string\n}'
        }
      ],
      job: [
        {
          title: 'Scheduled job',
          code: 'job "cleanup" every 1 hours {\n  log.info("Running cleanup")\n}'
        }
      ]
    };

    return examples[keyword] || [];
  }

  /**
   * Get examples for expected token
   */
  private getExamplesForExpected(expected: string): Array<{ title: string; code: string }> {
    if (expected.includes('app')) {
      return [{
        title: 'App structure',
        code: 'app MyApp {\n  model Item {\n    id: id\n    name: string\n  }\n}'
      }];
    }

    if (expected.includes('method') || expected.includes('GET') || expected.includes('POST')) {
      return [{
        title: 'HTTP methods',
        code: 'endpoint GET "/users" -> [User] {\n  return db.User.findAll()\n}'
      }];
    }

    return [];
  }
}

/**
 * Create enhanced diagnostic from error and suggestion
 */
export function createEnhancedDiagnostic(
  error: ParseError,
  suggestion: ErrorSuggestion
): Diagnostic {
  let message = suggestion.message;

  // Add did-you-mean hint to message
  if (suggestion.didYouMean && suggestion.didYouMean.length > 0) {
    message += `. Did you mean: ${suggestion.didYouMean.join(', ')}?`;
  }

  // Add auto-fix hint
  if (suggestion.autoFix) {
    message += ` (${suggestion.autoFix.title})`;
  }

  return {
    severity: suggestion.severity,
    message,
    line: suggestion.line,
    column: suggestion.column
  };
}
