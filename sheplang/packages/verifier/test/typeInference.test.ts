import { describe, it, expect } from 'vitest';
import { 
  parseTypeString,
  inferFieldValueType, 
  buildTypeEnvironment,
  getModelFieldType,
  inferLoadReturnType,
  inferListReturnType
} from '../src/solvers/typeInference.js';
import type { TypeEnvironment } from '../src/types.js';
import type { AppModel } from '@sheplang/language';

describe('Type Inference', () => {
  describe('parseTypeString', () => {
    it('parses primitive types', () => {
      expect(parseTypeString('text')).toEqual({ kind: 'text' });
      expect(parseTypeString('string')).toEqual({ kind: 'text' });
      expect(parseTypeString('number')).toEqual({ kind: 'number' });
      expect(parseTypeString('yes/no')).toEqual({ kind: 'yes/no' });
      expect(parseTypeString('bool')).toEqual({ kind: 'yes/no' });
      expect(parseTypeString('boolean')).toEqual({ kind: 'yes/no' });
      expect(parseTypeString('datetime')).toEqual({ kind: 'datetime' });
      expect(parseTypeString('id')).toEqual({ kind: 'id' });
    });
    
    it('parses model types', () => {
      expect(parseTypeString('User')).toEqual({ 
        kind: 'model', 
        name: 'User' 
      });
      expect(parseTypeString('Product')).toEqual({ 
        kind: 'model', 
        name: 'Product' 
      });
      expect(parseTypeString('MyCustomModel')).toEqual({ 
        kind: 'model', 
        name: 'MyCustomModel' 
      });
    });
    
    it('handles undefined input', () => {
      expect(parseTypeString(undefined)).toEqual({ kind: 'unknown' });
    });
  });
  
  describe('inferFieldValueType', () => {
    const emptyEnv: TypeEnvironment = { variables: new Map() };
    
    it('infers boolean literals', () => {
      expect(inferFieldValueType('true', emptyEnv)).toEqual({ kind: 'yes/no' });
      expect(inferFieldValueType('false', emptyEnv)).toEqual({ kind: 'yes/no' });
    });
    
    it('infers number literals', () => {
      expect(inferFieldValueType('123', emptyEnv)).toEqual({ kind: 'number' });
      expect(inferFieldValueType('45.67', emptyEnv)).toEqual({ kind: 'number' });
      expect(inferFieldValueType('-123', emptyEnv)).toEqual({ kind: 'number' });
      expect(inferFieldValueType('-45.67', emptyEnv)).toEqual({ kind: 'number' });
      expect(inferFieldValueType('0', emptyEnv)).toEqual({ kind: 'number' });
    });
    
    it('infers datetime literals', () => {
      expect(inferFieldValueType('2024-01-15', emptyEnv)).toEqual({ kind: 'datetime' });
      expect(inferFieldValueType('2024-01-15T10:30:00', emptyEnv)).toEqual({ kind: 'datetime' });
    });
    
    it('infers text literals', () => {
      expect(inferFieldValueType('hello', emptyEnv)).toEqual({ kind: 'text' });
      expect(inferFieldValueType('user@example.com', emptyEnv)).toEqual({ kind: 'text' });
      expect(inferFieldValueType('123abc', emptyEnv)).toEqual({ kind: 'text' });
      expect(inferFieldValueType('', emptyEnv)).toEqual({ kind: 'text' });
    });
    
    it('looks up variable types from environment', () => {
      const env: TypeEnvironment = { 
        variables: new Map([
          ['userName', { kind: 'text' }],
          ['userId', { kind: 'id' }],
          ['age', { kind: 'number' }],
          ['isActive', { kind: 'yes/no' }]
        ])
      };
      
      expect(inferFieldValueType('userName', env)).toEqual({ kind: 'text' });
      expect(inferFieldValueType('userId', env)).toEqual({ kind: 'id' });
      expect(inferFieldValueType('age', env)).toEqual({ kind: 'number' });
      expect(inferFieldValueType('isActive', env)).toEqual({ kind: 'yes/no' });
    });
    
    it('prefers variable lookup over literal inference', () => {
      const env: TypeEnvironment = { 
        variables: new Map([
          ['true', { kind: 'text' }], // Variable named 'true'
          ['123', { kind: 'id' }]     // Variable named '123'
        ])
      };
      
      expect(inferFieldValueType('true', env)).toEqual({ kind: 'text' });
      expect(inferFieldValueType('123', env)).toEqual({ kind: 'id' });
    });
  });
  
  describe('buildTypeEnvironment', () => {
    it('builds environment from parameters', () => {
      const params = [
        { name: 'name', type: 'text' },
        { name: 'age', type: 'number' },
        { name: 'userId', type: 'id' }
      ];
      
      const env = buildTypeEnvironment(params);
      
      expect(env.variables.get('name')).toEqual({ kind: 'text' });
      expect(env.variables.get('age')).toEqual({ kind: 'number' });
      expect(env.variables.get('userId')).toEqual({ kind: 'id' });
    });
    
    it('handles parameters with undefined types', () => {
      const params = [
        { name: 'unknown1' },
        { name: 'unknown2', type: undefined }
      ];
      
      const env = buildTypeEnvironment(params);
      
      expect(env.variables.get('unknown1')).toEqual({ kind: 'unknown' });
      expect(env.variables.get('unknown2')).toEqual({ kind: 'unknown' });
    });
    
    it('handles empty parameter list', () => {
      const env = buildTypeEnvironment([]);
      
      expect(env.variables.size).toBe(0);
    });
    
    it('handles model type parameters', () => {
      const params = [
        { name: 'user', type: 'User' },
        { name: 'product', type: 'Product' }
      ];
      
      const env = buildTypeEnvironment(params);
      
      expect(env.variables.get('user')).toEqual({ kind: 'model', name: 'User' });
      expect(env.variables.get('product')).toEqual({ kind: 'model', name: 'Product' });
    });
  });
  
  describe('getModelFieldType', () => {
    const testAppModel: AppModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'User',
          fields: [
            { name: 'id', type: 'id' },
            { name: 'name', type: 'text' },
            { name: 'age', type: 'number' },
            { name: 'isActive', type: 'yes/no' }
          ],
          rules: []
        },
        {
          name: 'Product',
          fields: [
            { name: 'id', type: 'id' },
            { name: 'title', type: 'text' },
            { name: 'price', type: 'number' }
          ],
          rules: []
        }
      ],
      views: [],
      actions: []
    };
    
    it('finds field types in models', () => {
      expect(getModelFieldType('User', 'name', testAppModel))
        .toEqual({ kind: 'text' });
      expect(getModelFieldType('User', 'age', testAppModel))
        .toEqual({ kind: 'number' });
      expect(getModelFieldType('User', 'isActive', testAppModel))
        .toEqual({ kind: 'yes/no' });
      expect(getModelFieldType('Product', 'price', testAppModel))
        .toEqual({ kind: 'number' });
    });
    
    it('returns null for non-existent fields', () => {
      expect(getModelFieldType('User', 'nonexistent', testAppModel))
        .toBeNull();
      expect(getModelFieldType('Product', 'nonexistent', testAppModel))
        .toBeNull();
    });
    
    it('returns null for non-existent models', () => {
      expect(getModelFieldType('NonExistent', 'name', testAppModel))
        .toBeNull();
    });
  });
  
  describe('inferLoadReturnType', () => {
    it('returns nullable model type for load operations', () => {
      expect(inferLoadReturnType('User')).toEqual({
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      });
      
      expect(inferLoadReturnType('Product')).toEqual({
        kind: 'nullable',
        baseType: { kind: 'model', name: 'Product' }
      });
    });
  });
  
  describe('inferListReturnType', () => {
    it('returns array type for list operations', () => {
      expect(inferListReturnType('User')).toEqual({
        kind: 'array',
        elementType: { kind: 'model', name: 'User' }
      });
      
      expect(inferListReturnType('Product')).toEqual({
        kind: 'array',
        elementType: { kind: 'model', name: 'Product' }
      });
    });
  });
});
