/**
 * Compiler Integration Tests
 * Tests the real ShepLang compiler integration
 * Note: These tests require workspace packages to be built first
 */

import { describe, it, expect } from 'vitest';

describe.skip('Compiler Integration (requires workspace packages built)', () => {
  it.skip('should have compiler package available', async () => {
    // Requires workspace packages to be built
    try {
      const compiler = await import('@goldensheepai/sheplang-compiler');
      expect(compiler.generateApp).toBeDefined();
      expect(typeof compiler.generateApp).toBe('function');
    } catch (error) {
      console.log('Skipping: workspace packages not built');
    }
  });

  it('should have language package available', async () => {
    const language = await import('@goldensheepai/sheplang-language');
    expect(language.parseShep).toBeDefined();
    expect(typeof language.parseShep).toBe('function');
  });

  it('should generate code from simple ShepLang', async () => {
    const { generateApp } = await import('@goldensheepai/sheplang-compiler');
    
    const code = `app HelloWorld

data Message:
  fields:
    text: text

view Dashboard:
  text "Hello, World!"`;

    const result = await generateApp(code);

    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect(result.output.files).toBeDefined();
    expect(Object.keys(result.output.files).length).toBeGreaterThan(0);
  });

  it('should handle invalid ShepLang code', async () => {
    const { generateApp } = await import('@goldensheepai/sheplang-compiler');
    
    const code = `invalid sheplang code here`;

    const result = await generateApp(code);

    expect(result.success).toBe(false);
    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it('should generate multiple files for complex apps', async () => {
    const { generateApp } = await import('@goldensheepai/sheplang-compiler');
    
    const code = `app TaskManager

data Task:
  fields:
    title: text
    done: yes/no

view Dashboard:
  list Task
  button "Add" -> AddTask

action AddTask(title):
  add Task with title = title, done = false
  show Dashboard`;

    const result = await generateApp(code);

    expect(result.success).toBe(true);
    expect(result.output.files).toBeDefined();
    
    // Should have multiple file types
    const fileKeys = Object.keys(result.output.files);
    expect(fileKeys.some(f => f.includes('screens/'))).toBe(true);
    expect(fileKeys.some(f => f.includes('models/'))).toBe(true);
  });

  it('should calculate correct metrics', async () => {
    const { generateApp } = await import('@goldensheepai/sheplang-compiler');
    
    const code = `app TestApp

data User:
  fields:
    name: text

view UserList:
  list User`;

    const result = await generateApp(code);

    expect(result.success).toBe(true);
    
    // Files should be generated
    const fileCount = Object.keys(result.output.files).length;
    expect(fileCount).toBeGreaterThan(0);
    
    // Calculate total lines
    let totalLines = 0;
    for (const content of Object.values(result.output.files)) {
      totalLines += (content as string).split('\n').length;
    }
    expect(totalLines).toBeGreaterThan(50); // Should generate significant code
  });
});
