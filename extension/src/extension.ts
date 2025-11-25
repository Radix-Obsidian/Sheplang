import * as vscode from 'vscode';
import * as path from 'path';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { showPreviewCommand } from './commands/preview';
import { showPreviewInBrowser, stopPreviewServer } from './commands/previewInBrowser';
import { RuntimeManager } from './services/runtimeManager';
import { outputChannel } from './services/outputChannel';
import { sendFeedbackCommand } from './commands/sendFeedback';

// ========================================
// ALPHA FOCUS: Import Only
// ========================================
// Next.js/React importer (Local)
import { streamlinedImport } from './commands/streamlinedImport';
// Git Importer (GitHub)
import { importFromGitHubCommand } from './commands/importFromGitHub';

// ========================================
// Language features (keep for .shep files)
// ========================================
import { initializeAutoPreview } from './features/autoPreview';
import { registerIntelliSense } from './features/intelligentCompletion';
import { registerDiagnostics } from './features/diagnostics';
import { registerSemanticHighlighting } from './features/semanticHighlighting';

// ========================================
// DISABLED FOR ALPHA - Re-enable in Beta
// ========================================
// import { newProjectCommand } from './commands/newProject';
// import { restartBackendCommand } from './commands/restartBackend';
// import { showOutputCommand } from './commands/showOutput';
// import { createBackendFileCommand } from './commands/createBackendFile';
// import { startProjectWizard } from './commands/projectWizard';
// import { testWizard, quickTestWizard } from './commands/testWizard';
// import { showUsageStats, resetUsageForTesting } from './ai/usageTracker';
// import { registerQuickStart, showQuickStartForNewUsers } from './features/quickStart';
// import { importFromWebflow } from './commands/importFromWebflow';

let client: LanguageClient;
let runtimeManager: RuntimeManager;

export function activate(context: vscode.ExtensionContext) {
  // Initialize output channel
  context.subscriptions.push(outputChannel as any);

  outputChannel.section('ShepLang Extension Activated');
  outputChannel.info('Extension version:', context.extension.packageJSON.version);
  outputChannel.info('VS Code version:', vscode.version);

  console.log('ShepLang extension is now active');

  // Initialize Runtime Manager for ShepThon backend
  runtimeManager = new RuntimeManager(context);
  context.subscriptions.push(runtimeManager);

  // ALPHA: Disabled - Quick start wizard not in alpha
  // setTimeout(() => {
  //   showQuickStartForNewUsers(context);
  // }, 1000);

  // ========================================
  // ALPHA COMMANDS: Import + Preview Only
  // ========================================
  outputChannel.info('Registering ALPHA commands (Import focus)...');
  context.subscriptions.push(
    // CORE ALPHA: Import from GitHub
    vscode.commands.registerCommand('sheplang.importFromGitHub', () => importFromGitHubCommand()),
    
    // CORE ALPHA: Import from Local Project
    vscode.commands.registerCommand('sheplang.importFromNextJS', () => streamlinedImport(context)),
    
    // Preview (needed to see results)
    vscode.commands.registerCommand('sheplang.showPreview', async () => {
      await showPreviewCommand(context, runtimeManager);
    }),
    vscode.commands.registerCommand('sheplang.showPreviewInBrowser', () => showPreviewInBrowser(context)),
    vscode.commands.registerCommand('sheplang.stopPreviewServer', () => stopPreviewServer()),
    
    // Feedback (important for alpha)
    vscode.commands.registerCommand('sheplang.sendFeedback', () => sendFeedbackCommand(context)),
    
    // API Key management
    vscode.commands.registerCommand('sheplang.updateApiKey', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'Enter your Anthropic API key (for unlimited imports)',
        placeHolder: 'sk-ant-api03-...',
        password: true,
        ignoreFocusOut: true
      });
      if (key) {
        await vscode.workspace.getConfiguration('sheplang').update('anthropicApiKey', key, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('✓ API key updated! You now have unlimited imports.');
      }
    }),
    
    // Error broadcasting (used by diagnostics)
    vscode.commands.registerCommand('sheplang.broadcastError', (error: Error | string) => {
      // Log errors for debugging - preview server handles display
      const msg = error instanceof Error ? error.message : String(error);
      outputChannel.error('Broadcast error:', msg);
    })
  );
  outputChannel.success('ALPHA commands registered');

  // ========================================
  // DISABLED FOR ALPHA - Re-enable in Beta
  // ========================================
  // context.subscriptions.push(
  //   vscode.commands.registerCommand('sheplang.newProject', () => newProjectCommand(context)),
  //   vscode.commands.registerCommand('sheplang.restartBackend', () => restartBackendCommand(context)),
  //   vscode.commands.registerCommand('sheplang.showOutput', () => showOutputCommand()),
  //   vscode.commands.registerCommand('sheplang.createBackendFile', () => createBackendFileCommand()),
  //   vscode.commands.registerCommand('sheplang.startProjectWizard', () => startProjectWizard(context)),
  //   vscode.commands.registerCommand('sheplang.testWizard', () => testWizard()),
  //   vscode.commands.registerCommand('sheplang.quickTestWizard', () => quickTestWizard()),
  //   vscode.commands.registerCommand('sheplang.showAIUsage', () => showUsageStats(context)),
  //   vscode.commands.registerCommand('sheplang.resetAIUsage', () => resetUsageForTesting(context)),
  //   vscode.commands.registerCommand('sheplang.broadcastError', (error: Error | string) => {...}),
  //   vscode.commands.registerCommand('sheplang.importFromWebflow', () => importFromWebflow())
  // );

  // Start Language Server
  startLanguageServer(context);

  // ✨ Initialize extraordinary features
  outputChannel.info('Initializing extraordinary features...');

  // Auto-start live preview when .shep files are opened
  initializeAutoPreview(context);
  outputChannel.success('✓ Auto-preview enabled');

  // Context-aware IntelliSense and hover documentation
  registerIntelliSense(context);
  outputChannel.success('✓ Intelligent completion enabled');

  // ALPHA: Disabled - Quick start not in alpha
  // registerQuickStart(context);
  // outputChannel.success('✓ Quick start ready');

  // Comprehensive error diagnostics
  const diagnosticsManager = registerDiagnostics(context);
  outputChannel.success('✓ Error diagnostics enabled');

  // Semantic syntax highlighting (beyond basic TextMate)
  registerSemanticHighlighting(context);
  outputChannel.success('✓ Semantic highlighting enabled');

  // Legacy auto-preview code (keeping for backward compatibility)
  const autoPreview = vscode.workspace.getConfiguration('sheplang').get('autoPreview', true);
  if (autoPreview) {
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId === 'sheplang') {
          vscode.commands.executeCommand('sheplang.showPreview');
        }
      })
    );
  }

  // Auto-load ShepThon backend when .shepthon files are opened
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (doc) => {
      if (doc.languageId === 'shepthon') {
        console.log('[Extension] ShepThon file opened, loading backend...');
        await runtimeManager.loadBackend(doc);
      }
    })
  );

  // Also load backend for already-open .shepthon files on activation
  vscode.workspace.textDocuments.forEach(async (doc) => {
    if (doc.languageId === 'shepthon') {
      console.log('[Extension] Loading backend for already-open .shepthon file');
      await runtimeManager.loadBackend(doc);
    }
  });

  // Status bar for ShepThon backend
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(database) ShepThon';
  statusBarItem.tooltip = 'ShepThon Backend Status';
  statusBarItem.command = 'sheplang.restartBackend';
  context.subscriptions.push(statusBarItem);

  // Show status bar when .shepthon file is active
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && editor.document.languageId === 'shepthon') {
        statusBarItem.show();
      } else {
        statusBarItem.hide();
      }
    })
  );
}

function startLanguageServer(context: vscode.ExtensionContext) {
  // The server is bundled with esbuild to dist/server.js
  const serverModule = context.asAbsolutePath(
    path.join('dist', 'server.js')
  );

  // The debug options for the server
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for ShepLang and ShepThon documents
    documentSelector: [
      { scheme: 'file', language: 'sheplang' },
      { scheme: 'file', language: 'shepthon' }
    ],
    synchronize: {
      // Notify the server about file changes to '.shep' and '.shepthon' files
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{shep,shepthon}')
    }
  };

  // Create the language client and start the client
  client = new LanguageClient(
    'sheplangLanguageServer',
    'ShepLang Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
