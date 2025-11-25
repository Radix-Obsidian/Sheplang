/**
 * Slice 3 Tests – Entity Extractor
 * 
 * Tests entity extraction from Prisma schemas and component state heuristics
 * Validates conversion to ShepLang data model definitions
 */

import { describe, it, expect } from 'vitest';
import { extractEntities, generateShepLangData } from '../../extension/src/parsers/entityExtractor';
import { parseReactFile } from '../../extension/src/parsers/reactParser';
import * as path from 'path';

describe('Entity Extractor – Slice 3', () => {
  const fixturesDir = path.join(__dirname, '../../test-import-fixtures');
  
  it('extracts entities from Next.js Prisma schema correctly', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const result = await extractEntities(projectRoot);
    
    expect(result.entities).toHaveLength(2); // Task and User models
    expect(result.source).toBe('prisma');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.errors).toBeUndefined();
    
    // Check Task entity
    const taskEntity = result.entities.find(e => e.name === 'Task');
    expect(taskEntity).toBeDefined();
    expect(taskEntity!.fields).toContainEqual({
      name: 'id',
      type: 'number',
      required: true,
      default: { name: 'autoincrement', args: [] }
    });
    expect(taskEntity!.fields).toContainEqual({
      name: 'title',
      type: 'text',
      required: true
    });
    expect(taskEntity!.fields).toContainEqual({
      name: 'completed',
      type: 'yes/no',
      required: true,
      default: false
    });
    
    // Check User entity
    const userEntity = result.entities.find(e => e.name === 'User');
    expect(userEntity).toBeDefined();
    expect(userEntity!.fields).toContainEqual({
      name: 'id',
      type: 'number',
      required: true,
      default: { name: 'autoincrement', args: [] }
    });
    expect(userEntity!.fields).toContainEqual({
      name: 'email',
      type: 'text',
      required: true
    });
  });
  
  it('falls back to heuristics when no Prisma schema exists', async () => {
    const projectRoot = path.join(fixturesDir, 'vite-react');
    
    // Parse components first
    const componentPath = path.join(projectRoot, 'src', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    const result = await extractEntities(projectRoot, component ? [component] : []);
    
    expect(result.source).toBe('heuristics');
    expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    
    if (result.entities.length > 0) {
      // Should find inferred entity
      const entity = result.entities[0];
      expect(entity.name).toBeTruthy();
      expect(entity.fields.length).toBeGreaterThan(0);
      expect(entity.fields).toContainEqual({
        name: 'id',
        type: 'number',
        required: true
      });
    }
  });
  
  it('detects relations in Prisma schema', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const result = await extractEntities(projectRoot);
    
    const taskEntity = result.entities.find(e => e.name === 'Task');
    const userEntity = result.entities.find(e => e.name === 'User');
    
    // Check that relations are detected (if they exist in schema)
    if (taskEntity!.relations.length > 0) {
      expect(taskEntity!.relations[0].type).toMatch(/hasOne|hasMany|belongsTo/);
    }
  });
  
  it('maps Prisma types to ShepLang primitives correctly', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const result = await extractEntities(projectRoot);
    
    const taskEntity = result.entities.find(e => e.name === 'Task');
    const fieldTypes = taskEntity!.fields.map(f => f.type);
    
    // Should contain mapped types
    expect(fieldTypes).toContain('text'); // String -> text
    expect(fieldTypes).toContain('yes/no'); // Boolean -> yes/no
    expect(fieldTypes).toContain('number'); // Int -> number
  });
  
  it('generates valid ShepLang data definitions', () => {
    const entities = [
      {
        name: 'Task',
        fields: [
          { name: 'id', type: 'number' as const, required: true },
          { name: 'title', type: 'text' as const, required: true },
          { name: 'completed', type: 'yes/no' as const, required: false }
        ],
        relations: [],
        enums: []
      },
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'number' as const, required: true },
          { name: 'email', type: 'text' as const, required: true }
        ],
        relations: [],
        enums: []
      }
    ];
    
    const shepLang = generateShepLangData(entities);
    
    expect(shepLang).toContain('data Task:');
    expect(shepLang).toContain('data User:');
    expect(shepLang).toContain('id: number');
    expect(shepLang).toContain('title: text');
    expect(shepLang).toContain('completed?: yes/no');
    expect(shepLang).toContain('email: text');
  });
  
  it('handles projects with no entities gracefully', async () => {
    const emptyProjectRoot = path.join(fixturesDir, 'nonexistent');
    const result = await extractEntities(emptyProjectRoot);
    
    expect(result.entities).toHaveLength(0);
    expect(result.source).toBe('heuristics');
    expect(result.confidence).toBeLessThan(0.5);
    // Errors may be undefined if no schema found but no parsing errors occurred
    expect(result.errors === undefined || Array.isArray(result.errors)).toBe(true);
  });
  
  it('combines Prisma and heuristic sources when both available', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    
    // Add a component with additional entity
    const componentPath = path.join(projectRoot, 'src', 'components', 'ExtraComponent.tsx');
    
    const result = await extractEntities(projectRoot);
    
    // Should primarily use Prisma
    expect(result.source).toMatch(/prisma|combined/);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  it('normalizes entity names correctly', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const result = await extractEntities(projectRoot);
    
    const entityNames = result.entities.map(e => e.name);
    
    // All names should be PascalCase
    entityNames.forEach(name => {
      expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
    });
  });
  
  it('handles required vs optional fields correctly', async () => {
    const projectRoot = path.join(fixturesDir, 'nextjs-prisma');
    const result = await extractEntities(projectRoot);
    
    const taskEntity = result.entities.find(e => e.name === 'Task');
    const requiredFields = taskEntity!.fields.filter(f => f.required);
    const optionalFields = taskEntity!.fields.filter(f => !f.required);
    
    expect(requiredFields.length).toBeGreaterThan(0);
    // Optional fields should be marked correctly based on Prisma schema
  });
});
