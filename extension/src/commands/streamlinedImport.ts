/**
 * Streamlined Import Command
 * 
 * PROPERLY WIRED to use all Slice implementations:
 * - Slice 2: reactParser (React/TSX parsing)
 * - Slice 3: entityExtractor (Prisma schema parsing)
 * - Slice 4: viewMapper (Component → ShepLang mapping)
 * - Slice 5: apiRouteParser (Next.js API routes)
 * - Slice 6: importAnalysisAggregator + importWizardPanel
 * - Slice 7: telemetry
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Real Slice Imports - ALL WIRED!
import { extractEntities } from '../parsers/entityExtractor';
import { parseReactFile, ReactComponent } from '../parsers/reactParser';
import { mapProjectToShepLang } from '../parsers/viewMapper';
import { parseAPIRoutes } from '../parsers/apiRouteParser';
import { aggregateAnalysis } from '../services/importAnalysisAggregator';
import { showImportWizardPanel } from '../wizard/importWizardPanel';
import { trackImportStart, trackImportSuccess, trackImportFailure } from '../services/telemetry';

import { generateShepLangFiles, generateImportReport } from '../generators/shepGenerator';
import { generateShepThonBackend } from '../generators/shepthonGenerator';
import { generateFromPlan } from '../generators/intelligentScaffold';
import { outputChannel } from '../services/outputChannel';
import { callClaude } from '../ai/claudeClient';
import type { ArchitecturePlan } from '../wizard/architectureWizard';

// AppModel interface (full version)
interface AppModel {
  appName: string;
  projectRoot: string;
  entities: any[];
  views: any[];
  actions: any[];
  todos?: any[];
}

/**
 * Get a sensible default location for new projects
 * Prefers: Documents/ShepLang Projects, falls back to Desktop
 */
function getDefaultProjectsFolder(): string {
  const homedir = os.homedir();
  
  // Try Documents/ShepLang Projects
  const docsFolder = path.join(homedir, 'Documents', 'ShepLang Projects');
  if (fs.existsSync(path.join(homedir, 'Documents'))) {
    if (!fs.existsSync(docsFolder)) {
      try {
        fs.mkdirSync(docsFolder, { recursive: true });
      } catch {
        // Fall through to Desktop
      }
    }
    if (fs.existsSync(docsFolder)) {
      return docsFolder;
    }
  }
  
  // Fall back to Desktop
  const desktopFolder = path.join(homedir, 'Desktop');
  if (fs.existsSync(desktopFolder)) {
    return desktopFolder;
  }
  
  // Ultimate fallback: home directory
  return homedir;
}

/**
 * Parse all React/TSX files in a project (Slice 2 integration)
 */
async function parseReactProject(projectRoot: string): Promise<ReactComponent[]> {
  const components: ReactComponent[] = [];
  
  // Directories to scan for React components
  const scanDirs = [
    path.join(projectRoot, 'src'),
    path.join(projectRoot, 'app'),
    path.join(projectRoot, 'pages'),
    path.join(projectRoot, 'components'),
    path.join(projectRoot, 'src', 'components'),
    path.join(projectRoot, 'src', 'app'),
    path.join(projectRoot, 'src', 'pages')
  ];
  
  for (const dir of scanDirs) {
    if (fs.existsSync(dir)) {
      const files = findReactFiles(dir);
      for (const file of files) {
        try {
          const component = parseReactFile(file);
          if (component) {
            components.push(component);
          }
        } catch (error) {
          outputChannel.warn(`[Slice 2] Failed to parse ${file}: ${error}`);
        }
      }
    }
  }
  
  return components;
}

/**
 * Recursively find all React/TSX files in a directory
 */
function findReactFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules and hidden directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        files.push(...findReactFiles(fullPath));
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        // Skip test files, config files, and declaration files
        if (!/\.(test|spec|config|d)\./i.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

/**
 * Streamlined import with improved UX
 * 
 * NEW FLOW (works from blank VS Code window):
 * 1. Select source project (from Desktop/GitHub)
 * 2. Name your new ShepLang project
 * 3. Choose where to save it
 * 4. Analyze, generate, and OPEN the new workspace
 */
export async function streamlinedImport(context: vscode.ExtensionContext): Promise<void> {
  outputChannel.section('🐑 ShepLang Import Wizard');

  try {
    // STEP 1: Select the SOURCE project to import (no workspace required!)
    outputChannel.info('Step 1: Selecting source project...');
    
    const projectRoot = await selectProjectFolder();
    if (!projectRoot) {
      outputChannel.info('Import cancelled - no project selected');
      return;
    }

    // STEP 2: Detect what kind of project this is
    outputChannel.info('Step 2: Detecting project type...');
    const stack = await detectStack(projectRoot);
    
    if (!stack.isValid) {
      vscode.window.showErrorMessage(
        '❌ Not a valid Next.js/React/Vite project. Make sure the folder contains a package.json with React, Next.js, or Vite.'
      );
      return;
    }
    
    outputChannel.success(`✅ Found ${stack.framework.toUpperCase()} project!`);
    
    // Use actual root (handles nested GitHub ZIP folders)
    const analysisRoot = stack.actualRoot;
    
    // STEP 3: Ask user to name their NEW ShepLang project
    const projectName = await vscode.window.showInputBox({
      prompt: '🐑 What should we name your ShepLang project?',
      placeHolder: 'my-awesome-app',
      value: path.basename(analysisRoot).replace(/-main$/, ''), // Remove GitHub "-main" suffix
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Project name cannot be empty';
        }
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return null;
      }
    });
    
    if (!projectName) {
      outputChannel.info('Import cancelled - no project name provided');
      return;
    }
    
    // STEP 4: Ask where to save the NEW project
    const saveLocation = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(path.join(getDefaultProjectsFolder(), projectName)),
      saveLabel: 'Create ShepLang Project Here',
      title: '🐑 Where should we create your ShepLang project?'
    });
    
    if (!saveLocation) {
      outputChannel.info('Import cancelled - no save location selected');
      return;
    }
    
    const outputFolder = saveLocation.fsPath;
    
    // Create the output folder
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    
    outputChannel.info(`Creating project at: ${outputFolder}`);

    // Now run the analysis and generation with progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🐑 ShepLang Import',
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: `🔍 Analyzing ${stack.framework.toUpperCase()} project...`, increment: 10 });

        // Step 3: REAL ANALYSIS using all slices!
        // Track import start (Slice 7: Telemetry)
        trackImportStart(stack.framework, stack.hasPrisma);
        const startTime = Date.now();

        // 🐑 Golden Sheep messages - goofy but informative!
        progress.report({ message: '🐑 Baaaa! Sheep are reading your Prisma schema...', increment: 5 });
        
        // Slice 3: Entity Extraction (Prisma parsing)
        const entityResult = await extractEntities(analysisRoot);
        outputChannel.info(`[Slice 3] Extracted ${entityResult.entities.length} entities from ${entityResult.source}`);
        
        progress.report({ message: '🐑 Wooly good! Now sniffing your React components...', increment: 5 });
        
        // Slice 2: React Component Parsing
        const components = await parseReactProject(analysisRoot);
        outputChannel.info(`[Slice 2] Found ${components.length} React components`);
        
        progress.report({ message: '🐑 Baa-rilliant! Mapping components to ShepLang views...', increment: 5 });
        
        // Slice 4: View/Action Mapping
        const projectMapping = mapProjectToShepLang(components, entityResult.entities);
        outputChannel.info(`[Slice 4] Mapped ${projectMapping.views.length} views, ${projectMapping.actions.length} actions`);
        
        progress.report({ message: '🐑 Ewe got it! Parsing API routes...', increment: 5 });
        
        // Slice 5: API Route Parsing
        const routeResult = parseAPIRoutes(analysisRoot);
        outputChannel.info(`[Slice 5] Found ${routeResult.routes.length} API routes`);
        
        // Build the proper AppModel from real data
        const appModel: AppModel = {
          appName: projectName, // Use user-provided name
          projectRoot: analysisRoot,
          entities: entityResult.entities,
          views: projectMapping.views,
          actions: projectMapping.actions,
          todos: []
        };
        
        const componentCount = entityResult.entities.length + projectMapping.views.length;
        progress.report({ message: `🐑 Shear genius! Found ${componentCount} things to convert!`, increment: 5 });
        outputChannel.success(`✅ Analysis complete: ${entityResult.entities.length} entities, ${projectMapping.views.length} views, ${projectMapping.actions.length} actions, ${routeResult.routes.length} routes`);

        // Step 4: SINGLE QUESTION - What type of application?
        progress.report({ message: '💭 Tell us about your project...', increment: 5 });
        
        const appType = await askApplicationType(appModel);
        if (!appType) {
          outputChannel.info('Import cancelled by user');
          return;
        }

        // Step 5: Choose structure approach
        progress.report({ message: '🎨 Pick how you want your ShepLang organized...', increment: 5 });
        
        const approach = await vscode.window.showQuickPick(
          [
            {
              label: '$(sparkle) AI Architect',
              value: 'intelligent',
              description: 'Custom architecture designed for your project',
              detail: 'AI analyzes and creates optimal structure'
            },
            {
              label: '$(file) Single File',
              value: 'single',
              description: 'Simple single .shep file',
              detail: 'Best for quick prototypes'
            }
          ],
          {
            placeHolder: 'How should we organize your project?',
            ignoreFocusOut: true
          }
        );

        if (!approach) {
          outputChannel.info('Import cancelled');
          return;
        }

        // outputFolder already set before progress dialog started

        let mainFilePath: string;
        let report: string;

        if (approach.value === 'intelligent') {
          // AI-designed architecture
          progress.report({ message: '🤖 AI Architect is analyzing your project structure...', increment: 10 });
          
          const architecturePlan = await designArchitecture(context, appModel, appType);
          if (!architecturePlan) {
            outputChannel.info('Import cancelled during architecture design');
            return;
          }

          // SHOW PREVIEW WITH MODAL DIALOG (doesn't auto-close)
          const confirmed = await showArchitecturePreviewModal(architecturePlan);
          if (!confirmed) {
            outputChannel.info('Architecture plan rejected by user');
            return;
          }

          // File generation with AI agent (NOT just TODOs or CRUD!)
          progress.report({ message: '🤖 Generating production-ready code with AI...', increment: 20 });
          
          const project = await generateFromPlan(appModel, architecturePlan, outputFolder, context);
          
          outputChannel.success(`✓ Created ${project.files.length} files in ${architecturePlan.structure} structure`);
          
          // Show folder tree
          const folderTree = project.files
            .map(f => path.dirname(f.relativePath))
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
          
          for (const folder of folderTree) {
            const count = project.files.filter(f => path.dirname(f.relativePath) === folder).length;
            outputChannel.success(`  📁 ${folder}/ (${count} files)`);
          }
          
          mainFilePath = path.join(outputFolder, 'README.md');
          report = project.report;

        } else {
          // Single file
          progress.report({ message: '📝 Creating your ShepLang file...', increment: 30 });
          
          const files = generateShepLangFiles(appModel);
          report = generateImportReport(appModel, files);
          
          for (const file of files) {
            const filePath = path.join(outputFolder, file.fileName);
            fs.writeFileSync(filePath, file.content, 'utf-8');
            outputChannel.success(`✓ Created: ${file.fileName}`);
          }
          
          mainFilePath = path.join(outputFolder, files[0].fileName);
        }

        // Step 7: Ask about backend generation
        progress.report({ message: '🔌 Do you need a backend?', increment: 10 });
        
        const generateBackend = await vscode.window.showQuickPick(
          ['Yes, generate backend', 'No, just frontend'],
          {
            placeHolder: 'Generate .shepthon backend file with AI?',
            ignoreFocusOut: true
          }
        );

        let backendFile: string | undefined;
        if (generateBackend === 'Yes, generate backend') {
          progress.report({ message: '⚡ AI is building your backend API...', increment: 15 });
          
          const firstShepContent = approach.value === 'single'
            ? fs.readFileSync(mainFilePath, 'utf-8')
            : '// AI will use app model';
          
          const shepthonResult = await generateShepThonBackend(context, appModel, firstShepContent);
          
          if (shepthonResult) {
            const shepthonPath = path.join(outputFolder, shepthonResult.fileName);
            fs.writeFileSync(shepthonPath, shepthonResult.content, 'utf-8');
            outputChannel.success(`✓ Created: ${shepthonResult.fileName}`);
            backendFile = shepthonPath;
          }
        }

        // Step 8: Write report
        progress.report({ message: '📊 Creating import documentation...', increment: 5 });
        const reportPath = path.join(outputFolder, 'IMPORT_REPORT.md');
        fs.writeFileSync(reportPath, report, 'utf-8');

        // Step 9: Open files
        progress.report({ message: '🎉 Opening your new ShepLang project...', increment: 5 });
        if (fs.existsSync(mainFilePath)) {
          const doc = await vscode.workspace.openTextDocument(mainFilePath);
          await vscode.window.showTextDocument(doc);
        }

        if (backendFile && fs.existsSync(backendFile)) {
          const backendDoc = await vscode.workspace.openTextDocument(backendFile);
          await vscode.window.showTextDocument(backendDoc, vscode.ViewColumn.Beside);
        }

        progress.report({ message: 'Complete!', increment: 100 });

        // Track success (Slice 7: Telemetry)
        const durationMs = Date.now() - startTime;
        trackImportSuccess({
          framework: stack.framework,
          hasPrisma: stack.hasPrisma,
          entityCount: entityResult.entities.length,
          viewCount: projectMapping.views.length,
          actionCount: projectMapping.actions.length,
          routeCount: routeResult.routes.length,
          confidence: entityResult.confidence,
          durationMs
        });

        outputChannel.success('\n🐑 Baa-doom! Import complete!');
        outputChannel.info(`Project saved to: ${outputFolder}`);
        outputChannel.info(`📊 Stats: ${entityResult.entities.length} entities, ${projectMapping.views.length} views, ${projectMapping.actions.length} actions in ${durationMs}ms`);
        
        progress.report({ message: '🎉 Opening your new ShepLang workspace!', increment: 100 });
      }
    );
    
    // CRITICAL: AUTOMATICALLY open the new workspace in the SAME window
    // This is the key differentiator vs Copilot - seamless blank → project flow!
    // 
    // Per VS Code API docs:
    // - forceReuseWindow: true = Force opening in the same window (what we want!)
    // - forceNewWindow: false just means "don't force new", but doesn't guarantee same window
    //
    // Note: This will restart the extension host, which is expected behavior.
    outputChannel.info('🐑 Opening your new workspace in this window...');
    
    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(outputFolder), {
      forceReuseWindow: true  // FORCE same window - no new window!
    });
    
  } catch (error: any) {
    // Track failure (Slice 7: Telemetry)
    trackImportFailure('import_error', error.message);
    
    outputChannel.error(`🐑 Baa-d news! Import failed: ${error.message}`);
    vscode.window.showErrorMessage(`🐑 Import failed: ${error.message}`);
  }
}

/**
 * Ask about application type (REPLACES duplicate question)
 */
async function askApplicationType(appModel: AppModel): Promise<string | null> {
  const entityNames = appModel.entities.map(e => e.name.toLowerCase()).join(', ');
  
  // Auto-detect
  let suggestedType = 'custom';
  if (entityNames.includes('user') && entityNames.includes('product')) {
    suggestedType = 'ecommerce';
  } else if (entityNames.includes('user') && entityNames.includes('post')) {
    suggestedType = 'social';
  } else if (entityNames.includes('metric') || entityNames.includes('report')) {
    suggestedType = 'dashboard';
  } else if (entityNames.includes('subscription') || entityNames.includes('billing')) {
    suggestedType = 'saas';
  } else if (appModel.entities.length > 0 && appModel.views.length === 0) {
    suggestedType = 'api';
  }

  const typeOptions = [
    {
      label: `$(rocket) SaaS Platform${suggestedType === 'saas' ? ' (Recommended)' : ''}`,
      value: 'saas',
      description: 'Multi-tenant app with auth, billing, admin'
    },
    {
      label: `$(package) E-commerce${suggestedType === 'ecommerce' ? ' (Recommended)' : ''}`,
      value: 'ecommerce',
      description: 'Products, cart, checkout, orders'
    },
    {
      label: `$(comment-discussion) Social Network${suggestedType === 'social' ? ' (Recommended)' : ''}`,
      value: 'social',
      description: 'Users, posts, comments, feeds'
    },
    {
      label: `$(graph) Dashboard${suggestedType === 'dashboard' ? ' (Recommended)' : ''}`,
      value: 'dashboard',
      description: 'Analytics, charts, reports'
    },
    {
      label: `$(server) API Service${suggestedType === 'api' ? ' (Recommended)' : ''}`,
      value: 'api',
      description: 'Backend only, no UI'
    },
    {
      label: '$(file-code) Portfolio/Landing Page',
      value: 'portfolio',
      description: 'Simple content site'
    },
    {
      label: '$(tools) Custom',
      value: 'custom',
      description: 'I\'ll describe it myself'
    }
  ];

  const selected = await vscode.window.showQuickPick(typeOptions, {
    placeHolder: 'What type of application is this?',
    ignoreFocusOut: true,
    title: '📱 Application Type'
  });

  if (!selected) return null;

  if (selected.value === 'custom') {
    const description = await vscode.window.showInputBox({
      prompt: 'Describe your application in 1-2 sentences',
      placeHolder: 'e.g., A booking system for restaurants with table management',
      ignoreFocusOut: true
    });
    return description || 'custom';
  }

  return selected.value;
}

/**
 * Design architecture with AI (simplified flow)
 */
async function designArchitecture(
  context: vscode.ExtensionContext,
  appModel: AppModel,
  appType: string
): Promise<ArchitecturePlan | null> {
  // Determine structure based on entity count (auto-decide, don't ask)
  let structure: string;
  let scale: string;
  
  if (appModel.entities.length <= 3) {
    structure = 'layer-based'; // Simple
    scale = 'small';
  } else if (appModel.entities.length <= 10) {
    structure = 'feature-based'; // Organized
    scale = 'medium';
  } else {
    structure = 'domain-driven'; // Advanced
    scale = 'large';
  }

  const prompt = buildArchitecturePrompt(appModel, appType, structure, scale);
  
  const response = await callClaude(context, prompt, 3000);
  if (!response) return null;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const plan = JSON.parse(jsonMatch[0]) as ArchitecturePlan;
    return plan;
  } catch (error) {
    console.error('[Architecture] Failed to parse AI response:', error);
    return null;
  }
}

/**
 * Build AI prompt for architecture
 */
function buildArchitecturePrompt(
  appModel: AppModel,
  appType: string,
  structure: string,
  scale: string
): string {
  const hasEntities = appModel.entities.length > 0;
  const hasViews = appModel.views.length > 0;
  
  // If no entities/views detected, this is likely a static site or landing page
  const projectContext = hasEntities || hasViews
    ? `**Entities:** ${appModel.entities.map(e => e.name).join(', ') || 'None'}
**Views:** ${appModel.views.map(v => v.name).join(', ') || 'None'}`
    : `**Note:** This appears to be a ${appType} (likely a static landing page, portfolio, or marketing site).
Since no data models were detected, focus on organizing UI components, pages, styles, and assets.`;

  const taskContext = hasEntities
    ? `Design a professional, scalable folder structure following ${structure} architecture pattern.`
    : `Design a clean, maintainable folder structure for this ${appType}.
Focus on organizing UI components, pages/routes, styling, assets, and configuration.
Keep it simple but professional - don't over-engineer for a static site.`;

  return `You are an expert software architect helping a real developer import their project.

# Project Details
**Name:** ${appModel.appName}
**Type:** ${appType}
**Scale:** ${scale}
**Structure:** ${structure}

${projectContext}

# Task
${taskContext}

IMPORTANT: Be specific to THIS project. Don't use generic placeholders like "useContactForm" or "useAnalytics" unless you actually see those in the project. Base your response on what's really there.

# Output Format (JSON ONLY)
\`\`\`json
{
  "projectType": "${appType}",
  "structure": "${structure}",
  "folders": [
    {
      "path": "src/components",
      "purpose": "Reusable UI components found in your project",
      "files": [
        {
          "name": "Button.shep",
          "purpose": "Reusable button component",
          "dependencies": []
        }
      ],
      "subfolders": []
    }
  ],
  "conventions": {
    "naming": "Simple, clear naming that matches what you're already doing",
    "fileOrganization": "Organized by what makes sense for your project",
    "importStrategy": "Simple relative imports or path aliases"
  },
  "reasoning": "In plain English, explain why this structure makes sense for THIS specific ${appType} project. Don't use buzzwords - talk like you're explaining to a friend."
}
\`\`\`

CRITICAL RULES:
1. ALL frontend files MUST use .shep extension (NOT .tsx, .jsx, .ts, .js)
2. ALL backend files MUST use .shepthon extension
3. Views = .shep files (e.g., Dashboard.shep, UserProfile.shep)
4. Components = .shep files (e.g., Button.shep, Card.shep)
5. Models/Data = .shep files (e.g., User.shep, Product.shep)
6. Actions = .shep files (e.g., CreateUser.shep, UpdateProduct.shep)

Return ONLY the JSON, no explanations.`;
}

/**
 * Show architecture preview with MODAL DIALOG (doesn't auto-close)
 */
async function showArchitecturePreviewModal(plan: ArchitecturePlan): Promise<boolean> {
  // Create webview panel  
  const panel = vscode.window.createWebviewPanel(
    'architecturePreview',
    `📐 ${plan.projectType} Architecture Plan`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  panel.webview.html = getArchitecturePreviewHTML(plan);

  // Use modal-style dialog that DOESN'T timeout
  return new Promise<boolean>((resolve) => {
    let resolved = false;
    
    // Create buttons in the webview itself
    panel.webview.onDidReceiveMessage(message => {
      if (resolved) return; // Prevent double-resolution
      
      if (message.command === 'confirm') {
        resolved = true;
        resolve(true);
        setTimeout(() => panel.dispose(), 100); // Delay disposal to ensure message is sent
      } else if (message.command === 'reject') {
        resolved = true;
        resolve(false);
        setTimeout(() => panel.dispose(), 100);
      }
    });

    // Handle panel close (user closes window)
    panel.onDidDispose(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    });
  });
}

/**
 * Get HTML for architecture preview with inline buttons
 */
function getArchitecturePreviewHTML(plan: ArchitecturePlan): string {
  const preview = generateArchitecturePreview(plan);
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: #1e1e1e;
      color: #d4d4d4;
      margin: 0;
    }
    .header {
      background: #007acc;
      color: white;
      padding: 20px;
      margin: -20px -20px 20px -20px;
      border-radius: 0;
    }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #4ec9b0; border-bottom: 1px solid #3e3e42; padding-bottom: 8px; margin-top: 30px; }
    h3 { color: #dcdcaa; margin-top: 20px; }
    code { background: #2d2d30; padding: 2px 6px; border-radius: 3px; }
    pre {
      background: #2d2d30;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      line-height: 1.6;
    }
    .button-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #252526;
      border-top: 2px solid #007acc;
      padding: 20px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    button {
      padding: 12px 32px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    .confirm-btn {
      background: #007acc;
      color: white;
    }
    .confirm-btn:hover {
      background: #005a9e;
    }
    .reject-btn {
      background: #3e3e42;
      color: #d4d4d4;
    }
    .reject-btn:hover {
      background: #2d2d30;
    }
    .content {
      padding-bottom: 100px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📐 Architecture Plan Review</h1>
  </div>
  <div class="content">
    <pre>${preview}</pre>
  </div>
  <div class="button-container">
    <button class="reject-btn" onclick="reject()">❌ Start Over</button>
    <button class="confirm-btn" onclick="confirm()">✅ Looks Good - Generate Files!</button>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    
    function confirm() {
      vscode.postMessage({ command: 'confirm' });
    }
    
    function reject() {
      vscode.postMessage({ command: 'reject' });
    }
  </script>
</body>
</html>`;
}

function generateArchitecturePreview(plan: ArchitecturePlan): string {
  let preview = `# 📁 Your Project Layout\n\n`;
  preview += `**Type:** ${plan.projectType}\n`;
  preview += `**Style:** ${plan.structure}\n\n`;
  
  preview += `## What Gets Created\n\n`;
  preview += `Here's how your files will be organized:\n\n`;
  
  for (const folder of plan.folders) {
    preview += `### 📂 ${folder.path}/\n`;
    preview += `${folder.purpose}\n\n`;
    for (const file of folder.files) {
      preview += `  • **${file.name}** — ${file.purpose}\n`;
    }
    preview += `\n`;
  }

  preview += `## How It Works\n\n`;
  preview += `${plan.reasoning}\n\n`;
  
  preview += `## Quick Reference\n\n`;
  preview += `- **File Names:** ${plan.conventions.naming}\n`;
  preview += `- **How Files Talk:** ${plan.conventions.importStrategy}\n\n`;
  
  preview += `---\n\n`;
  preview += `✅ **Ready to create these files?** Click "Looks Good - Generate Files!" below.\n`;

  return preview;
}

// Helper functions (same as before)
async function selectProjectFolder(): Promise<string | undefined> {
  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select React/Next.js/Vite Project Folder',
    openLabel: 'Select'
  });
  return result?.[0].fsPath;
}

async function selectOutputFolder(): Promise<string | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const useWorkspace = await vscode.window.showQuickPick(
      ['Create in workspace', 'Choose different location'],
      {
        placeHolder: 'Where should we save the generated files?'
      }
    );

    if (useWorkspace === 'Create in workspace') {
      // Ask for project name
      const projectName = await vscode.window.showInputBox({
        prompt: 'What should we name your project?',
        placeHolder: 'my-awesome-app',
        value: 'my-sheplang-app',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Project name cannot be empty';
          }
          if (!/^[a-z0-9-_]+$/i.test(value)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return null;
        }
      });

      if (!projectName) {
        return undefined; // User cancelled
      }

      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const shepFolder = path.join(workspaceRoot, projectName);
      
      if (!fs.existsSync(shepFolder)) {
        fs.mkdirSync(shepFolder, { recursive: true });
      }
      
      return shepFolder;
    }
  }

  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select Output Folder',
    openLabel: 'Select'
  });

  return result?.[0].fsPath;
}

async function detectStack(projectRoot: string): Promise<{
  framework: 'nextjs' | 'vite' | 'react' | 'cli' | 'node' | 'typescript' | 'unknown';
  hasPrisma: boolean;
  hasTypeScript: boolean;
  isValid: boolean;
  actualRoot: string; // The actual project root (may differ if nested)
}> {
  let actualRoot = projectRoot;
  let packageJsonPath = path.join(projectRoot, 'package.json');
  
  // Check for package.json at root
  if (!fs.existsSync(packageJsonPath)) {
    // GitHub ZIP downloads create nested folders like: repo-main/repo-main/
    // Check one level deeper for common patterns
    try {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      const subdirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
      
      // If there's exactly one subdirectory, check if IT has package.json
      if (subdirs.length === 1) {
        const nestedPath = path.join(projectRoot, subdirs[0].name);
        const nestedPackageJson = path.join(nestedPath, 'package.json');
        
        if (fs.existsSync(nestedPackageJson)) {
          outputChannel.info(`🐑 Found nested project folder: ${subdirs[0].name}/`);
          actualRoot = nestedPath;
          packageJsonPath = nestedPackageJson;
        }
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  // Still no package.json found
  if (!fs.existsSync(packageJsonPath)) {
    return {
      framework: 'unknown',
      hasPrisma: false,
      hasTypeScript: false,
      isValid: false,
      actualRoot
    };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  let framework: 'nextjs' | 'vite' | 'react' | 'cli' | 'node' | 'typescript' | 'unknown' = 'unknown';
  
  // Web frameworks (check these first)
  if ('next' in allDeps) {
    framework = 'nextjs';
  } else if ('vite' in allDeps) {
    framework = 'vite';
  } else if ('react' in allDeps) {
    framework = 'react';
  }
  // CLI tools
  else if ('commander' in allDeps || 'yargs' in allDeps || 'inquirer' in allDeps || 'oclif' in allDeps) {
    framework = 'cli';
  }
  // Backend frameworks
  else if ('express' in allDeps || 'fastify' in allDeps || 'koa' in allDeps || '@nestjs/core' in allDeps) {
    framework = 'node';
  }
  // TypeScript projects
  else if ('typescript' in allDeps) {
    framework = 'typescript';
  }
  // Any Node.js project with package.json is valid
  else if (packageJson.name) {
    framework = 'node';
  }

  return {
    framework,
    hasPrisma: 'prisma' in allDeps || '@prisma/client' in allDeps,
    hasTypeScript: 'typescript' in allDeps,
    isValid: true, // Any project with package.json is valid
    actualRoot
  };
}
