/**
 * Prisma Schema Parser
 * 
 * Parses prisma/schema.prisma files to extract data models
 * and convert them to ShepLang data blocks.
 * 
 * Supports:
 * - Model definitions
 * - Field types and attributes
 * - Enums
 * - Basic relationships (as TODOs)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  relationships: PrismaRelationship[];
}

export interface PrismaField {
  name: string;
  type: string; // Prisma type (String, Int, Boolean, etc.)
  shepType: string; // ShepLang type (text, number, yes/no, etc.)
  required: boolean;
  isArray: boolean;
  isEnum: boolean;
  defaultValue?: string;
}

export interface PrismaRelationship {
  fieldName: string;
  relatedModel: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface PrismaEnum {
  name: string;
  values: string[];
}

export interface PrismaSchema {
  models: PrismaModel[];
  enums: PrismaEnum[];
}

/**
 * Parse a Prisma schema file
 */
export function parsePrismaSchema(schemaPath: string): PrismaSchema | null {
  if (!fs.existsSync(schemaPath)) {
    return null;
  }

  const content = fs.readFileSync(schemaPath, 'utf-8');
  const schema: PrismaSchema = {
    models: [],
    enums: []
  };

  // Extract all models
  const modelMatches = content.matchAll(/model\s+(\w+)\s*\{([^}]+)\}/g);
  for (const match of modelMatches) {
    const modelName = match[1];
    const modelBody = match[2];
    
    const model: PrismaModel = {
      name: modelName,
      fields: [],
      relationships: []
    };

    // Parse fields
    const lines = modelBody.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    for (const line of lines) {
      // Skip special directives
      if (line.startsWith('@@')) continue;

      // Parse field: name Type @attributes
      const fieldMatch = line.match(/^(\w+)\s+(\w+)(\[\])?\??(\s+@.*)?$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const isArray = !!fieldMatch[3];
        const required = !line.includes('?');
        const attributes = fieldMatch[4] || '';

        // Check if it's a relationship
        if (isModelType(fieldType, schema.models)) {
          model.relationships.push({
            fieldName,
            relatedModel: fieldType,
            type: isArray ? 'one-to-many' : 'one-to-one'
          });
        } else {
          // Regular field
          const field: PrismaField = {
            name: fieldName,
            type: fieldType,
            shepType: mapPrismaTypeToShepLang(fieldType),
            required,
            isArray,
            isEnum: schema.enums.some(e => e.name === fieldType),
            defaultValue: extractDefaultValue(attributes)
          };
          model.fields.push(field);
        }
      }
    }

    schema.models.push(model);
  }

  // Extract all enums
  const enumMatches = content.matchAll(/enum\s+(\w+)\s*\{([^}]+)\}/g);
  for (const match of enumMatches) {
    const enumName = match[1];
    const enumBody = match[2];
    
    const values = enumBody
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'));

    schema.enums.push({
      name: enumName,
      values
    });
  }

  return schema;
}

/**
 * Check if a type is a model (relationship) rather than a primitive
 */
function isModelType(type: string, models: PrismaModel[]): boolean {
  // Prisma primitives
  const primitives = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Decimal', 'BigInt', 'Bytes'];
  if (primitives.includes(type)) {
    return false;
  }
  
  // Check if it's a known model
  return models.some(m => m.name === type);
}

/**
 * Map Prisma types to ShepLang types
 */
function mapPrismaTypeToShepLang(prismaType: string): string {
  const typeMap: Record<string, string> = {
    'String': 'text',
    'Int': 'number',
    'Float': 'number',
    'Decimal': 'number',
    'BigInt': 'number',
    'Boolean': 'yes/no',
    'DateTime': 'datetime',
    'Json': 'text', // JSON as text for now
    'Bytes': 'text'
  };

  return typeMap[prismaType] || 'text';
}

/**
 * Extract default value from attributes
 */
function extractDefaultValue(attributes: string): string | undefined {
  const defaultMatch = attributes.match(/@default\(([^)]+)\)/);
  if (defaultMatch) {
    let value = defaultMatch[1].trim();
    
    // Clean up Prisma functions
    if (value === 'now()' || value === 'autoincrement()' || value === 'uuid()') {
      return undefined; // These are handled by backend
    }
    
    // Remove quotes from strings
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    return value;
  }
  return undefined;
}

/**
 * Find Prisma schema in a Next.js project
 */
export function findPrismaSchema(projectRoot: string): string | null {
  // Common locations
  const locations = [
    path.join(projectRoot, 'prisma', 'schema.prisma'),
    path.join(projectRoot, 'prisma.schema'),
    path.join(projectRoot, 'schema.prisma')
  ];

  for (const location of locations) {
    if (fs.existsSync(location)) {
      return location;
    }
  }

  return null;
}

/**
 * Generate ShepLang data blocks from Prisma models
 */
export function generateShepDataBlocks(schema: PrismaSchema): string {
  let output = '';

  // Generate enum types as comments (for reference)
  if (schema.enums.length > 0) {
    output += '# Enums from Prisma schema:\n';
    for (const enum_ of schema.enums) {
      output += `# enum ${enum_.name} { ${enum_.values.join(', ')} }\n`;
    }
    output += '\n';
  }

  // Generate data blocks
  for (const model of schema.models) {
    output += `data ${model.name}:\n`;
    output += `  fields:\n`;

    // Add regular fields
    for (const field of model.fields) {
      const requiredMarker = field.required ? '' : ' # optional';
      const arrayMarker = field.isArray ? ' # array' : '';
      
      if (field.isEnum) {
        output += `    ${field.name}: text # enum ${field.type}${requiredMarker}${arrayMarker}\n`;
      } else {
        output += `    ${field.name}: ${field.shepType}${requiredMarker}${arrayMarker}\n`;
      }
    }

    // Add relationship TODOs
    if (model.relationships.length > 0) {
      output += '\n';
      for (const rel of model.relationships) {
        output += `  # TODO: model relationship ${rel.fieldName} -> ${rel.relatedModel} (${rel.type})\n`;
      }
    }

    output += '\n';
  }

  return output;
}
