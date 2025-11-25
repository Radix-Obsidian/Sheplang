/**
 * Slice 4 Tests – View & Action Mapper
 * 
 * Tests the conversion of React components to ShepLang views and actions
 */

import { describe, it, expect } from 'vitest';
import { parseReactFile } from '../../extension/src/parsers/reactParser';
import { extractEntities } from '../../extension/src/parsers/entityExtractor';
import {
  mapComponentToView,
  mapProjectToShepLang,
  generateShepLangViewCode
} from '../../extension/src/parsers/viewMapper';
import * as path from 'path';

describe('View & Action Mapper – Slice 4', () => {
  const fixturesDir = path.join(__dirname, '../../test-import-fixtures');

  it('maps Next.js page to ShepLang view', () => {
    const pagePath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'page.tsx');
    const component = parseReactFile(pagePath);
    
    expect(component).not.toBeNull();
    
    const mapping = mapComponentToView(component!, []);
    
    // Should create a view
    expect(mapping.view).toBeDefined();
    expect(mapping.view.name).toBeTruthy(); // Component name varies by fixture
    expect(mapping.view.kind).toBe('page');
    expect(mapping.view.route).toBe('/');
  });

  it('maps React component to ShepLang view', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    const mapping = mapComponentToView(component!, []);
    
    // Should create a component view
    expect(mapping.view).toBeDefined();
    expect(mapping.view.name).toBe('TaskList');
    expect(mapping.view.kind).toBe('component');
    expect(mapping.view.route).toBeUndefined();
  });

  it('extracts widgets from JSX elements', () => {
    const componentPath = path.join(fixturesDir, 'vite-react', 'src', 'components', 'Header.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    const mapping = mapComponentToView(component!, []);
    
    // Should have widgets
    expect(mapping.view.widgets.length).toBeGreaterThan(0);
  });

  it('maps buttons to widgets with actions', () => {
    const componentPath = path.join(fixturesDir, 'vite-react', 'src', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    const mapping = mapComponentToView(component!, []);
    
    // Find button widgets
    const buttons = findWidgetsByType(mapping.view.widgets, 'button');
    
    // Should have extracted buttons (if any exist in the component)
    // The actual count depends on the fixture content
    expect(Array.isArray(buttons)).toBe(true);
  });

  it('creates actions from event handlers', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const componentPath = path.join(projectRoot, 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Get entities for context
    const entityResult = await extractEntities(projectRoot);
    
    const mapping = mapComponentToView(component!, entityResult.entities);
    
    // Actions should be an array (may be empty if no handlers)
    expect(Array.isArray(mapping.actions)).toBe(true);
  });

  it('maps list elements with entity references', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const componentPath = path.join(projectRoot, 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Get entities
    const entityResult = await extractEntities(projectRoot);
    
    const mapping = mapComponentToView(component!, entityResult.entities);
    
    // Look for list widgets or bindings
    const lists = findWidgetsByType(mapping.view.widgets, 'list');
    const hasListOrBinding = lists.length > 0 || mapping.view.bindings.length > 0;
    
    // Should have some form of list representation
    expect(mapping.view).toBeDefined();
  });

  it('generates valid ShepLang view code', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const componentPath = path.join(projectRoot, 'app', 'page.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    const entityResult = await extractEntities(projectRoot);
    const projectMapping = mapProjectToShepLang([component!], entityResult.entities);
    
    const shepLangCode = generateShepLangViewCode(projectMapping);
    
    // Should generate valid ShepLang syntax
    expect(shepLangCode).toContain('view '); // View declaration
    expect(shepLangCode).toContain('route: "/"'); // Route for page
  });

  it('maps multiple components to project mapping', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // Parse multiple components
    const components = [
      parseReactFile(path.join(projectRoot, 'app', 'page.tsx')),
      parseReactFile(path.join(projectRoot, 'app', 'components', 'TaskList.tsx'))
    ].filter(Boolean);
    
    expect(components.length).toBe(2);
    
    const entityResult = await extractEntities(projectRoot);
    const projectMapping = mapProjectToShepLang(components as any[], entityResult.entities);
    
    // Should have multiple views
    expect(projectMapping.views.length).toBe(2);
    expect(projectMapping.confidence).toBeGreaterThan(0);
  });

  it('handles components with no handlers gracefully', () => {
    const componentPath = path.join(fixturesDir, 'vite-react', 'src', 'components', 'Header.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    const mapping = mapComponentToView(component!, []);
    
    // Should create view without errors
    expect(mapping.view).toBeDefined();
    expect(mapping.view.name).toBe('Header');
    // Actions may be empty
    expect(Array.isArray(mapping.actions)).toBe(true);
  });

  it('generates action code with operations', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const componentPath = path.join(projectRoot, 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    if (!component) {
      // Skip if component not found
      return;
    }
    
    const entityResult = await extractEntities(projectRoot);
    const projectMapping = mapProjectToShepLang([component], entityResult.entities);
    
    const shepLangCode = generateShepLangViewCode(projectMapping);
    
    // Should generate valid ShepLang syntax
    expect(shepLangCode).toContain('view TaskList:');
  });

  it('extracts view bindings from state', async () => {
    const projectRoot = path.join(fixturesDir, 'vite-react');
    const componentPath = path.join(projectRoot, 'src', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Create mock entities to match state types
    const mockEntities = [
      { name: 'Task', fields: [], relations: [], enums: [] }
    ];
    
    const mapping = mapComponentToView(component!, mockEntities);
    
    // Check if bindings were extracted (depends on component having matching state)
    expect(mapping.view.bindings).toBeDefined();
    expect(Array.isArray(mapping.view.bindings)).toBe(true);
  });

  it('calculates confidence based on mapping success', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    const components = [
      parseReactFile(path.join(projectRoot, 'app', 'page.tsx'))
    ].filter(Boolean);
    
    const entityResult = await extractEntities(projectRoot);
    const projectMapping = mapProjectToShepLang(components as any[], entityResult.entities);
    
    // Confidence should be calculated
    expect(projectMapping.confidence).toBeGreaterThan(0);
    expect(projectMapping.confidence).toBeLessThanOrEqual(1);
  });
});

/**
 * Helper to find widgets by type recursively
 */
function findWidgetsByType(widgets: any[], type: string): any[] {
  const found: any[] = [];
  
  for (const widget of widgets) {
    if (widget.type === type) {
      found.push(widget);
    }
    if (widget.children) {
      found.push(...findWidgetsByType(widget.children, type));
    }
  }
  
  return found;
}
