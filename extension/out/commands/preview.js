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
exports.showPreviewCommand = showPreviewCommand;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const bridgeService_1 = require("../services/bridgeService");
const outputChannel_1 = require("../services/outputChannel");
const errorRecovery_1 = require("../services/errorRecovery");
async function showPreviewCommand(context, runtimeManager) {
    outputChannel_1.outputChannel.section('Show Preview Command');
    outputChannel_1.outputChannel.info('Opening preview...');
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        await errorRecovery_1.errorRecovery.handleError(new Error('No active editor found'), 'Show Preview', [{ message: 'Open a .shep file first, then try the preview command again.' }]);
        return;
    }
    if (editor.document.languageId !== 'sheplang') {
        await errorRecovery_1.errorRecovery.handleError(new Error('Preview is only available for .shep files'), 'Show Preview', [{ message: 'This command only works with .shep files. Open a .shep file and try again.' }]);
        return;
    }
    outputChannel_1.outputChannel.info('Active file:', editor.document.fileName);
    try {
        // Dynamic import for ESM package
        const { parseShep } = await import('@radix-obsidian/sheplang-language');
        // Parse ShepLang file
        console.log('[Preview] Parsing .shep file:', editor.document.uri.fsPath);
        const source = editor.document.getText();
        const parseResult = await parseShep(source, editor.document.uri.fsPath);
        // Check for parse errors
        if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
            const errors = parseResult.diagnostics
                .filter((d) => d.severity === 'error')
                .map((d) => `❌ Line ${d.start?.line || d.line}, Col ${d.start?.column || d.column} — ${d.message}`)
                .join('\n');
            if (errors) {
                vscode.window.showErrorMessage(`Failed to open preview: ${errors}`);
                return;
            }
        }
        console.log('[Preview] Parse successful, AST:', parseResult.appModel);
        // Create webview panel FIRST (don't block on backend)
        let backendLoaded = false;
        const panel = vscode.window.createWebviewPanel('sheplangPreview', `Preview: ${parseResult.appModel.name}`, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out', 'webview'))]
        });
        // Set webview HTML
        panel.webview.html = getWebviewContent(panel.webview, context);
        // Send AST to webview
        console.log('[Preview] Sending AST to webview');
        console.log('[Preview] AST structure:', JSON.stringify(parseResult.appModel, null, 2));
        panel.webview.postMessage({
            type: 'loadAST',
            ast: parseResult.appModel
        });
        // Listen for backend status changes
        const backendStatusListener = (statusData) => {
            panel.webview.postMessage({
                type: 'backendStatus',
                status: statusData.status,
                message: statusData.message
            });
        };
        // Register listener
        bridgeService_1.bridgeService.on('backendStatus', backendStatusListener);
        // Handle messages from webview
        panel.webview.onDidReceiveMessage(async (message) => {
            // Proxy webview logs to Debug Console
            if (message.type === 'webviewLog') {
                const prefix = message.level === 'error' ? '❌ [Webview]' : '📱 [Webview]';
                console.log(prefix, ...message.args);
                return;
            }
            console.log('[Preview] Received message from webview:', message.type);
            // Handle request for user input (Add Task button)
            if (message.type === 'promptForTitle') {
                const title = await vscode.window.showInputBox({
                    prompt: 'Enter task title',
                    placeHolder: 'e.g., Buy groceries'
                });
                if (title) {
                    panel.webview.postMessage({
                        type: 'addTaskWithTitle',
                        title,
                        viewName: message.viewName,
                        actionName: message.actionName
                    });
                }
                return;
            }
            // Handle request to edit task (Edit button)
            if (message.type === 'promptForEdit') {
                const title = await vscode.window.showInputBox({
                    prompt: 'Edit task title',
                    value: message.currentTitle,
                    placeHolder: 'e.g., Buy groceries'
                });
                if (title && title !== message.currentTitle) {
                    panel.webview.postMessage({
                        type: 'editTaskWithTitle',
                        title,
                        todoId: message.todoId
                    });
                }
                return;
            }
            if (message.type === 'callEndpoint') {
                try {
                    console.log(`[Preview] Calling ${message.method} ${message.path}`);
                    const result = await bridgeService_1.bridgeService.callEndpoint(message.method, message.path, message.body);
                    panel.webview.postMessage({
                        type: 'callResult',
                        requestId: message.requestId,
                        result
                    });
                }
                catch (error) {
                    console.error('[Preview] Call failed:', error);
                    panel.webview.postMessage({
                        type: 'callError',
                        requestId: message.requestId,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        });
        // Watch for file changes and update preview
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(editor.document.uri, '*.shep'));
        let updateTimeout;
        watcher.onDidChange(async () => {
            // Debounce updates
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(async () => {
                try {
                    console.log('[Preview] File changed, re-parsing...');
                    // Show loading state
                    panel.webview.postMessage({
                        type: 'updateStatus',
                        status: 'updating',
                        message: 'Updating preview...'
                    });
                    const updatedSource = editor.document.getText();
                    const updatedResult = await parseShep(updatedSource, editor.document.uri.fsPath);
                    // Check for errors
                    if (updatedResult.diagnostics && updatedResult.diagnostics.length > 0) {
                        const errors = updatedResult.diagnostics.filter((d) => d.severity === 'error');
                        if (errors.length > 0) {
                            panel.webview.postMessage({
                                type: 'updateStatus',
                                status: 'error',
                                message: 'Syntax errors detected. Fix them to update preview.',
                                errors: errors.map((e) => `Line ${e.start?.line || e.line}: ${e.message}`)
                            });
                            return;
                        }
                    }
                    panel.webview.postMessage({
                        type: 'loadAST',
                        ast: updatedResult.appModel
                    });
                    panel.webview.postMessage({
                        type: 'updateStatus',
                        status: 'ready',
                        message: 'Preview updated ✅'
                    });
                }
                catch (error) {
                    console.error('[Preview] Re-parse failed:', error);
                    panel.webview.postMessage({
                        type: 'updateStatus',
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Update failed'
                    });
                }
            }, 500);
        });
        panel.onDidDispose(() => {
            watcher.dispose();
            clearTimeout(updateTimeout);
            // Remove event listener
            bridgeService_1.bridgeService.removeListener('backendStatus', backendStatusListener);
        });
        // Send initial ready status
        panel.webview.postMessage({
            type: 'updateStatus',
            status: 'ready',
            message: 'Preview ready'
        });
        // Send initial backend status (disconnected until loaded)
        panel.webview.postMessage({
            type: 'backendStatus',
            status: 'disconnected',
            message: 'No backend'
        });
        vscode.window.showInformationMessage('✅ Preview opened successfully');
        // Load backend asynchronously (don't block preview)
        loadBackendIfPresent(editor.document.uri, runtimeManager).then(loaded => {
            console.log('[Preview] Backend load completed, success:', loaded);
            if (loaded) {
                panel.webview.postMessage({
                    type: 'backendStatus',
                    status: 'connected',
                    message: 'Backend connected'
                });
            }
        }).catch(error => {
            console.error('[Preview] Backend load failed:', error);
            panel.webview.postMessage({
                type: 'backendStatus',
                status: 'disconnected',
                message: 'Backend failed to load'
            });
        });
    }
    catch (error) {
        console.error('[Preview] Error:', error);
        vscode.window.showErrorMessage(`Failed to open preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function loadBackendIfPresent(shepUri, runtimeManager) {
    const shepthonPath = shepUri.fsPath.replace('.shep', '.shepthon');
    const shepthonUri = vscode.Uri.file(shepthonPath);
    console.log('[Preview] Looking for .shepthon file:', shepthonPath);
    try {
        const stat = await vscode.workspace.fs.stat(shepthonUri);
        if (stat) {
            console.log('[Preview] Found .shepthon file, loading backend...');
            try {
                // Open the .shepthon document to trigger backend load
                console.log('[Preview] Opening .shepthon document...');
                const shepthonDoc = await vscode.workspace.openTextDocument(shepthonUri);
                console.log('[Preview] Document opened, language:', shepthonDoc.languageId);
                // Load the backend
                console.log('[Preview] Calling runtimeManager.loadBackend()...');
                await runtimeManager.loadBackend(shepthonDoc);
                console.log('[Preview] Backend loaded successfully ✅');
                return true;
            }
            catch (loadError) {
                console.error('[Preview] Error loading backend:', loadError);
                console.error('[Preview] Error stack:', loadError instanceof Error ? loadError.stack : 'no stack');
                throw loadError;
            }
        }
    }
    catch (error) {
        if (error.code === 'FileNotFound') {
            console.log('[Preview] No .shepthon file found at:', shepthonPath);
        }
        else {
            console.error('[Preview] Error checking for .shepthon file:', error);
            throw error;
        }
    }
    return false;
}
function getWebviewContent(webview, context) {
    // Official VS Code CSP pattern - inline scripts allowed for simplicity
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src https: data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShepLang Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    
    #loading {
      text-align: center;
      padding: 40px;
      color: var(--vscode-descriptionForeground);
    }
    
    #status-bar {
      position: sticky;
      top: 0;
      padding: 12px 16px;
      margin: -20px -20px 20px -20px;
      border-bottom: 1px solid var(--vscode-panel-border);
      background: var(--vscode-editor-background);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 100;
    }
    
    #status-bar.ready {
      background: var(--vscode-inputValidation-infoBackground);
      border-color: var(--vscode-inputValidation-infoBorder);
      color: var(--vscode-inputValidation-infoForeground);
    }
    
    #status-bar.updating {
      background: var(--vscode-inputValidation-warningBackground);
      border-color: var(--vscode-inputValidation-warningBorder);
      color: var(--vscode-inputValidation-warningForeground);
    }
    
    #status-bar.error {
      background: var(--vscode-inputValidation-errorBackground);
      border-color: var(--vscode-inputValidation-errorBorder);
      color: var(--vscode-inputValidation-errorForeground);
    }
    
    #status-message {
      flex: 1;
    }
    
    #backend-badge {
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
    }
    
    #backend-badge.connected {
      background: #28a745;
      color: white;
    }
    
    #backend-badge.disconnected {
      background: #6c757d;
      color: white;
    }
    
    #error {
      display: none;
      background: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      color: var(--vscode-inputValidation-errorForeground);
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    #error ul {
      margin-top: 8px;
      padding-left: 20px;
    }
    
    #app {
      display: none;
    }
    
    .view {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
    }
    
    .view-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--vscode-editor-foreground);
    }
    
    .buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
    }
    
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    .list {
      margin-top: 16px;
    }
    
    .list-item {
      padding: 12px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      margin-bottom: 8px;
    }
    
    .list-empty {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
      padding: 12px;
    }

    .add-todo-input {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .add-todo-input input {
      flex: 1;
      padding: 6px 8px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-family: inherit;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--vscode-progressBar-background);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-left: 8px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="loading">
    <h2>Loading preview...</h2>
    <div class="loading-spinner"></div>
  </div>
  
  <div id="status-bar" class="ready" style="display: none;">
    <span id="status-message">Preview ready</span>
    <div class="loading-spinner" id="status-spinner" style="display: none;"></div>
    <span id="backend-badge" class="disconnected">No Backend</span>
  </div>
  
  <div id="error"></div>
  
  <div id="app"></div>

  <script>
    const vscode = acquireVsCodeApi();
    
    let currentAST = null;
    let pendingCalls = {};
    
    // Proxy console.log to extension host for debugging
    const originalLog = console.log;
    const originalError = console.error;
    console.log = function(...args) {
      originalLog.apply(console, args);
      vscode.postMessage({ type: 'webviewLog', level: 'log', args: args.map(String) });
    };
    console.error = function(...args) {
      originalError.apply(console, args);
      vscode.postMessage({ type: 'webviewLog', level: 'error', args: args.map(String) });
    };
    
    // Listen for messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      console.log('[Webview] Received message:', message.type);
      
      switch (message.type) {
        case 'loadAST':
          currentAST = message.ast;
          renderApp(currentAST);
          break;
        
        case 'updateStatus':
          updateStatus(message.status, message.message, message.errors);
          break;
        
        case 'backendStatus':
          updateBackendStatus(message.status, message.message);
          // Load todos when backend connects
          if (message.status === 'connected') {
            setTimeout(() => loadTodos(), 100);
          }
          break;
        
        case 'callResult':
          handleCallResult(message.requestId, message.result);
          break;
        
        case 'callError':
          handleCallError(message.requestId, message.error);
          break;
        
        case 'addTaskWithTitle':
          // Execute the action with the title from VS Code input box
          executeActionWithTitle(message.actionName, message.viewName, message.title);
          break;
        
        case 'editTaskWithTitle':
          // Update task with new title
          editTaskWithTitle(message.todoId, message.title);
          break;
      }
    });
    
    // Call backend endpoint
    function callBackend(method, path, body) {
      const requestId = Date.now().toString() + Math.random().toString(36);
      console.log('[Webview] Calling ' + method + ' ' + path, body);
      
      vscode.postMessage({
        type: 'callEndpoint',
        requestId,
        method,
        path,
        body
      });
      
      return new Promise((resolve, reject) => {
        pendingCalls[requestId] = { resolve, reject };
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (pendingCalls[requestId]) {
            reject(new Error('Request timeout'));
            delete pendingCalls[requestId];
          }
        }, 30000);
      });
    }
    
    function handleCallResult(requestId, result) {
      const pending = pendingCalls[requestId];
      if (pending) {
        console.log('[Webview] Call succeeded:', result);
        pending.resolve(result);
        delete pendingCalls[requestId];
      }
    }
    
    function handleCallError(requestId, error) {
      const pending = pendingCalls[requestId];
      if (pending) {
        console.error('[Webview] Call failed:', error);
        pending.reject(new Error(error));
        delete pendingCalls[requestId];
      }
    }
    
    function updateStatus(status, message, errors) {
      const statusBar = document.getElementById('status-bar');
      const statusMessage = document.getElementById('status-message');
      const statusSpinner = document.getElementById('status-spinner');
      const errorDiv = document.getElementById('error');
      
      // Show status bar
      statusBar.style.display = 'flex';
      statusBar.className = status;
      statusMessage.textContent = message;
      
      // Show/hide spinner
      if (status === 'updating') {
        statusSpinner.style.display = 'inline-block';
      } else {
        statusSpinner.style.display = 'none';
      }
      
      // Show errors if present
      if (errors && errors.length > 0) {
        errorDiv.innerHTML = '<strong>Errors:</strong><ul>' + 
          errors.map(e => '<li>' + e + '</li>').join('') + 
          '</ul>';
        errorDiv.style.display = 'block';
      } else {
        errorDiv.style.display = 'none';
      }
    }
    
    function updateBackendStatus(status, message) {
      const badge = document.getElementById('backend-badge');
      badge.className = status;
      badge.textContent = status === 'connected' ? '✓ Backend' : '○ No Backend';
    }
    
    function renderApp(ast) {
      console.log('[Webview] Rendering app:', ast);
      console.log('[Webview] AST views:', ast.views);
      console.log('[Webview] AST actions:', ast.actions);
      
      document.getElementById('loading').style.display = 'none';
      document.getElementById('status-bar').style.display = 'flex';
      document.getElementById('app').style.display = 'block';
      
      const appDiv = document.getElementById('app');
      appDiv.innerHTML = '';
      
      if (!ast || !ast.views || ast.views.length === 0) {
        appDiv.innerHTML = '<div class="view"><div class="view-title">No views defined</div></div>';
        return;
      }
      
      // Render each view
      ast.views.forEach(view => {
        const viewDiv = document.createElement('div');
        viewDiv.className = 'view';
        viewDiv.setAttribute('data-view', view.name);
        
        // View title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'view-title';
        titleDiv.textContent = view.name;
        viewDiv.appendChild(titleDiv);
        
        // Buttons
        console.log('[Webview] View buttons:', view.buttons);
        if (view.buttons && view.buttons.length > 0) {
          console.log('[Webview] Creating', view.buttons.length, 'buttons');
          const buttonsDiv = document.createElement('div');
          buttonsDiv.className = 'buttons';
          
          view.buttons.forEach(btn => {
            console.log('[Webview] Creating button:', btn.label, '-> action:', btn.action);
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.onclick = () => {
              console.log('[Webview] Button clicked:', btn.label);
              
              // Check if action needs user input (has title parameter)
              const action = currentAST.actions.find(a => a.name === btn.action);
              if (action && action.params && action.params.some(p => p.name === 'title')) {
                // Ask extension to show input box
                vscode.postMessage({
                  type: 'promptForTitle',
                  actionName: btn.action,
                  viewName: view.name
                });
              } else {
                // Execute action directly
                executeAction(btn.action, view.name);
              }
            };
            buttonsDiv.appendChild(button);
          });
          
          viewDiv.appendChild(buttonsDiv);
        }
        
        // List
        if (view.list) {
          const listDiv = document.createElement('div');
          listDiv.className = 'list';
          listDiv.innerHTML = \`
            <div class="list-empty">No tasks yet. Click "Add Task" to create one!</div>
          \`;
          viewDiv.appendChild(listDiv);
        }
        
        appDiv.appendChild(viewDiv);
      });
    }
    
    async function executeAction(actionName, viewName) {
      console.log('[Webview] Executing action: ' + actionName);
      
      if (!currentAST || !currentAST.actions) {
        console.error('[Webview] No actions in AST');
        return;
      }
      
      const action = currentAST.actions.find(a => a.name === actionName);
      if (!action) {
        console.error('[Webview] Action not found: ' + actionName);
        return;
      }
      
      console.log('[Webview] Action found:', action);
      console.log('[Webview] Statements:', action.ops);
      
      // Execute each operation sequentially
      for (const op of action.ops) {
        console.log('[Webview] Executing op:', op.kind);
        
        if (op.kind === 'call') {
          console.log('[Webview] Calling: ' + op.method + ' ' + op.path);
          try {
            // Build request body from op.args if present
            const body = op.args && op.args.length > 0 ? op.args[0] : undefined;
            
            const result = await callBackend(op.method, op.path, body);
            console.log('[Webview] ✅ Call succeeded:', result);
            
            // Show success feedback
            showToast('✅ Success!', 'success');
          } catch (error) {
            console.error('[Webview] ❌ Call failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        } else if (op.kind === 'show') {
          console.log('[Webview] Show view:', op.view);
          // Future: Navigate to different view
        } else if (op.kind === 'add') {
          console.log('[Webview] Add operation:', op);
          console.log('[Webview] op.data:', op.data);
          console.log('[Webview] op.fields:', op.fields);
          console.log('[Webview] op.with:', op.with);
          
          // Handle add operations by making POST calls to backend
          try {
            // Extract data type (e.g., "Todo")
            const dataType = op.data;
            console.log('[Webview] dataType:', dataType);
            
            // Build request body from op.fields or op.with
            const body = {};
            if (op.fields && typeof op.fields === 'object') {
              Object.assign(body, op.fields);
              console.log('[Webview] Copied from op.fields:', body);
            } else if (op.with && typeof op.with === 'object') {
              Object.assign(body, op.with);
              console.log('[Webview] Copied from op.with:', body);
            }
            
            // Add operations should be handled via executeActionWithTitle
            // (triggered by promptForTitle message from button click)
            console.log('[Webview] Add operation - should use executeActionWithTitle instead');
            showToast('Please use the button to add tasks', 'info');
          } catch (error) {
            console.error('[Webview] ❌ Add failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        } else {
          console.log('[Webview] Unknown op kind:', op.kind);
        }
      }
    }
    
    // Execute action with user-provided title (from VS Code input box)
    async function executeActionWithTitle(actionName, viewName, title) {
      console.log('[Webview] Executing action with title:', actionName, title);
      
      const action = currentAST.actions.find(a => a.name === actionName);
      if (!action) {
        console.error('[Webview] Action not found:', actionName);
        return;
      }
      
      // Execute each operation, replacing 'title' parameter
      for (const op of action.ops) {
        if (op.kind === 'add' && op.data === 'Todo') {
          try {
            const body = {
              title: title,
              done: false
            };
            
            console.log('[Webview] Creating Todo via POST /todos', body);
            const result = await callBackend('POST', '/todos', body);
            console.log('[Webview] ✅ Todo created:', result);
            
            showToast('✅ Task added!', 'success');
            await loadTodos();
          } catch (error) {
            console.error('[Webview] ❌ Add failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        }
      }
    }
    
    // Edit task with new title (from VS Code input box)
    async function editTaskWithTitle(todoId, newTitle) {
      console.log('[Webview] Editing task:', todoId, 'with new title:', newTitle);
      
      try {
        // Get the current todo to preserve the done status
        const todos = await callBackend('GET', '/todos');
        const currentTodo = todos.find(t => t.id === todoId);
        
        if (!currentTodo) {
          showToast('❌ Task not found', 'error');
          return;
        }
        
        // Update with new title, preserve done status
        const updated = await callBackend('PUT', '/todos/' + todoId, {
          title: newTitle,
          done: currentTodo.done
        });
        
        console.log('[Webview] ✅ Task updated:', updated);
        showToast('✏️ Task updated!', 'success');
        await loadTodos();
      } catch (error) {
        console.error('[Webview] ❌ Edit failed:', error);
        showToast('❌ Error: ' + error.message, 'error');
      }
    }
    
    async function loadTodos() {
      console.log('[Webview] Loading todos from backend...');
      try {
        const todos = await callBackend('GET', '/todos');
        console.log('[Webview] Loaded todos:', todos);
        
        // Update the list display
        const listDiv = document.querySelector('.list');
        if (listDiv) {
          listDiv.innerHTML = '';
          if (todos && todos.length > 0) {
            todos.forEach(todo => {
              const item = document.createElement('div');
              item.className = 'list-item';
              item.style.display = 'flex';
              item.style.alignItems = 'center';
              item.style.gap = '8px';
              
              // Title span (clickable to toggle)
              const titleSpan = document.createElement('span');
              titleSpan.style.flex = '1';
              titleSpan.style.cursor = 'pointer';
              titleSpan.style.textDecoration = todo.done ? 'line-through' : 'none';
              titleSpan.textContent = todo.title;
              titleSpan.onclick = async () => {
                try {
                  console.log('[Webview] Toggling todo:', todo.id);
                  const updated = await callBackend('PUT', '/todos/' + todo.id, {
                    title: todo.title,
                    done: !todo.done
                  });
                  console.log('[Webview] ✅ Todo updated:', updated);
                  showToast(updated.done ? '✅ Marked as done!' : '○ Marked as not done', 'success');
                  await loadTodos();
                } catch (error) {
                  console.error('[Webview] ❌ Toggle failed:', error);
                  showToast('❌ Error: ' + error.message, 'error');
                }
              };
              
              // Status icon
              const statusSpan = document.createElement('span');
              statusSpan.style.color = 'var(--vscode-descriptionForeground)';
              statusSpan.style.fontSize = '0.9em';
              statusSpan.textContent = todo.done ? '✓' : '○';
              
              // Edit button
              const editBtn = document.createElement('button');
              editBtn.textContent = '✏️';
              editBtn.style.background = 'transparent';
              editBtn.style.border = 'none';
              editBtn.style.cursor = 'pointer';
              editBtn.style.padding = '4px 8px';
              editBtn.style.fontSize = '14px';
              editBtn.style.opacity = '0.6';
              editBtn.style.transition = 'opacity 0.2s';
              editBtn.onmouseenter = () => { editBtn.style.opacity = '1'; };
              editBtn.onmouseleave = () => { editBtn.style.opacity = '0.6'; };
              editBtn.onclick = (e) => {
                e.stopPropagation();
                vscode.postMessage({
                  type: 'promptForEdit',
                  todoId: todo.id,
                  currentTitle: todo.title
                });
              };
              
              // Delete button
              const deleteBtn = document.createElement('button');
              deleteBtn.textContent = '🗑️';
              deleteBtn.style.background = 'transparent';
              deleteBtn.style.border = 'none';
              deleteBtn.style.cursor = 'pointer';
              deleteBtn.style.padding = '4px 8px';
              deleteBtn.style.fontSize = '14px';
              deleteBtn.style.opacity = '0.6';
              deleteBtn.style.transition = 'opacity 0.2s';
              deleteBtn.onmouseenter = () => { deleteBtn.style.opacity = '1'; };
              deleteBtn.onmouseleave = () => { deleteBtn.style.opacity = '0.6'; };
              deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                try {
                  console.log('[Webview] Deleting todo:', todo.id);
                  await callBackend('DELETE', '/todos/' + todo.id);
                  console.log('[Webview] ✅ Todo deleted');
                  showToast('🗑️ Task deleted', 'success');
                  await loadTodos();
                } catch (error) {
                  console.error('[Webview] ❌ Delete failed:', error);
                  showToast('❌ Error: ' + error.message, 'error');
                }
              };
              
              item.appendChild(titleSpan);
              item.appendChild(statusSpan);
              item.appendChild(editBtn);
              item.appendChild(deleteBtn);
              listDiv.appendChild(item);
            });
          } else {
            listDiv.innerHTML = '<div class="list-item" style="color: var(--vscode-descriptionForeground); font-style: italic;">No tasks yet. Click "Add Task" to create one!</div>';
          }
        }
      } catch (error) {
        console.error('[Webview] Failed to load todos:', error);
      }
    }
    
    function showToast(message, type = 'info') {
      // Simple toast notification
      const toast = document.createElement('div');
      toast.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: \$\{type === 'success' ? 'var(--vscode-editorInfo-background)' : 'var(--vscode-editorError-background)'\};
        color: var(--vscode-editor-foreground);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      \`;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    
    function showError(message) {
      document.getElementById('loading').style.display = 'none';
      const errorDiv = document.getElementById('error');
      errorDiv.style.display = 'block';
      errorDiv.textContent = message;
    }
  </script>
</body>
</html>`;
}
/**
 * Phase 2: Create webview panel for preview
 *
 * This will be similar to shepyard/src/preview/BobaRenderer.tsx
 * but integrated into VSCode's webview API
 */
function createPreviewPanel(context, document) {
    const panel = vscode.window.createWebviewPanel('sheplangPreview', 'ShepLang Preview', vscode.ViewColumn.Beside, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    // Load preview HTML with BobaScript runtime
    panel.webview.html = getPreviewHtml(panel.webview, context.extensionUri);
    return panel;
}
function getPreviewHtml(webview, extensionUri) {
    // Phase 2: Load actual preview HTML with BobaScript runtime
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>ShepLang Preview</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            background: #f5f5f5;
          }
          .preview-placeholder {
            background: white;
            padding: 40px;
            border-radius: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="preview-placeholder">
          <h1>🚀 ShepLang Preview</h1>
          <p>Coming in Phase 2!</p>
          <p>This will show your app running live with BobaScript.</p>
        </div>
      </body>
    </html>
  `;
}
//# sourceMappingURL=preview.js.map