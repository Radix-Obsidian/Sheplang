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
  console.log(`[IntelligentScaffold] generateFromPlan called:`);
  console.log(`  - appModel.appName: ${appModel.appName}`);
  console.log(`  - outputPath: ${outputPath}`);
  console.log(`  - plan.folders: ${plan.folders?.length || 0}`);
  
  // Create AI agent if context provided
  const agent = context ? new ShepLangCodeAgent(context) : null;
  const files: GeneratedFile[] = [];

  // Generate files for each folder in the plan
  for (const folder of plan.folders) {
    const folderFiles = await generateFolderFiles(folder, appModel, plan, agent);
    files.push(...folderFiles);
  }

  // CRITICAL FALLBACK: Generate essential files from appModel
  // Even if AI plan has empty folders, we MUST generate these files
  const essentialFiles = generateEssentialFiles(appModel);
  files.push(...essentialFiles);

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

  // Generate main backend file with ALL entities
  files.push({
    relativePath: `${appModel.appName}.shepthon`,
    content: generateMainBackendFile(appModel),
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
 * CRITICAL: Generate essential files from appModel
 * This ensures we always have real files even if AI plan is incomplete
 * FIX: Use 'models/', 'views/', 'actions/' WITHOUT 'src/' prefix to avoid duplication
 * The outputPath already handles the root, and AI plan folders may include src/
 */
function generateEssentialFiles(appModel: AppModel): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const seenPaths = new Set<string>(); // Prevent duplicate files
  
  console.log(`[IntelligentScaffold] generateEssentialFiles called:`);
  console.log(`  - Entities: ${appModel.entities.length}`);
  console.log(`  - Views: ${appModel.views.length}`);
  console.log(`  - Actions: ${appModel.actions.length}`);

  // Generate model files for each entity (deduplicated)
  for (const entity of appModel.entities) {
    const safeName = sanitizeFilename(entity.name);
    if (safeName) {
      const relativePath = `models/${safeName}.shep`;
      if (!seenPaths.has(relativePath)) {
        seenPaths.add(relativePath);
        files.push({
          relativePath,
          content: generateEntityModelFile(entity, appModel),
          dependencies: []
        });
        console.log(`[IntelligentScaffold] Added model: ${safeName}`);
      }
    }
  }

  // Generate view files for each view (deduplicated)
  for (const view of appModel.views) {
    const safeName = sanitizeFilename(view.name);
    if (safeName) {
      const relativePath = `views/${safeName}.shep`;
      if (!seenPaths.has(relativePath)) {
        seenPaths.add(relativePath);
        files.push({
          relativePath,
          content: generateViewFileFromModel(view, appModel),
          dependencies: []
        });
        console.log(`[IntelligentScaffold] Added view: ${safeName}`);
      }
    } else {
      console.warn(`[IntelligentScaffold] Skipped invalid view name: ${view.name}`);
    }
  }

  // Generate action files for each action (deduplicated)
  for (const action of appModel.actions) {
    const safeName = sanitizeFilename(action.name);
    if (safeName) {
      const relativePath = `actions/${safeName}.shep`;
      if (!seenPaths.has(relativePath)) {
        seenPaths.add(relativePath);
        files.push({
          relativePath,
          content: generateActionFileFromModel(action, appModel),
          dependencies: []
        });
        console.log(`[IntelligentScaffold] Added action: ${safeName}`);
      }
    } else {
      console.warn(`[IntelligentScaffold] Skipped invalid action name: ${action.name}`);
    }
  }

  console.log(`[IntelligentScaffold] Total essential files: ${files.length}`);
  return files;
}

/**
 * Sanitize a string to be a valid filename
 * Extracts identifier from complex expressions like arrow functions
 */
function sanitizeFilename(name: string): string | null {
  // Try to extract a function name from complex signatures
  // e.g., "(event) => void handleUserCreate(...)" -> "handleUserCreate"
  const funcMatch = name.match(/\b(handle\w+|on\w+|\w+Handler|\w+Action)\b/i);
  if (funcMatch) {
    return funcMatch[1].replace(/[^a-zA-Z0-9_]/g, '');
  }
  
  // Try to get any reasonable identifier
  const identMatch = name.match(/^([a-zA-Z_][a-zA-Z0-9_]*)$/);
  if (identMatch) {
    return identMatch[1];
  }
  
  // Extract first valid identifier from the string
  const firstIdentMatch = name.match(/\b([a-zA-Z_][a-zA-Z0-9_]{2,})\b/);
  if (firstIdentMatch) {
    return firstIdentMatch[1];
  }
  
  // Last resort: remove all invalid characters
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Generate entity model file with proper structure
 */
function generateEntityModelFile(entity: any, appModel: AppModel): string {
  let content = `app ${appModel.appName}\n`;
  content += `// ${entity.name} Data Model\n`;
  content += `// Source: ${entity.source || 'imported'}\n\n`;
  content += `data ${entity.name}:\n`;
  content += `  fields:\n`;
  
  for (const field of entity.fields || []) {
    const optional = field.required ? '' : ' // optional';
    content += `    ${field.name}: ${field.type}${optional}\n`;
  }
  
  return content;
}

/**
 * Detect screen type based on view characteristics
 * ShepUI screen kinds: feed, detail, form, list, dashboard, inbox
 */
function detectScreenKind(view: any, appModel: AppModel): string {
  const name = view.name?.toLowerCase() || '';
  const widgets = view.widgets || [];
  
  // Check for form indicators
  if (name.includes('create') || name.includes('edit') || name.includes('new') || 
      name.includes('add') || name.includes('form') || name.includes('signup') ||
      name.includes('login') || name.includes('register')) {
    return 'form';
  }
  
  // Check for detail/single item indicators
  if (name.includes('detail') || name.includes('view') || name.includes('profile') ||
      name.includes('single') || name.endsWith('page')) {
    return 'detail';
  }
  
  // Check for dashboard indicators
  if (name.includes('dashboard') || name.includes('admin') || name.includes('stats') ||
      name.includes('analytics') || name.includes('overview')) {
    return 'dashboard';
  }
  
  // Check for inbox/messaging indicators
  if (name.includes('inbox') || name.includes('message') || name.includes('chat') ||
      name.includes('notification')) {
    return 'inbox';
  }
  
  // Check for list/feed based on widgets
  const hasList = widgets.some((w: any) => w.kind === 'list');
  if (hasList || name.includes('list') || name.includes('feed') || name.endsWith('s')) {
    return 'feed';
  }
  
  return 'basic';
}

/**
 * Find related entity for a view
 */
function findRelatedEntity(view: any, appModel: AppModel): string | null {
  const name = view.name?.toLowerCase() || '';
  
  // Try to match view name with entity
  for (const entity of appModel.entities) {
    const entityLower = entity.name.toLowerCase();
    if (name.includes(entityLower) || entityLower.includes(name.replace(/list|feed|detail|form|create|edit/gi, ''))) {
      return entity.name;
    }
  }
  
  // Return first entity as fallback
  return appModel.entities[0]?.name || null;
}

/**
 * Generate view file from appModel view
 * Enhanced with ShepUI screen kind detection and rich widget generation
 */
function generateViewFileFromModel(view: any, appModel: AppModel): string {
  const screenKind = detectScreenKind(view, appModel);
  const relatedEntity = findRelatedEntity(view, appModel);
  
  let content = `app ${appModel.appName}\n`;
  content += `// ${view.name} Screen\n`;
  content += `// Kind: ${screenKind}\n`;
  content += `// From: ${view.filePath || 'imported'}\n\n`;
  content += `view ${view.name}:\n`;
  content += `  kind: "${screenKind}"\n`;
  
  if (relatedEntity) {
    content += `  entity: ${relatedEntity}\n`;
  }
  
  content += `  layout:\n`;
  
  // Generate layout based on screen kind
  switch (screenKind) {
    case 'feed':
      content += `    - "Header with search bar"\n`;
      content += `    - "Filter panel"\n`;
      if (relatedEntity) {
        content += `    - "Grid of ${relatedEntity}s with infinite scroll"\n`;
      }
      content += `    - "Loading indicator"\n`;
      break;
      
    case 'detail':
      content += `    - "Back navigation"\n`;
      if (relatedEntity) {
        content += `    - "Image gallery for ${relatedEntity}"\n`;
        content += `    - "Title and description"\n`;
        content += `    - "Details section"\n`;
      }
      content += `    - "Action buttons"\n`;
      break;
      
    case 'form':
      content += `    - "Form header"\n`;
      if (relatedEntity) {
        // Add fields from entity
        const entity = appModel.entities.find(e => e.name === relatedEntity);
        if (entity?.fields) {
          for (const field of entity.fields.slice(0, 5)) {
            content += `    - "Field '${field.name}' (${field.type})"\n`;
          }
        }
      }
      content += `    - "Submit button"\n`;
      content += `    - "Cancel button"\n`;
      break;
      
    case 'dashboard':
      content += `    - "Stats cards row"\n`;
      content += `    - "Charts section"\n`;
      content += `    - "Recent activity table"\n`;
      content += `    - "Quick actions"\n`;
      break;
      
    case 'inbox':
      content += `    - "Conversation list"\n`;
      content += `    - "Message thread"\n`;
      content += `    - "Message composer"\n`;
      break;
      
    default:
      // Generate from widgets if available
      if (view.widgets && view.widgets.length > 0) {
        for (const widget of view.widgets) {
          if (widget.kind === 'list') {
            content += `    - "List of ${widget.entityName || 'items'}"\n`;
          } else if (widget.kind === 'button') {
            content += `    - "Button '${widget.label || 'Action'}' -> ${widget.actionName || 'HandleClick'}"\n`;
          } else if (widget.kind === 'input') {
            content += `    - "Input field"\n`;
          } else if (widget.kind === 'text') {
            content += `    - "Text content"\n`;
          } else {
            content += `    - "${widget.kind || 'Component'}"\n`;
          }
        }
      } else {
        content += `    - "Content section"\n`;
      }
  }
  
  // Add actions if available
  if (view.actions && view.actions.length > 0) {
    content += `\n  actions:\n`;
    for (const action of view.actions) {
      content += `    - "${action.name}" -> ${action.target || 'Handle' + action.name}\n`;
    }
  }
  
  return content;
}

/**
 * Generate action file from appModel action
 */
function generateActionFileFromModel(action: any, appModel: AppModel): string {
  const params = (action.parameters && action.parameters.length > 0)
    ? action.parameters.join(', ')
    : 'params';
  
  let content = `app ${appModel.appName}\n`;
  content += `// ${action.name} Action\n`;
  content += `// Source: ${action.source || 'imported'}\n\n`;
  content += `action ${action.name}(${params}):\n`;
  
  if (action.apiCalls && action.apiCalls.length > 0) {
    for (const apiCall of action.apiCalls) {
      if (apiCall.method === 'GET') {
        content += `  load ${apiCall.method} "${apiCall.path}" into data\n`;
      } else {
        content += `  call ${apiCall.method} "${apiCall.path}"\n`;
      }
    }
  } else {
    content += `  // TODO: Implement business logic\n`;
  }
  
  content += `  show Dashboard\n`;
  
  return content;
}

/**
 * Generate main backend file with ALL entities
 */
function generateMainBackendFile(appModel: AppModel): string {
  let content = `// ${appModel.appName} Backend API\n`;
  content += `// Generated by ShepLang Import\n\n`;
  
  // Generate models for all entities
  for (const entity of appModel.entities) {
    content += `model ${entity.name} {\n`;
    for (const field of entity.fields || []) {
      content += `  ${field.name}: ${field.type}\n`;
    }
    content += `}\n\n`;
    
    // Generate CRUD endpoints for entity
    const tableName = entity.name.toLowerCase();
    content += `GET /${tableName} -> db.all("${tableName}")\n`;
    content += `GET /${tableName}/:id -> db.find("${tableName}", params.id)\n`;
    content += `POST /${tableName} -> db.add("${tableName}", body)\n`;
    content += `PUT /${tableName}/:id -> db.update("${tableName}", params.id, body)\n`;
    content += `DELETE /${tableName}/:id -> db.remove("${tableName}", params.id)\n\n`;
  }
  
  return content;
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
  let content = `app ${entity.name}Model\n`;
  content += `// ${entity.name} Data Model\n`;
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
  let content = `app ${appModel.appName}\n`;
  content += `// ${view.name} Screen\n`;
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
  
  let content = `app ${action.name}App\n`;
  content += `// ${action.name} Action\n`;
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
 * FIX: Deduplicate imports to prevent duplicate import statements
 * FIX: Use paths WITHOUT 'src/' prefix to match generateEssentialFiles
 */
function generateAppConfig(appModel: AppModel, plan: ArchitecturePlan): string {
  // CRITICAL: app declaration MUST be on line 1 for diagnostics
  let content = `app ${appModel.appName}\n`;
  content += `// ${appModel.appName} - Main Application Configuration\n`;
  content += `// Generated with ${plan.structure} architecture\n\n`;
  
  // Deduplicate entities, views, and actions by name
  const uniqueEntities = deduplicateByName(appModel.entities);
  const uniqueViews = deduplicateByName(appModel.views);
  const uniqueActions = deduplicateByName(appModel.actions);
  
  // Import models with REAL paths (no src/ prefix to avoid duplication)
  if (uniqueEntities.length > 0) {
    content += `// Data Models\n`;
    for (const entity of uniqueEntities) {
      const safeName = sanitizeFilename(entity.name);
      if (safeName) {
        content += `import ${safeName} from "models/${safeName}.shep"\n`;
      }
    }
    content += `\n`;
  }
  
  // Import views with REAL paths (no src/ prefix)
  if (uniqueViews.length > 0) {
    content += `// Views\n`;
    for (const view of uniqueViews) {
      const safeName = sanitizeFilename(view.name);
      if (safeName) {
        content += `import ${safeName} from "views/${safeName}.shep"\n`;
      }
    }
    content += `\n`;
  }
  
  // Import actions with REAL paths (no src/ prefix)
  if (uniqueActions.length > 0) {
    content += `// Actions\n`;
    for (const action of uniqueActions) {
      const safeName = sanitizeFilename(action.name);
      if (safeName) {
        content += `import ${safeName} from "actions/${safeName}.shep"\n`;
      }
    }
    content += `\n`;
  }
  
  const firstView = uniqueViews[0]?.name ? sanitizeFilename(uniqueViews[0].name) : 'Dashboard';
  content += `// App entry point\n`;
  content += `view ${firstView || 'Dashboard'}\n`;
  
  return content;
}

/**
 * Deduplicate array items by name property
 */
function deduplicateByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const name = sanitizeFilename(item.name);
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  });
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
  console.log(`[IntelligentScaffold] Writing ${files.length} files to ${outputPath}`);
  
  if (files.length === 0) {
    console.error('[IntelligentScaffold] ERROR: No files to write!');
    throw new Error('No files generated - nothing to write');
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    console.log(`[IntelligentScaffold] Creating output directory: ${outputPath}`);
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Create all directories first
  const dirs = new Set(files.map(f => path.dirname(path.join(outputPath, f.relativePath))));
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[IntelligentScaffold] Created dir: ${dir}`);
      }
    } catch (err) {
      console.error(`[IntelligentScaffold] Failed to create dir ${dir}:`, err);
      throw err;
    }
  }
  
  // Write all files
  let written = 0;
  for (const file of files) {
    const filePath = path.join(outputPath, file.relativePath);
    try {
      fs.writeFileSync(filePath, file.content, 'utf-8');
      written++;
      console.log(`[IntelligentScaffold] Wrote: ${file.relativePath}`);
    } catch (err) {
      console.error(`[IntelligentScaffold] Failed to write ${filePath}:`, err);
      throw err;
    }
  }
  
  console.log(`[IntelligentScaffold] Successfully wrote ${written}/${files.length} files`);
  
  // Verify files exist
  const missing = files.filter(f => !fs.existsSync(path.join(outputPath, f.relativePath)));
  if (missing.length > 0) {
    console.error(`[IntelligentScaffold] VERIFICATION FAILED: ${missing.length} files missing after write`);
    throw new Error(`File verification failed: ${missing.length} files not found after write`);
  }
}
