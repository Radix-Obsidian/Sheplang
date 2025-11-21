/**
 * Preview in Browser Command
 * 
 * Opens ShepLang preview in default browser with live reload
 */

import * as vscode from 'vscode';
import { PreviewServer } from '../services/previewServer';
import { outputChannel } from '../services/outputChannel';

let globalPreviewServer: PreviewServer | null = null;
let fileWatcher: vscode.FileSystemWatcher | null = null;

export async function showPreviewInBrowser(context: vscode.ExtensionContext): Promise<void> {
  outputChannel.section('Browser Preview');
  
  const editor = vscode.window.activeTextEditor;
  
  if (!editor) {
    await vscode.window.showErrorMessage('No active editor. Open a .shep file first.');
    return;
  }
  
  if (editor.document.languageId !== 'sheplang') {
    await vscode.window.showErrorMessage('Preview is only available for .shep files.');
    return;
  }
  
  outputChannel.info('Starting browser preview...');
  
  try {
    // Dynamic import for ESM package
    const { parseShep } = await import('@goldensheepai/sheplang-language');
    
    // Parse ShepLang file
    const source = editor.document.getText();
    const parseResult = await parseShep(source, editor.document.uri.fsPath);
    
    // Check for parse errors
    if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
      const errors = parseResult.diagnostics
        .filter((d: any) => d.severity === 'error')
        .map((d: any) => `Line ${d.start?.line || d.line}: ${d.message}`)
        .join('\n');
      
      if (errors) {
        vscode.window.showErrorMessage(`Cannot preview: Fix syntax errors first\n\n${errors}`);
        return;
      }
    }
    
    // Get or create preview server
    if (!globalPreviewServer) {
      const port = vscode.workspace.getConfiguration('sheplang').get<number>('preview.port') || 3000;
      globalPreviewServer = new PreviewServer(port);
    }
    
    // Start server
    let url: string;
    if (!globalPreviewServer.isRunning()) {
      url = await globalPreviewServer.start();
      outputChannel.success(`✓ Preview server started at ${url}`);
      
      vscode.window.showInformationMessage(
        `Preview server running at ${url}`,
        'Open in Browser',
        'Copy URL'
      ).then(selection => {
        if (selection === 'Open in Browser') {
          vscode.env.openExternal(vscode.Uri.parse(url));
        } else if (selection === 'Copy URL') {
          vscode.env.clipboard.writeText(url);
          vscode.window.showInformationMessage('✓ URL copied to clipboard');
        }
      });
    } else {
      url = globalPreviewServer.getUrl();
      outputChannel.info(`Preview server already running at ${url}`);
    }
    
    // Send initial AST
    globalPreviewServer.updateAST(parseResult.appModel);
    outputChannel.info('Sent initial AST to browser');
    
    // Setup file watcher for live reload
    setupFileWatcher(editor.document.uri, globalPreviewServer);
    
    // Open browser
    await vscode.env.openExternal(vscode.Uri.parse(url));
    outputChannel.success('✓ Browser opened');
    
  } catch (error) {
    console.error('[Browser Preview] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    outputChannel.error('Failed to start preview:', errorMessage);
    vscode.window.showErrorMessage(`Preview failed: ${errorMessage}`);
  }
}

function setupFileWatcher(fileUri: vscode.Uri, server: PreviewServer) {
  // Dispose existing watcher
  if (fileWatcher) {
    fileWatcher.dispose();
  }
  
  // Create new watcher for this file
  fileWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(fileUri, '*.shep')
  );
  
  let updateTimeout: NodeJS.Timeout;
  
  const handleChange = async () => {
    // Debounce updates
    clearTimeout(updateTimeout);
    
    updateTimeout = setTimeout(async () => {
      try {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const source = document.getText();
        
        const { parseShep } = await import('@goldensheepai/sheplang-language');
        const parseResult = await parseShep(source, fileUri.fsPath);
        
        // Check for errors
        const errors = parseResult.diagnostics?.filter((d: any) => d.severity === 'error') || [];
        if (errors.length > 0) {
          console.log('[Browser Preview] Skipping update due to parse errors');
          return;
        }
        
        // Broadcast update
        server.updateAST(parseResult.appModel);
        console.log('[Browser Preview] Sent AST update to browser');
      } catch (error) {
        console.error('[Browser Preview] Update failed:', error);
      }
    }, 500); // 500ms debounce
  };
  
  fileWatcher.onDidChange(handleChange);
  fileWatcher.onDidCreate(handleChange);
}

export async function stopPreviewServer(): Promise<void> {
  if (globalPreviewServer && globalPreviewServer.isRunning()) {
    await globalPreviewServer.stop();
    globalPreviewServer = null;
    
    if (fileWatcher) {
      fileWatcher.dispose();
      fileWatcher = null;
    }
    
    outputChannel.success('✓ Preview server stopped');
    vscode.window.showInformationMessage('Preview server stopped');
  } else {
    vscode.window.showInformationMessage('No preview server is running');
  }
}
