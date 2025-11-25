/**
 * Slice 0 Tests – Importer Fixture Validation
 * 
 * Ensures test fixtures are reproducible and detection works.
 * Tests run without network calls and are OS-agnostic.
 */

import { describe, it, expect } from 'vitest';
import { generateManifest } from '../../extension/src/services/manifestGenerator';
import * as path from 'path';
import * as fs from 'fs';

describe('Importer Fixtures – Slice 0', () => {
  const fixturesDir = path.join(__dirname, '../../test-import-fixtures');
  
  it('detects Next.js + Prisma fixture correctly', async () => {
    const fixturePath = path.join(fixturesDir, 'nextjs-prisma');
    
    // Verify fixture exists
    expect(fs.existsSync(fixturePath)).toBe(true);
    expect(fs.existsSync(path.join(fixturePath, 'package.json'))).toBe(true);
    
    // Generate manifest
    const manifest = await generateManifest(fixturePath);
    
    // Verify framework detection
    expect(manifest.framework.type).toBe('nextjs');
    expect(manifest.framework.version).toBe('14.0.0');
    expect(manifest.framework.router).toBe('app');
    expect(manifest.framework.confidence).toBeGreaterThan(0.9);
    
    // Verify Prisma detection
    expect(manifest.prisma.enabled).toBe(true);
    expect(manifest.prisma.schemaPath).toBe('prisma/schema.prisma');
    expect(manifest.prisma.clientVersion).toBe('5.6.0');
    
    // Verify TypeScript detection
    expect(manifest.typescript.enabled).toBe(true);
    expect(manifest.typescript.configPath).toBe('tsconfig.json');
    
    // Verify source paths
    expect(manifest.sourcePaths.app).toBe('app');
    expect(manifest.sourcePaths.components).toBe('app/components');
    
    // Verify confidence scores
    expect(manifest.confidence.framework).toBeGreaterThan(0.9);
    expect(manifest.confidence.typescript).toBeGreaterThan(0.8);
    expect(manifest.confidence.prisma).toBeGreaterThan(0.8);
    expect(manifest.confidence.overall).toBeGreaterThan(0.8);
    
    // Verify no unsupported features detected
    expect(manifest.unsupported).not.toContain('monorepo');
    expect(manifest.unsupported).not.toContain('graphql');
  });
  
  it('detects Vite + React fixture correctly', async () => {
    const fixturePath = path.join(fixturesDir, 'vite-react');
    
    // Verify fixture exists
    expect(fs.existsSync(fixturePath)).toBe(true);
    expect(fs.existsSync(path.join(fixturePath, 'package.json'))).toBe(true);
    
    // Generate manifest
    const manifest = await generateManifest(fixturePath);
    
    // Verify framework detection
    expect(manifest.framework.type).toBe('vite');
    expect(manifest.framework.version).toBe('5.0.8');
    expect(manifest.framework.confidence).toBeGreaterThan(0.8);
    
    // Verify no Prisma
    expect(manifest.prisma.enabled).toBe(false);
    expect(manifest.prisma.schemaPath).toBeUndefined();
    
    // Verify TypeScript detection
    expect(manifest.typescript.enabled).toBe(true);
    expect(manifest.typescript.configPath).toBe('tsconfig.json');
    
    // Verify source paths
    expect(manifest.sourcePaths.src).toBe('src');
    expect(manifest.sourcePaths.components).toBe('src/components');
    
    // Verify confidence scores
    expect(manifest.confidence.framework).toBeGreaterThan(0.8);
    expect(manifest.confidence.typescript).toBeGreaterThan(0.8);
    expect(manifest.confidence.prisma).toBeLessThan(0.6); // No Prisma
    expect(manifest.confidence.overall).toBeGreaterThan(0.6);
  });
  
  it('detects plain React fixture correctly', async () => {
    const fixturePath = path.join(fixturesDir, 'plain-react');
    
    // Verify fixture exists
    expect(fs.existsSync(fixturePath)).toBe(true);
    expect(fs.existsSync(path.join(fixturePath, 'package.json'))).toBe(true);
    
    // Generate manifest
    const manifest = await generateManifest(fixturePath);
    
    // Verify framework detection
    expect(manifest.framework.type).toBe('react');
    expect(manifest.framework.version).toBe('18.2.0');
    expect(manifest.framework.confidence).toBeGreaterThan(0.6);
    
    // Verify no Vite or Next.js
    expect(manifest.framework.type).not.toBe('vite');
    expect(manifest.framework.type).not.toBe('nextjs');
    
    // Verify confidence is lower for plain React
    expect(manifest.confidence.framework).toBeLessThanOrEqual(0.8);
    expect(manifest.confidence.overall).toBeGreaterThan(0.5);
  });
  
  it('rejects invalid fixture directories', async () => {
    const invalidPath = path.join(fixturesDir, 'nonexistent');
    
    await expect(generateManifest(invalidPath)).rejects.toThrow('No package.json found');
  });
  
  it('detects unsupported features in fixtures', async () => {
    // Create a temporary fixture with GraphQL
    const tempFixturePath = path.join(fixturesDir, 'temp-graphql');
    fs.mkdirSync(tempFixturePath, { recursive: true });
    
    const packageJson = {
      name: 'temp-graphql',
      dependencies: {
        'react': '18.2.0',
        '@apollo/client': '3.8.0',
        'graphql': '16.8.0'
      }
    };
    
    fs.writeFileSync(
      path.join(tempFixturePath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    try {
      const manifest = await generateManifest(tempFixturePath);
      expect(manifest.unsupported).toContain('graphql');
    } finally {
      // Cleanup
      fs.rmSync(tempFixturePath, { recursive: true, force: true });
    }
  });
  
  it('all fixtures have locked dependency versions', () => {
    const fixtures = ['nextjs-prisma', 'vite-react', 'plain-react'];
    
    for (const fixture of fixtures) {
      const packageJsonPath = path.join(fixturesDir, fixture, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // Check that no versions use ^ or ~
      for (const [name, version] of Object.entries(allDeps)) {
        expect(version).not.toMatch(/^[\^~]/);
      }
      
      // Verify pnpm-lock.yaml exists for true reproducibility
      const lockPath = path.join(fixturesDir, fixture, 'pnpm-lock.yaml');
      expect(fs.existsSync(lockPath)).toBe(true);
    }
  });
  
  it('manifest persists to .shep/import-manifest.json', async () => {
    const fixturePath = path.join(fixturesDir, 'nextjs-prisma');
    const shepDir = path.join(fixturePath, '.shep');
    
    // Clean up any existing manifest
    if (fs.existsSync(shepDir)) {
      fs.rmSync(shepDir, { recursive: true, force: true });
    }
    
    // Generate manifest
    await generateManifest(fixturePath);
    
    // Verify .shep directory was created
    expect(fs.existsSync(shepDir)).toBe(true);
    
    // Verify manifest file was created
    const manifestPath = path.join(shepDir, 'import-manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    
    // Verify manifest content is valid JSON and matches expected structure
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    expect(manifest).toHaveProperty('projectName');
    expect(manifest).toHaveProperty('framework');
    expect(manifest).toHaveProperty('typescript');
    expect(manifest).toHaveProperty('prisma');
    expect(manifest).toHaveProperty('detectedAt');
    
    // Cleanup
    fs.rmSync(shepDir, { recursive: true, force: true });
  });
  
  it('fixtures can be installed reproducibly', async () => {
    const fixtures = ['nextjs-prisma', 'vite-react', 'plain-react'];
    
    for (const fixture of fixtures) {
      const fixturePath = path.join(fixturesDir, fixture);
      
      // Verify pnpm-lock.yaml exists
      const lockPath = path.join(fixturePath, 'pnpm-lock.yaml');
      expect(fs.existsSync(lockPath)).toBe(true);
      
      // Verify lock file is not empty
      const lockContent = fs.readFileSync(lockPath, 'utf-8');
      expect(lockContent.length).toBeGreaterThan(100);
      expect(lockContent).toContain('lockfileVersion');
    }
  });
  
  it('fixtures are stable across different relative paths', async () => {
    const fixturePath = path.join(fixturesDir, 'nextjs-prisma');
    
    // Test with absolute path
    const manifest1 = await generateManifest(path.resolve(fixturePath));
    
    // Test with relative path
    const manifest2 = await generateManifest(fixturePath);
    
    // Manifests should be identical except for projectRoot
    expect(manifest1.framework).toEqual(manifest2.framework);
    expect(manifest1.typescript).toEqual(manifest2.typescript);
    expect(manifest1.prisma).toEqual(manifest2.prisma);
    expect(manifest1.sourcePaths).toEqual(manifest2.sourcePaths);
    expect(manifest1.confidence).toEqual(manifest2.confidence);
  });
});
