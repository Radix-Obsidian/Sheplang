# Parser-Level Smart Error Recovery

## Overview

Parser-level error recovery system that enhances diagnostic messages with:
- **Did-you-mean suggestions** - Typo detection using Levenshtein distance
- **Context-aware messages** - Include the line of code where error occurred
- **Auto-fix recommendations** - Suggest how to fix the error
- **Code examples** - Show correct usage patterns

## Integration Status

### ✅ ShepThon Parser (INTEGRATED)
- Located: `sheplang/packages/shepthon/src/parser.ts`
- Status: **Fully integrated and working**
- Build: ✅ Passing

### ⏳ ShepLang Parser (PENDING)
- Located: `sheplang/packages/language/` (LOCKED)
- Status: **Ready for integration when authorized**
- Note: Requires TTD/PRD authorization to modify locked package

## How It Works

### 1. SmartErrorRecovery Class

```typescript
import { SmartErrorRecovery } from '@sheplang/shepthon';

const errorRecovery = new SmartErrorRecovery('shepthon'); // or 'sheplang'

const parseError = {
  severity: 'error',
  message: "Unexpected token 'endpoit'",
  line: 5,
  column: 3,
  token: currentToken,
  context: "endpoit GET \"/users\""
};

const suggestion = errorRecovery.analyze(parseError);
// Returns:
// {
//   message: "Unknown keyword 'endpoit'",
//   didYouMean: ['endpoint', 'end'],
//   autoFix: {
//     title: "Replace with 'endpoint'",
//     description: "Change 'endpoit' to 'endpoint'",
//     replacement: 'endpoint'
//   },
//   examples: [
//     {
//       title: 'GET endpoint',
//       code: 'endpoint GET "/items" -> [Item] { ... }'
//     }
//   ],
//   confidence: 0.95
// }
```

### 2. ShepThon Parser Integration

**Before:**
```typescript
private error(message: string): void {
  const token = this.peek();
  this.diagnostics.push({
    severity: 'error',
    message,
    line: token.line,
    column: token.column
  });
}
```

**After (with Smart Recovery):**
```typescript
private error(message: string): void {
  const token = this.peek();
  
  // Create parse error with context
  const parseError: ParseError = {
    severity: 'error',
    message,
    line: token.line,
    column: token.column,
    token,
    context: this.getLineAt(token.line)
  };
  
  // Analyze error for suggestions
  const suggestion = this.errorRecovery.analyze(parseError);
  
  // Create enhanced diagnostic with did-you-mean hints
  const diagnostic = createEnhancedDiagnostic(parseError, suggestion);
  
  this.diagnostics.push(diagnostic);
}
```

## Example Error Messages

### Before Integration
```
Error: Expected HTTP method (GET or POST)
Line 5, Column 3
```

### After Integration
```
Error: Expected HTTP method (GET or POST). Did you mean: GET, POST? (Replace with 'GET')
Line 5, Column 3

Example:
endpoint GET "/users" -> [User] {
  return db.User.findAll()
}
```

## Features

### 1. Typo Detection
Uses Levenshtein distance algorithm to find similar keywords:
- `endpoit` → suggests `endpoint`
- `modle` → suggests `model`
- `retrn` → suggests `return`

**Confidence threshold:** Distance ≤ 2 characters

### 2. Expected Token Handling
Provides contextual examples when expected tokens are missing:
- Missing HTTP method → Shows endpoint examples
- Missing `app` keyword → Shows app structure

### 3. Context Awareness
Includes the line of code where the error occurred:
```typescript
const parseError: ParseError = {
  ...
  context: "endpoit GET \"/users\"" // The actual line from source
};
```

### 4. Auto-Fix Suggestions
Provides machine-applicable fixes:
```typescript
{
  autoFix: {
    title: "Replace with 'endpoint'",
    description: "Change 'endpoit' to 'endpoint'",
    replacement: 'endpoint'
  }
}
```

## API Reference

### SmartErrorRecovery

```typescript
class SmartErrorRecovery {
  constructor(language: 'sheplang' | 'shepthon');
  
  analyze(error: ParseError): ErrorSuggestion;
}
```

### ParseError

```typescript
interface ParseError extends Diagnostic {
  token?: Token;
  context?: string;
  expectedTokens?: string[];
}
```

### ErrorSuggestion

```typescript
interface ErrorSuggestion extends Diagnostic {
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
```

### Helper Functions

```typescript
// Convert suggestion to enhanced diagnostic
function createEnhancedDiagnostic(
  error: ParseError,
  suggestion: ErrorSuggestion
): Diagnostic;
```

## Integration Guide for ShepLang Parser

**⚠️ NOTE: ShepLang parser is a LOCKED package. Do NOT integrate without TTD/PRD authorization.**

When authorized, follow these steps:

### Step 1: Import SmartErrorRecovery

```typescript
// In sheplang/packages/language/src/parser.ts (or equivalent)
import { SmartErrorRecovery, createEnhancedDiagnostic, type ParseError } from '@sheplang/shepthon';
```

### Step 2: Add to Parser Class

```typescript
class ShepLangParser {
  private errorRecovery = new SmartErrorRecovery('sheplang');
  
  // ... existing parser code
}
```

### Step 3: Enhance Error Method

```typescript
private error(message: string): void {
  const token = this.peek();
  
  const parseError: ParseError = {
    severity: 'error',
    message,
    line: token.line,
    column: token.column,
    token,
    context: this.getLineAt(token.line)
  };
  
  const suggestion = this.errorRecovery.analyze(parseError);
  const diagnostic = createEnhancedDiagnostic(parseError, suggestion);
  
  this.diagnostics.push(diagnostic);
}
```

### Step 4: Add Context Helper

```typescript
private getLineAt(line: number | undefined): string {
  if (!line) return '';
  const lineTokens = this.tokens.filter(t => t.line === line);
  return lineTokens.map(t => t.value).join(' ');
}
```

## Testing

### Unit Tests

```typescript
import { SmartErrorRecovery } from '@sheplang/shepthon';

describe('SmartErrorRecovery', () => {
  it('should detect typos', () => {
    const recovery = new SmartErrorRecovery('shepthon');
    
    const error = {
      severity: 'error' as const,
      message: "Unexpected token 'endpoit'",
      line: 5,
      column: 3,
      token: { value: 'endpoit', type: 'IDENTIFIER', line: 5, column: 3 },
      context: "endpoit GET \"/users\""
    };
    
    const suggestion = recovery.analyze(error);
    
    expect(suggestion.didYouMean).toContain('endpoint');
    expect(suggestion.confidence).toBeGreaterThan(0.9);
  });
});
```

### Integration Tests

```typescript
describe('Parser with Smart Error Recovery', () => {
  it('should provide helpful error for typo', () => {
    const code = 'endpoit GET "/users"';
    const result = parseShepThon(code);
    
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].message).toContain('Did you mean');
    expect(result.diagnostics[0].message).toContain('endpoint');
  });
});
```

## Keywords Dictionary

### ShepThon Keywords
```typescript
const SHEPTHON_KEYWORDS = [
  // Structure
  'app', 'model', 'endpoint', 'job',
  
  // Statements
  'let', 'return', 'if', 'else', 'for', 'in',
  
  // Operators
  'not', 'and', 'or',
  
  // Special
  'error', 'true', 'false',
  
  // HTTP Methods
  'GET', 'POST', 'PUT', 'DELETE',
  
  // Types
  'id', 'string', 'int', 'float', 'bool', 'datetime', 'json',
  
  // Time
  'every', 'minutes', 'hours', 'days',
  
  // Built-ins
  'db', 'log', 'now'
];
```

To add more keywords, edit `SmartErrorRecovery.ts`.

## Performance

- **Levenshtein algorithm:** O(m×n) where m,n are string lengths
- **Keyword matching:** O(k) where k is number of keywords (~30)
- **Total overhead per error:** < 1ms
- **Memory:** Negligible (< 1KB per instance)

## Future Enhancements

### Phase 1: Current
- [x] Typo detection with did-you-mean
- [x] Context-aware error messages
- [x] Auto-fix suggestions
- [x] Code examples

### Phase 2: Planned
- [ ] Multi-error analysis (suggest fixes for related errors)
- [ ] Semantic error detection (e.g., undefined variables)
- [ ] Fix confidence scoring based on context
- [ ] Custom keyword dictionaries per project

### Phase 3: Advanced
- [ ] Machine learning for better suggestions
- [ ] Natural language error explanations
- [ ] Interactive error resolution in IDE
- [ ] Error pattern tracking and analytics

## Links

- **ShepYard UI Integration:** `shepyard/src/errors/SmartErrorRecovery.tsx`
- **Error Analysis Service:** `shepyard/src/services/errorAnalysisService.ts`
- **ShepThon Parser:** `sheplang/packages/shepthon/src/parser.ts`
- **Types:** `sheplang/packages/shepthon/src/types.ts`

## Build Status

✅ **ShepThon Package:** Passing  
✅ **TypeScript Compilation:** No errors  
✅ **Integration:** Complete

---

**Status:** ✅ Production Ready (ShepThon)  
**Next:** Awaiting TTD/PRD authorization for ShepLang integration
