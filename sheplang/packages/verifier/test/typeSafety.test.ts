import { describe, it, expect } from 'vitest';
import { checkTypeSafety } from '../src/passes/typeSafety.js';
import { parseShep } from '@sheplang/language';

describe('Type Safety Pass', () => {
  it('accepts valid type assignments', async () => {
    const code = `
app TestApp

data User:
  fields:
    name: text
    age: number
  rules:
    - "name required"

action createUser(name: text, age: number):
  add User with name, age
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    // Should only have warnings for missing fields (id, etc) if any
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors).toHaveLength(0);
  });
  
  it('rejects type mismatches in field assignments', async () => {
    const code = `
app TestApp

data User:
  fields:
    name: text
    age: number
  rules:
    - "name required"

action createUser(name: text, age: text):
  add User with name, age
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Type mismatch');
    expect(errors[0].message).toContain('expected number, got text');
  });
  
  it('catches unknown model references', async () => {
    // Parser will throw error for unresolved references
    // This is actually good - it means we catch errors early
    const code = `
app TestApp

action test():
  add NonExistentModel with name="test"
    `;
    
    await expect(parseShep(code)).rejects.toThrow('Could not resolve reference');
  });
  
  it('catches unknown field references', async () => {
    const code = `
app TestApp

data User:
  fields:
    name: text
  rules:
    - "name required"

action createUser():
  add User with name="John", unknownField="value"
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Field \'unknownField\' not found');
  });
  
  it('warns about missing fields', async () => {
    const code = `
app TestApp

data User:
  fields:
    name: text
    emailAddress: text
  rules:
    - "name required"

action createUser():
  add User with name="John"
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    const warnings = diagnostics.filter(d => d.severity === 'warning');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.message.includes('Missing field \'emailAddress\''))).toBe(true);
  });
  
  it('infers literal types correctly', async () => {
    const code = `
app TestApp

data Product:
  fields:
    name: text
    price: number
    inStock: yes/no
  rules:
    - "name required"

action createProduct():
  add Product with name="Widget", price=99, inStock=true
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors).toHaveLength(0);
  });
  
  it('handles parameter type inference', async () => {
    const code = `
app TestApp

data Order:
  fields:
    customerName: text
    amount: number
  rules:
    - "customerName required"

action createOrder(customer: text, total: number):
  add Order with customerName=customer, amount=total
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors).toHaveLength(0);
  });
  
  it('provides helpful suggestions', async () => {
    const code = `
app TestApp

data User:
  fields:
    age: number
  rules:
    - "age required"

action createUser(userAge: text):
  add User with age=userAge
    `;
    
    const { appModel } = await parseShep(code);
    const diagnostics = checkTypeSafety(appModel);
    
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].suggestion).toContain('Ensure userAge is of type number');
  });
});
