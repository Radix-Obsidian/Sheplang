import type { Type, TypeEnvironment } from '../types.js';
import type { AppModel } from '@sheplang/language';

/**
 * Parse ShepLang type string to Type object.
 * 
 * @param typeStr - Type string from AST
 * @returns Parsed Type object
 * 
 * @example
 * parseTypeString('text') // { kind: 'text' }
 * parseTypeString('number') // { kind: 'number' }
 * parseTypeString('User') // { kind: 'model', name: 'User' }
 */
export function parseTypeString(typeStr: string | undefined): Type {
  if (!typeStr) {
    return { kind: 'unknown' };
  }
  
  switch (typeStr) {
    case 'text':
    case 'string':
      return { kind: 'text' };
    case 'number':
      return { kind: 'number' };
    case 'yes/no':
    case 'bool':
    case 'boolean':
      return { kind: 'yes/no' };
    case 'datetime':
      return { kind: 'datetime' };
    case 'id':
      return { kind: 'id' };
    default:
      // Assume it's a model type
      return { kind: 'model', name: typeStr };
  }
}

/**
 * Infer the type of a field value expression.
 * 
 * In ShepLang, field values are either:
 * - String literals (from op.fields values)
 * - Parameter references (from action params)
 * 
 * @param value - The value to infer type from
 * @param env - Type environment with variable types
 * @returns Inferred Type
 * 
 * @example
 * inferFieldValueType('123', env) // { kind: 'number' }
 * inferFieldValueType('true', env) // { kind: 'yes/no' }
 * inferFieldValueType('hello', env) // { kind: 'text' }
 * inferFieldValueType('userName', envWithUserName) // looks up from env
 */
export function inferFieldValueType(
  value: string,
  env: TypeEnvironment
): Type {
  // Check if it's a variable reference
  const varType = env.variables.get(value);
  if (varType) {
    return varType;
  }
  
  // Try to infer from literal value
  if (value === 'true' || value === 'false') {
    return { kind: 'yes/no' };
  }
  
  // Check if it's a number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return { kind: 'number' };
  }
  
  // Check if it's a datetime (ISO format)
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value)) {
    return { kind: 'datetime' };
  }
  
  // Default to text (string literal)
  return { kind: 'text' };
}

/**
 * Build type environment from action parameters.
 * 
 * @param params - Action parameters from AST
 * @returns TypeEnvironment with parameter types
 * 
 * @example
 * buildTypeEnvironment([
 *   { name: 'name', type: 'text' },
 *   { name: 'age', type: 'number' }
 * ])
 * // Returns env with name: text, age: number
 */
export function buildTypeEnvironment(
  params: Array<{ name: string; type?: string }>
): TypeEnvironment {
  const variables = new Map<string, Type>();
  
  for (const param of params) {
    const type = parseTypeString(param.type);
    variables.set(param.name, type);
  }
  
  return { variables };
}

/**
 * Get the type of a model field.
 * 
 * @param modelName - Name of the model
 * @param fieldName - Name of the field
 * @param appModel - Parsed application model
 * @returns Type of the field or null if not found
 * 
 * @example
 * getModelFieldType('User', 'name', appModel) // { kind: 'text' }
 * getModelFieldType('User', 'age', appModel) // { kind: 'number' }
 * getModelFieldType('User', 'nonexistent', appModel) // null
 */
export function getModelFieldType(
  modelName: string,
  fieldName: string,
  appModel: AppModel
): Type | null {
  const model = appModel.datas.find(d => d.name === modelName);
  if (!model) {
    return null;
  }
  
  const field = model.fields.find(f => f.name === fieldName);
  if (!field) {
    return null;
  }
  
  return parseTypeString(field.type);
}

/**
 * Infer return type of a load operation.
 * 
 * Load operations in ShepLang always return nullable types
 * because the item might not exist in the database.
 * 
 * @param modelName - Name of the model being loaded
 * @returns Nullable model type
 * 
 * @example
 * inferLoadReturnType('User') // { kind: 'nullable', baseType: { kind: 'model', name: 'User' } }
 */
export function inferLoadReturnType(modelName: string): Type {
  return {
    kind: 'nullable',
    baseType: { kind: 'model', name: modelName }
  };
}

/**
 * Infer return type of a list operation.
 * 
 * List operations return arrays of models.
 * 
 * @param modelName - Name of the model being listed
 * @returns Array type
 * 
 * @example
 * inferListReturnType('User') // { kind: 'array', elementType: { kind: 'model', name: 'User' } }
 */
export function inferListReturnType(modelName: string): Type {
  return {
    kind: 'array',
    elementType: { kind: 'model', name: modelName }
  };
}
