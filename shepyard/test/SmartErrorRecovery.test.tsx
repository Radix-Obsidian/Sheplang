/**
 * Smart Error Recovery Tests
 * 
 * Tests for the error recovery UI and analysis service
 */

import { describe, it, expect } from 'vitest';
import { analyzeError, analyzeTranspilerErrors } from '../src/services/errorAnalysisService';

describe('Error Analysis Service', () => {
  describe('analyzeError', () => {
    it('should detect typos and suggest corrections', () => {
      const result = analyzeError(
        "unknown keyword 'endpoit'",
        'endpoit GET "/test"',
        false
      );

      expect(result.errorType).toBe('typo');
      expect(result.didYouMean).toContain('endpoint');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.autoFix).toBeDefined();
    });

    it('should detect missing end keyword', () => {
      const result = analyzeError(
        "missing 'end'",
        'component App {\n  "test"\n',
        false
      );

      expect(result.errorType).toBe('missing_token');
      expect(result.autoFix).toBeDefined();
      expect(result.autoFix?.title).toContain('end');
    });

    it('should handle generic syntax errors', () => {
      const result = analyzeError(
        'syntax error at line 5',
        'some invalid code',
        false
      );

      expect(result.errorType).toBe('syntax');
      expect(result.line).toBe(5);
      expect(result.examples).toBeDefined();
    });

    it('should differentiate ShepLang and ShepThon errors', () => {
      const shepLangResult = analyzeError(
        "unknown keyword 'componet'",
        'componet App',
        false
      );
      
      const shepThonResult = analyzeError(
        "unknown keyword 'endpont'",
        'endpont GET',
        true
      );

      expect(shepLangResult.didYouMean).toContain('component');
      expect(shepThonResult.didYouMean).toContain('endpoint');
    });
  });

  describe('analyzeTranspilerErrors', () => {
    it('should convert transpiler error to suggestions array', () => {
      const suggestions = analyzeTranspilerErrors(
        "unknown keyword 'endpoit'",
        'endpoit GET "/test"',
        false
      );

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].message).toBeDefined();
    });
  });

  describe('Levenshtein Distance', () => {
    it('should find close matches for common typos', () => {
      const typos = [
        { typo: 'endpoit', correct: 'endpoint' },
        { typo: 'componet', correct: 'component' },
        { typo: 'modle', correct: 'model' },
      ];

      typos.forEach(({ typo, correct }) => {
        const result = analyzeError(
          `unknown keyword '${typo}'`,
          typo,
          false
        );
        
        expect(result.didYouMean).toContain(correct);
      });
    });
  });

  describe('Error Position Extraction', () => {
    it('should extract line and column from error message', () => {
      const testCases = [
        { msg: 'Error at line 5, column 10', line: 5, column: 10 },
        { msg: 'Syntax error (line 3:7)', line: 3, column: 7 },
        { msg: 'Parse error at line 12:5', line: 12, column: 5 },
      ];

      testCases.forEach(({ msg, line, column }) => {
        const result = analyzeError(msg, 'test', false);
        expect(result.line).toBe(line);
        expect(result.column).toBe(column);
      });
    });
  });
});

describe('Error Suggestion Structure', () => {
  it('should have all required fields', () => {
    const result = analyzeError(
      "unknown keyword 'test'",
      'test code',
      false
    );

    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('line');
    expect(result).toHaveProperty('column');
    expect(result).toHaveProperty('errorType');
    expect(result).toHaveProperty('confidence');
  });

  it('should provide helpful examples', () => {
    const result = analyzeError(
      "unknown keyword 'endpoit'",
      'endpoit GET',
      false
    );

    expect(result.examples).toBeDefined();
    if (result.examples && result.examples.length > 0) {
      expect(result.examples[0]).toHaveProperty('title');
      expect(result.examples[0]).toHaveProperty('description');
      expect(result.examples[0]).toHaveProperty('code');
    }
  });
});
