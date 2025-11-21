/**
 * Auto-Start Live Preview
 * 
 * Battle-tested pattern from VS Code Live Server extension
 * Opens preview automatically when .shep file is opened
 */

import * as vscode from 'vscode';
import { showPreviewInBrowser } from '../commands/previewInBrowser';

let previewStarted = false;
let currentFile: string | undefined;

/**
 * Initialize auto-preview functionality
 */
export function initializeAutoPreview(context: vscode.ExtensionContext): void {
  // Listen for text document open events
  const openListener = vscode.workspace.onDidOpenTextDocument(async (document) => {
    await handleDocumentOpen(document, context);
  });

  // Listen for active editor change
  const changeListener = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (editor) {
      await handleDocumentOpen(editor.document, context);
    }
  });

  // Check if a .shep file is already open on activation
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    handleDocumentOpen(activeEditor.document, context);
  }

  context.subscriptions.push(openListener, changeListener);
}

/**
 * Handle document open event
 */
async function handleDocumentOpen(
  document: vscode.TextDocument,
  context: vscode.ExtensionContext
): Promise<void> {
  // Only auto-start for .shep files
  if (document.languageId !== 'sheplang' && !document.fileName.endsWith('.shep')) {
    return;
  }

  // Check user preference
  const config = vscode.workspace.getConfiguration('sheplang');
  const autoPreview = config.get('preview.autoStart', true);

  if (!autoPreview) {
    return;
  }

  // Avoid starting multiple previews
  if (previewStarted && currentFile === document.fileName) {
    return;
  }

  // Show subtle notification (doesn't block user)
  vscode.window.setStatusBarMessage('$(globe) Starting live preview...', 2000);

  try {
    // Start browser preview automatically
    await showPreviewInBrowser(context);
    
    previewStarted = true;
    currentFile = document.fileName;

    // Update status bar
    vscode.window.setStatusBarMessage('$(check) Live preview running', 3000);
  } catch (error) {
    console.error('[AutoPreview] Failed to start preview:', error);
    // Don't show error - user can manually start if needed
  }
}

/**
 * Reset preview state (called when preview is manually stopped)
 */
export function resetPreviewState(): void {
  previewStarted = false;
  currentFile = undefined;
}
