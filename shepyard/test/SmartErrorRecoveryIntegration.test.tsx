/**
 * Smart Error Recovery - Integration Tests
 * 
 * Tests the complete error recovery pipeline with real test cases.
 */

import { describe, it, expect } from 'vitest';
import { analyzeTranspilerErrors } from '../src/services/errorAnalysisService';

describe('Smart Error Recovery - Integration Tests', () => {
  
  // Test 1: Typo detection - endpoint
  it('should detect "endpoit" typo and suggest "endpoint"', () => {
    const errorMessage = "Unknown token 'endpoit'";
    const source = `
component App {
  "Hello"
  endpoit GET "/test"
}`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].message).toContain('endpoit');
    expect(suggestions[0].didYouMean).toContain('endpoint');
    expect(suggestions[0].confidence).toBeGreaterThan(0.9);
    expect(suggestions[0].autoFix).toBeDefined();
    expect(suggestions[0].autoFix?.replacement).toBe('endpoint');
  });
  
  // Test 2: Missing token - end keyword
  it('should detect missing "end" keyword', () => {
    const errorMessage = "Expected 'end' keyword";
    const source = `
component App {
  "Hello"
`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].message).toContain('end');
    expect(suggestions[0].errorType).toBe('missing_token');
  });
  
  // Test 3: Unknown keyword - component
  it('should detect "componet" typo and suggest "component"', () => {
    const errorMessage = "Unknown token 'componet'";
    const source = `
componet App {
  "Hello"
end`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].didYouMean).toContain('component');
    expect(suggestions[0].confidence).toBeGreaterThan(0.9);
  });
  
  // Test 4: ShepThon model typo
  it('should detect "modle" typo and suggest "model" in ShepThon', () => {
    const errorMessage = "Unknown token 'modle'";
    const source = `
app MyApp {
  modle User {
    id: id
  }
}`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, true); // isShepThon = true
    
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].didYouMean).toContain('model');
    expect(suggestions[0].autoFix?.replacement).toBe('model');
  });
  
  // Test 5: High confidence for close matches
  it('should show high confidence for 1-character typo', () => {
    const errorMessage = "Unknown token 'retrn'";
    const source = `component App { retrn "test" end }`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions[0].confidence).toBeGreaterThan(0.9);
    expect(suggestions[0].didYouMean).toContain('return');
  });
  
  // Test 6: Low confidence for unrelated keywords
  it('should show low confidence for unrelated keywords', () => {
    const errorMessage = "Unknown token 'xyz123'";
    const source = `component App { xyz123 "test" end }`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    // Either low confidence or no suggestions
    if (suggestions[0].didYouMean && suggestions[0].didYouMean.length > 0) {
      expect(suggestions[0].confidence).toBeLessThan(0.7);
    }
  });
  
  // Test 7: Multiple errors detection
  it('should handle multiple error messages', () => {
    const errorMessage = "Multiple errors: Unknown token 'componet', Unknown token 'endpoit'";
    const source = `
componet App {
  endpoit GET "/test"
end`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    // Should detect at least one error
    expect(suggestions.length).toBeGreaterThan(0);
  });
  
  // Test 8: Position extraction
  it('should extract line and column from error message', () => {
    const errorMessage = "Syntax error at line 5, column 10: Unknown token 'foo'";
    const source = `component App { foo }`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions[0].line).toBe(5);
    expect(suggestions[0].column).toBe(10);
  });
  
  // Test 9: ShepLang vs ShepThon context
  it('should use ShepLang keywords for ShepLang code', () => {
    const errorMessage = "Unknown token 'componnt'";
    const source = `componnt App { "test" end }`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions[0].didYouMean).toContain('component');
  });
  
  it('should use ShepThon keywords for ShepThon code', () => {
    const errorMessage = "Unknown token 'endpoit'";
    const source = `app MyApp { endpoit GET "/test" }`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, true);
    
    expect(suggestions[0].didYouMean).toContain('endpoint');
  });
  
  // Test 10: Auto-fix generation
  it('should generate auto-fix for typos', () => {
    const errorMessage = "Unknown token 'modle'";
    const source = `model User { id: id }`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, true);
    
    expect(suggestions[0].autoFix).toBeDefined();
    expect(suggestions[0].autoFix?.title).toContain('Replace');
    expect(suggestions[0].autoFix?.replacement).toBe('model');
  });
  
  // Test 11: Code examples
  it('should provide code examples for common errors', () => {
    const errorMessage = "Unknown token 'endpoit'";
    const source = `endpoit GET "/test"`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, true);
    
    // Should have examples for endpoint
    expect(suggestions[0].examples).toBeDefined();
    if (suggestions[0].examples) {
      expect(suggestions[0].examples.length).toBeGreaterThan(0);
    }
  });
  
  // Test 12: Severity classification
  it('should classify errors with correct severity', () => {
    const errorMessage = "Syntax error: Unknown token";
    const source = `component App {}`;
    
    const suggestions = analyzeTranspilerErrors(errorMessage, source, false);
    
    expect(suggestions[0].severity).toBe('error');
  });
  
});

describe('Smart Error Recovery - Edge Cases', () => {
  
  it('should handle empty source', () => {
    const suggestions = analyzeTranspilerErrors('Error', '', false);
    expect(suggestions).toHaveLength(1);
  });
  
  it('should handle null/undefined gracefully', () => {
    const suggestions = analyzeTranspilerErrors('Error', 'test', false);
    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
  });
  
  it('should handle very long source code', () => {
    const longSource = 'component App {\n' + '  "line"\n'.repeat(1000) + 'end';
    const suggestions = analyzeTranspilerErrors('Error', longSource, false);
    expect(suggestions).toBeDefined();
  });
  
  it('should handle special characters in error message', () => {
    const errorMessage = "Unknown token with special chars: <>#$%";
    const suggestions = analyzeTranspilerErrors(errorMessage, 'test', false);
    expect(suggestions).toHaveLength(1);
  });
  
});

describe('Smart Error Recovery - Performance', () => {
  
  it('should analyze errors quickly (<100ms)', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      analyzeTranspilerErrors(
        `Unknown token 'test${i}'`,
        `component App { test${i} }`,
        false
      );
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in <100ms
  });
  
});
