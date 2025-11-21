/**
 * Intelligent Scaffold Generator
 * 
 * Generates project structure based on AI-designed architecture plan.
 * Inspired by Cursor Composer's multi-file generation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { AppModel } from '../parsers/astAnalyzer';
import { ArchitecturePlan } from '../wizard/architectureWizard';

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
  outputPath: string
): Promise<GeneratedProject> {
  const files: GeneratedFile[] = [];

  // Generate files for each folder in the plan
  for (const folder of plan.folders) {
    const folderFiles = await generateFolderFiles(folder, appModel, plan);
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
  plan: ArchitecturePlan
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
      plan
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
      const subFiles = await generateFolderFiles(subfolder, appModel, plan);
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
  plan: ArchitecturePlan
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
    
    // Generic .shep file
    return generateGenericShepFile(fileSpec);
  }
  
  if (fileName.endsWith('.shepthon')) {
    // Backend API file
    const entityName = fileName.replace('-api.shepthon', '').replace('.shepthon', '');
    const entity = appModel.entities.find(
      e => e.name.toLowerCase() === entityName.toLowerCase()
    );
    
    if (entity) {
      return generateBackendFile(entity, fileSpec, folder);
    }
    
    return generateGenericBackendFile(fileSpec);
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
 * Generate backend API file
 */
function generateBackendFile(entity: any, fileSpec: any, folder: any): string {
  const tableName = entity.name.toLowerCase();
  
  let content = `// ${entity.name} API Endpoints\n`;
  content += `// ${fileSpec.purpose}\n\n`;
  
  // Model definition
  content += `model ${entity.name} {\n`;
  for (const field of entity.fields) {
    content += `  ${field.name}: String\n`;
  }
  content += `  createdAt: DateTime\n`;
  content += `  updatedAt: DateTime\n`;
  content += `}\n\n`;
  
  // CRUD endpoints
  content += `// List all ${entity.name}s\n`;
  content += `GET /${tableName} -> db.all("${tableName}")\n\n`;
  
  content += `// Get single ${entity.name} by ID\n`;
  content += `GET /${tableName}/:id -> db.find("${tableName}", params.id)\n\n`;
  
  content += `// Create new ${entity.name}\n`;
  content += `POST /${tableName} -> db.add("${tableName}", body)\n\n`;
  
  content += `// Update ${entity.name}\n`;
  content += `PUT /${tableName}/:id -> db.update("${tableName}", params.id, body)\n\n`;
  
  content += `// Delete ${entity.name}\n`;
  content += `DELETE /${tableName}/:id -> db.remove("${tableName}", params.id)\n`;
  
  return content;
}

/**
 * Generate generic ShepLang file
 */
function generateGenericShepFile(fileSpec: any): string {
  return `// ${fileSpec.name}\n// ${fileSpec.purpose}\n\n// TODO: Implement this file\n`;
}

/**
 * Generate generic backend file
 */
function generateGenericBackendFile(fileSpec: any): string {
  return `// ${fileSpec.name}\n// ${fileSpec.purpose}\n\n// TODO: Add API endpoints\n`;
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
