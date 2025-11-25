/**
 * Entity Extractor for Slice 3
 * 
 * Extracts ShepLang data models from React projects using:
 * 1. Primary path: Prisma schema parsing via @prisma/internals
 * 2. Fallback path: Component state heuristics from React AST
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDMMF } from '@prisma/internals';
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
 */
function findPrismaSchema(projectRoot: string): string | null {
  const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
  return fs.existsSync(schemaPath) ? schemaPath : null;
}

/**
 * Parse Prisma schema to extract entities
 */
async function parsePrismaSchema(schemaPath: string): Promise<Entity[]> {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  try {
    const dmmf = await getDMMF({ datamodel: schemaContent });
    
    // Check different possible locations for models (Prisma 7.0 compatibility)
    const models = dmmf.models || dmmf.datamodel?.models || [];
    
    const entities: Entity[] = [];

    // Extract models
    for (const model of models) {
      const entity: Entity = {
        name: model.name,
        fields: [],
        relations: [],
        enums: []
      };

      // Extract fields
      if (model.fields && Array.isArray(model.fields)) {
        for (const field of model.fields) {
          // Skip relation fields for now, handle separately
          if (field.kind === 'object') {
            const relation: Entity['relations'][0] = {
              name: field.name,
              target: field.type,
              type: field.isList ? 'hasMany' : 'belongsTo'
            };
            entity.relations.push(relation);
            continue;
          }

          const entityField = {
            name: field.name,
            type: mapPrismaTypeToShepLang(field.type),
            required: field.isRequired || !field.isOptional,
            default: field.default
          };

          entity.fields.push(entityField);
        }
      }

      entities.push(entity);
    }

    return entities;
  } catch (error) {
    throw new Error(`Failed to parse Prisma schema: ${error}`);
  }
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
