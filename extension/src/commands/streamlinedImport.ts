/**
 * Streamlined Import Command
 * 
 * FIXES:
 * 1. No duplicate questions (removed concept type, kept app type)
 * 2. Instant file generation (no delays)
 * 3. Persistent confirmation dialog (doesn't disappear)
 * 4. Single scaffold generator (removed duplication)
 * 5. Clear progress feedback
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeProject, AppModel } from '../parsers/astAnalyzer';
import { generateShepLangFiles, generateImportReport } from '../generators/shepGenerator';
import { generateShepThonBackend } from '../generators/shepthonGenerator';
import { generateFromPlan } from '../generators/intelligentScaffold';
import { outputChannel } from '../services/outputChannel';
import { callClaude } from '../ai/claudeClient';
import type { ArchitecturePlan } from '../wizard/architectureWizard';

/**
 * Streamlined import with improved UX
 */
export async function streamlinedImport(context: vscode.ExtensionContext): Promise<void> {
  outputChannel.section('ShepLang Import');

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🚀 ShepLang Import',
        cancellable: false
      },
      async (progress) => {
        // Step 1: Select project folder
        progress.report({ message: '📂 Waiting for you to select a project folder...', increment: 0 });
        const projectRoot = await selectProjectFolder();
        if (!projectRoot) {
          outputChannel.info('Import cancelled - no project selected');
          return;
        }

        // Step 2: Detect stack
        progress.report({ message: '🔍 Scanning project files...', increment: 10 });
        const stack = await detectStack(projectRoot);
        if (!stack.isValid) {
          vscode.window.showErrorMessage('❌ Not a valid Next.js/React/Vite project');
          return;
        }
        outputChannel.info(`Detected: ${stack.framework.toUpperCase()}`);
        progress.report({ message: `✅ Found ${stack.framework.toUpperCase()} project!`, increment: 5 });
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause to show success

        // Step 3: Analyze project
        progress.report({ message: '🧠 AI is reading your code...', increment: 10 });
        const appModel = await analyzeProject(projectRoot);
        outputChannel.info(`Found ${appModel.entities.length} entities, ${appModel.views.length} views`);
        const componentCount = appModel.entities.length + appModel.views.length;
        progress.report({ message: `✨ Discovered ${componentCount} components and pages`, increment: 10 });
        await new Promise(resolve => setTimeout(resolve, 500));

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

        // Step 6: Select output folder
        const outputFolder = await selectOutputFolder();
        if (!outputFolder) {
          outputChannel.info('Import cancelled - no output folder selected');
          return;
        }

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

          // File generation with visual feedback
          progress.report({ message: '📝 Generating ShepLang files...', increment: 20 });
          
          const project = await generateFromPlan(appModel, architecturePlan, outputFolder);
          
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

        // Success message
        vscode.window.showInformationMessage(
          `✅ Successfully imported ${appModel.appName}!`,
          'Open Folder',
          'View Report'
        ).then(selection => {
          if (selection === 'Open Folder') {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputFolder));
          } else if (selection === 'View Report') {
            vscode.workspace.openTextDocument(reportPath).then(doc => {
              vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            });
          }
        });

        outputChannel.success('\n🎉 Import complete!');
        outputChannel.info(`Project saved to: ${outputFolder}`);
      }
    );
  } catch (error: any) {
    outputChannel.error(`Import failed: ${error.message}`);
    vscode.window.showErrorMessage(`Import failed: ${error.message}`);
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
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const shepFolder = path.join(workspaceRoot, 'sheplang-import');
      
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
}> {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return {
      framework: 'unknown',
      hasPrisma: false,
      hasTypeScript: false,
      isValid: false
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
    isValid: true // Any project with package.json is valid
  };
}
