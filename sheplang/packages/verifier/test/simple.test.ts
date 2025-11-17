import { describe, it, expect } from 'vitest';
import { verify } from '../src/index.js';

describe('Simple Verification Tests', () => {
  it('verifies basic type safety without parsing', () => {
    // Manually construct AppModel to bypass parser issues
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'age', type: 'number' }
          ],
          rules: []
        }
      ],
      views: [],
      actions: [
        {
          name: 'createUser',
          params: [
            { name: 'userName', type: 'text' },
            { name: 'userAge', type: 'number' }
          ],
          ops: [
            {
              kind: 'add',
              data: 'User',
              fields: {
                name: 'userName',
                age: 'userAge'
              }
            }
          ]
        }
      ]
    };
    
    const result = verify(appModel);
    
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.confidenceScore).toBeGreaterThanOrEqual(90);
  });
  
  it('catches type mismatches without parsing', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'User',
          fields: [
            { name: 'age', type: 'number' }
          ],
          rules: []
        }
      ],
      views: [],
      actions: [
        {
          name: 'createUser',
          params: [
            { name: 'userAge', type: 'text' }
          ],
          ops: [
            {
              kind: 'add',
              data: 'User',
              fields: {
                age: 'userAge'  // text being assigned to number field
              }
            }
          ]
        }
      ]
    };
    
    const result = verify(appModel);
    
    expect(result.passed).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Type mismatch');
  });
  
  it('warns about missing fields', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'Product',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'price', type: 'number' }
          ],
          rules: []
        }
      ],
      views: [],
      actions: [
        {
          name: 'addProduct',
          params: [],
          ops: [
            {
              kind: 'add',
              data: 'Product',
              fields: {
                name: '"Widget"'
                // Missing price field
              }
            }
          ]
        }
      ]
    };
    
    const result = verify(appModel);
    
    // Should pass but with warnings
    expect(result.passed).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('Missing field'))).toBe(true);
  });
  
  it('handles literal type inference', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'Todo',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'done', type: 'yes/no' },
            { name: 'priority', type: 'number' }
          ],
          rules: []
        }
      ],
      views: [],
      actions: [
        {
          name: 'addTodo',
          params: [],
          ops: [
            {
              kind: 'add',
              data: 'Todo',
              fields: {
                title: '"Buy milk"',
                done: 'false',
                priority: '1'
              }
            }
          ]
        }
      ]
    };
    
    const result = verify(appModel);
    
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
