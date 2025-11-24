/**
 * Build Validation Tests
 * Catches build-time errors before they hit production
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

describe('Build Validation', () => {
  it('should have jszip installed', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    expect(packageJson.dependencies.jszip).toBeDefined();
  });

  it('should have all required dependencies', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      '@monaco-editor/react',
      'jszip',
      '@goldensheepai/sheplang-compiler',
      '@goldensheepai/sheplang-language'
    ];
    
    requiredDeps.forEach(dep => {
      expect(packageJson.dependencies[dep], `${dep} should be in dependencies`).toBeDefined();
    });
  });

  it('should have TypeScript configured', async () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
    
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('should have Next.js config file', async () => {
    const configPath = path.join(process.cwd(), 'next.config.ts');
    await expect(fs.access(configPath)).resolves.not.toThrow();
  });

  it('should not import jszip statically in export route', async () => {
    const exportRoutePath = path.join(process.cwd(), 'app', 'api', 'export', 'route.ts');
    const content = await fs.readFile(exportRoutePath, 'utf-8');
    
    // Should use dynamic import, not static
    expect(content).not.toContain('import JSZip from');
    expect(content).toContain('await import(\'jszip\')');
  });

  it('should have no any types in error handlers', async () => {
    const files = [
      'app/page.tsx',
      'app/api/preview/route.ts',
      'app/api/generate/route.ts',
      'app/api/analyze/route.ts',
      'app/api/export/route.ts'
    ];
    
    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Should use 'error: unknown', not 'error: any'
      const anyErrorMatch = content.match(/catch\s*\(\s*error:\s*any\s*\)/);
      expect(anyErrorMatch, `${file} should not have 'error: any' in catch blocks`).toBeNull();
    }
  });
});
