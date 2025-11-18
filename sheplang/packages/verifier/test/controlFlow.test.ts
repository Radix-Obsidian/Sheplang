import { describe, it, expect } from 'vitest';
import {
  createFlowEnvironment,
  cloneEnvironment,
  getVariableType,
  refineTypes,
  isNonNull,
  mergeEnvironments,
  markAsChecked
} from '../src/solvers/controlFlow.js';

describe('Control Flow Analysis', () => {
  describe('createFlowEnvironment', () => {
    it('creates empty environment', () => {
      const env = createFlowEnvironment();
      expect(env.variables.size).toBe(0);
      expect(env.refined.size).toBe(0);
    });
  });
  
  describe('cloneEnvironment', () => {
    it('creates independent copy', () => {
      const env1 = createFlowEnvironment();
      env1.variables.set('x', { kind: 'text' });
      
      const env2 = cloneEnvironment(env1);
      env2.variables.set('y', { kind: 'number' });
      
      expect(env1.variables.has('y')).toBe(false);
      expect(env2.variables.has('x')).toBe(true);
    });
  });
  
  describe('getVariableType', () => {
    it('returns base type when no refinement', () => {
      const env = createFlowEnvironment();
      env.variables.set('user', { kind: 'model', name: 'User' });
      
      const type = getVariableType('user', env);
      expect(type).toEqual({ kind: 'model', name: 'User' });
    });
    
    it('returns refined type when available', () => {
      const env = createFlowEnvironment();
      env.variables.set('user', { 
        kind: 'nullable', 
        baseType: { kind: 'model', name: 'User' }
      });
      env.refined.set('user', { kind: 'model', name: 'User' });
      
      const type = getVariableType('user', env);
      expect(type).toEqual({ kind: 'model', name: 'User' }); // Non-null!
    });
  });
  
  describe('refineTypes', () => {
    it('refines nullable to non-null on exists check', () => {
      const thenEnv = createFlowEnvironment();
      const elseEnv = createFlowEnvironment();
      
      thenEnv.variables.set('user', {
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      });
      elseEnv.variables = new Map(thenEnv.variables);
      
      refineTypes('user exists', 'user', thenEnv, elseEnv);
      
      // Then branch: user is non-null
      expect(thenEnv.refined.get('user')).toEqual({
        kind: 'model', 
        name: 'User'
      });
      
      // Else branch: no refinement
      expect(elseEnv.refined.has('user')).toBe(false);
    });
    
    it('refines on != null check', () => {
      const thenEnv = createFlowEnvironment();
      const elseEnv = createFlowEnvironment();
      
      thenEnv.variables.set('data', {
        kind: 'nullable',
        baseType: { kind: 'text' }
      });
      elseEnv.variables = new Map(thenEnv.variables);
      
      refineTypes('data != null', 'data', thenEnv, elseEnv);
      
      expect(thenEnv.refined.get('data')).toEqual({ kind: 'text' });
    });
    
    it('refines on == null check', () => {
      const thenEnv = createFlowEnvironment();
      const elseEnv = createFlowEnvironment();
      
      thenEnv.variables.set('value', {
        kind: 'nullable',
        baseType: { kind: 'number' }
      });
      elseEnv.variables = new Map(thenEnv.variables);
      
      refineTypes('value == null', 'value', thenEnv, elseEnv);
      
      // Then branch: value is null
      expect(thenEnv.refined.get('value')).toEqual({ kind: 'null' });
      
      // Else branch: value is non-null
      expect(elseEnv.refined.get('value')).toEqual({ kind: 'number' });
    });
  });
  
  describe('isNonNull', () => {
    it('returns true for non-nullable types', () => {
      const env = createFlowEnvironment();
      env.variables.set('x', { kind: 'text' });
      
      expect(isNonNull('x', env)).toBe(true);
    });
    
    it('returns false for nullable types', () => {
      const env = createFlowEnvironment();
      env.variables.set('y', {
        kind: 'nullable',
        baseType: { kind: 'text' }
      });
      
      expect(isNonNull('y', env)).toBe(false);
    });
    
    it('returns true after refinement', () => {
      const env = createFlowEnvironment();
      env.variables.set('z', {
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      });
      
      // After refinement
      env.refined.set('z', { kind: 'model', name: 'User' });
      
      expect(isNonNull('z', env)).toBe(true);
    });
    
    it('returns false for null type', () => {
      const env = createFlowEnvironment();
      env.variables.set('n', { kind: 'null' });
      
      expect(isNonNull('n', env)).toBe(false);
    });
  });
  
  describe('mergeEnvironments', () => {
    it('keeps refinements that are same in both branches', () => {
      const env1 = createFlowEnvironment();
      const env2 = createFlowEnvironment();
      
      env1.variables.set('x', { kind: 'text' });
      env2.variables.set('x', { kind: 'text' });
      
      env1.refined.set('x', { kind: 'text' });
      env2.refined.set('x', { kind: 'text' });
      
      const merged = mergeEnvironments(env1, env2);
      expect(merged.refined.get('x')).toEqual({ kind: 'text' });
    });
    
    it('drops refinements that differ', () => {
      const env1 = createFlowEnvironment();
      const env2 = createFlowEnvironment();
      
      const nullable = {
        kind: 'nullable' as const,
        baseType: { kind: 'text' as const }
      };
      
      env1.variables.set('y', nullable);
      env2.variables.set('y', nullable);
      
      env1.refined.set('y', { kind: 'text' });
      env2.refined.set('y', { kind: 'null' });
      
      const merged = mergeEnvironments(env1, env2);
      expect(merged.refined.has('y')).toBe(false);
    });
  });
  
  describe('markAsChecked', () => {
    it('refines nullable to non-null', () => {
      const env = createFlowEnvironment();
      env.variables.set('user', {
        kind: 'nullable',
        baseType: { kind: 'model', name: 'User' }
      });
      
      markAsChecked('user', env);
      
      expect(env.refined.get('user')).toEqual({
        kind: 'model',
        name: 'User'
      });
    });
    
    it('does nothing for non-nullable types', () => {
      const env = createFlowEnvironment();
      env.variables.set('text', { kind: 'text' });
      
      markAsChecked('text', env);
      
      expect(env.refined.has('text')).toBe(false);
    });
  });
});
