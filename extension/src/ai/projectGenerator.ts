/**
 * AI Project Generator
 * Converts natural language descriptions into full ShepLang projects
 */

import * as vscode from 'vscode';
import { callClaude, extractJSON } from './claudeClient';

interface ProjectFile {
  path: string;
  content: string;
  fullPath?: string;
}

interface ProjectStructure {
  name: string;
  files: ProjectFile[];
  needsBackend: boolean;
  includeBackend?: boolean;
}

interface ProjectAnalysis {
  projectName: string;
  entities: Array<{
    name: string;
    fields: Array<{
      name: string;
      type: 'text' | 'number' | 'yes/no' | 'date' | 'time';
    }>;
  }>;
  views: Array<{
    name: string;
    lists?: string[];
    buttons?: Array<{ label: string; action: string }>;
  }>;
  actions: Array<{
    name: string;
    parameters: string[];
    operations: string[];
  }>;
  needsBackend: boolean;
  features: string[];
}

/**
 * Generate a complete ShepLang project from a natural language prompt
 */
export async function generateProjectFromPrompt(
  prompt: string,
  options: {
    includeBackend?: boolean;
    context: vscode.ExtensionContext;
  }
): Promise<ProjectStructure> {
  // Analyze prompt to understand requirements
  const analysis = await analyzePrompt(prompt, options.context);
  
  // Generate ShepLang code
  const sheplangCode = generateShepLangCode(analysis);
  
  // Generate backend if needed
  let backendCode: string | null = null;
  if (options.includeBackend && analysis.needsBackend) {
    backendCode = generateShepThonBackend(analysis);
  }
  
  // Create project structure
  const projectStructure: ProjectStructure = {
    name: analysis.projectName,
    needsBackend: analysis.needsBackend,
    includeBackend: options.includeBackend,
    files: []
  };
  
  // Add main ShepLang file
  projectStructure.files.push({
    path: `${analysis.projectName}.shep`,
    content: sheplangCode
  });
  
  // Add backend file if generated
  if (backendCode) {
    projectStructure.files.push({
      path: `backend.shepthon`,
      content: backendCode
    });
  }
  
  // Add README
  projectStructure.files.push({
    path: 'README.md',
    content: generateReadme(analysis)
  });
  
  // Add .gitignore
  projectStructure.files.push({
    path: '.gitignore',
    content: generateGitignore()
  });
  
  return projectStructure;
}

/**
 * Analyze the user's prompt to extract requirements
 */
async function analyzePrompt(prompt: string, context: vscode.ExtensionContext): Promise<ProjectAnalysis> {
  const systemPrompt = `You are a ShepLang project architect. Analyze the user's app description and extract:
1. A suitable project name (PascalCase)
2. Data entities with fields
3. Views/screens needed
4. Actions/behaviors
5. Whether it needs a backend (for data persistence, user auth, etc.)

Respond in JSON format only, no markdown.`;

  try {
    const response = await callClaude(context, `${systemPrompt}\n\nAnalyze this app idea: ${prompt}`, 2048);
    
    if (!response) {
      return fallbackAnalysis(prompt);
    }
    
    const json = extractJSON(response);
    const parsed = JSON.parse(json) as ProjectAnalysis;
    
    // CRITICAL: Normalize actions and operations to always be arrays
    // AI sometimes returns invalid data structures
    if (!Array.isArray(parsed.actions)) {
      parsed.actions = [];
    }
    
    for (const action of parsed.actions) {
      // Ensure operations exist
      if (!action.operations) {
        action.operations = [];
        continue;
      }
      
      // Normalize operations to array
      if (typeof action.operations === 'string') {
        // Split string by common delimiters
        action.operations = (action.operations as any)
          .split(/[\n,;]/)  
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
      }
      
      // Ensure it's an array
      if (!Array.isArray(action.operations)) {
        action.operations = [];
      }
      
      // Ensure parameters exist
      if (!action.parameters || !Array.isArray(action.parameters)) {
        action.parameters = [];
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('[ProjectGenerator] Failed to parse AI response:', error);
    // Fallback analysis based on keywords
    return fallbackAnalysis(prompt);
  }
}

/**
 * Fallback analysis when AI is unavailable
 */
function fallbackAnalysis(prompt: string): ProjectAnalysis {
  const lowercasePrompt = prompt.toLowerCase();
  
  // Detect project type
  let projectName = 'MyApp';
  let entities: ProjectAnalysis['entities'] = [];
  let views: ProjectAnalysis['views'] = [];
  let actions: ProjectAnalysis['actions'] = [];
  
  // Todo/Task app detection
  if (lowercasePrompt.includes('todo') || lowercasePrompt.includes('task')) {
    projectName = 'TaskManager';
    entities = [{
      name: 'Task',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'completed', type: 'yes/no' },
        { name: 'dueDate', type: 'date' }
      ]
    }];
    views = [{
      name: 'Dashboard',
      lists: ['Task'],
      buttons: [
        { label: 'New Task', action: 'CreateTask' },
        { label: 'Clear Completed', action: 'ClearCompleted' }
      ]
    }];
    actions = [
      {
        name: 'CreateTask',
        parameters: ['title', 'description', 'dueDate'],
        operations: ['add Task with title, description, dueDate', 'show Dashboard']
      }
    ];
  }
  // User/Account detection
  else if (lowercasePrompt.includes('user') || lowercasePrompt.includes('account')) {
    projectName = 'UserManager';
    entities = [{
      name: 'User',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'active', type: 'yes/no' }
      ]
    }];
    views = [{
      name: 'UserList',
      lists: ['User'],
      buttons: [
        { label: 'Add User', action: 'AddUser' },
        { label: 'Export', action: 'ExportUsers' }
      ]
    }];
    actions = [
      {
        name: 'AddUser',
        parameters: ['name', 'email', 'role'],
        operations: ['add User with name, email, role', 'show UserList']
      }
    ];
  }
  // E-commerce detection
  else if (lowercasePrompt.includes('shop') || lowercasePrompt.includes('product') || lowercasePrompt.includes('store')) {
    projectName = 'OnlineStore';
    entities = [
      {
        name: 'Product',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'price', type: 'number' },
          { name: 'stock', type: 'number' },
          { name: 'available', type: 'yes/no' }
        ]
      },
      {
        name: 'Order',
        fields: [
          { name: 'customerName', type: 'text' },
          { name: 'total', type: 'number' },
          { name: 'status', type: 'text' }
        ]
      }
    ];
  }
  // Generic fallback
  else {
    entities = [{
      name: 'Item',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'value', type: 'number' }
      ]
    }];
  }
  
  // Fill in missing views/actions if not set
  if (views.length === 0) {
    views = [{
      name: 'MainView',
      lists: entities.map(e => e.name),
      buttons: [{ label: `New ${entities[0].name}`, action: `Create${entities[0].name}` }]
    }];
  }
  
  if (actions.length === 0) {
    actions = [{
      name: `Create${entities[0].name}`,
      parameters: entities[0].fields.map(f => f.name),
      operations: [
        `add ${entities[0].name} with ${entities[0].fields.map(f => f.name).join(', ')}`,
        'show MainView'
      ]
    }];
  }
  
  return {
    projectName,
    entities,
    views,
    actions,
    needsBackend: lowercasePrompt.includes('sync') || 
                  lowercasePrompt.includes('team') || 
                  lowercasePrompt.includes('user') ||
                  lowercasePrompt.includes('account') ||
                  lowercasePrompt.includes('real-time'),
    features: []
  };
}

/**
 * Generate ShepLang code from analysis
 */
function generateShepLangCode(analysis: ProjectAnalysis): string {
  let code = `app ${analysis.projectName}\n\n`;
  
  // Add data entities
  for (const entity of analysis.entities) {
    code += `data ${entity.name}:\n`;
    code += `  fields:\n`;
    for (const field of entity.fields) {
      code += `    ${field.name}: ${field.type}\n`;
    }
    code += '\n';
  }
  
  // Add views
  for (const view of analysis.views) {
    code += `view ${view.name}:\n`;
    if (view.lists) {
      for (const list of view.lists) {
        code += `  list ${list}\n`;
      }
    }
    if (view.buttons) {
      for (const button of view.buttons) {
        code += `  button "${button.label}" -> ${button.action}\n`;
      }
    }
    code += '\n';
  }
  
  // Add actions
  for (const action of analysis.actions) {
    const params = action.parameters.length > 0 ? `(${action.parameters.join(', ')})` : '()';
    code += `action ${action.name}${params}:\n`;
    for (const op of action.operations) {
      code += `  ${op}\n`;
    }
    code += '\n';
  }
  
  return code;
}

/**
 * Generate ShepThon backend code
 */
function generateShepThonBackend(analysis: ProjectAnalysis): string {
  let code = '# ShepThon Backend\n\n';
  
  // Add models
  for (const entity of analysis.entities) {
    code += `model ${entity.name} {\n`;
    for (const field of entity.fields) {
      const backendType = mapToBackendType(field.type);
      code += `  ${field.name}: ${backendType}\n`;
    }
    code += '}\n\n';
  }
  
  // Add basic CRUD endpoints
  for (const entity of analysis.entities) {
    const entityLower = entity.name.toLowerCase();
    code += `# ${entity.name} endpoints\n`;
    code += `GET /${entityLower}s -> db.all("${entityLower}s")\n`;
    code += `GET /${entityLower}s/:id -> db.get("${entityLower}s", id)\n`;
    code += `POST /${entityLower}s -> db.add("${entityLower}s", body)\n`;
    code += `PUT /${entityLower}s/:id -> db.update("${entityLower}s", id, body)\n`;
    code += `DELETE /${entityLower}s/:id -> db.remove("${entityLower}s", id)\n\n`;
  }
  
  return code;
}

/**
 * Map ShepLang types to backend types
 */
function mapToBackendType(type: string): string {
  switch (type) {
    case 'text': return 'string';
    case 'number': return 'number';
    case 'yes/no': return 'boolean';
    case 'date': return 'date';
    case 'time': return 'datetime';
    default: return 'string';
  }
}

/**
 * Generate README for the project
 */
function generateReadme(analysis: ProjectAnalysis): string {
  return `# ${analysis.projectName}

Built with ShepLang - the AI-native full-stack language.

## Features
${analysis.features.map(f => `- ${f}`).join('\n') || '- Full CRUD operations\n- Live preview\n- Type-safe\n- AI-verified'}

## Getting Started

1. Open in VS Code with ShepLang extension
2. Press \`Ctrl+Shift+P\` → "ShepLang: Start Live Preview"
3. Start building!

## Data Models
${analysis.entities.map(e => `- **${e.name}**: ${e.fields.map(f => f.name).join(', ')}`).join('\n')}

## Views
${analysis.views.map(v => `- **${v.name}**`).join('\n')}

## Technology
- Frontend: ShepLang
- Backend: ${analysis.needsBackend ? 'ShepThon' : 'None (local only)'}
- Verification: ShepVerify
`;
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `# ShepLang
.shep/
*.shepthon.db

# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
out/
build/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/
`;
}
