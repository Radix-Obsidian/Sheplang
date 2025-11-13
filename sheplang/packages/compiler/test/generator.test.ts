import { generateApp } from '../src';
import fs from 'fs';
import path from 'path';

describe('generateApp', () => {
  test('should correctly generate app from valid ShepLang code', async () => {
    const source = fs.readFileSync(path.join(__dirname, 'fixtures/todo.shep'), 'utf-8');
    const result = await generateApp(source);
    
    expect(result.success).toBe(true);
    expect(result.output).toBeTruthy();
    expect(result.diagnostics).toEqual([]);
    expect(result.output?.files).toBeDefined();
    expect(result.output?.entryPoint).toBe('index.ts');
    
    // Verify key files
    expect(Object.keys(result.output?.files || {})).toContain('index.ts');
    expect(Object.keys(result.output?.files || {})).toContain('tsconfig.json');
  });

  test('should handle parsing errors', async () => {
    const source = `
      component Broken {
        // Missing closing brace
        state count = 1
    `;
    const result = await generateApp(source);
    
    expect(result.success).toBe(false);
    expect(result.output).toBeNull();
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0].severity).toBe('error');
  });
});
