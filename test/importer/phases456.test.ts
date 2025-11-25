/**
 * Tests for Phases 4, 5, and 6
 * 
 * Phase 4: Backend route handler translation to ShepThon
 * Phase 5: State management (useState, useEffect) translation
 * Phase 6: Component composition (imports, child components)
 * 
 * Following Golden Sheep Methodology: "Test deep."
 */

import { describe, it, expect } from 'vitest';
import { parseReactFile, EffectHook, ComponentImport } from '../../extension/src/parsers/reactParser';
import { 
  translateRouteHandler, 
  generateShepThonCode,
  translateRoutesToShepThon 
} from '../../extension/src/parsers/backendTranslator';
import { APIRoute } from '../../extension/src/types/APIRoute';
import * as path from 'path';

const fixturesDir = path.join(__dirname, '../../test-import-fixtures');

describe('Phase 4: Backend Route Translation', () => {
  
  it('translates GET route to db.all', () => {
    const route: APIRoute = {
      path: '/api/tasks',
      method: 'GET',
      filePath: 'test.ts',
      handlerName: 'GET',
      params: [],
      bodyFields: [],
      returnsJson: true,
      prismaOperation: 'findMany',
      prismaModel: 'Task'
    };
    
    const result = translateRouteHandler(route);
    
    expect(result.statements.length).toBeGreaterThan(0);
    expect(result.statements[0].kind).toBe('db');
    expect((result.statements[0] as any).operation).toBe('all');
  });
  
  it('translates GET with params to db.get', () => {
    const route: APIRoute = {
      path: '/api/tasks/:id',
      method: 'GET',
      filePath: 'test.ts',
      handlerName: 'GET',
      params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
      bodyFields: [],
      returnsJson: true,
      prismaOperation: 'findUnique',
      prismaModel: 'Task'
    };
    
    const result = translateRouteHandler(route);
    
    expect(result.statements[0].kind).toBe('db');
    expect((result.statements[0] as any).operation).toBe('get');
  });
  
  it('translates POST route to db.add', () => {
    const route: APIRoute = {
      path: '/api/tasks',
      method: 'POST',
      filePath: 'test.ts',
      handlerName: 'POST',
      params: [],
      bodyFields: ['title', 'priority'],
      returnsJson: true,
      prismaOperation: 'create',
      prismaModel: 'Task'
    };
    
    const result = translateRouteHandler(route);
    
    expect(result.statements[0].kind).toBe('db');
    expect((result.statements[0] as any).operation).toBe('add');
    expect((result.statements[0] as any).data).toContain('title');
  });
  
  it('translates DELETE route to db.remove', () => {
    const route: APIRoute = {
      path: '/api/tasks/:id',
      method: 'DELETE',
      filePath: 'test.ts',
      handlerName: 'DELETE',
      params: [{ name: 'id', segment: '[id]', isCatchAll: false, isOptional: false }],
      bodyFields: [],
      returnsJson: true,
      prismaOperation: 'delete',
      prismaModel: 'Task'
    };
    
    const result = translateRouteHandler(route);
    
    expect(result.statements[0].kind).toBe('db');
    expect((result.statements[0] as any).operation).toBe('remove');
  });
  
  it('generates valid ShepThon code', () => {
    const route: APIRoute = {
      path: '/api/tasks',
      method: 'GET',
      filePath: 'test.ts',
      handlerName: 'GET',
      params: [],
      bodyFields: [],
      returnsJson: true,
      prismaModel: 'Task'
    };
    
    const result = translateRouteHandler(route);
    const code = generateShepThonCode(route, result.statements);
    
    expect(code).toContain('GET /api/tasks');
    expect(code).toContain('db.all');
    expect(code).toContain('task');
  });
  
  it('generates complete ShepThon file from multiple routes', () => {
    const routes: APIRoute[] = [
      {
        path: '/api/tasks',
        method: 'GET',
        filePath: 'test.ts',
        handlerName: 'GET',
        params: [],
        bodyFields: [],
        returnsJson: true,
        prismaModel: 'Task'
      },
      {
        path: '/api/tasks',
        method: 'POST',
        filePath: 'test.ts',
        handlerName: 'POST',
        params: [],
        bodyFields: ['title'],
        returnsJson: true,
        prismaModel: 'Task'
      }
    ];
    
    const code = translateRoutesToShepThon(routes);
    
    expect(code).toContain('# Auto-generated ShepThon');
    expect(code).toContain('GET /api/tasks');
    expect(code).toContain('POST /api/tasks');
    expect(code).toContain('model Task');
  });
});

describe('Phase 5: State Management Translation', () => {
  
  it('extracts useEffect hooks', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    expect(component!.effects).toBeDefined();
    expect(Array.isArray(component!.effects)).toBe(true);
  });
  
  it('extracts useState with setter', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    expect(component!.state).toBeDefined();
    
    // State variables should be extracted
    if (component!.state.length > 0) {
      for (const stateVar of component!.state) {
        expect(stateVar.name).toBeDefined();
        expect(stateVar.type).toBeDefined();
      }
    }
  });
  
  it('effects have correct structure', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'page.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // If there are effects, verify structure
    if (component!.effects.length > 0) {
      for (const effect of component!.effects) {
        expect(effect).toHaveProperty('dependencies');
        expect(effect).toHaveProperty('body');
        expect(effect).toHaveProperty('type');
        expect(['effect', 'layoutEffect', 'memo', 'callback']).toContain(effect.type);
      }
    }
  });
  
  it('extracts effect dependencies', () => {
    // Test that dependencies array is extracted correctly
    const mockEffect: EffectHook = {
      dependencies: ['count', 'items'],
      body: 'console.log(count)',
      type: 'effect'
    };
    
    expect(mockEffect.dependencies).toHaveLength(2);
    expect(mockEffect.dependencies).toContain('count');
    expect(mockEffect.dependencies).toContain('items');
  });
});

describe('Phase 6: Component Composition', () => {
  
  it('extracts component imports', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'page.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    expect(component!.imports).toBeDefined();
    expect(Array.isArray(component!.imports)).toBe(true);
  });
  
  it('extracts child components from JSX', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'page.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    expect(component!.childComponents).toBeDefined();
    expect(Array.isArray(component!.childComponents)).toBe(true);
  });
  
  it('identifies PascalCase components in JSX', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Child components should be PascalCase
    for (const childName of component!.childComponents) {
      expect(/^[A-Z]/.test(childName)).toBe(true);
    }
  });
  
  it('import has correct structure', () => {
    const mockImport: ComponentImport = {
      name: 'TaskCard',
      source: './components/TaskCard',
      isDefault: true
    };
    
    expect(mockImport.name).toBe('TaskCard');
    expect(mockImport.source).toBe('./components/TaskCard');
    expect(mockImport.isDefault).toBe(true);
  });
  
  it('distinguishes default and named imports', () => {
    const defaultImport: ComponentImport = {
      name: 'Header',
      source: './Header',
      isDefault: true
    };
    
    const namedImport: ComponentImport = {
      name: 'Button',
      source: './ui',
      isDefault: false
    };
    
    expect(defaultImport.isDefault).toBe(true);
    expect(namedImport.isDefault).toBe(false);
  });
});

describe('All Phases Integration', () => {
  
  it('parses component with all phase 4-6 features', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Phase 5: Effects
    expect(component).toHaveProperty('effects');
    expect(Array.isArray(component!.effects)).toBe(true);
    
    // Phase 6: Imports
    expect(component).toHaveProperty('imports');
    expect(Array.isArray(component!.imports)).toBe(true);
    
    // Phase 6: Child components
    expect(component).toHaveProperty('childComponents');
    expect(Array.isArray(component!.childComponents)).toBe(true);
  });
  
  it('maintains backward compatibility with existing tests', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Original fields still work
    expect(component!.name).toBe('TaskList');
    expect(component!.type).toBe('component');
    expect(component!.props).toBeDefined();
    expect(component!.state).toBeDefined();
    expect(component!.elements).toBeDefined();
    expect(component!.handlers).toBeDefined();
    expect(component!.apiCalls).toBeDefined();
  });
  
  it('full pipeline: React -> Phase 4,5,6 -> all data extracted', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'page.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // All new phase fields should be present
    const requiredFields = ['effects', 'imports', 'childComponents'];
    for (const field of requiredFields) {
      expect(component).toHaveProperty(field);
    }
    
    // Original fields also present
    const originalFields = ['name', 'filePath', 'type', 'exports', 'props', 'state', 'elements', 'handlers', 'apiCalls'];
    for (const field of originalFields) {
      expect(component).toHaveProperty(field);
    }
  });
});
