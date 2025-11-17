import type { Type } from '../types.js';

/**
 * Check if two types are compatible for assignment.
 * 
 * Rules:
 * - Same primitive types are compatible
 * - Same model types are compatible
 * - nullable types are compatible with their base types
 * - Arrays are compatible if element types match
 * 
 * @param expected - The expected type
 * @param actual - The actual type being assigned
 * @returns true if types are compatible
 */
export function isCompatible(expected: Type, actual: Type): boolean {
  // Exact match
  if (JSON.stringify(expected) === JSON.stringify(actual)) {
    return true;
  }
  
  // Nullable can accept base type
  if (expected.kind === 'nullable') {
    return isCompatible(expected.baseType, actual);
  }
  
  // Base type cannot accept nullable (must check explicitly)
  if (actual.kind === 'nullable') {
    return false;
  }
  
  // Array compatibility
  if (expected.kind === 'array' && actual.kind === 'array') {
    return isCompatible(expected.elementType, actual.elementType);
  }
  
  return false;
}

/**
 * Check if a type is nullable.
 * 
 * @param type - The type to check
 * @returns true if type can be null
 * 
 * @example
 * isNullable({ kind: 'nullable', baseType: { kind: 'model', name: 'User' } }) // true
 * isNullable({ kind: 'model', name: 'User' }) // false
 */
export function isNullable(type: Type): boolean {
  return type.kind === 'nullable';
}

/**
 * Remove null from a nullable type.
 * 
 * @param type - The type to unwrap
 * @returns The base type without null
 * 
 * @example
 * removeNull({ kind: 'nullable', baseType: { kind: 'text' } }) // { kind: 'text' }
 * removeNull({ kind: 'text' }) // { kind: 'text' }
 */
export function removeNull(type: Type): Type {
  if (type.kind === 'nullable') {
    return type.baseType;
  }
  return type;
}

/**
 * Make a type nullable.
 * 
 * @param type - The type to make nullable
 * @returns A nullable version of the type
 * 
 * @example
 * makeNullable({ kind: 'text' }) // { kind: 'nullable', baseType: { kind: 'text' } }
 * makeNullable({ kind: 'nullable', baseType: { kind: 'text' } }) // { kind: 'nullable', baseType: { kind: 'text' } }
 */
export function makeNullable(type: Type): Type {
  if (type.kind === 'nullable') {
    return type;  // Already nullable
  }
  return { kind: 'nullable', baseType: type };
}

/**
 * Format type as human-readable string.
 * 
 * @param type - The type to format
 * @returns Human-readable type string
 * 
 * @example
 * formatType({ kind: 'text' }) // 'text'
 * formatType({ kind: 'model', name: 'User' }) // 'User'
 * formatType({ kind: 'nullable', baseType: { kind: 'text' } }) // 'text | null'
 * formatType({ kind: 'array', elementType: { kind: 'model', name: 'User' } }) // '[User]'
 */
export function formatType(type: Type): string {
  switch (type.kind) {
    case 'text': return 'text';
    case 'number': return 'number';
    case 'yes/no': return 'yes/no';
    case 'datetime': return 'datetime';
    case 'id': return 'id';
    case 'model': return type.name;
    case 'array': return `[${formatType(type.elementType)}]`;
    case 'nullable': return `${formatType(type.baseType)} | null`;
    case 'unknown': return 'unknown';
  }
}
