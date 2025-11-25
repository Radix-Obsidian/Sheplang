/**
 * Scaffold Generator
 * 
 * Analyzes project architecture and generates organized folder structure
 * like Lovable, v0.dev, and other app builders.
 * 
 * Instead of a single .shep file, creates:
 * - /models/*.shep (data models)
 * - /views/*.shep (UI screens)
 * - /actions/*.shep (business logic)
 * - /api/*.shepthon (backend endpoints)
 * - config.shep (app configuration)
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AppModel } from '../parsers/astAnalyzer';
import { callClaude } from '../ai/claudeClient';

export interface ScaffoldStructure {
  type: 'monorepo' | 'single-app' | 'microservices' | 'component-library';
  folders: ScaffoldFolder[];
  rootFiles: ScaffoldFile[];
}

export interface ScaffoldFolder {
  name: string;
  description: string;
  files: ScaffoldFile[];
}

export interface ScaffoldFile {
  name: string;
  content: string;
  fileType: 'shep' | 'shepthon' | 'config' | 'readme';
}

/**
 * Analyze project and generate scaffold structure using AI
 */
export async function generateScaffold(
  context: vscode.ExtensionContext,
  appModel: AppModel,
  projectRoot: string
): Promise<ScaffoldStructure> {
  // Analyze project structure
  const projectInfo = analyzeProjectStructure(projectRoot);
  
  // Use AI to determine best scaffold structure
  const scaffoldPlan = await planScaffoldStructure(context, appModel, projectInfo);
  
  if (!scaffoldPlan) {
    // Fallback to simple structure
    return createSimpleScaffold(appModel);
  }
  
  return scaffoldPlan;
}

/**
 * Analyze the physical project structure
 */
function analyzeProjectStructure(projectRoot: string): ProjectInfo {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const hasWorkspaces = fs.existsSync(packageJsonPath) && 
    JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).workspaces;
  
  const hasPagesDir = fs.existsSync(path.join(projectRoot, 'pages')) ||
    fs.existsSync(path.join(projectRoot, 'app')) ||
    fs.existsSync(path.join(projectRoot, 'src', 'pages'));
  
  const hasComponentsDir = fs.existsSync(path.join(projectRoot, 'components')) ||
    fs.existsSync(path.join(projectRoot, 'src', 'components'));
  
  const hasApiDir = fs.existsSync(path.join(projectRoot, 'api')) ||
    fs.existsSync(path.join(projectRoot, 'pages', 'api')) ||
    fs.existsSync(path.join(projectRoot, 'app', 'api'));
  
  const hasLibDir = fs.existsSync(path.join(projectRoot, 'lib')) ||
    fs.existsSync(path.join(projectRoot, 'src', 'lib'));
  
  const hasModelsDir = fs.existsSync(path.join(projectRoot, 'models')) ||
    fs.existsSync(path.join(projectRoot, 'prisma'));
  
  // Detect structure type
  let structureType: 'monorepo' | 'single-app' | 'microservices' | 'component-library' = 'single-app';
  
  if (hasWorkspaces) {
    structureType = 'monorepo';
  } else if (!hasPagesDir && hasComponentsDir) {
    structureType = 'component-library';
  } else if (hasApiDir && !hasPagesDir) {
    structureType = 'microservices';
  }
  
  return {
    type: structureType,
    hasPagesDir,
    hasComponentsDir,
    hasApiDir,
    hasLibDir,
    hasModelsDir,
    directories: listTopLevelDirectories(projectRoot)
  };
}

interface ProjectInfo {
  type: 'monorepo' | 'single-app' | 'microservices' | 'component-library';
  hasPagesDir: boolean;
  hasComponentsDir: boolean;
  hasApiDir: boolean;
  hasLibDir: boolean;
  hasModelsDir: boolean;
  directories: string[];
}

function listTopLevelDirectories(projectRoot: string): string[] {
  try {
    return fs.readdirSync(projectRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !dirent.name.startsWith('.'))
      .filter(dirent => dirent.name !== 'node_modules')
      .map(dirent => dirent.name);
  } catch {
    return [];
  }
}

/**
 * Use AI to plan scaffold structure
 */
async function planScaffoldStructure(
  context: vscode.ExtensionContext,
  appModel: AppModel,
  projectInfo: ProjectInfo
): Promise<ScaffoldStructure | null> {
  const prompt = `You are a project scaffolding AI. Analyze this project and design an organized folder structure.

# Project Analysis
**Project Type:** ${projectInfo.type}
**App Name:** ${appModel.appName}

**Detected Structure:**
- Pages/Routes: ${projectInfo.hasPagesDir ? 'Yes' : 'No'}
- Components: ${projectInfo.hasComponentsDir ? 'Yes' : 'No'}
- API Routes: ${projectInfo.hasApiDir ? 'Yes' : 'No'}
- Lib/Utils: ${projectInfo.hasLibDir ? 'Yes' : 'No'}
- Models: ${projectInfo.hasModelsDir ? 'Yes' : 'No'}

**Directories Found:**
${projectInfo.directories.map(d => `- ${d}`).join('\n')}

**Entities:** ${appModel.entities.length} (${appModel.entities.map(e => e.name).join(', ')})
**Views:** ${appModel.views.length}
**Actions:** ${appModel.actions.length}

# Task
Design a clean, organized folder structure for this ShepLang project.

# Guidelines
1. Follow best practices from the detected project type
2. Organize by feature or domain (not by file type)
3. Keep it simple - 3-5 main folders
4. Each folder should have a clear purpose

# Folder Structure Options

**Option A: Feature-Based (Recommended for apps with multiple features)**
\`\`\`
/features
  /users
    - users.shep (data model)
    - users-api.shepthon (endpoints)
  /posts
    - posts.shep
    - posts-api.shepthon
/shared
  - config.shep
  - types.shep
\`\`\`

**Option B: Layer-Based (Recommended for simple CRUD apps)**
\`\`\`
/models
  - User.shep
  - Post.shep
/views
  - Dashboard.shep
  - UserList.shep
/api
  - users.shepthon
  - posts.shepthon
\`\`\`

**Option C: Monorepo (Recommended for workspace projects)**
\`\`\`
/packages
  /frontend
    - app.shep
    - views.shep
  /backend
    - api.shepthon
    - models.shep
  /shared
    - types.shep
\`\`\`

# Output Format
Return a JSON object with this structure:
\`\`\`json
{
  "type": "single-app",
  "folders": [
    {
      "name": "models",
      "description": "Data models and entities"
    },
    {
      "name": "views", 
      "description": "UI screens and pages"
    },
    {
      "name": "api",
      "description": "Backend endpoints"
    }
  ]
}
\`\`\`

Return ONLY the JSON, no explanations.`;

  try {
    const response = await callClaude(context, prompt, 1000);
    if (!response) return null;
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const plan = JSON.parse(jsonMatch[0]);
    
    // Generate files for each folder
    const structure: ScaffoldStructure = {
      type: plan.type || 'single-app',
      folders: [],
      rootFiles: [
        {
          name: 'README.md',
          content: generateReadme(appModel, plan),
          fileType: 'readme'
        }
      ]
    };
    
    for (const folder of plan.folders || []) {
      const files = generateFilesForFolder(folder.name, appModel);
      structure.folders.push({
        name: folder.name,
        description: folder.description,
        files
      });
    }
    
    return structure;
  } catch (error) {
    console.error('[Scaffold] AI planning failed:', error);
    return null;
  }
}

/**
 * Generate files for a specific folder based on its purpose
 */
function generateFilesForFolder(folderName: string, appModel: AppModel): ScaffoldFile[] {
  const files: ScaffoldFile[] = [];
  
  // Models folder
  if (folderName.toLowerCase().includes('model')) {
    for (const entity of appModel.entities) {
      files.push({
        name: `${entity.name}.shep`,
        content: generateEntityFile(entity),
        fileType: 'shep'
      });
    }
  }
  
  // Views folder
  if (folderName.toLowerCase().includes('view') || folderName.toLowerCase().includes('page')) {
    for (const view of appModel.views) {
      files.push({
        name: `${view.name}.shep`,
        content: generateViewFile(view, appModel),
        fileType: 'shep'
      });
    }
  }
  
  // API folder
  if (folderName.toLowerCase().includes('api') || folderName.toLowerCase().includes('backend')) {
    for (const entity of appModel.entities) {
      files.push({
        name: `${entity.name.toLowerCase()}.shepthon`,
        content: generateApiFile(entity),
        fileType: 'shepthon'
      });
    }
  }
  
  // Actions folder
  if (folderName.toLowerCase().includes('action') || folderName.toLowerCase().includes('logic')) {
    for (const action of appModel.actions) {
      files.push({
        name: `${action.name}.shep`,
        content: generateActionFile(action),
        fileType: 'shep'
      });
    }
  }
  
  return files;
}

/**
 * Fallback: Create simple scaffold structure
 */
function createSimpleScaffold(appModel: AppModel): ScaffoldStructure {
  return {
    type: 'single-app',
    folders: [
      {
        name: 'models',
        description: 'Data models',
        files: appModel.entities.map(e => ({
          name: `${e.name}.shep`,
          content: generateEntityFile(e),
          fileType: 'shep' as const
        }))
      },
      {
        name: 'views',
        description: 'UI screens',
        files: appModel.views.map(v => ({
          name: `${v.name}.shep`,
          content: generateViewFile(v, appModel),
          fileType: 'shep' as const
        }))
      },
      {
        name: 'api',
        description: 'Backend endpoints',
        files: appModel.entities.map(e => ({
          name: `${e.name.toLowerCase()}.shepthon`,
          content: generateApiFile(e),
          fileType: 'shepthon' as const
        }))
      }
    ],
    rootFiles: [
      {
        name: 'app.shep',
        content: generateMainAppFile(appModel),
        fileType: 'shep'
      },
      {
        name: 'README.md',
        content: generateReadme(appModel, { type: 'single-app' }),
        fileType: 'readme'
      }
    ]
  };
}

/**
 * Generate individual file contents
 */
function generateEntityFile(entity: any): string {
  return `// ${entity.name} Data Model

data ${entity.name}:
  fields:
${entity.fields.map((f: any) => `    ${f.name}: ${f.type}${f.required ? '' : ' // optional'}`).join('\n')}
`;
}

function generateViewFile(view: any, appModel: AppModel): string {
  return `// ${view.name} Screen

view ${view.name}:
${view.widgets && view.widgets.length > 0 
  ? view.widgets.map((w: any) => {
      if (w.kind === 'list') return `  list ${w.entityName}`;
      if (w.kind === 'button') return `  button "${w.label}" -> ${w.actionName}`;
      return `  // TODO: Add ${w.kind} widget`;
    }).join('\n')
  : '  // TODO: Add widgets for this view'
}
`;
}

function generateActionFile(action: any): string {
  const params = action.parameters.length > 0 ? action.parameters.join(', ') : 'params';
  return `// ${action.name} Action

action ${action.name}(${params}):
  // TODO: Implement business logic
  show Dashboard
`;
}

function generateApiFile(entity: any): string {
  const tableName = entity.name.toLowerCase();
  return `// ${entity.name} API Endpoints

model ${entity.name} {
${entity.fields.map((f: any) => `  ${f.name}: String`).join('\n')}
  createdAt: DateTime
}

GET /${tableName} -> db.all("${tableName}")
GET /${tableName}/:id -> db.find("${tableName}", params.id)
POST /${tableName} -> db.add("${tableName}", body)
PUT /${tableName}/:id -> db.update("${tableName}", params.id, body)
DELETE /${tableName}/:id -> db.remove("${tableName}", params.id)
`;
}

function generateMainAppFile(appModel: AppModel): string {
  return `app ${appModel.appName}
// ${appModel.appName} - Main Application Configuration
// Generated by ShepLang Import

// Import models
${appModel.entities.map(e => `// model ${e.name} from "models/${e.name}.shep"`).join('\n')}

// Import views
${appModel.views.map(v => `// view ${v.name} from "views/${v.name}.shep"`).join('\n')}

// App entry point
view ${appModel.views[0]?.name || 'Dashboard'}
`;
}

function generateReadme(appModel: AppModel, plan: any): string {
  return `# ${appModel.appName}

Generated by ShepLang AI Scaffolder

## Project Structure

This project uses a **${plan.type}** architecture.

### Folders

${plan.folders?.map((f: any) => `- **${f.name}/** - ${f.description}`).join('\n') || ''}

## Getting Started

1. Review the generated \`.shep\` and \`.shepthon\` files
2. Fill in TODO comments with your business logic
3. Run \`sheplang dev\` to start the development server
4. Open the preview to see your app

## Entities

${appModel.entities.map(e => `- ${e.name}`).join('\n')}

## Views

${appModel.views.map(v => `- ${v.name}`).join('\n')}

---

Generated on ${new Date().toLocaleDateString()}
`;
}

/**
 * Write scaffold structure to disk
 */
export async function writeScaffold(
  scaffold: ScaffoldStructure,
  outputFolder: string
): Promise<void> {
  // Create root files
  for (const file of scaffold.rootFiles) {
    const filePath = path.join(outputFolder, file.name);
    fs.writeFileSync(filePath, file.content, 'utf-8');
  }
  
  // Create folders and files
  for (const folder of scaffold.folders) {
    const folderPath = path.join(outputFolder, folder.name);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Write files
    for (const file of folder.files) {
      const filePath = path.join(folderPath, file.name);
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
    
    // Create folder README
    const readmePath = path.join(folderPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, `# ${folder.name}\n\n${folder.description}\n`, 'utf-8');
    }
  }
}
