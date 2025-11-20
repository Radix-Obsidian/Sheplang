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
const newProject_1 = require("./commands/newProject");
const restartBackend_1 = require("./commands/restartBackend");
const showOutput_1 = require("./commands/showOutput");
const createBackendFile_1 = require("./commands/createBackendFile");
// import { manageFigmaToken } from './commands/manageFigmaToken';
// TODO: Add Next.js/React importer
// import { importFromNextJS } from './commands/importFromNextJS';
// TODO: Add Webflow importer
// import { importFromWebflow } from './commands/importFromWebflow';
const runtimeManager_1 = require("./services/runtimeManager");
const outputChannel_1 = require("./services/outputChannel");
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
    // Show welcome message on first activation
    const hasSeenWelcome = context.globalState.get('sheplang.hasSeenWelcome');
    if (!hasSeenWelcome) {
        vscode.window.showInformationMessage('🐑 Welcome to ShepLang! Create beautiful full-stack apps with AI-native syntax.', 'New Project', 'View Examples').then(selection => {
            if (selection === 'New Project') {
                vscode.commands.executeCommand('sheplang.newProject');
            }
            else if (selection === 'View Examples') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/Radix-Obsidian/Sheplang-BobaScript/tree/main/examples'));
            }
        });
        context.globalState.update('sheplang.hasSeenWelcome', true);
    }
    // Register commands
    outputChannel_1.outputChannel.info('Registering commands...');
    context.subscriptions.push(vscode.commands.registerCommand('sheplang.showPreview', async () => {
        await (0, preview_1.showPreviewCommand)(context, runtimeManager);
    }), vscode.commands.registerCommand('sheplang.newProject', () => (0, newProject_1.newProjectCommand)(context)), vscode.commands.registerCommand('sheplang.restartBackend', () => (0, restartBackend_1.restartBackendCommand)(context)), vscode.commands.registerCommand('sheplang.showOutput', () => (0, showOutput_1.showOutputCommand)()), vscode.commands.registerCommand('sheplang.createBackendFile', () => (0, createBackendFile_1.createBackendFileCommand)()));
    outputChannel_1.outputChannel.success('All commands registered');
    // Start Language Server
    startLanguageServer(context);
    // Auto-preview on .shep file open (if enabled)
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
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('out', 'server', 'server.js'));
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