/**
 * Minimalist Quick Start System
 * 
 * Two paths to ShepLang:
 * 1. Import existing project → AI converts to ShepLang
 * 2. Prompt a new project → AI generates from description
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { streamlinedImport } from '../commands/streamlinedImport';
import { generateProjectFromPrompt } from '../ai/projectGenerator';

export async function quickStart(context: vscode.ExtensionContext): Promise<void> {
  const choice = await vscode.window.showQuickPick([
    {
      label: '$(sparkle) Describe Your Project',
      description: 'AI generates everything from your description',
      detail: 'Example: "I need a task manager with team collaboration"',
      value: 'prompt'
    },
    {
      label: '$(folder-opened) Import Existing Project', 
      description: 'Convert Next.js/React/HTML to ShepLang',
      detail: 'AI analyzes and recreates in our full-stack language',
      value: 'import'
    }
  ], {
    placeHolder: '🚀 Start building in ShepLang',
    ignoreFocusOut: false // Don't block the UI
  });

  if (!choice) return;

  switch (choice.value) {
    case 'prompt':
      await promptToProject(context);
      break;
    case 'import':
      await streamlinedImport(context);
      break;
  }
}

/**
 * ShepImpromptu: Describe project → AI generates full structure
 */
async function promptToProject(context: vscode.ExtensionContext): Promise<void> {
  const prompt = await vscode.window.showInputBox({
    prompt: 'Describe the app you want to build',
    placeHolder: 'A todo app with user accounts and real-time sync...',
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value || value.length < 10) {
        return 'Please provide a meaningful description (at least 10 characters)';
      }
      return null;
    }
  });

  if (!prompt) return;

  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'AI is generating your ShepLang project...',
    cancellable: false
  }, async (progress) => {
    progress.report({ increment: 10, message: 'Understanding requirements...' });
    
    // Check for existing backend
    const hasBackend = await checkForBackend();
    
    progress.report({ increment: 20, message: 'Designing data models...' });
    
    // Generate project structure
    const projectStructure = await generateProjectFromPrompt(prompt, {
      includeBackend: !hasBackend,
      context
    });
    
    if (!hasBackend && projectStructure.needsBackend) {
      const generateBackend = await vscode.window.showQuickPick(
        ['Yes, generate ShepThon backend', 'No, I\'ll handle the backend'],
        { placeHolder: 'Would you like AI to generate a backend for you?' }
      );
      
      projectStructure.includeBackend = generateBackend?.startsWith('Yes');
    }
    
    progress.report({ increment: 30, message: 'Creating views and actions...' });
    
    // Create files in workspace
    await createProjectFiles(projectStructure, progress);
    
    progress.report({ increment: 20, message: 'Setting up live preview...' });
    
    // Open main file
    const mainFile = projectStructure.files.find(f => f.path.endsWith('.shep'));
    if (mainFile && mainFile.fullPath) {
      const doc = await vscode.workspace.openTextDocument(mainFile.fullPath);
      await vscode.window.showTextDocument(doc);
    }
    
    progress.report({ increment: 20, message: 'Done! Your project is ready.' });
  });

  // Auto-start preview
  setTimeout(() => {
    vscode.window.showInformationMessage(
      '✨ Your ShepLang project is ready!',
      'Start Live Preview',
      'View Files'
    ).then(result => {
      if (result === 'Start Live Preview') {
        vscode.commands.executeCommand('sheplang.showPreviewInBrowser');
      } else if (result === 'View Files') {
        vscode.commands.executeCommand('workbench.view.explorer');
      }
    });
  }, 500);
}

/**
 * Check if project already has a backend
 */
async function checkForBackend(): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return false;
  
  const rootPath = workspaceFolders[0].uri.fsPath;
  
  // Check for common backend indicators
  const backendIndicators = [
    'backend.shepthon',
    'api.shepthon', 
    'server.shepthon',
    'package.json', // Node.js
    'requirements.txt', // Python
    'Gemfile', // Ruby
    'go.mod', // Go
    'Cargo.toml', // Rust
    'pom.xml', // Java
  ];
  
  for (const indicator of backendIndicators) {
    if (fs.existsSync(path.join(rootPath, indicator))) {
      return true;
    }
  }
  
  // Check for API routes in Next.js
  const apiDir = path.join(rootPath, 'pages', 'api');
  const appApiDir = path.join(rootPath, 'app', 'api');
  
  return fs.existsSync(apiDir) || fs.existsSync(appApiDir);
}

/**
 * Create project files from AI-generated structure
 */
async function createProjectFiles(
  projectStructure: any,
  progress: vscode.Progress<{ increment?: number; message?: string }>
): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    throw new Error('Please open a folder first');
  }
  
  const rootPath = workspaceFolders[0].uri.fsPath;
  
  // Create each file
  for (const file of projectStructure.files) {
    const filePath = path.join(rootPath, file.path);
    const dir = path.dirname(filePath);
    
    // Create directory if needed
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filePath, file.content, 'utf-8');
    file.fullPath = filePath; // Store for later
    
    progress.report({ 
      message: `Creating ${path.basename(file.path)}...` 
    });
  }
}

/**
 * Register quick start command
 */
export function registerQuickStart(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('sheplang.quickStart', () => quickStart(context))
  );
}

/**
 * Auto-show quick start for new users (replaces heavy onboarding)
 */
export async function showQuickStartForNewUsers(context: vscode.ExtensionContext): Promise<void> {
  const hasUsedBefore = context.globalState.get('sheplang.hasUsedBefore', false);
  
  if (!hasUsedBefore) {
    // Simple notification, not blocking
    const result = await vscode.window.showInformationMessage(
      '👋 Welcome to ShepLang! Ready to build something amazing?',
      'Get Started',
      'Later'
    );
    
    if (result === 'Get Started') {
      await quickStart(context);
    }
    
    // Mark as used
    await context.globalState.update('sheplang.hasUsedBefore', true);
  }
}
