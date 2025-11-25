/**
 * Entity extraction types for ShepLang data model generation
 * Used by Slice 3 to convert React projects to ShepLang data definitions
 */

export type ShepLangPrimitive = 'text' | 'number' | 'yes/no' | 'date' | 'object';

export interface EntityField {
  name: string;
  type: ShepLangPrimitive;
  required: boolean;
  default?: any;
}

export interface EntityRelation {
  name: string;
  target: string;
  type: 'hasOne' | 'hasMany' | 'belongsTo';
}

export interface Entity {
  name: string;
  fields: EntityField[];
  relations: EntityRelation[];
  enums: string[];
  isEnum?: boolean; // True if this entity represents a Prisma enum
}

export interface EntityExtractionResult {
  entities: Entity[];
  source: 'prisma' | 'heuristics' | 'combined';
  confidence: number;
  errors?: string[];
}

/**
 * Map Prisma scalar types to ShepLang primitives
 */
export function mapPrismaTypeToShepLang(prismaType: string): ShepLangPrimitive {
  switch (prismaType.toLowerCase()) {
    case 'string':
      return 'text';
    case 'boolean':
      return 'yes/no';
    case 'int':
    case 'bigint':
    case 'float':
    case 'decimal':
      return 'number';
    case 'datetime':
    case 'timestamp':
      return 'date';
    case 'json':
    case 'bytes':
      return 'object';
    default:
      return 'text'; // Default fallback
  }
}
