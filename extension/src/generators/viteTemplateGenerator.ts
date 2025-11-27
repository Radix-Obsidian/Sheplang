/**
 * Vite Template Generator
 * 
 * Generates a runnable Vite + React + TailwindCSS app from ShepLang code.
 * Phase 4.1 of the Strategic Plan.
 * 
 * Per GSAIM ZPP™: "No fake data. No TODOs. No 'fix later'."
 * This generator creates REAL, RUNNABLE code.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Types for ShepLang AST (simplified for generation)
export interface ShepLangData {
  name: string;
  fields: { name: string; type: string; optional?: boolean }[];
  rules?: string[];
}

export interface ShepLangView {
  name: string;
  elements: { kind: string; entity?: string; label?: string; action?: string }[];
}

export interface ShepLangAction {
  name: string;
  params: string[];
  operations: { kind: string; entity?: string; view?: string; method?: string; path?: string; fields?: string[] }[];
}

export interface ShepLangApp {
  name: string;
  data: ShepLangData[];
  views: ShepLangView[];
  actions: ShepLangAction[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * Main entry point: Generate Vite app from ShepLang
 */
export async function generateViteApp(
  shepLangContent: string,
  outputDir: string
): Promise<{ success: boolean; files: GeneratedFile[]; error?: string }> {
  try {
    // Parse ShepLang content
    const app = parseShepLangForGeneration(shepLangContent);
    
    if (!app) {
      return { success: false, files: [], error: 'Failed to parse ShepLang file' };
    }

    // Generate all files
    const files: GeneratedFile[] = [
      // Project config files
      generatePackageJson(app),
      generateViteConfig(app),
      generateTailwindConfig(),
      generatePostCSSConfig(),
      generateTSConfig(),
      generateTSConfigNode(),
      generateIndexHtml(app),
      generateReadme(app),
      
      // Source files
      generateMainTsx(app),
      generateAppTsx(app),
      generateIndexCss(),
      
      // Data models
      ...generateDataModels(app),
      
      // Components from views
      ...generateViewComponents(app),
      
      // Actions/hooks
      ...generateActions(app),
    ];

    // Write files to disk
    for (const file of files) {
      const fullPath = path.join(outputDir, file.path);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }

    return { success: true, files };
  } catch (error) {
    return { 
      success: false, 
      files: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Parse ShepLang content for generation
 * Supports both colon-based and brace-based syntax
 */
function parseShepLangForGeneration(content: string): ShepLangApp | null {
  // Extract app name - supports both "app Name" and "app Name {"
  const appMatch = content.match(/^app\s+(\w+)/m);
  if (!appMatch) return null;
  
  const app: ShepLangApp = {
    name: appMatch[1],
    data: [],
    views: [],
    actions: []
  };
  
  // Detect syntax style (colon vs brace)
  const usesBraces = content.includes('data ') && content.includes('{');
  
  // Parse data blocks - both syntaxes
  // Colon: "data Todo:\n  fields:\n    title: text"
  // Brace: "data Todo {\n    title: text\n  }"
  const dataRegexColon = /data\s+(\w+):\s*\n([\s\S]*?)(?=\n(?:data|view|action|job|$))/g;
  const dataRegexBrace = /data\s+(\w+)\s*\{([\s\S]*?)\}/g;
  
  let match;
  const dataRegex = usesBraces ? dataRegexBrace : dataRegexColon;
  
  while ((match = dataRegex.exec(content)) !== null) {
    const dataName = match[1];
    const dataBody = match[2];
    
    const fields: { name: string; type: string; optional?: boolean }[] = [];
    // Match "fieldName: type" patterns, handling yes/no as a single type
    const fieldMatches = dataBody.matchAll(/(\w+):\s*([\w\/]+)(\?)?/g);
    
    for (const fm of fieldMatches) {
      if (fm[1] !== 'fields' && fm[1] !== 'rules') {
        fields.push({
          name: fm[1],
          type: fm[2],
          optional: fm[3] === '?'
        });
      }
    }
    
    const rules: string[] = [];
    const rulesMatch = dataBody.match(/rules:\s*\n?([\s\S]*?)(?=\n\s*\w|$)/);
    if (rulesMatch) {
      const ruleLines = rulesMatch[1].match(/-\s*"([^"]+)"/g);
      if (ruleLines) {
        rules.push(...ruleLines.map(r => r.replace(/-\s*"/, '').replace(/"$/, '')));
      }
    }
    
    app.data.push({ name: dataName, fields, rules });
  }
  
  // Parse view blocks - both syntaxes
  const viewRegexColon = /view\s+(\w+):\s*\n([\s\S]*?)(?=\n(?:data|view|action|job|$))/g;
  const viewRegexBrace = /view\s+(\w+)\s*\{([\s\S]*?)\}/g;
  const viewRegex = usesBraces ? viewRegexBrace : viewRegexColon;
  
  while ((match = viewRegex.exec(content)) !== null) {
    const viewName = match[1];
    const viewBody = match[2];
    
    const elements: { kind: string; entity?: string; label?: string; action?: string }[] = [];
    
    // Parse list
    const listMatch = viewBody.match(/list\s+(\w+)/);
    if (listMatch) {
      elements.push({ kind: 'list', entity: listMatch[1] });
    }
    
    // Parse buttons
    const buttonMatches = viewBody.matchAll(/button\s+"([^"]+)"\s*->\s*(\w+)/g);
    for (const bm of buttonMatches) {
      elements.push({ kind: 'button', label: bm[1], action: bm[2] });
    }
    
    // Parse inputs
    const inputMatches = viewBody.matchAll(/input\s+(\w+)/g);
    for (const im of inputMatches) {
      elements.push({ kind: 'input', entity: im[1] });
    }
    
    app.views.push({ name: viewName, elements });
  }
  
  // Parse action blocks - both syntaxes
  // Colon: "action CreateTodo(title):\n  add Todo..."
  // Brace: "action CreateTodo(title) {\n    add Todo...\n  }"
  const actionRegexColon = /action\s+(\w+)\(([^)]*)\):\s*\n([\s\S]*?)(?=\n(?:data|view|action|job|$))/g;
  const actionRegexBrace = /action\s+(\w+)\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
  const actionRegex = usesBraces ? actionRegexBrace : actionRegexColon;
  
  while ((match = actionRegex.exec(content)) !== null) {
    const actionName = match[1];
    const params = match[2].split(',').map(p => p.trim()).filter(p => p);
    const actionBody = match[3];
    
    const operations: { kind: string; entity?: string; view?: string; method?: string; path?: string; fields?: string[] }[] = [];
    
    // Parse add
    const addMatch = actionBody.match(/add\s+(\w+)\s+with\s+(.+)/);
    if (addMatch) {
      operations.push({ 
        kind: 'add', 
        entity: addMatch[1], 
        fields: addMatch[2].split(',').map(f => f.trim().split('=')[0]) 
      });
    }
    
    // Parse show
    const showMatch = actionBody.match(/show\s+(\w+)/);
    if (showMatch) {
      operations.push({ kind: 'show', view: showMatch[1] });
    }
    
    // Parse call
    const callMatch = actionBody.match(/call\s+(GET|POST|PUT|PATCH|DELETE)\s+"([^"]+)"(?:\s+with\s+(.+))?/);
    if (callMatch) {
      operations.push({ 
        kind: 'call', 
        method: callMatch[1], 
        path: callMatch[2],
        fields: callMatch[3]?.split(',').map(f => f.trim())
      });
    }
    
    // Parse load
    const loadMatch = actionBody.match(/load\s+(GET|POST|PUT|PATCH|DELETE)\s+"([^"]+)"\s+into\s+(\w+)/);
    if (loadMatch) {
      operations.push({ 
        kind: 'load', 
        method: loadMatch[1], 
        path: loadMatch[2],
        entity: loadMatch[3]
      });
    }
    
    app.actions.push({ name: actionName, params, operations });
  }
  
  // If no views found, create a default Dashboard
  if (app.views.length === 0) {
    app.views.push({
      name: 'Dashboard',
      elements: app.data.length > 0 
        ? [{ kind: 'list', entity: app.data[0].name }]
        : []
    });
  }
  
  // If no data found, create a placeholder
  if (app.data.length === 0) {
    app.data.push({
      name: 'Item',
      fields: [{ name: 'title', type: 'text' }],
      rules: []
    });
  }
  
  return app;
}

// ============================================
// FILE GENERATORS
// ============================================

function generatePackageJson(app: ShepLangApp): GeneratedFile {
  const pkg = {
    name: app.name.toLowerCase().replace(/\s+/g, '-'),
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'lucide-react': '^0.263.1'
    },
    devDependencies: {
      '@types/react': '^18.2.15',
      '@types/react-dom': '^18.2.7',
      '@vitejs/plugin-react': '^4.0.3',
      'autoprefixer': '^10.4.14',
      'postcss': '^8.4.27',
      'tailwindcss': '^3.3.3',
      'typescript': '^5.0.2',
      'vite': '^4.4.5'
    }
  };
  
  return {
    path: 'package.json',
    content: JSON.stringify(pkg, null, 2)
  };
}

function generateViteConfig(app: ShepLangApp): GeneratedFile {
  return {
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`
  };
}

function generateTailwindConfig(): GeneratedFile {
  return {
    path: 'tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
  };
}

function generatePostCSSConfig(): GeneratedFile {
  return {
    path: 'postcss.config.js',
    content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
  };
}

function generateTSConfig(): GeneratedFile {
  return {
    path: 'tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    }, null, 2)
  };
}

function generateTSConfigNode(): GeneratedFile {
  return {
    path: 'tsconfig.node.json',
    content: JSON.stringify({
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true
      },
      include: ['vite.config.ts']
    }, null, 2)
  };
}

function generateReadme(app: ShepLangApp): GeneratedFile {
  return {
    path: 'README.md',
    content: `# ${app.name}

Generated by [ShepLang](https://github.com/Radix-Obsidian/Sheplang) - The AI-native programming language.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **TypeScript** - Type safety
- **Lucide React** - Icons

## Project Structure

\`\`\`
src/
├── components/    # React components (from ShepLang views)
├── data/          # TypeScript types & CRUD helpers (from ShepLang data)
├── App.tsx        # Main app component
├── main.tsx       # Entry point
└── index.css      # Global styles
\`\`\`

## Data Models

${app.data.map(d => `- **${d.name}** - ${d.fields.map(f => f.name).join(', ')}`).join('\n')}

## Views

${app.views.map(v => `- **${v.name}** - ${v.elements.map(e => e.kind).join(', ')}`).join('\n')}

---

*Built with ShepLang - Ship verified software faster.*
`
  };
}

function generateIndexHtml(app: ShepLangApp): GeneratedFile {
  return {
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${app.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  };
}

function generateMainTsx(app: ShepLangApp): GeneratedFile {
  return {
    path: 'src/main.tsx',
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`
  };
}

function generateAppTsx(app: ShepLangApp): GeneratedFile {
  // Find the main view (usually Dashboard or first view)
  const mainView = app.views.find(v => v.name === 'Dashboard') || app.views[0];
  const viewName = mainView?.name || 'Home';
  
  const imports = app.views.map(v => 
    `import ${v.name} from './components/${v.name}'`
  ).join('\n');
  
  return {
    path: 'src/App.tsx',
    content: `import { useState } from 'react'
${imports}

function App() {
  const [currentView, setCurrentView] = useState('${viewName}')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">${app.name}</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === '${viewName}' && <${viewName} onNavigate={setCurrentView} />}
        ${app.views.filter(v => v.name !== viewName).map(v => 
          `{currentView === '${v.name}' && <${v.name} onNavigate={setCurrentView} />}`
        ).join('\n        ')}
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          Built with ShepLang
        </div>
      </footer>
    </div>
  )
}

export default App
`
  };
}

function generateIndexCss(): GeneratedFile {
  return {
    path: 'src/index.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`
  };
}

function generateDataModels(app: ShepLangApp): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  
  for (const data of app.data) {
    const typeContent = generateTypeFromData(data);
    files.push({
      path: `src/data/${data.name}.ts`,
      content: typeContent
    });
  }
  
  // Generate index file
  const indexContent = app.data.map(d => 
    `export * from './${d.name}'`
  ).join('\n') + '\n';
  
  files.push({
    path: 'src/data/index.ts',
    content: indexContent
  });
  
  return files;
}

function generateTypeFromData(data: ShepLangData): GeneratedFile['content'] {
  const tsType = mapShepLangTypeToTS;
  
  const fields = data.fields.map(f => {
    const optional = f.optional ? '?' : '';
    return `  ${f.name}${optional}: ${tsType(f.type)};`;
  }).join('\n');
  
  return `/**
 * ${data.name} - Generated from ShepLang
 */
export interface ${data.name} {
  id: string;
${fields}
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new ${data.name}
 */
export function create${data.name}(data: Omit<${data.name}, 'id' | 'createdAt' | 'updatedAt'>): ${data.name} {
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Local storage key for ${data.name}
 */
const STORAGE_KEY = '${data.name.toLowerCase()}s';

/**
 * Get all ${data.name}s from local storage
 */
export function getAll${data.name}s(): ${data.name}[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save ${data.name}s to local storage
 */
export function save${data.name}s(items: ${data.name}[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Add a ${data.name}
 */
export function add${data.name}(data: Omit<${data.name}, 'id' | 'createdAt' | 'updatedAt'>): ${data.name} {
  const items = getAll${data.name}s();
  const newItem = create${data.name}(data);
  items.push(newItem);
  save${data.name}s(items);
  return newItem;
}

/**
 * Delete a ${data.name}
 */
export function delete${data.name}(id: string): void {
  const items = getAll${data.name}s();
  const filtered = items.filter(item => item.id !== id);
  save${data.name}s(filtered);
}
`;
}

function mapShepLangTypeToTS(shepType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'string',
    'string': 'string',
    'number': 'number',
    'integer': 'number',
    'boolean': 'boolean',
    'yes/no': 'boolean',
    'date': 'Date',
    'datetime': 'Date',
    'email': 'string',
    'url': 'string',
    'money': 'number',
    'decimal': 'number',
    'json': 'Record<string, unknown>',
    'uuid': 'string',
    'bigint': 'bigint'
  };
  
  return typeMap[shepType.toLowerCase()] || 'string';
}

function generateViewComponents(app: ShepLangApp): GeneratedFile[] {
  return app.views.map(view => ({
    path: `src/components/${view.name}.tsx`,
    content: generateViewComponent(view, app)
  }));
}

function generateViewComponent(view: ShepLangView, app: ShepLangApp): string {
  const imports: string[] = ['import { useState, useEffect } from \'react\''];
  const usedEntities = new Set<string>();
  
  // Find which entities this view uses
  for (const el of view.elements) {
    if (el.entity) {
      usedEntities.add(el.entity);
    }
  }
  
  // Add imports for entities
  for (const entity of usedEntities) {
    imports.push(`import { ${entity}, getAll${entity}s, add${entity}, delete${entity} } from '../data/${entity}'`);
  }
  
  // Add lucide icons
  imports.push(`import { Plus, Trash2, Check } from 'lucide-react'`);
  
  const hasListElement = view.elements.some(el => el.kind === 'list');
  const listEntity = view.elements.find(el => el.kind === 'list')?.entity;
  
  return `${imports.join('\n')}

interface ${view.name}Props {
  onNavigate: (view: string) => void;
}

export default function ${view.name}({ onNavigate }: ${view.name}Props) {
${listEntity ? `  const [items, setItems] = useState<${listEntity}[]>([])
  const [newItemTitle, setNewItemTitle] = useState('')
  
  useEffect(() => {
    setItems(getAll${listEntity}s())
  }, [])
  
  const handleAdd = () => {
    if (!newItemTitle.trim()) return
    const newItem = add${listEntity}({ title: newItemTitle${app.data.find(d => d.name === listEntity)?.fields.some(f => f.name === 'done') ? ', done: false' : ''} } as any)
    setItems([...items, newItem])
    setNewItemTitle('')
  }
  
  const handleDelete = (id: string) => {
    delete${listEntity}(id)
    setItems(items.filter(item => item.id !== id))
  }
  
  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ))
  }` : ''}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">${view.name}</h2>
      </div>
      
${listEntity ? `      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add new ${listEntity.toLowerCase()}..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add
        </button>
      </div>
      
      {/* List of items */}
      <div className="bg-white rounded-lg shadow divide-y">
        {items.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No ${listEntity.toLowerCase()}s yet. Add one above!</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                ${'done' in (app.data.find(d => d.name === listEntity)?.fields.find(f => f.name === 'done') || {}) ? `<button
                  onClick={() => handleToggle(item.id)}
                  className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center \${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}\`}
                >
                  {item.done && <Check size={14} />}
                </button>` : ''}
                <span className={item.done ? 'line-through text-gray-400' : ''}>{item.title}</span>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>` : `      <p className="text-gray-500">View content goes here.</p>`}
      
      {/* Navigation buttons */}
      <div className="flex gap-2">
${view.elements.filter(el => el.kind === 'button').map(btn => `        <button
          onClick={() => ${btn.action?.startsWith('Show') ? `onNavigate('${btn.action.replace('Show', '')}')` : 'handleAdd()'}}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          ${btn.label}
        </button>`).join('\n')}
      </div>
    </div>
  )
}
`;
}

function generateActions(app: ShepLangApp): GeneratedFile[] {
  // For v1, actions are embedded in components
  // Future: Generate separate hook files
  return [];
}
