import { describe, test, expect } from 'vitest';
import { transpileShepToBoba } from '../src';
import fs from 'fs';
import path from 'path';

describe('transpileShepToBoba', () => {
  // Positive case
  test('should correctly transpile valid ShepLang code', async () => {
    const source = fs.readFileSync(path.join(__dirname, 'fixtures/todo.shep'), 'utf-8');
    const result = await transpileShepToBoba(source);
    
    expect(result.success).toBe(true);
    expect(result.output).toBeTruthy();
    expect(result.diagnostics).toEqual([]);
    expect(result.canonicalAst).toBeDefined();
  });
  
  // Negative cases
  test.each([
    'invalid-syntax.shep',
    'missing-target.shep',
    'duplicate-component.shep'
  ])('should handle errors in %s', async (fixture) => {
    const source = fs.readFileSync(path.join(__dirname, `fixtures/${fixture}`), 'utf-8');
    const result = await transpileShepToBoba(source);
    
    expect(result.success).toBe(false);
    expect(result.output).toBeNull();
    expect(result.diagnostics.length).toBeGreaterThan(0);
    
    // Verify error details
    const diagnostics = result.diagnostics;
    expect(diagnostics[0].severity).toBe('error');
    expect(diagnostics[0].message).toBeTruthy();
    expect(diagnostics[0].start).toBeDefined();
  });
});
