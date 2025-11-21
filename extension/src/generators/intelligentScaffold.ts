/**
 * Intelligent Scaffold Generator
 * 
 * Generates project structure based on AI-designed architecture plan.
 * Inspired by Cursor Composer's multi-file generation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { AppModel } from '../parsers/astAnalyzer';
import { ArchitecturePlan } from '../wizard/architectureWizard';
import { ShepLangCodeAgent, ComponentSpec, EntitySpec } from '../ai/sheplangCodeAgent';

export interface GeneratedProject {
  rootPath: string;
  files: GeneratedFile[];
  report: string;
}

export interface GeneratedFile {
  relativePath: string;
  content: string;
  dependencies: string[];
}

/**
 * Generate project from architecture plan
 */
export async function generateFromPlan(
  appModel: AppModel,
  plan: ArchitecturePlan,
  outputPath: string,
  context?: vscode.ExtensionContext
): Promise<GeneratedProject> {
  // Create AI agent if context provided
  const agent = context ? new ShepLangCodeAgent(context) : null;
  const files: GeneratedFile[] = [];

  // Generate files for each folder in the plan
  for (const folder of plan.folders) {
    const folderFiles = await generateFolderFiles(folder, appModel, plan, agent);
    files.push(...folderFiles);
  }

  // Generate root files
  files.push({
    relativePath: 'README.md',
    content: generateProjectReadme(appModel, plan),
    dependencies: []
  });

  files.push({
    relativePath: 'app.shep',
    content: generateAppConfig(appModel, plan),
    dependencies: []
  });

  // Write all files to disk
  await writeProjectFiles(outputPath, files);

  // Generate import report
  const report = generateImportReport(appModel, plan, files);

  return {
    rootPath: outputPath,
    files,
    report
  };
}

/**
 * Generate files for a folder based on architecture plan
 */
async function generateFolderFiles(
  folder: any,
  appModel: AppModel,
  plan: ArchitecturePlan,
  agent: ShepLangCodeAgent | null
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Safety check: ensure folder has files array
  if (!folder.files || !Array.isArray(folder.files)) {
    console.warn(`[IntelligentScaffold] Folder ${folder.path} has no files array, skipping`);
    return files;
  }

  for (const fileSpec of folder.files) {
    if (!fileSpec) {
      console.warn(`[IntelligentScaffold] Folder ${folder.path} has an empty file spec, skipping`);
      continue;
    }

    const content = await generateFileContent(
      fileSpec,
      folder,
      appModel,
      plan,
      agent
    );

    files.push({
      relativePath: path.join(folder.path, fileSpec.name),
      content,
      dependencies: fileSpec.dependencies || []
    });
  }

  // Generate subfolders recursively
  if (folder.subfolders && Array.isArray(folder.subfolders)) {
    for (const subfolder of folder.subfolders) {
      const subFiles = await generateFolderFiles(subfolder, appModel, plan, agent);
      files.push(...subFiles);
    }
  }

  // Add folder README
  files.push({
    relativePath: path.join(folder.path, 'README.md'),
    content: `# ${path.basename(folder.path)}\n\n${folder.purpose}\n`,
    dependencies: []
  });

  return files;
}

/**
 * Generate content for a specific file
 */
async function generateFileContent(
  fileSpec: any,
  folder: any,
  appModel: AppModel,
  plan: ArchitecturePlan,
  agent: ShepLangCodeAgent | null
): Promise<string> {
  const fileName = fileSpec.name;
  
  // Determine file type
  if (fileName.endsWith('.shep')) {
    // Check if it's a model file
    const entityName = fileName.replace('.shep', '');
    const entity = appModel.entities.find(e => e.name === entityName);
    
    if (entity) {
      return generateModelFile(entity, fileSpec);
    }
    
    // Check if it's a view file
    const view = appModel.views.find(v => v.name === entityName);
    if (view) {
      return generateViewFile(view, appModel, fileSpec);
    }
    
    // Check if it's an action file
    const action = appModel.actions.find(a => a.name === entityName);
    if (action) {
      return generateActionFile(action, fileSpec);
    }
    
    // Generic .shep file (component, hook, config)
    return await generateGenericShepFile(fileSpec, folder, agent);
  }
  
  if (fileName.endsWith('.shepthon')) {
    // Backend API file - Use AI agent for production-ready endpoints
    return await generateBackendFileWithAgent(appModel, fileSpec, folder, agent);
  }
  
  // Unknown file type
  return `// ${fileSpec.purpose}\n\n// TODO: Implement ${fileName}\n`;
}

/**
 * Generate model file
 */
function generateModelFile(entity: any, fileSpec: any): string {
  let content = `// ${entity.name} Data Model\n`;
  content += `// ${fileSpec.purpose}\n\n`;
  content += `data ${entity.name}:\n`;
  content += `  fields:\n`;
  
  for (const field of entity.fields) {
    const optional = field.required ? '' : ' // optional';
    content += `    ${field.name}: ${field.type}${optional}\n`;
  }
  
  return content;
}

/**
 * Generate view file
 */
function generateViewFile(view: any, appModel: AppModel, fileSpec: any): string {
  let content = `// ${view.name} Screen\n`;
  content += `// ${fileSpec.purpose}\n\n`;
  content += `view ${view.name}:\n`;
  
  if (view.widgets && view.widgets.length > 0) {
    for (const widget of view.widgets) {
      if (widget.kind === 'list') {
        content += `  list ${widget.entityName}\n`;
      } else if (widget.kind === 'button') {
        content += `  button "${widget.label}" -> ${widget.actionName}\n`;
      } else {
        content += `  // TODO: Add ${widget.kind} widget\n`;
      }
    }
  } else {
    content += `  // TODO: Add widgets for this view\n`;
    content += `  // Example: list EntityName\n`;
    content += `  // Example: button "Click me" -> ActionName\n`;
  }
  
  return content;
}

/**
 * Generate action file
 */
function generateActionFile(action: any, fileSpec: any): string {
  const params = action.parameters.length > 0 
    ? action.parameters.join(', ') 
    : 'params';
  
  let content = `// ${action.name} Action\n`;
  content += `// ${fileSpec.purpose}\n\n`;
  content += `action ${action.name}(${params}):\n`;
  
  if (action.apiCalls && action.apiCalls.length > 0) {
    for (const apiCall of action.apiCalls) {
      content += `  call ${apiCall.method} "${apiCall.path}"\n`;
    }
  } else {
    content += `  // TODO: Implement business logic\n`;
  }
  
  content += `  show Dashboard\n`;
  
  return content;
}

/**
 * Generate backend API file with AI agent
 * NOT just CRUD - includes auth, search, filters, uploads!
 */
async function generateBackendFileWithAgent(
  appModel: AppModel,
  fileSpec: any,
  folder: any,
  agent: ShepLangCodeAgent | null
): Promise<string> {
  // If agent available, generate production-ready backend
  if (agent && appModel.entities.length > 0) {
    console.log('[IntelligentScaffold] Generating production backend with AI agent...');
    
    // Convert entities to EntitySpec format
    const entitySpecs: EntitySpec[] = appModel.entities.map(entity => ({
      name: entity.name,
      fields: entity.fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required
      }))
    }));
    
    try {
      const backendCode = await agent.generateBackend(entitySpecs, appModel.appName);
      if (backendCode) {
        console.log('[IntelligentScaffold] ✓ AI agent generated production backend');
        return backendCode;
      }
    } catch (error) {
      console.warn('[IntelligentScaffold] AI agent failed, using fallback:', error);
    }
  }
  
  // Fallback: Generate basic CRUD (better than nothing)
  console.log('[IntelligentScaffold] Using fallback CRUD backend');
  return generateFallbackBackend(appModel, fileSpec);
}

/**
 * Generate generic ShepLang file with AI agent
 */
async function generateGenericShepFile(
  fileSpec: any,
  folder: any,
  agent: ShepLangCodeAgent | null
): Promise<string> {
  // If agent available, generate real component
  if (agent) {
    console.log(`[IntelligentScaffold] Generating component: ${fileSpec.name}`);
    
    // Determine component type from folder path
    const folderPath = folder.path.toLowerCase();
    let componentType: 'view' | 'component' | 'hook' | 'config' = 'component';
    
    if (folderPath.includes('view')) {
      componentType = 'view';
    } else if (folderPath.includes('hook')) {
      componentType = 'hook';
    } else if (folderPath.includes('config')) {
      componentType = 'config';
    }
    
    const spec: ComponentSpec = {
      name: fileSpec.name.replace('.shep', ''),
      purpose: fileSpec.purpose || 'Component functionality',
      type: componentType,
      dependencies: fileSpec.dependencies || []
    };
    
    try {
      const componentCode = await agent.generateComponent(spec);
      if (componentCode) {
        console.log(`[IntelligentScaffold] ✓ AI agent generated ${spec.name}`);
        return componentCode;
      }
    } catch (error) {
      console.warn(`[IntelligentScaffold] AI agent failed for ${spec.name}, using fallback:`, error);
    }
  }
  
  // Fallback: Generate basic template
  return `// ${fileSpec.name}\n// ${fileSpec.purpose}\n\napp YourApp\n\n// TODO: Implement this file\n`;
}

/**
 * Fallback: Generate basic CRUD backend
 */
function generateFallbackBackend(appModel: AppModel, fileSpec: any): string {
  let content = `// ${appModel.appName} API\n`;
  content += `// ${fileSpec.purpose}\n\n`;
  
  for (const entity of appModel.entities) {
    const tableName = entity.name.toLowerCase();
    
    content += `model ${entity.name} {\n`;
    for (const field of entity.fields) {
      content += `  ${field.name}: String\n`;
    }
    content += `  createdAt: DateTime\n`;
    content += `  updatedAt: DateTime\n`;
    content += `}\n\n`;
    
    content += `GET /${tableName} -> db.all("${tableName}")\n`;
    content += `GET /${tableName}/:id -> db.find("${tableName}", params.id)\n`;
    content += `POST /${tableName} -> db.add("${tableName}", body)\n`;
    content += `PUT /${tableName}/:id -> db.update("${tableName}", params.id, body)\n`;
    content += `DELETE /${tableName}/:id -> db.remove("${tableName}", params.id)\n\n`;
  }
  
  return content;
}

/**
 * Generate app configuration file
 */
function generateAppConfig(appModel: AppModel, plan: ArchitecturePlan): string {
  let content = `// ${appModel.appName} - Main Application Configuration\n`;
  content += `// Generated with ${plan.structure} architecture\n\n`;
  content += `app ${appModel.appName}\n\n`;
  
  content += `// Import models\n`;
  for (const entity of appModel.entities) {
    content += `// import ${entity.name} from "path/to/${entity.name}.shep"\n`;
  }
  content += `\n`;
  
  content += `// Import views\n`;
  for (const view of appModel.views) {
    content += `// import ${view.name} from "path/to/${view.name}.shep"\n`;
  }
  content += `\n`;
  
  const firstView = appModel.views[0]?.name || 'Dashboard';
  content += `// App entry point\n`;
  content += `view ${firstView}\n`;
  
  return content;
}

/**
 * Generate project README
 */
function generateProjectReadme(appModel: AppModel, plan: ArchitecturePlan): string {
  let content = `# ${appModel.appName}\n\n`;
  content += `Generated by ShepLang with **${plan.structure}** architecture.\n\n`;
  
  content += `## Project Type\n\n${plan.projectType}\n\n`;
  
  content += `## Architecture\n\n`;
  content += `**Structure:** ${plan.structure}\n\n`;
  content += `${plan.reasoning}\n\n`;
  
  content += `## Folder Structure\n\n`;
  for (const folder of plan.folders) {
    content += `### ${folder.path}/\n\n`;
    content += `${folder.purpose}\n\n`;
    content += `**Files:**\n`;
    for (const file of folder.files) {
      content += `- \`${file.name}\` - ${file.purpose}\n`;
    }
    content += `\n`;
  }
  
  content += `## Conventions\n\n`;
  content += `- **Naming:** ${plan.conventions.naming}\n`;
  content += `- **File Organization:** ${plan.conventions.fileOrganization}\n`;
  content += `- **Import Strategy:** ${plan.conventions.importStrategy}\n\n`;
  
  content += `## Getting Started\n\n`;
  content += `1. Review the generated files in each folder\n`;
  content += `2. Fill in TODO comments with your business logic\n`;
  content += `3. Run \`sheplang dev\` to start the development server\n`;
  content += `4. Open the browser preview to see your app\n\n`;
  
  content += `## Entities\n\n`;
  for (const entity of appModel.entities) {
    content += `- **${entity.name}** (${entity.fields.length} fields)\n`;
  }
  content += `\n`;
  
  content += `## Views\n\n`;
  for (const view of appModel.views) {
    content += `- **${view.name}**\n`;
  }
  content += `\n`;
  
  content += `---\n\nGenerated on ${new Date().toLocaleDateString()}\n`;
  
  return content;
}

/**
 * Generate import report
 */
function generateImportReport(
  appModel: AppModel,
  plan: ArchitecturePlan,
  files: GeneratedFile[]
): string {
  let report = `# Import Report: ${appModel.appName}\n\n`;
  report += `**Architecture:** ${plan.structure}\n`;
  report += `**Project Type:** ${plan.projectType}\n`;
  report += `**Files Generated:** ${files.length}\n\n`;
  
  report += `## Structure\n\n`;
  const folders = new Set(files.map(f => path.dirname(f.relativePath)));
  for (const folder of Array.from(folders).sort()) {
    const folderFiles = files.filter(f => path.dirname(f.relativePath) === folder);
    report += `### ${folder}/\n`;
    for (const file of folderFiles) {
      report += `- ${path.basename(file.relativePath)}\n`;
    }
    report += `\n`;
  }
  
  report += `## AI Reasoning\n\n`;
  report += `${plan.reasoning}\n\n`;
  
  report += `## Next Steps\n\n`;
  report += `1. Open the project in VS Code Explorer\n`;
  report += `2. Review the README.md for architecture overview\n`;
  report += `3. Start with the main app.shep file\n`;
  report += `4. Implement TODOs in each feature folder\n`;
  
  return report;
}

/**
 * Write all project files to disk
 */
async function writeProjectFiles(
  outputPath: string,
  files: GeneratedFile[]
): Promise<void> {
  // Create all directories first
  const dirs = new Set(files.map(f => path.dirname(path.join(outputPath, f.relativePath))));
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Write all files
  for (const file of files) {
    const filePath = path.join(outputPath, file.relativePath);
    fs.writeFileSync(filePath, file.content, 'utf-8');
  }
}
