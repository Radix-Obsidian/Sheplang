import { AppModel } from './types';

/**
 * Generate TypeScript type definitions for data models
 */
export function generateTypeDefinitions(app: AppModel): string {
  return app.datas.map(data => {
    const fields = data.fields.map(field => {
      let tsType = 'string';
      if (field.type === 'text') tsType = 'string';
      else if (field.type === 'yes/no' || field.type === 'boolean') tsType = 'boolean';
      else if (field.type === 'number') tsType = 'number';
      return `  ${field.name}: ${tsType};`;
    }).join('\n');
    
    return `
export interface ${data.name} {
${fields}
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ${data.name}Input = Omit<${data.name}, 'id' | 'createdAt' | 'updatedAt'>;
`.trim();
  }).join('\n\n');
}

/**
 * Generate action type definitions
 */
export function generateActionTypes(): string {
  return `
export type NavigationAction = { 
  type: 'NAVIGATE'; 
  view: string;
  params?: Record<string, unknown>;
};

export type DataAction = {
  type: 'DATA_OPERATION';
  operation: 'ADD' | 'UPDATE' | 'DELETE';
  entity: string;
  data: Record<string, unknown>;
};

export type AppAction = NavigationAction | DataAction;
`.trim();
}

/**
 * Generate action implementations
 */
export function generateActions(app: AppModel): string {
  return app.actions.map(a => {
    const body = a.ops.map(op => {
      if (op.kind === 'add') {
        const fields = Object.entries(op.fields || {})
          .map(([key, value]) => `      ${key}: ${typeof value === 'string' ? `'${value}'` : value},`)
          .join('\n');
        
        return `
    // Add ${op.data} record
    return {
      type: 'DATA_OPERATION',
      operation: 'ADD',
      entity: '${op.data}',
      data: {
${fields}
      }
    } as const;`;
      }
      
      if (op.kind === 'show') {
        return `
    return { 
      type: 'NAVIGATE', 
      view: '${op.view}' 
    } as const;`;
      }
      
      return `
    // Operation: ${(op.text ?? '').toString()}
    console.warn('Unimplemented operation:', ${JSON.stringify(op)});`;
    }).join('\n');

    const paramSig = (a.params ?? []).map(p => {
      let type = 'string';
      if (p.type === 'yes/no' || p.type === 'boolean') type = 'boolean';
      else if (p.type === 'number') type = 'number';
      return `${p.name}: ${type}`;
    }).join(', ');
    
    return `
export async function ${a.name}(${paramSig}): Promise<AppAction> {${body}
}`;
  }).join('\n\n');
}

/**
 * Generate view utilities
 */
export function generateViews(app: AppModel): string {
  return `
// Application metadata
export const __appName = ${JSON.stringify(app.name)} as const;

// Data models
export const __datas = ${JSON.stringify(app.datas, null, 2)} as const;

// View definitions
export const __views = ${JSON.stringify(app.views, null, 2)} as const;

// View helper functions
${app.views.map(v => `
export function render${v.name}(data?: Record<string, unknown>): string {
  // Template for ${v.name} view
  return \`<div class="view ${v.name.toLowerCase()}">
    <h1>${v.name}</h1>
    ${v.list ? `<div class="list" data-list="${v.list}"></div>` : ''}
    ${(v.buttons || []).map(b => 
      `<button data-action="${b.action}">${b.label}</button>`
    ).join('\n    ')}
  </div>\`;
}
`).join('\n')}
`.trim();
}
