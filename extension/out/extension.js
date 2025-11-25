"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const node_1 = require("vscode-languageclient/node");
const preview_1 = require("./commands/preview");
const previewInBrowser_1 = require("./commands/previewInBrowser");
const runtimeManager_1 = require("./services/runtimeManager");
const outputChannel_1 = require("./services/outputChannel");
const sendFeedback_1 = require("./commands/sendFeedback");
// ========================================
// ALPHA FOCUS: Import Only
// ========================================
// Next.js/React importer (Local)
const streamlinedImport_1 = require("./commands/streamlinedImport");
// Git Importer (GitHub)
const importFromGitHub_1 = require("./commands/importFromGitHub");
// ========================================
// Language features (keep for .shep files)
// ========================================
const autoPreview_1 = require("./features/autoPreview");
const intelligentCompletion_1 = require("./features/intelligentCompletion");
const diagnostics_1 = require("./features/diagnostics");
const semanticHighlighting_1 = require("./features/semanticHighlighting");
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
let client;
let runtimeManager;
function activate(context) {
    // Initialize output channel
    context.subscriptions.push(outputChannel_1.outputChannel);
    outputChannel_1.outputChannel.section('ShepLang Extension Activated');
    outputChannel_1.outputChannel.info('Extension version:', context.extension.packageJSON.version);
    outputChannel_1.outputChannel.info('VS Code version:', vscode.version);
    console.log('ShepLang extension is now active');
    // Initialize Runtime Manager for ShepThon backend
    runtimeManager = new runtimeManager_1.RuntimeManager(context);
    context.subscriptions.push(runtimeManager);
    // ALPHA: Disabled - Quick start wizard not in alpha
    // setTimeout(() => {
    //   showQuickStartForNewUsers(context);
    // }, 1000);
    // ========================================
    // ALPHA COMMANDS: Import + Preview Only
    // ========================================
    outputChannel_1.outputChannel.info('Registering ALPHA commands (Import focus)...');
    context.subscriptions.push(
    // CORE ALPHA: Import from GitHub
    vscode.commands.registerCommand('sheplang.importFromGitHub', () => (0, importFromGitHub_1.importFromGitHubCommand)()), 
    // CORE ALPHA: Import from Local Project
    vscode.commands.registerCommand('sheplang.importFromNextJS', () => (0, streamlinedImport_1.streamlinedImport)(context)), 
    // Preview (needed to see results)
    vscode.commands.registerCommand('sheplang.showPreview', async () => {
        await (0, preview_1.showPreviewCommand)(context, runtimeManager);
    }), vscode.commands.registerCommand('sheplang.showPreviewInBrowser', () => (0, previewInBrowser_1.showPreviewInBrowser)(context)), vscode.commands.registerCommand('sheplang.stopPreviewServer', () => (0, previewInBrowser_1.stopPreviewServer)()), 
    // Feedback (important for alpha)
    vscode.commands.registerCommand('sheplang.sendFeedback', () => (0, sendFeedback_1.sendFeedbackCommand)(context)), 
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
    }));
    outputChannel_1.outputChannel.success('ALPHA commands registered');
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
    outputChannel_1.outputChannel.info('Initializing extraordinary features...');
    // Auto-start live preview when .shep files are opened
    (0, autoPreview_1.initializeAutoPreview)(context);
    outputChannel_1.outputChannel.success('✓ Auto-preview enabled');
    // Context-aware IntelliSense and hover documentation
    (0, intelligentCompletion_1.registerIntelliSense)(context);
    outputChannel_1.outputChannel.success('✓ Intelligent completion enabled');
    // ALPHA: Disabled - Quick start not in alpha
    // registerQuickStart(context);
    // outputChannel.success('✓ Quick start ready');
    // Comprehensive error diagnostics
    const diagnosticsManager = (0, diagnostics_1.registerDiagnostics)(context);
    outputChannel_1.outputChannel.success('✓ Error diagnostics enabled');
    // Semantic syntax highlighting (beyond basic TextMate)
    (0, semanticHighlighting_1.registerSemanticHighlighting)(context);
    outputChannel_1.outputChannel.success('✓ Semantic highlighting enabled');
    // Legacy auto-preview code (keeping for backward compatibility)
    const autoPreview = vscode.workspace.getConfiguration('sheplang').get('autoPreview', true);
    if (autoPreview) {
        context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'sheplang') {
                vscode.commands.executeCommand('sheplang.showPreview');
            }
        }));
    }
    // Auto-load ShepThon backend when .shepthon files are opened
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(async (doc) => {
        if (doc.languageId === 'shepthon') {
            console.log('[Extension] ShepThon file opened, loading backend...');
            await runtimeManager.loadBackend(doc);
        }
    }));
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
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'shepthon') {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    }));
}
function startLanguageServer(context) {
    // The server is bundled with esbuild to dist/server.js
    const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'));
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    // Options to control the language client
    const clientOptions = {
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
    client = new node_1.LanguageClient('sheplangLanguageServer', 'ShepLang Language Server', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
//# sourceMappingURL=extension.js.map