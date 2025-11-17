/**
 * Error Analysis Service
 * 
 * Converts raw transpiler errors into rich, actionable ErrorSuggestions
 * with auto-fixes, examples, and did-you-mean suggestions.
 * 
 * Phase: Error Handling Enhancement
 */

import { ErrorSuggestion, AutoFix, CodeExample, TextEdit } from '../errors/SmartErrorRecovery';

// Common ShepLang/ShepThon keywords for typo detection
const SHEPLANG_KEYWORDS = [
  'app', 'component', 'model', 'endpoint', 'job', 'let', 'return', 
  'if', 'else', 'for', 'in', 'end', 'true', 'false', 'not',
  'GET', 'POST', 'PUT', 'DELETE', 'db', 'log', 'now'
];

const SHEPTHON_KEYWORDS = [
  'app', 'model', 'endpoint', 'job', 'let', 'return', 'if', 'else', 
  'for', 'in', 'error', 'db', 'log', 'now', 'GET', 'POST', 'PUT', 'DELETE',
  'id', 'string', 'int', 'float', 'bool', 'datetime', 'every'
];

/**
 * Calculate Levenshtein distance between two strings
 */
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
 * Find similar keywords for "did you mean" suggestions
 */
function findSimilarKeywords(word: string, keywords: string[]): string[] {
  const suggestions = keywords
    .map(keyword => ({
      keyword,
      distance: levenshteinDistance(word.toLowerCase(), keyword.toLowerCase())
    }))
    .filter(({ distance }) => distance <= 2) // Only suggest if distance <= 2
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3) // Top 3 suggestions
    .map(({ keyword }) => keyword);

  return suggestions;
}

/**
 * Extract line and column from error message if present
 */
function extractPosition(errorMessage: string): { line: number; column: number } | null {
  // Try patterns like "at line 5, column 10" or "line 5:10"
  const patterns = [
    /line (\d+)[,:]?\s*column (\d+)/i,
    /line (\d+):(\d+)/i,
    /\((\d+),(\d+)\)/
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match) {
      return {
        line: parseInt(match[1], 10),
        column: parseInt(match[2], 10)
      };
    }
  }

  return null;
}

/**
 * Generate code examples based on error type
 */
function getExamplesForError(errorType: string, keyword?: string): CodeExample[] {
  const examples: Record<string, CodeExample[]> = {
    'component': [
      {
        title: 'Basic Component',
        description: 'A simple ShepLang component',
        code: 'component App {\n  "Hello, World!"\nend'
      }
    ],
    'endpoint': [
      {
        title: 'GET endpoint',
        description: 'Fetch data from your backend',
        code: 'endpoint GET "/items" -> [Item] {\n  return db.Item.findAll()\nend'
      },
      {
        title: 'POST endpoint',
        description: 'Create new data',
        code: 'endpoint POST "/items" {\n  let item = db.Item.create(data)\n  return item\nend'
      }
    ],
    'model': [
      {
        title: 'Model Definition',
        description: 'Define your data structure',
        code: 'model User {\n  id: id\n  name: string\n  email: string\n  createdAt: datetime\n}'
      }
    ],
    'missing_end': [
      {
        title: 'Complete block',
        description: 'Always close blocks with "end"',
        code: 'component App {\n  "Content"\nend  // <- Don\'t forget this!'
      }
    ]
  };

  if (keyword && examples[keyword]) {
    return examples[keyword];
  }

  return examples[errorType] || [];
}

/**
 * Analyze error and generate rich suggestion
 */
export function analyzeError(
  errorMessage: string,
  source: string,
  isShepThon: boolean = false
): ErrorSuggestion {
  const keywords = isShepThon ? SHEPTHON_KEYWORDS : SHEPLANG_KEYWORDS;
  
  // Extract position
  const position = extractPosition(errorMessage);
  const line = position?.line || 1;
  const column = position?.column || 1;

  // Check for unknown keyword/typo
  const unknownKeywordMatch = errorMessage.match(/unknown keyword ['"](.+?)['"]/i) ||
                              errorMessage.match(/unexpected token ['"](.+?)['"]/i);
  
  if (unknownKeywordMatch) {
    const word = unknownKeywordMatch[1];
    const didYouMean = findSimilarKeywords(word, keywords);
    
    if (didYouMean.length > 0) {
      const suggestion = didYouMean[0];
      
      return {
        severity: 'error',
        message: `Unknown keyword '${word}'`,
        line,
        column,
        endColumn: column + word.length,
        didYouMean,
        autoFix: {
          title: `Replace with '${suggestion}'`,
          description: `Change '${word}' to '${suggestion}'`,
          changes: [{
            range: {
              startLine: line,
              startColumn: column,
              endLine: line,
              endColumn: column + word.length
            },
            newText: suggestion
          }]
        },
        examples: getExamplesForError('', suggestion),
        errorType: 'typo',
        confidence: 0.95
      };
    }
  }

  // Check for missing 'end' keyword
  if (errorMessage.match(/missing ['"]end['"]/i) || errorMessage.match(/expected end/i)) {
    return {
      severity: 'error',
      message: "Missing 'end' keyword",
      line,
      column: 1,
      autoFix: {
        title: "Add 'end' keyword",
        description: 'Blocks must be closed with "end"',
        changes: [{
          range: {
            startLine: line,
            startColumn: 1,
            endLine: line,
            endColumn: 1
          },
          newText: 'end\n'
        }]
      },
      examples: getExamplesForError('missing_end'),
      errorType: 'missing_token',
      confidence: 0.9
    };
  }

  // Check for syntax errors
  if (errorMessage.match(/syntax error/i)) {
    return {
      severity: 'error',
      message: 'Syntax error detected',
      line,
      column,
      examples: [
        {
          title: 'Common Syntax',
          description: 'Check your code structure',
          code: isShepThon 
            ? 'app MyApp {\n  model Item {\n    id: id\n    name: string\n  }\nend'
            : 'component App {\n  "Hello"\nend'
        }
      ],
      learnMore: isShepThon 
        ? 'https://sheplang.dev/docs/shepthon'
        : 'https://sheplang.dev/docs/sheplang',
      errorType: 'syntax',
      confidence: 0.7
    };
  }

  // Generic error fallback
  return {
    severity: 'error',
    message: errorMessage || 'An error occurred',
    line,
    column,
    errorType: 'unknown',
    confidence: 0.5
  };
}

/**
 * Analyze multiple errors from transpilation
 */
export function analyzeTranspilerErrors(
  error: string,
  source: string,
  isShepThon: boolean = false
): ErrorSuggestion[] {
  // For now, treat as single error
  // In the future, could parse multiple errors from error message
  return [analyzeError(error, source, isShepThon)];
}
