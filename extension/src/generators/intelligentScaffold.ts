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

  // ==========================================================================
  // A-GRADE UX FIX: All declarations go in app.shep
  // 
  // Separate .shep files cause "not found" errors because:
  // 1. Each file has its own `app { }` block
  // 2. Cross-file references don't resolve in ShepLang grammar
  // 3. Users see confusing "Entity not found" errors
  //
  // Solution: Put EVERYTHING in app.shep (already done in generateAppConfig)
  // Generate README files for folder documentation only
  // ==========================================================================
  
  console.log(`[IntelligentScaffold] All ${appModel.entities.length} entities, ${appModel.views.length} views, ${appModel.actions.length} actions in app.shep`);
  
  // Generate folder READMEs for organization (not .shep files)
  if (appModel.entities.length > 0) {
    files.push({
      relativePath: 'models/README.md',
      content: `# Data Models\n\nThis project has ${appModel.entities.length} data models defined in \`app.shep\`.\n\n## Models\n${appModel.entities.map(e => `- ${e.name}`).join('\n')}\n`,
      dependencies: []
    });
  }
  
  if (appModel.views.length > 0) {
    files.push({
      relativePath: 'views/README.md', 
      content: `# Views\n\nThis project has ${appModel.views.length} views defined in \`app.shep\`.\n\n## Views\n${appModel.views.slice(0, 20).map(v => `- ${v.name}`).join('\n')}${appModel.views.length > 20 ? `\n- ... and ${appModel.views.length - 20} more` : ''}\n`,
      dependencies: []
    });
  }
  
  if (appModel.actions.length > 0) {
    files.push({
      relativePath: 'actions/README.md',
      content: `# Actions\n\nThis project has ${appModel.actions.length} actions defined in \`app.shep\`.\n\n## Actions\n${appModel.actions.map(a => `- ${a.name}`).join('\n')}\n`,
      dependencies: []
    });
  }

  // Skip ALL separate .shep file generation for A-grade UX
  // Everything is in app.shep - no reference errors, no confusion
  // 
  // Future: Re-enable when cross-file resolution is fully implemented
  // - workflows, jobs, realtime, integrations need grammar support
  // - Cross-file references need Langium scope provider updates

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
 * FIXED: Generate VALID ShepLang syntax
 */
function generateEntityModelFile(entity: any, appModel: AppModel): string {
  // Generate VALID ShepLang syntax
  let content = `app ${appModel.appName} {\n`;
  content += `  // ${entity.name} Data Model\n`;
  content += `  // Source: ${entity.source || 'imported'}\n\n`;
  content += `  data ${entity.name} {\n`;
  content += `    fields: {\n`;
  
  for (const field of entity.fields || []) {
    const fieldName = sanitizeFieldName(field.name);
    const fieldType = mapFieldType(field.type);
    content += `      ${fieldName}: ${fieldType}\n`;
  }
  
  content += `    }\n`;
  content += `  }\n`;
  content += `}\n`;
  
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
 * FIXED: Generate VALID ShepLang syntax (not YAML-like)
 * ShepUI screen kind is embedded in comments for preview to parse
 */
function generateViewFileFromModel(view: any, appModel: AppModel): string {
  const screenKind = detectScreenKind(view, appModel);
  const relatedEntity = findRelatedEntity(view, appModel);
  const firstAction = appModel.actions[0]?.name || 'HandleAction';
  
  // Generate VALID ShepLang syntax
  let content = `app ${appModel.appName} {\n`;
  content += `  // ${view.name} Screen\n`;
  content += `  // @shepui-kind: ${screenKind}\n`;
  content += `  // @shepui-entity: ${relatedEntity || 'none'}\n`;
  content += `  // From: ${view.filePath || 'imported'}\n\n`;
  
  content += `  view ${view.name} {\n`;
  
  // Generate content based on screen kind
  switch (screenKind) {
    case 'form':
      // Form screens get entity list and submit button
      if (relatedEntity) {
        content += `    list ${relatedEntity}\n`;
      }
      content += `    button "Submit" -> ${firstAction}\n`;
      content += `    button "Cancel" -> ${firstAction}\n`;
      break;
      
    case 'dashboard':
      // Dashboard screens get multiple entity lists
      if (relatedEntity) {
        content += `    list ${relatedEntity}\n`;
      }
      content += `    button "Refresh" -> ${firstAction}\n`;
      content += `    button "Settings" -> ${firstAction}\n`;
      break;
      
    case 'detail':
      // Detail screens get single entity reference
      if (relatedEntity) {
        content += `    list ${relatedEntity}\n`;
      }
      content += `    button "Edit" -> ${firstAction}\n`;
      content += `    button "Delete" -> ${firstAction}\n`;
      break;
      
    case 'inbox':
      // Inbox screens get list and compose button
      if (relatedEntity) {
        content += `    list ${relatedEntity}\n`;
      }
      content += `    button "Compose" -> ${firstAction}\n`;
      break;
      
    case 'feed':
      // Feed screens get list with load more
      if (relatedEntity) {
        content += `    list ${relatedEntity}\n`;
      }
      content += `    button "Load More" -> ${firstAction}\n`;
      break;
      
    default:
      // Basic screens
      if (relatedEntity) {
        content += `    list ${relatedEntity}\n`;
      }
      content += `    button "Action" -> ${firstAction}\n`;
  }
  
  // Close view and app blocks
  content += `  }\n`;
  content += `}\n`;
  
  return content;
}

/**
 * Generate action file from appModel action
 * FIXED: Generate VALID ShepLang syntax
 */
function generateActionFileFromModel(action: any, appModel: AppModel): string {
  const params = (action.parameters && action.parameters.length > 0)
    ? action.parameters.join(', ')
    : 'params';
  
  const firstEntity = appModel.entities[0]?.name || 'Data';
  const firstView = appModel.views[0]?.name || 'Dashboard';
  
  // Generate VALID ShepLang syntax
  let content = `app ${appModel.appName} {\n`;
  content += `  // ${action.name} Action\n`;
  content += `  // Source: ${action.source || 'imported'}\n\n`;
  content += `  action ${action.name}(${params}) {\n`;
  content += `    add ${firstEntity} with ${params}\n`;
  content += `    show ${firstView}\n`;
  content += `  }\n`;
  content += `}\n`;
  
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
 * Map field types to valid ShepLang types
 */
function mapFieldType(type: string): string {
  const typeMap: Record<string, string> = {
    'string': 'text',
    'String': 'text',
    'text': 'text',
    'number': 'number',
    'Number': 'number',
    'int': 'number',
    'Int': 'number',
    'integer': 'number',
    'float': 'number',
    'Float': 'number',
    'boolean': 'yes/no',
    'Boolean': 'yes/no',
    'bool': 'yes/no',
    'date': 'date',
    'Date': 'date',
    'DateTime': 'date',
    'datetime': 'date',
    'email': 'email',
    'Email': 'email',
    'money': 'money',
    'Money': 'money',
    'decimal': 'money',
    'Decimal': 'money',
    'image': 'image',
    'Image': 'image',
    'file': 'file',
    'File': 'file',
    'id': 'id',
    'Id': 'id',
    'ID': 'id'
  };
  return typeMap[type] || 'text';
}

/**
 * Reserved words in ShepLang that cannot be used as field names
 * These are types and keywords that would confuse the parser
 */
const RESERVED_FIELD_NAMES = new Set([
  'id', 'text', 'number', 'date', 'email', 'money', 'image', 'datetime', 
  'richtext', 'file', 'yes', 'no', 'app', 'data', 'view', 'action', 
  'fields', 'states', 'rules', 'list', 'button', 'show', 'add', 'set',
  'call', 'load', 'job', 'workflow', 'flow', 'trigger', 'schedule'
]);

/**
 * Sanitize field name to avoid conflicts with ShepLang reserved words
 */
function sanitizeFieldName(name: string): string {
  if (!name) return 'field';
  const lower = name.toLowerCase();
  if (RESERVED_FIELD_NAMES.has(lower)) {
    // Prefix with underscore or append 'Field'
    return `${name}Field`;
  }
  return name;
}

/**
 * Generate app configuration file
 * FIXED: Generate VALID ShepLang syntax with brace-based declarations
 * This file can be previewed in the browser
 */
function generateAppConfig(appModel: AppModel, plan: ArchitecturePlan): string {
  // Deduplicate entities, views, and actions by name
  const uniqueEntities = deduplicateByName(appModel.entities);
  const uniqueViews = deduplicateByName(appModel.views);
  const uniqueActions = deduplicateByName(appModel.actions);
  
  // Start app block - VALID ShepLang syntax
  let content = `app ${appModel.appName} {\n`;
  content += `  // ${appModel.appName} - Main Application\n`;
  content += `  // Generated with ${plan.structure} architecture\n`;
  content += `  // Source: ${plan.projectType}\n\n`;
  
  // Generate ALL data declarations (complete for reference resolution)
  if (uniqueEntities.length > 0) {
    content += `  // === Data Models (${uniqueEntities.length} total) ===\n`;
    for (const entity of uniqueEntities) {
      const entityName = sanitizeFilename(entity.name);
      if (entityName) {
        content += `  data ${entityName} {\n`;
        content += `    fields: {\n`;
        // Include ALL fields for proper type resolution
        const fields = entity.fields || [];
        for (const field of fields) {
          const fieldType = mapFieldType(field.type);
          const fieldName = sanitizeFieldName(field.name);
          content += `      ${fieldName}: ${fieldType}\n`;
        }
        content += `    }\n`;
        content += `  }\n\n`;
      }
    }
  }
  
  // Generate ALL view declarations (complete for reference resolution)
  if (uniqueViews.length > 0) {
    content += `  // === Views (${uniqueViews.length} total) ===\n`;
    // First, find the first valid action for button references
    const firstValidAction = uniqueActions.find(a => sanitizeFilename(a.name));
    const defaultActionName = firstValidAction ? sanitizeFilename(firstValidAction.name) : null;
    
    for (const view of uniqueViews) {
      const safeName = sanitizeFilename(view.name);
      if (safeName) {
        content += `  view ${safeName} {\n`;
        // Reference first entity if available
        if (uniqueEntities.length > 0) {
          const entityName = sanitizeFilename(uniqueEntities[0].name);
          if (entityName) {
            content += `    list ${entityName}\n`;
          }
        }
        // Only add button if we have a valid action to reference
        if (defaultActionName) {
          content += `    button "Action" -> ${defaultActionName}\n`;
        }
        content += `  }\n\n`;
      }
    }
  }
  
  // Generate ALL action declarations (complete for reference resolution)
  if (uniqueActions.length > 0) {
    content += `  // === Actions (${uniqueActions.length} total) ===\n`;
    // Find first valid entity and view for action bodies
    const firstValidEntity = uniqueEntities.find(e => sanitizeFilename(e.name));
    const firstValidView = uniqueViews.find(v => sanitizeFilename(v.name));
    const entityName = firstValidEntity ? sanitizeFilename(firstValidEntity.name) : 'Data';
    const viewName = firstValidView ? sanitizeFilename(firstValidView.name) : 'Dashboard';
    
    for (const action of uniqueActions) {
      const safeName = sanitizeFilename(action.name);
      if (safeName) {
        content += `  action ${safeName}(params) {\n`;
        content += `    add ${entityName} with params\n`;
        content += `    show ${viewName}\n`;
        content += `  }\n\n`;
      }
    }
  }
  
  // Close app block
  content += `}\n`;
  
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

// =============================================================================
// ShepAPI GENERATORS - Workflows, Real-time, Jobs, Integrations
// =============================================================================

interface GeneratedShepFile {
  name: string;
  content: string;
}

/**
 * Detect workflow patterns from actions
 * Workflows are multi-step processes like: Create -> Validate -> Send Email -> Update Status
 */
function detectWorkflowPatterns(appModel: AppModel): Array<{name: string; trigger: string; steps: string[]; entity: string | null}> {
  const patterns: Array<{name: string; trigger: string; steps: string[]; entity: string | null}> = [];
  
  // Group actions by entity/feature
  const actionsByPrefix = new Map<string, any[]>();
  for (const action of appModel.actions) {
    const name = action.name || '';
    // Extract prefix: CreateUser -> User, HandlePayment -> Payment
    const match = name.match(/^(Create|Update|Delete|Handle|Submit|Process|Send|Verify|Accept|Reject|Cancel)(.+)$/i);
    if (match) {
      const prefix = match[2];
      if (!actionsByPrefix.has(prefix)) {
        actionsByPrefix.set(prefix, []);
      }
      actionsByPrefix.get(prefix)!.push(action);
    }
  }
  
  // Create workflows for entities with multiple related actions
  for (const [entityName, actions] of actionsByPrefix) {
    if (actions.length >= 2) {
      // This looks like a workflow candidate
      const hasCreate = actions.some(a => /create/i.test(a.name));
      const hasUpdate = actions.some(a => /update/i.test(a.name));
      const hasProcess = actions.some(a => /(process|handle|submit)/i.test(a.name));
      
      if (hasCreate || hasProcess) {
        const steps = actions.map(a => {
          const actionType = a.name.replace(entityName, '').replace(/^(Create|Update|Delete|Handle|Submit|Process|Send|Verify)/i, '$1');
          return `${actionType} ${entityName}`;
        });
        
        patterns.push({
          name: `${entityName}Workflow`,
          trigger: hasCreate ? `User creates ${entityName}` : `User submits ${entityName}`,
          steps,
          entity: entityName
        });
      }
    }
  }
  
  // Also check views for form submissions that trigger workflows
  for (const view of appModel.views) {
    const viewName = view.name?.toLowerCase() || '';
    if (viewName.includes('signup') || viewName.includes('register')) {
      patterns.push({
        name: 'UserOnboardingWorkflow',
        trigger: 'User completes signup',
        steps: [
          'Validate user data',
          'Create user account',
          'Send welcome email',
          'Set up default settings'
        ],
        entity: 'User'
      });
    }
    if (viewName.includes('checkout') || viewName.includes('payment')) {
      patterns.push({
        name: 'PaymentWorkflow',
        trigger: 'User initiates payment',
        steps: [
          'Validate payment details',
          'Process payment with Stripe',
          'On success: Create order record',
          'Send confirmation email',
          'Update inventory'
        ],
        entity: 'Payment'
      });
    }
  }
  
  return patterns;
}

/**
 * Generate workflow files from actions
 */
function generateWorkflowsFromActions(appModel: AppModel): GeneratedShepFile[] {
  const workflows: GeneratedShepFile[] = [];
  const patterns = detectWorkflowPatterns(appModel);
  
  for (const pattern of patterns) {
    // Generate VALID ShepLang brace-based syntax for workflows
    // Grammar: workflow Name { on State { event Name -> Target } }
    let content = `app ${appModel.appName} {\n`;
    content += `  // ${pattern.name} - Automated Workflow\n`;
    content += `  // Trigger: ${pattern.trigger}\n`;
    if (pattern.entity) {
      content += `  // Entity: ${pattern.entity}\n`;
    }
    content += `\n`;
    content += `  workflow ${pattern.name} {\n`;
    
    // Generate workflow states based on steps
    content += `    on Initiated {\n`;
    content += `      event Start -> Processing\n`;
    content += `    }\n`;
    
    content += `    on Processing {\n`;
    for (let i = 0; i < pattern.steps.length; i++) {
      const stepName = `Step${i + 1}`;
      const nextState = i < pattern.steps.length - 1 ? 'Processing' : 'Completed';
      content += `      event ${stepName} -> ${nextState}\n`;
    }
    content += `    }\n`;
    
    content += `    on Completed {\n`;
    content += `      event Finish -> Done\n`;
    content += `    }\n`;
    
    content += `  }\n`;
    content += `}\n`;
    
    workflows.push({
      name: pattern.name,
      content
    });
  }
  
  return workflows;
}

/**
 * Detect which entities need real-time updates
 */
function detectRealtimeEntities(appModel: AppModel): string[] {
  const realtimeEntities: string[] = [];
  
  for (const entity of appModel.entities) {
    const name = entity.name?.toLowerCase() || '';
    // Common real-time patterns
    if (name.includes('message') || name.includes('notification') || 
        name.includes('chat') || name.includes('comment') ||
        name.includes('activity') || name.includes('event') ||
        name.includes('order') || name.includes('status')) {
      realtimeEntities.push(entity.name);
    }
  }
  
  // Also check views for real-time indicators
  for (const view of appModel.views) {
    const viewName = view.name?.toLowerCase() || '';
    if (viewName.includes('dashboard') || viewName.includes('feed') || 
        viewName.includes('inbox') || viewName.includes('live')) {
      // Find related entity
      for (const entity of appModel.entities) {
        if (!realtimeEntities.includes(entity.name)) {
          realtimeEntities.push(entity.name);
          break; // Just add one for dashboards
        }
      }
    }
  }
  
  return [...new Set(realtimeEntities)]; // Deduplicate
}

/**
 * Generate real-time hook files for entities
 */
function generateRealtimeHooks(appModel: AppModel): GeneratedShepFile[] {
  const hooks: GeneratedShepFile[] = [];
  const realtimeEntities = detectRealtimeEntities(appModel);
  
  for (const entityName of realtimeEntities) {
    let content = `app ${appModel.appName}\n`;
    content += `// ${entityName} Real-Time Updates\n`;
    content += `// Generated by ShepAPI - Uses WebSocket/Socket.io\n\n`;
    content += `realtime ${entityName}Updates:\n`;
    content += `  entity: ${entityName}\n`;
    content += `  channel: "${entityName.toLowerCase()}"\n`;
    content += `  events:\n`;
    content += `    - "created": "New ${entityName} added"\n`;
    content += `    - "updated": "${entityName} modified"\n`;
    content += `    - "deleted": "${entityName} removed"\n`;
    content += `\n  hooks:\n`;
    content += `    use${entityName}Realtime:\n`;
    content += `      description: "Subscribe to ${entityName} updates"\n`;
    content += `      returns: "${entityName}[]"\n`;
    content += `    use${entityName}Presence:\n`;
    content += `      description: "Track who is viewing ${entityName}"\n`;
    content += `      returns: "User[]"\n`;
    
    hooks.push({
      name: `${entityName}Realtime`,
      content
    });
  }
  
  return hooks;
}

/**
 * Detect background job patterns
 */
function detectBackgroundJobs(appModel: AppModel): Array<{name: string; schedule: string; description: string; entity: string | null}> {
  const jobs: Array<{name: string; schedule: string; description: string; entity: string | null}> = [];
  
  // Check for entities that commonly need scheduled jobs
  for (const entity of appModel.entities) {
    const name = entity.name?.toLowerCase() || '';
    
    if (name.includes('subscription') || name.includes('billing')) {
      jobs.push({
        name: 'ProcessSubscriptionRenewals',
        schedule: '0 0 * * *', // Daily at midnight
        description: 'Process subscription renewals and billing',
        entity: entity.name
      });
    }
    
    if (name.includes('session') || name.includes('token')) {
      jobs.push({
        name: 'CleanupExpiredSessions',
        schedule: '0 */6 * * *', // Every 6 hours
        description: 'Remove expired sessions and tokens',
        entity: entity.name
      });
    }
    
    if (name.includes('invitation') || name.includes('invite')) {
      jobs.push({
        name: 'ExpireOldInvitations',
        schedule: '0 0 * * *', // Daily
        description: 'Expire invitations older than 7 days',
        entity: entity.name
      });
    }
    
    if (name.includes('notification')) {
      jobs.push({
        name: 'SendPendingNotifications',
        schedule: '*/5 * * * *', // Every 5 minutes
        description: 'Process and send pending notifications',
        entity: entity.name
      });
    }
  }
  
  // Always add common jobs for SaaS apps
  if (appModel.entities.length > 0) {
    jobs.push({
      name: 'GenerateAnalyticsReport',
      schedule: '0 6 * * 1', // Every Monday at 6 AM
      description: 'Generate weekly analytics report',
      entity: null
    });
    
    jobs.push({
      name: 'DatabaseBackup',
      schedule: '0 2 * * *', // Daily at 2 AM
      description: 'Backup database to cloud storage',
      entity: null
    });
  }
  
  return jobs;
}

/**
 * Generate background job files
 * Uses VALID ShepLang brace-based syntax for jobs
 * Grammar: job Name { schedule: cron "pattern" action { statements } }
 */
function generateBackgroundJobs(appModel: AppModel): GeneratedShepFile[] {
  const jobFiles: GeneratedShepFile[] = [];
  const jobs = detectBackgroundJobs(appModel);
  
  for (const job of jobs) {
    // Generate VALID ShepLang brace-based syntax for jobs
    let content = `app ${appModel.appName} {\n`;
    content += `  // ${job.name} - Background Job\n`;
    content += `  // ${job.description}\n`;
    if (job.entity) {
      content += `  // Related entity: ${job.entity}\n`;
    }
    content += `\n`;
    content += `  job ${job.name} {\n`;
    content += `    schedule: cron "${job.schedule}"\n`;
    content += `    action {\n`;
    content += `      // Job implementation here\n`;
    content += `    }\n`;
    content += `  }\n`;
    content += `}\n`;
    
    jobFiles.push({
      name: job.name,
      content
    });
  }
  
  return jobFiles;
}

/**
 * Detect third-party integrations based on entity and view names
 */
function detectIntegrations(appModel: AppModel): Array<{name: string; type: string; features: string[]}> {
  const integrations: Array<{name: string; type: string; features: string[]}> = [];
  const detectedTypes = new Set<string>();
  
  for (const entity of appModel.entities) {
    const name = entity.name?.toLowerCase() || '';
    
    // Payment integrations
    if ((name.includes('payment') || name.includes('subscription') || 
         name.includes('billing') || name.includes('price')) && !detectedTypes.has('stripe')) {
      detectedTypes.add('stripe');
      integrations.push({
        name: 'Stripe',
        type: 'payment',
        features: ['Payments', 'Subscriptions', 'Invoicing', 'Webhooks']
      });
    }
    
    // Email integrations
    if ((name.includes('email') || name.includes('invite') || 
         name.includes('notification') || name.includes('verification')) && !detectedTypes.has('email')) {
      detectedTypes.add('email');
      integrations.push({
        name: 'SendGrid',
        type: 'email',
        features: ['Transactional emails', 'Templates', 'Tracking', 'Webhooks']
      });
    }
    
    // Auth integrations
    if ((name.includes('session') || name.includes('account') || 
         name.includes('oauth') || name.includes('sso')) && !detectedTypes.has('auth')) {
      detectedTypes.add('auth');
      integrations.push({
        name: 'Auth0',
        type: 'authentication',
        features: ['SSO', 'OAuth providers', 'MFA', 'Session management']
      });
    }
    
    // Storage integrations
    if ((name.includes('file') || name.includes('upload') || 
         name.includes('image') || name.includes('avatar')) && !detectedTypes.has('storage')) {
      detectedTypes.add('storage');
      integrations.push({
        name: 'AWS_S3',
        type: 'storage',
        features: ['File uploads', 'CDN', 'Signed URLs', 'Image optimization']
      });
    }
  }
  
  // Check views for additional integrations
  for (const view of appModel.views) {
    const viewName = view.name?.toLowerCase() || '';
    
    if ((viewName.includes('analytics') || viewName.includes('dashboard')) && !detectedTypes.has('analytics')) {
      detectedTypes.add('analytics');
      integrations.push({
        name: 'Mixpanel',
        type: 'analytics',
        features: ['Event tracking', 'User analytics', 'Funnels', 'Cohorts']
      });
    }
  }
  
  return integrations;
}

/**
 * Generate integration files based on detected services
 */
function generateIntegrationFiles(appModel: AppModel): GeneratedShepFile[] {
  const integrationFiles: GeneratedShepFile[] = [];
  const integrations = detectIntegrations(appModel);
  
  for (const integration of integrations) {
    let content = `app ${appModel.appName}\n`;
    content += `// ${integration.name} Integration\n`;
    content += `// Type: ${integration.type}\n`;
    content += `// Generated by ShepAPI\n\n`;
    content += `integration ${integration.name}:\n`;
    content += `  type: "${integration.type}"\n`;
    content += `  provider: "${integration.name.toLowerCase()}"\n`;
    content += `\n  features:\n`;
    for (const feature of integration.features) {
      content += `    - "${feature}"\n`;
    }
    content += `\n  config:\n`;
    content += `    api_key: env("${integration.name.toUpperCase()}_API_KEY")\n`;
    content += `    webhook_secret: env("${integration.name.toUpperCase()}_WEBHOOK_SECRET")\n`;
    content += `\n  webhooks:\n`;
    content += `    endpoint: "/api/webhooks/${integration.name.toLowerCase()}"\n`;
    content += `    events:\n`;
    
    // Add integration-specific webhook events
    if (integration.type === 'payment') {
      content += `      - "payment.succeeded"\n`;
      content += `      - "payment.failed"\n`;
      content += `      - "subscription.created"\n`;
      content += `      - "subscription.cancelled"\n`;
    } else if (integration.type === 'email') {
      content += `      - "email.delivered"\n`;
      content += `      - "email.bounced"\n`;
      content += `      - "email.opened"\n`;
    } else {
      content += `      - "event.received"\n`;
    }
    
    integrationFiles.push({
      name: integration.name,
      content
    });
  }
  
  return integrationFiles;
}
