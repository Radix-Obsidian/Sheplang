/**
 * Integration Tests – AST Importer Slices 0-5
 * 
 * End-to-end testing of the complete importer pipeline
 */

import { describe, it, expect } from 'vitest';
import { generateManifest } from '../../extension/src/services/manifestGenerator';
import { parseReactFile } from '../../extension/src/parsers/reactParser';
import { extractEntities, generateShepLangData } from '../../extension/src/parsers/entityExtractor';
import { mapProjectToShepLang, generateShepLangViewCode } from '../../extension/src/parsers/viewMapper';
import { parseAPIRoutes } from '../../extension/src/parsers/apiRouteParser';
import { correlateAPICalls, FrontendCall } from '../../extension/src/parsers/backendCorrelator';
import { generateShepThonFromRoutes } from '../../extension/src/generators/shepthonRouteGenerator';
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

describe('Integration Tests – Slice 5: API & Backend Correlation', () => {
  const fixturesDir = path.join(__dirname, '../../test-import-fixtures');
  
  it('parses API routes and correlates with frontend calls in Next.js project', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // Parse all API routes
    const routeResult = parseAPIRoutes(projectRoot);
    expect(routeResult.errors).toHaveLength(0);
    expect(routeResult.routes.length).toBeGreaterThanOrEqual(5);
    
    // Verify we have all expected HTTP methods
    const methods = routeResult.routes.map(r => r.method);
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('PUT');
    expect(methods).toContain('DELETE');
    
    // Parse frontend component with API calls
    const componentPath = path.join(projectRoot, 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    expect(component).not.toBeNull();
    
    // Component should have API calls detected
    expect(component!.apiCalls.length).toBeGreaterThan(0);
  });
  
  it('correlates frontend API calls with backend routes', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // Parse API routes
    const routeResult = parseAPIRoutes(projectRoot);
    
    // Create frontend calls matching the TaskList component patterns
    const frontendCalls: FrontendCall[] = [
      { url: '/api/tasks', method: 'GET', sourceComponent: 'TaskList', sourceHandler: 'handleRefresh' },
      { url: '/api/tasks', method: 'POST', sourceComponent: 'TaskList', sourceHandler: 'handleAddTask' },
      { url: '/api/tasks/1', method: 'PUT', sourceComponent: 'TaskList', sourceHandler: 'handleToggleComplete' },
      { url: '/api/tasks/1', method: 'DELETE', sourceComponent: 'TaskList', sourceHandler: 'handleDeleteTask' }
    ];
    
    // Correlate
    const correlation = correlateAPICalls(frontendCalls, routeResult.routes);
    
    // All 4 calls should match
    expect(correlation.matches).toHaveLength(4);
    expect(correlation.unmatchedFrontend).toHaveLength(0);
    expect(correlation.confidence).toBeGreaterThan(0.7);
  });
  
  it('generates ShepThon backend from parsed routes', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // Parse routes
    const routeResult = parseAPIRoutes(projectRoot);
    
    // Extract entities for model generation
    const entityResult = await extractEntities(projectRoot);
    
    // Generate ShepThon
    const shepthon = generateShepThonFromRoutes(routeResult.routes, entityResult.entities);
    
    // Verify output structure
    expect(shepthon.filename).toBe('backend.shepthon');
    expect(shepthon.content).toContain('# Auto-generated ShepThon backend');
    expect(shepthon.content).toContain('model Task {');
    expect(shepthon.content).toContain('GET /api/tasks');
    expect(shepthon.content).toContain('POST /api/tasks');
    expect(shepthon.content).toContain('PUT /api/tasks/:id');
    expect(shepthon.content).toContain('DELETE /api/tasks/:id');
    
    // Verify endpoints mapped correctly
    expect(shepthon.endpoints.length).toBeGreaterThanOrEqual(5);
    expect(shepthon.models).toContain('tasks');
  });
  
  it('complete Slice 5 pipeline from fixture to ShepThon', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // STEP 1: Parse project (Slices 0-2)
    const manifest = await generateManifest(projectRoot);
    expect(manifest.framework.type).toBe('nextjs');
    
    const componentPath = path.join(projectRoot, 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    expect(component).not.toBeNull();
    
    // STEP 2: Extract entities (Slice 3)
    const entityResult = await extractEntities(projectRoot, [component!]);
    expect(entityResult.entities.length).toBeGreaterThan(0);
    
    // STEP 3: Map views/actions (Slice 4)
    const projectMapping = mapProjectToShepLang([component!], entityResult.entities);
    expect(projectMapping.views.length).toBeGreaterThan(0);
    
    // STEP 4: Parse API routes (Slice 5)
    const routeResult = parseAPIRoutes(projectRoot);
    expect(routeResult.routes.length).toBeGreaterThan(0);
    
    // STEP 5: Generate ShepThon (Slice 5)
    const shepthon = generateShepThonFromRoutes(routeResult.routes, entityResult.entities);
    expect(shepthon.content).toBeTruthy();
    
    // Verify complete output
    const shepLangData = generateShepLangData(entityResult.entities);
    const shepLangViews = generateShepLangViewCode(projectMapping);
    
    // All three artifacts should be generated
    expect(shepLangData).toContain('data Task:');
    expect(shepLangViews).toContain('view TaskList:');
    expect(shepthon.content).toContain('GET /api/tasks');
    
    // Combined output represents a complete full-stack app
    console.log('\n=== Complete Full-Stack ShepLang Output ===');
    console.log('\n--- ShepLang Data Models ---');
    console.log(shepLangData.substring(0, 200) + '...');
    console.log('\n--- ShepLang Views ---');
    console.log(shepLangViews.substring(0, 200) + '...');
    console.log('\n--- ShepThon Backend ---');
    console.log(shepthon.content.substring(0, 300) + '...');
  });
});
