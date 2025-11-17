import * as vscode from 'vscode';
import * as path from 'path';
import { bridgeService } from '../services/bridgeService';
import { RuntimeManager } from '../services/runtimeManager';
import { outputChannel } from '../services/outputChannel';
import { errorRecovery } from '../services/errorRecovery';

export async function showPreviewCommand(context: vscode.ExtensionContext, runtimeManager: RuntimeManager): Promise<void> {
  outputChannel.section('Show Preview Command');
  outputChannel.info('Opening preview...');

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    await errorRecovery.handleError(
      new Error('No active editor found'),
      'Show Preview',
      [{ message: 'Open a .shep file first, then try the preview command again.' }]
    );
    return;
  }

  if (editor.document.languageId !== 'sheplang') {
    await errorRecovery.handleError(
      new Error('Preview is only available for .shep files'),
      'Show Preview',
      [{ message: 'This command only works with .shep files. Open a .shep file and try again.' }]
    );
    return;
  }

  outputChannel.info('Active file:', editor.document.fileName);

  try {
    // Dynamic import for ESM package
    const { parseShep } = await import('@sheplang/language');
    
    // Parse ShepLang file
    console.log('[Preview] Parsing .shep file:', editor.document.uri.fsPath);
    const source = editor.document.getText();
    const parseResult = await parseShep(source, editor.document.uri.fsPath);
    
    // Check for parse errors
    if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
      const errors = parseResult.diagnostics
        .filter(d => d.severity === 'error')
        .map(d => `❌ Line ${d.line}, Col ${d.column} — ${d.message}`)
        .join('\n');
      
      if (errors) {
        vscode.window.showErrorMessage(`Failed to open preview: ${errors}`);
        return;
      }
    }
    
    console.log('[Preview] Parse successful, AST:', parseResult.appModel);

    // Create webview panel FIRST (don't block on backend)
    let backendLoaded = false;
    const panel = vscode.window.createWebviewPanel(
      'sheplangPreview',
      `Preview: ${parseResult.appModel.name}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out', 'webview'))]
      }
    );

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
    const backendStatusListener = (statusData: any) => {
      panel.webview.postMessage({
        type: 'backendStatus',
        status: statusData.status,
        message: statusData.message
      });
    };
    
    // Register listener
    bridgeService.on('backendStatus', backendStatusListener);
    
    // Handle messages from webview
    panel.webview.onDidReceiveMessage(async (message) => {
      
      // Proxy webview logs to Debug Console
      if (message.type === 'webviewLog') {
        const prefix = message.level === 'error' ? '❌ [Webview]' : '📱 [Webview]';
        console.log(prefix, ...message.args);
        return;
      }
      
      console.log('[Preview] Received message from webview:', message.type);
      
      // Handle request for user input (dynamic parameter)
      if (message.type === 'promptForTitle') {
        const paramName = message.paramName || 'title';
        const capitalizedParam = paramName.charAt(0).toUpperCase() + paramName.slice(1);
        
        const userInput = await vscode.window.showInputBox({
          prompt: `Enter ${paramName}`,
          placeHolder: `e.g., My ${capitalizedParam}`
        });
        
        if (userInput) {
          panel.webview.postMessage({
            type: 'addTaskWithTitle',
            title: userInput,
            viewName: message.viewName,
            actionName: message.actionName,
            paramName: paramName
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
          const result = await bridgeService.callEndpoint(
            message.method,
            message.path,
            message.body
          );
          
          panel.webview.postMessage({
            type: 'callResult',
            requestId: message.requestId,
            result
          });
        } catch (error) {
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
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(editor.document.uri, '*.shep')
    );
    
    let updateTimeout: NodeJS.Timeout;
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
            const errors = updatedResult.diagnostics.filter(d => d.severity === 'error');
            if (errors.length > 0) {
              panel.webview.postMessage({
                type: 'updateStatus',
                status: 'error',
                message: 'Syntax errors detected. Fix them to update preview.',
                errors: errors.map(e => `Line ${e.line}: ${e.message}`)
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
        } catch (error) {
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
      bridgeService.removeListener('backendStatus', backendStatusListener);
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
  } catch (error) {
    console.error('[Preview] Error:', error);
    vscode.window.showErrorMessage(
      `Failed to open preview: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function loadBackendIfPresent(shepUri: vscode.Uri, runtimeManager: RuntimeManager): Promise<boolean> {
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
      } catch (loadError) {
        console.error('[Preview] Error loading backend:', loadError);
        console.error('[Preview] Error stack:', loadError instanceof Error ? loadError.stack : 'no stack');
        throw loadError;
      }
    }
  } catch (error) {
    if ((error as any).code === 'FileNotFound') {
      console.log('[Preview] No .shepthon file found at:', shepthonPath);
    } else {
      console.error('[Preview] Error checking for .shepthon file:', error);
      throw error;
    }
  }
  
  return false;
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext): string {
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
    
    // ========================================
    // Helper Functions for Dynamic Rendering
    // ========================================
    
    /**
     * Get the model name that a view displays
     * @param {string} viewName - Name of the view
     * @returns {string|null} Model name or null
     */
    function getModelFromView(viewName) {
      if (!currentAST || !currentAST.views) return null;
      const view = currentAST.views.find(v => v.name === viewName);
      return view?.list || null;
    }
    
    /**
     * Get model definition from AST
     * @param {string} modelName - Name of the model
     * @returns {object|null} Model definition or null
     */
    function getModelByName(modelName) {
      if (!currentAST || !currentAST.datas) return null;
      return currentAST.datas.find(d => d.name === modelName);
    }
    
    /**
     * Construct endpoint path from model name
     * Pattern: Message → /messages
     * @param {string} modelName - Name of the model
     * @returns {string} Endpoint path
     */
    function getEndpointPath(modelName) {
      return '/' + modelName.toLowerCase() + 's';
    }
    
    /**
     * Format field value based on type
     * @param {any} value - Field value
     * @param {string} type - Field type (text, number, yes/no, datetime)
     * @returns {string} Formatted value
     */
    function formatFieldValue(value, type) {
      if (value === null || value === undefined) return '';
      
      switch(type) {
        case 'yes/no':
          return value ? '✓' : '○';
        case 'datetime':
          return new Date(value).toLocaleString();
        case 'number':
          return String(value);
        case 'text':
        default:
          return String(value);
      }
    }
    
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
          // Load data when backend connects
          if (message.status === 'connected') {
            setTimeout(() => loadData(), 100);
          }
          break;
        
        case 'callResult':
          handleCallResult(message.requestId, message.result);
          break;
        
        case 'callError':
          handleCallError(message.requestId, message.error);
          break;
        
        case 'addTaskWithTitle':
          // Execute the action with input from VS Code input box
          executeActionWithTitle(message.actionName, message.viewName, message.title, message.paramName);
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
              
              // Check if action needs user input
              const action = currentAST.actions.find(a => a.name === btn.action);
              if (action && action.params && action.params.length > 0) {
                // Check if it's a single-parameter action
                if (action.params.length === 1) {
                  const paramName = action.params[0].name;
                  // Ask extension to show input box for single parameter
                  vscode.postMessage({
                    type: 'promptForTitle',
                    actionName: btn.action,
                    viewName: view.name,
                    paramName: paramName  // Pass the actual parameter name
                  });
                } else {
                  // Multi-parameter actions - show inline form
                  console.log('[Webview] Multi-parameter action:', action.params);
                  showMultiFieldForm(btn.action, view.name, action.params);
                }
              } else {
                // Execute action directly (no parameters)
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
          
          // Dynamic empty message based on model
          const modelName = view.list;
          const pluralName = modelName ? modelName.toLowerCase() + 's' : 'items';
          
          listDiv.innerHTML = '<div class="list-empty">No ' + pluralName + ' yet. Click the button above to create one!</div>';
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
          
          // Dynamic add operation - construct endpoint and body
          try {
            const modelName = op.data;
            const endpoint = getEndpointPath(modelName);
            
            // Build request body from op.fields
            const body = op.fields || {};
            
            console.log('[Webview] Creating ' + modelName + ' via POST ' + endpoint, body);
            const result = await callBackend('POST', endpoint, body);
            console.log('[Webview] ✅ ' + modelName + ' created:', result);
            
            showToast('✅ Created!', 'success');
            await loadData();
          } catch (error) {
            console.error('[Webview] ❌ Add failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        } else {
          console.log('[Webview] Unknown op kind:', op.kind);
        }
      }
    }
    
    // Execute action with user-provided input (from VS Code input box)
    async function executeActionWithTitle(actionName, viewName, userInput, paramName) {
      console.log('[Webview] Executing action with input:', actionName, userInput, 'param:', paramName);
      
      const action = currentAST.actions.find(a => a.name === actionName);
      if (!action) {
        console.error('[Webview] Action not found:', actionName);
        return;
      }
      
      // Execute each operation
      for (const op of action.ops) {
        if (op.kind === 'add') {
          try {
            const modelName = op.data;
            const endpoint = getEndpointPath(modelName);
            
            // Build request body
            const body = {};
            
            // First, add any default fields from op.fields
            if (op.fields && typeof op.fields === 'object') {
              Object.assign(body, op.fields);
            }
            
            // Then override with user input (this ensures user input takes precedence)
            if (paramName) {
              body[paramName] = userInput;
            } else {
              // Fallback to 'title' for backward compatibility
              body['title'] = userInput;
            }
            
            console.log('[Webview] [SINGLE-PARAM] Creating ' + modelName + ' via POST ' + endpoint, body);
            const result = await callBackend('POST', endpoint, body);
            console.log('[Webview] [SINGLE-PARAM] ✅ ' + modelName + ' created:', result);
            
            showToast('✅ Created!', 'success');
            
            // Wait for backend to process, then reload
            console.log('[Webview] [SINGLE-PARAM] Waiting 300ms before reloading...');
            setTimeout(async () => {
              console.log('[Webview] [SINGLE-PARAM] Calling loadData()...');
              try {
                await loadData();
                console.log('[Webview] [SINGLE-PARAM] ✅ loadData() completed');
              } catch (err) {
                console.error('[Webview] [SINGLE-PARAM] ❌ loadData() failed:', err);
              }
            }, 300);
          } catch (error) {
            console.error('[Webview] ❌ Add failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        }
      }
    }
    
    // Show multi-field form for actions with multiple parameters
    function showMultiFieldForm(actionName, viewName, params) {
      console.log('[Webview] Showing multi-field form for:', actionName, params);
      
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
      
      // Create form dialog
      const dialog = document.createElement('div');
      dialog.style.cssText = 'background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border); border-radius: 8px; padding: 20px; min-width: 400px; max-width: 500px;';
      
      // Form title
      const title = document.createElement('h3');
      title.style.marginTop = '0';
      title.textContent = actionName.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capitals
      dialog.appendChild(title);
      
      // Create form
      const form = document.createElement('form');
      const inputs = {};
      
      params.forEach(param => {
        const fieldDiv = document.createElement('div');
        fieldDiv.style.marginBottom = '15px';
        
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.color = 'var(--vscode-descriptionForeground)';
        label.textContent = param.name.charAt(0).toUpperCase() + param.name.slice(1) + ':';
        
        const input = document.createElement('input');
        input.type = param.type === 'datetime' ? 'datetime-local' : 'text';
        input.name = param.name;
        input.style.cssText = 'width: 100%; padding: 6px 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 2px;';
        input.placeholder = 'Enter ' + param.name;
        
        inputs[param.name] = input;
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        form.appendChild(fieldDiv);
      });
      
      // Buttons
      const buttonDiv = document.createElement('div');
      buttonDiv.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = 'padding: 6px 12px; background: transparent; color: var(--vscode-button-secondaryForeground); border: 1px solid var(--vscode-button-border); border-radius: 2px; cursor: pointer;';
      cancelBtn.onclick = () => overlay.remove();
      
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.textContent = 'Create';
      submitBtn.style.cssText = 'padding: 6px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer;';
      
      buttonDiv.appendChild(cancelBtn);
      buttonDiv.appendChild(submitBtn);
      form.appendChild(buttonDiv);
      
      // Form submit handler
      form.onsubmit = (e) => {
        e.preventDefault();
        
        // Collect values
        const values = {};
        for (const [name, input] of Object.entries(inputs)) {
          values[name] = input.value;
        }
        
        console.log('[Webview] Form submitted with values:', values);
        
        // Execute action with all parameters
        executeActionWithMultipleInputs(actionName, viewName, values);
        
        // Close dialog
        overlay.remove();
      };
      
      dialog.appendChild(form);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      // Focus first input
      const firstInput = Object.values(inputs)[0];
      if (firstInput) {
        firstInput.focus();
      }
    }
    
    // Execute action with multiple parameters
    async function executeActionWithMultipleInputs(actionName, viewName, inputs) {
      console.log('[Webview] Executing action with multiple inputs:', actionName, inputs);
      
      const action = currentAST.actions.find(a => a.name === actionName);
      if (!action) {
        console.error('[Webview] Action not found:', actionName);
        return;
      }
      
      // Execute each operation
      for (const op of action.ops) {
        if (op.kind === 'add') {
          try {
            const modelName = op.data;
            const endpoint = getEndpointPath(modelName);
            
            // Build request body
            const body = {};
            
            // First, add any default fields from op.fields
            if (op.fields && typeof op.fields === 'object') {
              Object.assign(body, op.fields);
            }
            
            // Then override with all user inputs
            Object.assign(body, inputs);
            
            console.log('[Webview] [MULTI-FIELD] Creating ' + modelName + ' via POST ' + endpoint, body);
            const result = await callBackend('POST', endpoint, body);
            console.log('[Webview] [MULTI-FIELD] ✅ ' + modelName + ' created:', result);
            
            showToast('✅ Created!', 'success');
            
            // Wait for backend to process, then reload
            console.log('[Webview] [MULTI-FIELD] Waiting 300ms before reloading...');
            setTimeout(async () => {
              console.log('[Webview] [MULTI-FIELD] Calling loadData()...');
              try {
                await loadData();
                console.log('[Webview] [MULTI-FIELD] ✅ loadData() completed');
              } catch (err) {
                console.error('[Webview] [MULTI-FIELD] ❌ loadData() failed:', err);
              }
            }, 300);
          } catch (error) {
            console.error('[Webview] ❌ Add failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        } else if (op.kind === 'show') {
          console.log('[Webview] Show view:', op.view);
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
        await loadData();
      } catch (error) {
        console.error('[Webview] ❌ Edit failed:', error);
        showToast('❌ Error: ' + error.message, 'error');
      }
    }
    
    /**
     * Load data from backend dynamically based on AST
     */
    async function loadData() {
      console.log('[Webview] Loading data from backend...');
      
      // Get the first view (active view)
      if (!currentAST || !currentAST.views || currentAST.views.length === 0) {
        console.error('[Webview] No views in AST');
        return;
      }
      
      const view = currentAST.views[0];
      const modelName = view.list;
      
      if (!modelName) {
        console.log('[Webview] View has no list property, skipping data load');
        return;
      }
      
      const model = getModelByName(modelName);
      if (!model) {
        console.error('[Webview] Model not found:', modelName);
        return;
      }
      
      const endpoint = getEndpointPath(modelName);
      
      try {
        console.log('[Webview] Calling GET', endpoint);
        const response = await callBackend('GET', endpoint);
        console.log('[Webview] Raw response:', response);
        console.log('[Webview] Response type:', typeof response);
        console.log('[Webview] Is array?', Array.isArray(response));
        
        // Handle different response formats
        let items;
        if (Array.isArray(response)) {
          // Direct array response
          items = response;
        } else if (response && typeof response === 'object') {
          // Object wrapper - try common property names
          const pluralName = modelName.toLowerCase() + 's';
          items = response[pluralName] || response.data || response.items || response.results || [];
          console.log('[Webview] Extracted items from property:', pluralName, '- count:', items.length);
        } else {
          items = [];
        }
        
        console.log('[Webview] Final items array:', items);
        renderItems(items, model, modelName);
      } catch (error) {
        console.error('[Webview] Failed to load data:', error);
        // Don't show toast on initial load failure - backend might not be ready
      }
    }
    
    /**
     * Render items in the list dynamically
     * @param {Array} items - Array of items from backend
     * @param {object} model - Model definition from AST
     * @param {string} modelName - Name of the model
     */
    function renderItems(items, model, modelName) {
      const listDiv = document.querySelector('.list');
      if (!listDiv) {
        console.error('[Webview] List div not found');
        return;
      }
      
      listDiv.innerHTML = '';
      
      // Empty state
      if (!items || items.length === 0) {
        const pluralName = modelName.toLowerCase() + 's';
        listDiv.innerHTML = '<div class="list-item" style="color: var(--vscode-descriptionForeground); font-style: italic;">No ' + pluralName + ' yet. Click the button above to create one!</div>';
        return;
      }
      
      // Render each item
      items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.gap = '8px';
        
        // Fields container
        const fieldsContainer = document.createElement('div');
        fieldsContainer.style.flex = '1';
        fieldsContainer.style.display = 'flex';
        fieldsContainer.style.gap = '12px';
        fieldsContainer.style.flexWrap = 'wrap';
        
        // Render each field (skip id)
        model.fields.forEach(field => {
          if (field.name === 'id') return;
          
          const fieldContainer = document.createElement('div');
          fieldContainer.style.display = 'flex';
          fieldContainer.style.gap = '4px';
          
          // Field label
          const labelSpan = document.createElement('span');
          labelSpan.style.fontWeight = '500';
          labelSpan.style.color = 'var(--vscode-descriptionForeground)';
          labelSpan.textContent = field.name + ':';
          
          // Field value
          const valueSpan = document.createElement('span');
          const formattedValue = formatFieldValue(item[field.name], field.type);
          valueSpan.textContent = formattedValue;
          
          // Special styling for yes/no
          if (field.type === 'yes/no') {
            valueSpan.style.fontSize = '1.2em';
            valueSpan.style.color = item[field.name] ? 
              'var(--vscode-testing-iconPassed)' : 
              'var(--vscode-descriptionForeground)';
          }
          
          fieldContainer.appendChild(labelSpan);
          fieldContainer.appendChild(valueSpan);
          fieldsContainer.appendChild(fieldContainer);
        });
        
        // Edit button (placeholder for now)
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
          console.log('[Webview] Edit not yet implemented for:', modelName);
          showToast('✏️ Edit coming soon!', 'info');
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
            const endpoint = getEndpointPath(modelName);
            console.log('[Webview] Deleting:', endpoint + '/' + item.id);
            await callBackend('DELETE', endpoint + '/' + item.id);
            console.log('[Webview] ✅ Deleted');
            showToast('🗑️ Deleted!', 'success');
            await loadData();
          } catch (error) {
            console.error('[Webview] ❌ Delete failed:', error);
            showToast('❌ Error: ' + error.message, 'error');
          }
        };
        
        itemDiv.appendChild(fieldsContainer);
        itemDiv.appendChild(editBtn);
        itemDiv.appendChild(deleteBtn);
        listDiv.appendChild(itemDiv);
      });
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
function createPreviewPanel(context: vscode.ExtensionContext, document: vscode.TextDocument): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    'sheplangPreview',
    'ShepLang Preview',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  // Load preview HTML with BobaScript runtime
  panel.webview.html = getPreviewHtml(panel.webview, context.extensionUri);

  return panel;
}

function getPreviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
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
