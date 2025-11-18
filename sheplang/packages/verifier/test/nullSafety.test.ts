import { describe, it, expect } from 'vitest';
import { checkNullSafety } from '../src/passes/nullSafety.js';

describe('Null Safety Pass', () => {
  it('detects potential null pointer from database query', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'email', type: 'text' }
          ],
          rules: []
        }
      ],
      views: [
        { name: 'UserProfile', list: 'User', buttons: [] }
      ],
      actions: [
        {
          name: 'loadUser',
          params: [{ name: 'id', type: 'id' }],
          ops: [
            {
              kind: 'load',
              method: 'GET',
              path: '/users/{id}',
              target: 'user'
            },
            {
              kind: 'show',
              view: 'UserProfile'
            }
          ]
        }
      ]
    };
    
    const diagnostics = checkNullSafety(appModel);
    
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].message).toContain('never checked for null');
    expect(diagnostics[0].type).toBe('null-safety');
  });
  
  it('allows access after null check', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'User',
          fields: [{ name: 'name', type: 'text' }],
          rules: []
        }
      ],
      views: [
        { name: 'UserProfile', list: 'User', buttons: [] }
      ],
      actions: [
        {
          name: 'loadUser',
          params: [{ name: 'id', type: 'id' }],
          ops: [
            {
              kind: 'load',
              method: 'GET',
              path: '/users/{id}',
              target: 'user'
            },
            {
              kind: 'raw',
              text: 'if user exists'
            },
            {
              kind: 'show',
              view: 'UserProfile'
            }
          ]
        }
      ]
    };
    
    const diagnostics = checkNullSafety(appModel);
    
    // Should not have errors after null check
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors).toHaveLength(0);
  });
  
  it('detects nullable assignment to non-nullable field', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'Order',
          fields: [
            { name: 'customerId', type: 'id' }, // Non-nullable
            { name: 'amount', type: 'number' }
          ],
          rules: []
        },
        {
          name: 'Customer',
          fields: [{ name: 'id', type: 'id' }],
          rules: []
        }
      ],
      views: [],
      actions: [
        {
          name: 'createOrder',
          params: [{ name: 'custId', type: 'id' }],
          ops: [
            {
              kind: 'load',
              method: 'GET',
              path: '/customers/{custId}',
              target: 'customer'
            },
            {
              kind: 'add',
              data: 'Order',
              fields: {
                customerId: 'customer', // customer might be null!
                amount: '100'
              }
            }
          ]
        }
      ]
    };
    
    const diagnostics = checkNullSafety(appModel);
    
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Cannot assign nullable value');
  });
  
  it('warns about unchecked nullable variables', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'Product',
          fields: [{ name: 'name', type: 'text' }],
          rules: []
        }
      ],
      views: [],
      actions: [
        {
          name: 'loadProduct',
          params: [{ name: 'id', type: 'id' }],
          ops: [
            {
              kind: 'load',
              method: 'GET',
              path: '/products/{id}',
              target: 'product'
            }
            // No null check, no usage - should warn
          ]
        }
      ]
    };
    
    const diagnostics = checkNullSafety(appModel);
    
    const warnings = diagnostics.filter(d => d.severity === 'warning');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain('never checked for null');
  });
  
  it('handles != null pattern', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'Item',
          fields: [{ name: 'value', type: 'text' }],
          rules: []
        }
      ],
      views: [
        { name: 'ItemView', list: 'Item', buttons: [] }
      ],
      actions: [
        {
          name: 'loadItem',
          params: [],
          ops: [
            {
              kind: 'load',
              method: 'GET',
              path: '/items/latest',
              target: 'item'
            },
            {
              kind: 'raw',
              text: 'if item != null'
            },
            {
              kind: 'show',
              view: 'ItemView'
            }
          ]
        }
      ]
    };
    
    const diagnostics = checkNullSafety(appModel);
    
    // Should not have errors after != null check
    const errors = diagnostics.filter(d => d.severity === 'error');
    expect(errors).toHaveLength(0);
  });
  
  it('provides helpful suggestions', () => {
    const appModel = {
      name: 'TestApp',
      datas: [
        {
          name: 'User',
          fields: [{ name: 'name', type: 'text' }],
          rules: []
        }
      ],
      views: [
        { name: 'UserView', list: 'User', buttons: [] }
      ],
      actions: [
        {
          name: 'showUser',
          params: [],
          ops: [
            {
              kind: 'load',
              method: 'GET',
              path: '/users/current',
              target: 'user'
            },
            {
              kind: 'show',
              view: 'UserView'
            }
          ]
        }
      ]
    };
    
    const diagnostics = checkNullSafety(appModel);
    
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].suggestion).toBeDefined();
    expect(diagnostics[0].suggestion).toContain('Consider adding null check');
  });
});
