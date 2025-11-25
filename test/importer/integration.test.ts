/**
 * Integration Tests – AST Importer Slices 0-4
 * 
 * End-to-end testing of the complete importer pipeline
 */

import { describe, it, expect } from 'vitest';
import { generateManifest } from '../../extension/src/services/manifestGenerator';
import { parseReactFile } from '../../extension/src/parsers/reactParser';
import { extractEntities, generateShepLangData } from '../../extension/src/parsers/entityExtractor';
import { mapProjectToShepLang, generateShepLangViewCode } from '../../extension/src/parsers/viewMapper';
import * as path from 'path';

describe('Integration Tests – Slices 0-4', () => {
  const fixturesDir = path.join(__dirname, '../../test-import-fixtures');
  
  it('generates complete ShepLang output from Next.js + Prisma project', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // Slice 0-1: Generate manifest
    const manifest = await generateManifest(projectRoot);
    expect(manifest).toBeDefined();
    expect(manifest.framework.type).toBe('nextjs');
    expect(manifest.prisma.enabled).toBe(true);
    
    // Slice 2: Parse React components
    const componentPath = path.join(projectRoot, 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    expect(component).not.toBeNull();
    expect(component!.name).toBe('TaskList');
    
    // Slice 3: Extract entities
    const entityResult = await extractEntities(projectRoot, [component!]);
    expect(entityResult.source).toBe('prisma');
    expect(entityResult.entities).toHaveLength(2);
    
    // Generate ShepLang data definitions
    const shepLangData = generateShepLangData(entityResult.entities);
    expect(shepLangData).toContain('data Task:');
    expect(shepLangData).toContain('data User:');
    expect(shepLangData).toContain('id: number');
    expect(shepLangData).toContain('title: text');
    expect(shepLangData).toContain('completed: yes/no');
    
    // Slice 4: Map views and actions
    const projectMapping = mapProjectToShepLang([component!], entityResult.entities);
    expect(projectMapping.views).toHaveLength(1);
    expect(projectMapping.views[0].name).toBe('TaskList');
    expect(projectMapping.views[0].kind).toBe('component');
    
    // Generate complete ShepLang output
    const shepLangViews = generateShepLangViewCode(projectMapping);
    expect(shepLangViews).toContain('view TaskList:');
  });
  
  it('falls back to heuristic path for Vite + React project', async () => {
    const projectRoot = path.join(fixturesDir, 'vite-react');
    
    // Slice 0-1: Generate manifest (no Prisma)
    const manifest = await generateManifest(projectRoot);
    expect(manifest.framework.type).toBe('vite');
    expect(manifest.prisma.enabled).toBe(false);
    
    // Slice 2: Parse React components
    const componentPath = path.join(projectRoot, 'src', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    expect(component).not.toBeNull();
    
    // Slice 3: Extract entities (should use heuristics)
    const entityResult = await extractEntities(projectRoot, [component!]);
    expect(entityResult.source).toBe('heuristics');
    
    if (entityResult.entities.length > 0) {
      // Verify heuristic entities have basic structure
      const entity = entityResult.entities[0];
      expect(entity.name).toBeTruthy();
      expect(entity.fields.length).toBeGreaterThan(0);
      
      // Generate ShepLang output
      const shepLangData = generateShepLangData(entityResult.entities);
      expect(shepLangData).toContain(`data ${entity.name}:`);
    }
  });
  
  it('handles plain React project with no framework features', async () => {
    const projectRoot = path.join(fixturesDir, 'plain-react');
    
    // Slice 0-1: Generate manifest
    const manifest = await generateManifest(projectRoot);
    expect(manifest.framework.type).toBe('react'); // Detected as 'react' not 'plain-react'
    expect(manifest.prisma.enabled).toBe(false);
    
    // Slice 3: Extract entities (should use heuristics or return empty)
    const entityResult = await extractEntities(projectRoot);
    expect(entityResult.source).toBe('heuristics');
    expect(entityResult.confidence).toBeLessThan(0.5);
    
    // Should handle empty results gracefully
    const shepLangData = generateShepLangData(entityResult.entities);
    expect(typeof shepLangData).toBe('string');
  });
  
  it('maintains backward compatibility across all slices', async () => {
    // Test that all slices work together without regressions
    const projects = ['nextjs-prisma', 'vite-react', 'plain-react'];
    
    for (const project of projects) {
      const projectRoot = path.join(fixturesDir, project);
      
      // All slices should complete without errors
      const manifest = await generateManifest(projectRoot);
      expect(manifest).toBeDefined();
      
      const entityResult = await extractEntities(projectRoot);
      expect(entityResult).toBeDefined();
      expect(Array.isArray(entityResult.entities)).toBe(true);
      
      // ShepLang generation should not throw
      const shepLangData = generateShepLangData(entityResult.entities);
      expect(typeof shepLangData).toBe('string');
    }
  });
});
