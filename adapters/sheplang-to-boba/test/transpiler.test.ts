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

    // Basic canonical AST sanity checks for the Todo example
    const ast = result.canonicalAst as any;
    expect(ast.type).toBe('App');
    expect(ast.name).toBeDefined();
    expect(Array.isArray(ast.body)).toBe(true);

    const components = ast.body.filter((n: any) => n.type === 'ComponentDecl');
    const states = ast.body.filter((n: any) => n.type === 'StateDecl');
    const routes = ast.body.filter((n: any) => n.type === 'RouteDecl');

    // From todo.shep we expect one Dashboard view, one Todo data, and one CreateTodo action
    expect(components.some((c: any) => c.name === 'Dashboard')).toBe(true);
    expect(states.some((s: any) => s.name === 'Todo')).toBe(true);
    expect(routes.some((r: any) => r.path === '/CreateTodo' && r.target === 'CreateTodo')).toBe(true);
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
