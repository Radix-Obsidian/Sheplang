import * as vscode from 'vscode';
import * as path from 'path';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { showPreviewCommand } from './commands/preview';
import { newProjectCommand } from './commands/newProject';
import { restartBackendCommand } from './commands/restartBackend';
import { showOutputCommand } from './commands/showOutput';
import { createBackendFileCommand } from './commands/createBackendFile';
// import { manageFigmaToken } from './commands/manageFigmaToken';

// TODO: Add Next.js/React importer
// import { importFromNextJS } from './commands/importFromNextJS';

// TODO: Add Webflow importer
// import { importFromWebflow } from './commands/importFromWebflow';
import { RuntimeManager } from './services/runtimeManager';
import { outputChannel } from './services/outputChannel';

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

  // Show welcome message on first activation
  const hasSeenWelcome = context.globalState.get('sheplang.hasSeenWelcome');
  if (!hasSeenWelcome) {
    vscode.window.showInformationMessage(
      '🐑 Welcome to ShepLang! Create beautiful full-stack apps with AI-native syntax.',
      'New Project',
      'View Examples'
    ).then(selection => {
      if (selection === 'New Project') {
        vscode.commands.executeCommand('sheplang.newProject');
      } else if (selection === 'View Examples') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/Radix-Obsidian/Sheplang-BobaScript/tree/main/examples'));
      }
    });
    context.globalState.update('sheplang.hasSeenWelcome', true);
  }

  // Register commands
  outputChannel.info('Registering commands...');
  context.subscriptions.push(
    vscode.commands.registerCommand('sheplang.showPreview', async () => {
      await showPreviewCommand(context, runtimeManager);
    }),
    vscode.commands.registerCommand('sheplang.newProject', () => newProjectCommand(context)),
    vscode.commands.registerCommand('sheplang.restartBackend', () => restartBackendCommand(context)),
    vscode.commands.registerCommand('sheplang.showOutput', () => showOutputCommand()),
    vscode.commands.registerCommand('sheplang.createBackendFile', () => createBackendFileCommand()),
    // TODO: Uncomment when Next.js importer is ready
    // vscode.commands.registerCommand('sheplang.importFromNextJS', () => importFromNextJS()),
    
    // TODO: Uncomment when Webflow importer is ready
    // vscode.commands.registerCommand('sheplang.importFromWebflow', () => importFromWebflow())
    
    // Figma token management still available for future use
    // vscode.commands.registerCommand('sheplang.manageFigmaToken', () => manageFigmaToken())
  );
  outputChannel.success('All commands registered');

  // Start Language Server
  startLanguageServer(context);

  // Auto-preview on .shep file open (if enabled)
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
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'server.js')
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
