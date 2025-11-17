import { describe, it, expect } from 'vitest';
import { 
  isCompatible, 
  isNullable, 
  removeNull, 
  makeNullable, 
  formatType 
} from '../src/utils/typeUtils.js';
import type { Type } from '../src/types.js';

describe('Type Utilities', () => {
  describe('isCompatible', () => {
    it('accepts exact primitive type matches', () => {
      const textType: Type = { kind: 'text' };
      const numberType: Type = { kind: 'number' };
      
      expect(isCompatible(textType, textType)).toBe(true);
      expect(isCompatible(numberType, numberType)).toBe(true);
    });
    
    it('rejects mismatched primitive types', () => {
      const textType: Type = { kind: 'text' };
      const numberType: Type = { kind: 'number' };
      
      expect(isCompatible(textType, numberType)).toBe(false);
      expect(isCompatible(numberType, textType)).toBe(false);
    });
    
    it('accepts exact model type matches', () => {
      const userType: Type = { kind: 'model', name: 'User' };
      const userType2: Type = { kind: 'model', name: 'User' };
      
      expect(isCompatible(userType, userType2)).toBe(true);
    });
    
    it('rejects different model types', () => {
      const userType: Type = { kind: 'model', name: 'User' };
      const productType: Type = { kind: 'model', name: 'Product' };
      
      expect(isCompatible(userType, productType)).toBe(false);
    });
    
    it('allows base type to be assigned to nullable', () => {
      const nullableUser: Type = {
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      };
      const userType: Type = { kind: 'model', name: 'User' };
      
      expect(isCompatible(nullableUser, userType)).toBe(true);
    });
    
    it('rejects nullable assigned to base type', () => {
      const userType: Type = { kind: 'model', name: 'User' };
      const nullableUser: Type = {
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      };
      
      expect(isCompatible(userType, nullableUser)).toBe(false);
    });
    
    it('accepts compatible array types', () => {
      const userArray1: Type = {
        kind: 'array',
        elementType: { kind: 'model', name: 'User' }
      };
      const userArray2: Type = {
        kind: 'array',
        elementType: { kind: 'model', name: 'User' }
      };
      
      expect(isCompatible(userArray1, userArray2)).toBe(true);
    });
    
    it('rejects incompatible array element types', () => {
      const userArray: Type = {
        kind: 'array',
        elementType: { kind: 'model', name: 'User' }
      };
      const productArray: Type = {
        kind: 'array',
        elementType: { kind: 'model', name: 'Product' }
      };
      
      expect(isCompatible(userArray, productArray)).toBe(false);
    });
  });
  
  describe('isNullable', () => {
    it('returns true for nullable types', () => {
      const nullableUser: Type = {
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      };
      
      expect(isNullable(nullableUser)).toBe(true);
    });
    
    it('returns false for non-nullable types', () => {
      const textType: Type = { kind: 'text' };
      const userType: Type = { kind: 'model', name: 'User' };
      const arrayType: Type = {
        kind: 'array',
        elementType: { kind: 'text' }
      };
      
      expect(isNullable(textType)).toBe(false);
      expect(isNullable(userType)).toBe(false);
      expect(isNullable(arrayType)).toBe(false);
    });
  });
  
  describe('removeNull', () => {
    it('unwraps nullable types', () => {
      const nullableText: Type = {
        kind: 'nullable',
        baseType: { kind: 'text' }
      };
      
      const result = removeNull(nullableText);
      
      expect(result).toEqual({ kind: 'text' });
    });
    
    it('returns non-nullable types unchanged', () => {
      const textType: Type = { kind: 'text' };
      const userType: Type = { kind: 'model', name: 'User' };
      
      expect(removeNull(textType)).toEqual(textType);
      expect(removeNull(userType)).toEqual(userType);
    });
  });
  
  describe('makeNullable', () => {
    it('wraps non-nullable types', () => {
      const textType: Type = { kind: 'text' };
      
      const result = makeNullable(textType);
      
      expect(result).toEqual({
        kind: 'nullable',
        baseType: { kind: 'text' }
      });
    });
    
    it('returns nullable types unchanged', () => {
      const nullableText: Type = {
        kind: 'nullable',
        baseType: { kind: 'text' }
      };
      
      const result = makeNullable(nullableText);
      
      expect(result).toEqual(nullableText);
    });
  });
  
  describe('formatType', () => {
    it('formats primitive types', () => {
      expect(formatType({ kind: 'text' })).toBe('text');
      expect(formatType({ kind: 'number' })).toBe('number');
      expect(formatType({ kind: 'yes/no' })).toBe('yes/no');
      expect(formatType({ kind: 'datetime' })).toBe('datetime');
      expect(formatType({ kind: 'id' })).toBe('id');
    });
    
    it('formats model types', () => {
      const userType: Type = { kind: 'model', name: 'User' };
      
      expect(formatType(userType)).toBe('User');
    });
    
    it('formats nullable types', () => {
      const nullableText: Type = {
        kind: 'nullable',
        baseType: { kind: 'text' }
      };
      
      expect(formatType(nullableText)).toBe('text | null');
    });
    
    it('formats array types', () => {
      const userArray: Type = {
        kind: 'array',
        elementType: { kind: 'model', name: 'User' }
      };
      
      expect(formatType(userArray)).toBe('[User]');
    });
    
    it('formats nested nullable arrays', () => {
      const nullableUserArray: Type = {
        kind: 'nullable',
        baseType: {
          kind: 'array',
          elementType: { kind: 'model', name: 'User' }
        }
      };
      
      expect(formatType(nullableUserArray)).toBe('[User] | null');
    });
    
    it('formats unknown types', () => {
      const unknownType: Type = { kind: 'unknown' };
      
      expect(formatType(unknownType)).toBe('unknown');
    });
  });
});
