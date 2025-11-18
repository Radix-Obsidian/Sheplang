import { describe, it, expect } from 'vitest';
import { verify } from '../src/index.js';
import { parseShep } from '@sheplang/language';

describe('Integration - Main Verify Function', () => {
  it('returns passing result for valid code', async () => {
    const code = `
app TodoApp

data Todo:
  fields:
    title: text
    done: yes/no
  rules:
    - "title required"

action addTodo(title: text):
  add Todo with title, done=false
    `;
    
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.errorCount).toBe(0);
    expect(result.summary.confidenceScore).toBeGreaterThanOrEqual(90);
  });
  
  it('returns failing result for type errors', async () => {
    const code = `
app BrokenApp

data User:
  fields:
    age: number
  rules:
    - "age required"

action createUser():
  add User with age="not a number"
    `;
    
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    expect(result.passed).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.summary.errorCount).toBeGreaterThan(0);
    expect(result.summary.confidenceScore).toBe(0);
  });
  
  it('includes warnings but still passes', async () => {
    const code = `
app WarningApp

data User:
  fields:
    name: text
    emailAddress: text
  rules:
    - "name required"

action createUser(name: text):
  add User with name
    `;
    
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    expect(result.passed).toBe(true);  // Warnings don't fail
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.summary.warningCount).toBeGreaterThan(0);
    expect(result.summary.confidenceScore).toBeLessThan(100);
  });
  
  it('provides helpful diagnostic messages', async () => {
    const code = `
app DiagnosticApp

data Product:
  fields:
    price: number
  rules:
    - "price required"

action addProduct(cost: text):
  add Product with price=cost
    `;
    
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    expect(result.passed).toBe(false);
    expect(result.errors[0].message).toContain('Type mismatch');
    expect(result.errors[0].message).toContain('expected number');
    expect(result.errors[0].message).toContain('got text');
    expect(result.errors[0].suggestion).toBeDefined();
    expect(result.errors[0].type).toBe('type-safety');
  });
  
  it('calculates confidence score correctly', async () => {
    const code = `
app ScoreApp

data Item:
  fields:
    a: text
    b: text
    c: text
    d: text
  rules:
    - "a required"

action createItem():
  add Item with a="test"
    `;
    
    const { appModel } = await parseShep(code);
    const result = verify(appModel);
    
    // Should have 3 warnings for missing fields
    expect(result.passed).toBe(true);
    expect(result.warnings.length).toBe(3);
    
    // Confidence score should be reduced by warnings
    // 100 - (3 warnings * 3) = 91
    expect(result.summary.confidenceScore).toBe(91);
  });
  
  it('handles all exported functions', async () => {
    // Test that we can import all public APIs
    const { 
      verify,
      isCompatible,
      formatType,
      parseTypeString,
      checkTypeSafety
    } = await import('../src/index.js');
    
    expect(verify).toBeDefined();
    expect(isCompatible).toBeDefined();
    expect(formatType).toBeDefined();
    expect(parseTypeString).toBeDefined();
    expect(checkTypeSafety).toBeDefined();
  });
});
