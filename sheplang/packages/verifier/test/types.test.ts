import { describe, it, expect } from 'vitest';
import type { Type } from '../src/types.js';

describe('Type System', () => {
  it('represents primitive types', () => {
    const textType: Type = { kind: 'text' };
    const numberType: Type = { kind: 'number' };
    
    expect(textType.kind).toBe('text');
    expect(numberType.kind).toBe('number');
  });
  
  it('represents model types', () => {
    const userType: Type = { kind: 'model', name: 'User' };
    
    expect(userType.kind).toBe('model');
    expect(userType.name).toBe('User');
  });
  
  it('represents nullable types', () => {
    const nullableUser: Type = {
      kind: 'nullable',
      baseType: { kind: 'model', name: 'User' }
    };
    
    expect(nullableUser.kind).toBe('nullable');
    if (nullableUser.kind === 'nullable') {
      expect(nullableUser.baseType.kind).toBe('model');
    }
  });
  
  it('represents array types', () => {
    const userArray: Type = {
      kind: 'array',
      elementType: { kind: 'model', name: 'User' }
    };
    
    expect(userArray.kind).toBe('array');
    if (userArray.kind === 'array') {
      expect(userArray.elementType.kind).toBe('model');
    }
  });
});
