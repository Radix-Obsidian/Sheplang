import * as vscode from 'vscode';

export function restartBackendCommand(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found');
    return;
  }

  if (editor.document.languageId !== 'shepthon') {
    vscode.window.showInformationMessage('Backend restart is only available for .shepthon files');
    return;
  }

  // Phase 1: Show informational message
  vscode.window.showInformationMessage(
    '🔄 ShepThon backend will restart here',
    'Coming Soon'
  );

  // Phase 2: Implement actual backend restart
  // This will:
  // - Stop current ShepThon runtime
  // - Reload .shepthon file
  // - Re-parse and re-initialize runtime
  // - Restart scheduled jobs
  // - Show status in status bar
}

/**
 * Phase 2: Backend runtime manager
 * 
 * This will manage ShepThon runtime lifecycle:
 * - Start backend when .shepthon file opens
 * - Stop backend when file closes
 * - Restart on file save (if auto-reload enabled)
 * - Show job status in status bar
 * - Log endpoint calls
 */
