/**
 * Entity Extractor for Slice 3
 * 
 * Extracts ShepLang data models from React projects using:
 * 1. Primary path: Prisma schema parsing (pure JS - no WASM required)
 * 2. Fallback path: Component state heuristics from React AST
 * 
 * Note: We use a simple regex-based parser instead of @prisma/internals
 * because the WASM files required by @prisma/internals don't bundle
 * correctly with esbuild for VS Code extensions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Entity, EntityExtractionResult, mapPrismaTypeToShepLang } from '../types/Entity';
import { ReactComponent } from './reactParser';

/**
 * Extract entities from a React project
 */
export async function extractEntities(
  projectRoot: string,
  components: ReactComponent[] = []
): Promise<EntityExtractionResult> {
  const entities: Entity[] = [];
  let source: 'prisma' | 'heuristics' | 'combined' = 'heuristics';
  const errors: string[] = [];

  // Primary path: Try Prisma schema parsing
  const prismaSchemaPath = findPrismaSchema(projectRoot);
  
  if (prismaSchemaPath) {
    try {
      const prismaEntities = await parsePrismaSchema(prismaSchemaPath);
      entities.push(...prismaEntities);
      source = 'prisma';
    } catch (error) {
      errors.push(`Prisma schema parsing failed: ${error}`);
    }
  }

  // Fallback path: Component state heuristics
  if (entities.length === 0) {
    try {
      const heuristicEntities = extractFromComponentState(components);
      entities.push(...heuristicEntities);
      source = 'heuristics';
    } catch (error) {
      errors.push(`Heuristic extraction failed: ${error}`);
    }
  } else if (components.length > 0) {
    // Combined: Add any missing entities from components
    try {
      const heuristicEntities = extractFromComponentState(components);
      const existingNames = new Set(entities.map(e => e.name));
      const missingEntities = heuristicEntities.filter(e => !existingNames.has(e.name));
      
      if (missingEntities.length > 0) {
        entities.push(...missingEntities);
        source = 'combined';
      }
    } catch (error) {
      errors.push(`Combined extraction failed: ${error}`);
    }
  }

  // Calculate confidence based on source and entity count
  let confidence = 0.3; // Base confidence
  if (source === 'prisma') confidence = 0.9;
  else if (source === 'combined') confidence = 0.7;
  else if (entities.length > 0) confidence = 0.5;

  return {
    entities,
    source,
    confidence,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Find Prisma schema file in project
 * Searches multiple common locations
 */
function findPrismaSchema(projectRoot: string): string | null {
  // Common Prisma schema locations
  const searchPaths = [
    path.join(projectRoot, 'prisma', 'schema.prisma'),           // Standard: ./prisma/schema.prisma
    path.join(projectRoot, 'src', 'prisma', 'schema.prisma'),    // Alt: ./src/prisma/schema.prisma
    path.join(projectRoot, 'schema.prisma'),                      // Root: ./schema.prisma
    path.join(projectRoot, 'db', 'schema.prisma'),                // Alt: ./db/schema.prisma
    path.join(projectRoot, 'database', 'schema.prisma'),          // Alt: ./database/schema.prisma
  ];
  
  for (const schemaPath of searchPaths) {
    if (fs.existsSync(schemaPath)) {
      console.log(`[EntityExtractor] Found Prisma schema at: ${schemaPath}`);
      return schemaPath;
    }
  }
  
  // Deep search: recursively find schema.prisma anywhere in project
  const deepSearch = findFileRecursive(projectRoot, 'schema.prisma', 4);
  if (deepSearch) {
    console.log(`[EntityExtractor] Found Prisma schema via deep search: ${deepSearch}`);
    return deepSearch;
  }
  
  console.log('[EntityExtractor] No Prisma schema found');
  return null;
}

/**
 * Recursively search for a file up to maxDepth levels
 */
function findFileRecursive(dir: string, filename: string, maxDepth: number): string | null {
  if (maxDepth <= 0) return null;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isFile() && entry.name === filename) {
        return fullPath;
      }
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const found = findFileRecursive(fullPath, filename, maxDepth - 1);
        if (found) return found;
      }
    }
  } catch (e) {
    // Ignore permission errors
  }
  
  return null;
}

/**
 * Parse Prisma schema to extract entities
 * 
 * Pure JavaScript implementation - no WASM required.
 * Parses Prisma schema syntax using regex patterns.
 */
async function parsePrismaSchema(schemaPath: string): Promise<Entity[]> {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const entities: Entity[] = [];
  
  try {
    // Parse model blocks: model ModelName { ... }
    // Use a more robust approach: find all model declarations
    const models = extractPrismaModels(schemaContent);
    
    for (const { name: modelName, body: modelBody } of models) {
      
      const entity: Entity = {
        name: modelName,
        fields: [],
        relations: [],
        enums: []
      };
      
      // Parse fields within the model body
      const lines = modelBody.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines, comments, and @@ directives
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) {
          continue;
        }
        
        // Parse field: fieldName Type modifiers
        // Examples:
        //   id        Int      @id @default(autoincrement())
        //   name      String
        //   email     String?
        //   posts     Post[]
        //   author    User     @relation(...)
        const fieldRegex = /^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)?$/;
        const fieldMatch = trimmed.match(fieldRegex);
        
        if (fieldMatch) {
          const [, fieldName, fieldType, isArray, isOptional, modifiers = ''] = fieldMatch;
          
          // Check if this is a relation (type is another model, not a Prisma scalar)
          const prismaScalars = ['Int', 'String', 'Boolean', 'DateTime', 'Float', 'Decimal', 'Json', 'BigInt', 'Bytes'];
          const isRelation = !prismaScalars.includes(fieldType);
          
          if (isRelation) {
            // This is a relation field
            entity.relations.push({
              name: fieldName,
              target: fieldType,
              type: isArray ? 'hasMany' : 'belongsTo'
            });
          } else {
            // This is a regular field
            entity.fields.push({
              name: fieldName,
              type: mapPrismaTypeToShepLang(fieldType),
              required: !isOptional,
              default: extractDefaultValue(modifiers)
            });
          }
        }
      }
      
      entities.push(entity);
    }
    
    // Also parse enums
    const enums = extractPrismaEnums(schemaContent);
    
    for (const { name: enumName, values } of enums) {
      // Store enum as a virtual entity
      if (values.length > 0) {
        entities.push({
          name: enumName,
          fields: values.map(v => ({
            name: v,
            type: 'text' as const,
            required: true
          })),
          relations: [],
          enums: values,
          isEnum: true
        });
      }
    }
    
    return entities;
  } catch (error) {
    throw new Error(`Failed to parse Prisma schema: ${error}`);
  }
}

/**
 * Extract all model blocks from Prisma schema using balanced brace matching
 */
function extractPrismaModels(schema: string): Array<{ name: string; body: string }> {
  const models: Array<{ name: string; body: string }> = [];
  const lines = schema.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
    
    if (modelMatch) {
      const modelName = modelMatch[1];
      let braceCount = 1;
      let bodyLines: string[] = [];
      i++;
      
      // Find matching closing brace
      while (i < lines.length && braceCount > 0) {
        const currentLine = lines[i];
        bodyLines.push(currentLine);
        
        // Count braces in this line
        for (const char of currentLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        i++;
      }
      
      // Remove the last line's closing brace
      const body = bodyLines.slice(0, -1).join('\n');
      models.push({ name: modelName, body });
    } else {
      i++;
    }
  }
  
  return models;
}

/**
 * Extract all enum blocks from Prisma schema
 */
function extractPrismaEnums(schema: string): Array<{ name: string; values: string[] }> {
  const enums: Array<{ name: string; values: string[] }> = [];
  const lines = schema.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const enumMatch = line.match(/^enum\s+(\w+)\s*\{/);
    
    if (enumMatch) {
      const enumName = enumMatch[1];
      let braceCount = 1;
      let values: string[] = [];
      i++;
      
      // Find matching closing brace
      while (i < lines.length && braceCount > 0) {
        const currentLine = lines[i].trim();
        
        // Count braces
        for (const char of currentLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        // Add value if it's not empty and not a comment
        if (braceCount > 0 && currentLine && !currentLine.startsWith('//')) {
          values.push(currentLine);
        }
        
        i++;
      }
      
      enums.push({ name: enumName, values });
    } else {
      i++;
    }
  }
  
  return enums;
}

/**
 * Extract default value from Prisma field modifiers
 * FIX: Handle nested parentheses like @default(autoincrement())
 */
function extractDefaultValue(modifiers: string): any {
  // FIX: Use balanced parentheses matching for nested functions like autoincrement()
  const defaultMatch = modifiers.match(/@default\(((?:[^()]+|\([^)]*\))+)\)/);
  if (!defaultMatch) return undefined;
  
  const defaultValue = defaultMatch[1];
  
  // Handle common default functions - return structured objects for functions
  if (defaultValue === 'autoincrement()') {
    return { name: 'autoincrement', args: [] };
  }
  if (defaultValue === 'now()') {
    return { name: 'now', args: [] };
  }
  if (defaultValue === 'uuid()') {
    return { name: 'uuid', args: [] };
  }
  if (defaultValue === 'cuid()') {
    return { name: 'cuid', args: [] };
  }
  if (defaultValue === 'true') return true;
  if (defaultValue === 'false') return false;
  
  // Handle string literals
  const stringMatch = defaultValue.match(/^"([^"]*)"$/);
  if (stringMatch) return stringMatch[1];
  
  // Handle numbers
  const numValue = parseFloat(defaultValue);
  if (!isNaN(numValue)) return numValue;
  
  return defaultValue;
}

/**
 * Extract entities from component state using heuristics
 */
function extractFromComponentState(components: ReactComponent[]): Entity[] {
  const entities: Entity[] = [];
  const entityNames = new Set<string>();

  for (const component of components) {
    // Look for useState<Type[]> patterns
    for (const state of component.state) {
      const arrayMatch = state.type.match(/(\w+)\[\]/);
      if (arrayMatch) {
        const entityName = arrayMatch[1];
        if (!entityNames.has(entityName)) {
          entityNames.add(entityName);
          const entity = inferEntityFromComponent(component, entityName);
          if (entity) {
            entities.push(entity);
          }
        }
      }
    }
  }

  return entities;
}

/**
 * Infer entity structure from component TypeScript interfaces
 */
function inferEntityFromComponent(component: ReactComponent, entityName: string): Entity | null {
  // This is a simplified heuristic implementation
  // In future slices, we'd use TypeScript Compiler API to parse interfaces
  
  // For now, create a basic entity based on common patterns
  const entity: Entity = {
    name: entityName,
    fields: [],
    relations: [],
    enums: []
  };

  // Common fields for typical entities (heuristic)
  const commonFields: { [key: string]: { type: string, required: boolean } } = {
    id: { type: 'number', required: true },
    title: { type: 'text', required: true },
    name: { type: 'text', required: true },
    description: { type: 'text', required: false },
    completed: { type: 'yes/no', required: false },
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: false }
  };

  // Look for field usage in JSX to infer structure
  const usedFields = new Set<string>();
  
  for (const element of component.elements) {
    // Look for property access patterns like {task.title}
    // This is simplified - in future slices we'd parse the actual JSX expressions
    if (element.type === 'div' || element.type === 'li') {
      // Common patterns suggest certain fields
      if (component.filePath.includes('Task') || component.filePath.includes('Todo')) {
        usedFields.add('id');
        usedFields.add('title');
        usedFields.add('completed');
      }
      if (component.filePath.includes('User')) {
        usedFields.add('id');
        usedFields.add('name');
        usedFields.add('email');
      }
    }
  }

  // Add inferred fields
  for (const fieldName of usedFields) {
    const fieldInfo = commonFields[fieldName];
    if (fieldInfo) {
      entity.fields.push({
        name: fieldName,
        type: fieldInfo.type as any,
        required: fieldInfo.required
      });
    }
  }

  // If no fields inferred, add basic fields
  if (entity.fields.length === 0) {
    entity.fields.push(
      { name: 'id', type: 'number', required: true },
      { name: 'title', type: 'text', required: true }
    );
  }

  return entity;
}

/**
 * Generate ShepLang data definitions from entities
 */
export function generateShepLangData(entities: Entity[]): string {
  const definitions: string[] = [];

  for (const entity of entities) {
    let definition = `data ${entity.name}:\n  fields:\n`;
    
    for (const field of entity.fields) {
      const requiredStr = field.required ? '' : '?';
      definition += `    ${field.name}${requiredStr}: ${field.type}\n`;
    }

    if (entity.relations.length > 0) {
      definition += `  relations:\n`;
      for (const relation of entity.relations) {
        definition += `    ${relation.name}: ${relation.target} (${relation.type})\n`;
      }
    }

    definitions.push(definition);
  }

  return definitions.join('\n');
}
