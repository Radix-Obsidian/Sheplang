import type { AppModel } from './types';

/**
 * Generate TypeScript type definitions for data models (Prisma-parity)
 */
export function generateTypeDefinitions(app: AppModel): string {
  let output = '';
  
  // Generate enum types first
  if (app.enums && app.enums.length > 0) {
    for (const e of app.enums) {
      output += `export type ${e.name} = ${e.values.map(v => `'${v}'`).join(' | ')};\n\n`;
    }
  }
  
  // Generate interface for each data model
  output += app.datas.map(data => {
    const fields = data.fields.map(field => {
      let tsType = mapShepTypeToTS(field.type);
      
      // Handle arrays
      if (field.isArray) tsType += '[]';
      
      // Handle optional
      const optional = field.isOptional ? '?' : '';
      
      return `  ${field.name}${optional}: ${tsType};`;
    }).join('\n');
    
    // Find auto-generated fields
    const autoFields: string[] = [];
    for (const f of data.fields) {
      if (f.isId || f.isUpdatedAt || f.defaultFunction === 'now' || f.defaultFunction === 'cuid' || f.defaultFunction === 'uuid') {
        autoFields.push(`'${f.name}'`);
      }
    }
    
    return `
export interface ${data.name} {
${fields}
}

export type ${data.name}Input = Omit<${data.name}, ${autoFields.join(' | ') || "'id'"}>;
`.trim();
  }).join('\n\n');
  
  return output;
}

/**
 * Map ShepLang types to TypeScript types
 */
function mapShepTypeToTS(shepType: string): string {
  // Handle ref types
  if (shepType.startsWith('ref[')) {
    const entity = shepType.match(/ref\[(\w+)\]/)?.[1] || 'unknown';
    return entity;
  }
  
  const typeMap: Record<string, string> = {
    'text': 'string',
    'number': 'number',
    'yes/no': 'boolean',
    'boolean': 'boolean',
    'id': 'string',
    'date': 'Date',
    'datetime': 'Date',
    'email': 'string',
    'money': 'number',
    'decimal': 'number',
    'bigint': 'bigint',
    'image': 'string',
    'richtext': 'string',
    'file': 'string',
    'json': 'Record<string, unknown>',
    'bytes': 'Buffer',
    'uuid': 'string',
    'url': 'string',
    'phone': 'string'
  };
  
  return typeMap[shepType] || shepType; // Return as-is for enums
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
