/**
 * ShepVerify Dashboard Module
 * 
 * Main entry point for the verification dashboard.
 * Registers the tree view and handles dashboard lifecycle.
 */

import * as vscode from 'vscode';
import { ShepVerifyTreeProvider } from './treeViewProvider';
import { VerificationReport, HistoryEntry } from './types';
import { VerificationService } from './verificationService';
import { HistoryService } from './historyService';

// Export types for external use
export * from './types';
export { ShepVerifyTreeProvider } from './treeViewProvider';
export { VerificationService } from './verificationService';
export { HistoryService } from './historyService';

// Singleton instances
let treeProvider: ShepVerifyTreeProvider | null = null;
let treeView: vscode.TreeView<any> | null = null;
let verificationService: VerificationService | null = null;
let historyService: HistoryService | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;

/**
 * Initialize the ShepVerify Dashboard
 * 
 * Registers the tree view provider and sets up the dashboard.
 * Should be called once during extension activation.
 * 
 * @param context - VS Code extension context
 * @returns The tree provider instance
 */
export function initializeShepVerifyDashboard(
  context: vscode.ExtensionContext
): ShepVerifyTreeProvider {
  
  // Create the verification service
  verificationService = new VerificationService();

  // Create the history service
  historyService = new HistoryService(context);

  // Create the tree provider with history
  treeProvider = new ShepVerifyTreeProvider();
  
  // Load history into tree provider
  const history = historyService.getHistory();
  treeProvider.updateReport({
    ...treeProvider.getReport(),
    history
  });

  // Register the tree view using createTreeView for full TreeView API access
  // Per VS Code docs: https://code.visualstudio.com/api/extension-guides/tree-view
  treeView = vscode.window.createTreeView('shepverify-dashboard', {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });

  // Add to subscriptions for cleanup
  context.subscriptions.push(treeView);

  // Create status bar item for quick verification status
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    50  // Priority - lower = further right
  );
  statusBarItem.command = 'shepverify.rerun';
  statusBarItem.tooltip = 'ShepVerify Status - Click to re-run verification';
  context.subscriptions.push(statusBarItem);
  
  // Show status bar when .shep file is active
  updateStatusBar('none', 0, 0);

  // Register the re-run command
  context.subscriptions.push(
    vscode.commands.registerCommand('shepverify.rerun', () => {
      runVerificationOnActiveDocument();
    })
  );

  // Register the open error command
  context.subscriptions.push(
    vscode.commands.registerCommand('shepverify.openError', async (filePath: string, line: number, column: number) => {
      try {
        console.log('[ShepVerify] Opening error:', { filePath, line, column });
        
        if (!filePath) {
          vscode.window.showWarningMessage('No file path provided for error location');
          return;
        }
        
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        
        // Ensure line and column are valid numbers (default to 1 if not)
        const safeLine = typeof line === 'number' && line > 0 ? line : 1;
        const safeColumn = typeof column === 'number' && column > 0 ? column : 1;
        
        // Position cursor at error location (VS Code uses 0-based indexing)
        const position = new vscode.Position(safeLine - 1, safeColumn - 1);
        const range = new vscode.Range(position, position);
        
        // Reveal and select the error line
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        
        // Also highlight the line briefly
        const lineRange = document.lineAt(safeLine - 1).range;
        editor.setDecorations(
          vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            isWholeLine: true
          }),
          [lineRange]
        );
        
        console.log('[ShepVerify] Navigated to line', safeLine, 'column', safeColumn);
      } catch (error) {
        console.error('[ShepVerify] Failed to open error location:', error);
        vscode.window.showErrorMessage(`Failed to open file: ${error}`);
      }
    })
  );

  // Register the clear history command
  context.subscriptions.push(
    vscode.commands.registerCommand('shepverify.clearHistory', async () => {
      if (!historyService || !treeProvider) {
        return;
      }

      const answer = await vscode.window.showWarningMessage(
        'Clear verification history for this project?',
        { modal: true },
        'Clear'
      );

      if (answer === 'Clear') {
        await historyService.clearHistory();
        
        // Update tree with empty history
        const currentReport = treeProvider.getReport();
        treeProvider.updateReport({
          ...currentReport,
          history: []
        });

        vscode.window.showInformationMessage('Verification history cleared');
      }
    })
  );

  // Supported languages for multi-language verification
  const SUPPORTED_LANGUAGES = [
    'sheplang', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
    'html', 'css', 'scss', 'less', 'json', 'jsonc', 'python'
  ];

  // Run verification when active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && SUPPORTED_LANGUAGES.includes(editor.document.languageId)) {
        runVerificationOnActiveDocument();
      } else {
        // Hide status bar when not viewing supported file
        updateStatusBar('none', 0, 0);
      }
    })
  );

  // Run verification when document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (SUPPORTED_LANGUAGES.includes(event.document.languageId)) {
        // Debounce: only update if this is the active document
        if (vscode.window.activeTextEditor?.document === event.document) {
          runVerificationOnActiveDocument();
        }
      }
    })
  );

  // Run verification on already-open supported file
  if (vscode.window.activeTextEditor && 
      SUPPORTED_LANGUAGES.includes(vscode.window.activeTextEditor.document.languageId)) {
    runVerificationOnActiveDocument();
  }

  console.log('[ShepVerify Dashboard] Initialized');
  
  return treeProvider;
}

/**
 * Run verification on the active document and update dashboard
 */
async function runVerificationOnActiveDocument(): Promise<void> {
  if (!verificationService || !treeProvider || !historyService) {
    return;
  }

  const activeEditor = vscode.window.activeTextEditor;
  
  // Await the async verification (now supports multiple languages)
  const report = await verificationService.runVerification(activeEditor?.document);
  
  // Save to history if we have a valid report (not "none" status)
  if (report.status !== 'none' && report.timestamp) {
    // Collect all errors and warnings from all phases
    const allErrors = Object.values(report.phases).flatMap((phase: any) => phase.errors || []);
    const allWarnings = Object.values(report.phases).flatMap((phase: any) => phase.warnings || []);
    const errorCount = allErrors.length;
    const warningCount = allWarnings.length;

    const historyEntry: HistoryEntry = {
      timestamp: report.timestamp,
      status: report.status,
      errorCount,
      warningCount,
      projectPath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
      // Store errors and warnings for navigation from history
      errors: allErrors,
      warnings: allWarnings,
      filePath: activeEditor?.document.uri.fsPath
    };

    await historyService.addEntry(historyEntry);
    
    // Update report with new history
    const history = historyService.getHistory();
    report.history = history;
  }
  
  treeProvider.updateReport(report);
  
  // Update status bar with current verification status
  const totalErrors = Object.values(report.phases).reduce(
    (sum: number, phase: any) => sum + (phase.errors?.length || 0), 0
  );
  const totalWarnings = Object.values(report.phases).reduce(
    (sum: number, phase: any) => sum + (phase.warnings?.length || 0), 0
  );
  updateStatusBar(report.status, totalErrors, totalWarnings);
}

/**
 * Get the current tree provider instance
 */
export function getTreeProvider(): ShepVerifyTreeProvider | null {
  return treeProvider;
}

/**
 * Update the dashboard with a new verification report
 */
export function updateDashboard(report: VerificationReport): void {
  if (treeProvider) {
    treeProvider.updateReport(report);
  }
}

/**
 * Refresh the dashboard
 */
export function refreshDashboard(): void {
  if (treeProvider) {
    treeProvider.refresh();
  }
}

/**
 * Update the status bar with verification status
 * Now supports multi-language verification!
 */
function updateStatusBar(status: string, errorCount: number, warningCount: number): void {
  if (!statusBarItem) return;

  const activeEditor = vscode.window.activeTextEditor;
  const languageId = activeEditor?.document.languageId;
  
  // Supported languages for status bar
  const SUPPORTED_LANGUAGES = [
    'sheplang', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
    'html', 'css', 'scss', 'less', 'json', 'jsonc', 'python'
  ];
  
  const isSupportedFile = languageId && SUPPORTED_LANGUAGES.includes(languageId);

  if (!isSupportedFile) {
    statusBarItem.hide();
    return;
  }
  
  // Get language display name
  const languageNames: Record<string, string> = {
    'sheplang': 'ShepLang',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'typescriptreact': 'React TSX',
    'javascriptreact': 'React JSX',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'less': 'LESS',
    'json': 'JSON',
    'jsonc': 'JSON',
    'python': 'Python'
  };
  const langName = languageNames[languageId] || languageId;

  // Set icon and text based on status
  switch (status) {
    case 'passed':
      statusBarItem.text = `$(shield) ShepVerify [${langName}]: ✓ Verified`;
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = '#4EC9B0';  // Green
      break;
    case 'warning':
      statusBarItem.text = `$(shield) ShepVerify [${langName}]: ⚠ ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      statusBarItem.color = undefined;
      break;
    case 'failed':
      statusBarItem.text = `$(shield) ShepVerify [${langName}]: ✖ ${errorCount} error${errorCount !== 1 ? 's' : ''}`;
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      statusBarItem.color = undefined;
      break;
    default:
      statusBarItem.text = `$(shield) ShepVerify [${langName}]`;
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = undefined;
  }

  statusBarItem.show();
}
