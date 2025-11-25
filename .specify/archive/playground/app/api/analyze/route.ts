import { NextRequest, NextResponse } from 'next/server';

/**
 * ShepLang Code Analysis API Endpoint
 * 
 * Analyzes ShepLang code and returns diagnostics
 * POST /api/analyze
 * 
 * Request body:
 * {
 *   code: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   diagnostics: Array<{
 *     severity: 'error' | 'warning' | 'info'
 *     message: string
 *     line: number
 *     column: number
 *   }>
 *   parseTime: number
 * }
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const { code } = body;
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request: code is required and must be a string' 
        },
        { status: 400 }
      );
    }
    
    // TODO: Integrate with @goldensheepai/sheplang-language package
    // For now, return a simple validation based on basic checks
    const diagnostics = analyzeCodeSimple(code);
    
    const parseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      diagnostics,
      parseTime,
      metadata: {
        codeLength: code.length,
        lines: code.split('\n').length
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Analysis error:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze code',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

/**
 * Comprehensive code analysis following industry standards
 * Industry Standard: Report ALL errors found (no limits)
 * Reference: Monaco Editor, LSP, TypeScript, CodeSandbox, StackBlitz, Replit
 */
function analyzeCodeSimple(code: string): Array<{
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}> {
  const diagnostics: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
  }> = [];
  
  const lines = code.split('\n');
  
  // Check for app declaration (required in ShepLang)
  const hasAppDeclaration = /^\s*app\s+\w+/m.test(code);
  if (!hasAppDeclaration) {
    diagnostics.push({
      severity: 'error',
      message: 'ShepLang files must start with an app declaration (e.g., "app MyApp")',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 1
    });
  }
  
  // Valid ShepLang keywords and their expected patterns
  const keywords = ['app', 'data', 'view', 'action', 'fields', 'button', 'text', 'list', 'input', 'add', 'show', 'call', 'load', 'with'];
  const topLevelKeywords = ['app', 'data', 'view', 'action'];
  const statementKeywords = ['button', 'text', 'list', 'input', 'add', 'show', 'call', 'load'];
  
  // Track indentation context for better error detection
  let inDeclarationBlock = false;
  let currentBlockType = '';
  
  // Check each line comprehensively - NO LIMITS on error reporting
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    const indent = line.length - line.trimLeft().length;
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//')) {
      return;
    }
    
    // Track block context
    if (/^\s*(data|view|action)\s+\w+:/i.test(trimmed)) {
      inDeclarationBlock = true;
      const match = trimmed.match(/^\s*(data|view|action)/i);
      currentBlockType = match ? match[1].toLowerCase() : '';
    } else if (indent === 0 && trimmed && !trimmed.startsWith('app')) {
      inDeclarationBlock = false;
      currentBlockType = '';
    }
    
    // Track if we found specific errors to avoid duplicates
    let errorFound = { capitalization: false, misspelling: false, missingColon: false };
    
    // 1. Check for capitalized keywords (common mistake)
    const capitalizedKeywordMatch = trimmed.match(/^\s*([A-Z][a-z]+)/);
    if (capitalizedKeywordMatch) {
      const capitalizedWord = capitalizedKeywordMatch[1];
      const lowercaseWord = capitalizedWord.toLowerCase();
      
      // Check if lowercase version is a valid keyword
      if (keywords.includes(lowercaseWord)) {
        diagnostics.push({
          severity: 'error',
          message: `Keywords must be lowercase. Use "${lowercaseWord}" instead of "${capitalizedWord}"`,
          line: lineNum,
          column: 1,
          endLine: lineNum,
          endColumn: capitalizedWord.length + 1
        });
        errorFound.capitalization = true;
      }
    }
    
    // 2. Check for unclosed strings
    const quoteCount = (line.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      diagnostics.push({
        severity: 'error',
        message: 'Unclosed string literal',
        line: lineNum,
        column: line.indexOf('"') + 1,
        endLine: lineNum,
        endColumn: line.length
      });
    }
    
    // 3. Check for incomplete keyword declarations (keyword alone on a line)
    if (/^\s*(data|view|action)\s*$/i.test(trimmed)) {
      const keyword = trimmed.toLowerCase();
      diagnostics.push({
        severity: 'error',
        message: `${keyword} declaration must be followed by a name`,
        line: lineNum,
        column: 1,
        endLine: lineNum,
        endColumn: trimmed.length
      });
    }
    
    // 4. Check for data/view/action without colon
    const declarationMatch = trimmed.match(/^\s*(data|view|action)\s+(\w+)\s*$/i);
    if (declarationMatch && !errorFound.capitalization) {
      const keyword = declarationMatch[1].toLowerCase();
      diagnostics.push({
        severity: 'error',
        message: `${keyword} ${declarationMatch[2]} must be followed by a colon (:)`,
        line: lineNum,
        column: trimmed.indexOf(declarationMatch[2]) + declarationMatch[2].length + 1,
        endLine: lineNum,
        endColumn: line.length
      });
      errorFound.missingColon = true;
    }
    
    // 5. Check for statements missing 'with' keyword (add X with Y)
    if (/^\s*(add)\s+\w+\s+\w+/i.test(trimmed) && !/\s+with\s+/i.test(trimmed)) {
      diagnostics.push({
        severity: 'error',
        message: 'add statement requires "with" keyword (e.g., "add Todo with title")',
        line: lineNum,
        column: 1,
        endLine: lineNum,
        endColumn: line.length
      });
    }
    
    // 6. Check for incomplete statements (keyword without proper structure)
    const incompleteStatementMatch = trimmed.match(/^\s*(add|show|call|load|button|text|list|input)\s*$/i);
    if (incompleteStatementMatch) {
      const keyword = incompleteStatementMatch[1].toLowerCase();
      diagnostics.push({
        severity: 'error',
        message: `${keyword} statement is incomplete`,
        line: lineNum,
        column: 1,
        endLine: lineNum,
        endColumn: trimmed.length
      });
    }
    
    // 7. Check for 'button' without action (button "text" -> action)
    if (/^\s*button\s+"[^"]+"\s*$/i.test(trimmed)) {
      diagnostics.push({
        severity: 'error',
        message: 'button declaration must include an action (e.g., button "Click" -> ShowMessage)',
        line: lineNum,
        column: 1,
        endLine: lineNum,
        endColumn: line.length
      });
    }
    
    // 8. Check for potential misspelled keywords at start of line
    const firstWord = trimmed.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 3 && !errorFound.capitalization && !errorFound.missingColon) {
      // Check if it looks like it could be a keyword
      const potentialKeyword = keywords.find(kw => {
        // Check for similar keywords (edit distance of 1-2)
        if (Math.abs(kw.length - firstWord.length) > 2) return false;
        
        // Check if it's a substring or very close match
        if (kw.includes(firstWord) || firstWord.includes(kw)) return true;
        
        // Check for single character difference
        let differences = 0;
        const maxLen = Math.max(kw.length, firstWord.length);
        for (let i = 0; i < maxLen; i++) {
          if (kw[i] !== firstWord[i]) differences++;
          if (differences > 2) return false;
        }
        return differences <= 2;
      });
      
      // If we found a potential keyword match and it's not an exact match
      if (potentialKeyword && firstWord.toLowerCase() !== potentialKeyword) {
        // Make sure it's not a variable name, field name, or parameter
        const isLikelyKeyword = /^[a-z]+$/i.test(firstWord) && 
                                !trimmed.includes('=') && 
                                !trimmed.includes('(') &&
                                firstWord.length <= 10 &&
                                !/^\w+:\s+/.test(trimmed) && // Not a field definition
                                !/->/.test(trimmed); // Not part of button action
        
        if (isLikelyKeyword) {
          // Check if this is just a pluralization error
          if (firstWord === potentialKeyword + 's') {
            diagnostics.push({
              severity: 'error',
              message: `Unknown keyword "${firstWord}". Did you mean "${potentialKeyword}"? (Keywords should be singular)`,
              line: lineNum,
              column: 1,
              endLine: lineNum,
              endColumn: firstWord.length + 1
            });
          } else {
            diagnostics.push({
              severity: 'error',
              message: `Unknown keyword "${firstWord}". Did you mean "${potentialKeyword}"?`,
              line: lineNum,
              column: 1,
              endLine: lineNum,
              endColumn: firstWord.length + 1
            });
          }
        }
      }
    }
  });
  
  // Industry Standard: Report comprehensive statistics
  console.log(`[ShepLang Analysis] Found ${diagnostics.length} diagnostics for ${lines.length} lines`);
  
  // Add info message only if truly no errors
  if (diagnostics.length === 0 && hasAppDeclaration) {
    diagnostics.push({
      severity: 'info',
      message: 'Code appears valid (basic validation)',
      line: 1,
      column: 1
    });
  }
  
  // Industry Standard: Return ALL diagnostics with no artificial limits
  // Reference: Monaco Editor setModelMarkers accepts unlimited array
  // Reference: LSP publishDiagnostics sends all diagnostics
  // Reference: TypeScript compiler reports all errors by default
  return diagnostics;
}

// Export a GET handler for API testing
export async function GET() {
  return NextResponse.json({
    status: 'ShepLang Analysis API',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze'
    }
  });
}
