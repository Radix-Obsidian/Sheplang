/**
 * Runtime Manager - Manages ShepThon backend lifecycle
 * Phase 2: Full implementation
 */

import * as vscode from 'vscode';
import { bridgeService } from './bridgeService';
// Import our direct CommonJS-compatible implementation
import { parseShepThon, ShepThonRuntime } from './direct-parser';

export class RuntimeManager {
  private activeRuntimes: Map<string, any> = new Map();
  private statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'sheplang.restartBackend';
    context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Load and start a ShepThon backend from document
   */
  public async loadBackend(document: vscode.TextDocument): Promise<void> {
    const uri = document.uri.toString();
    console.log('[RuntimeManager] loadBackend called for:', uri);

    try {
      // Using direct parser implementation
      console.log('[RuntimeManager] Using direct parser implementation');
      
      this.updateStatus('$(sync~spin) Loading...', 'Loading ShepThon backend');

      // Parse source with detailed error handling
      console.log('[RuntimeManager] Parsing ShepThon source...');
      const source = document.getText();
      console.log('[RuntimeManager] Source length:', source.length);
      
      // Save source to temp file for debugging (first 100 chars)
      console.log('[RuntimeManager] Source preview:', source.substring(0, 100));
      
      // Try parse with extra error handling
      let parseResult;
      try {
        console.log('[RuntimeManager] Calling parseShepThon directly...');
        parseResult = parseShepThon(source);
        console.log('[RuntimeManager] Parse succeeded');
      } catch (parseError) {
        console.error('[RuntimeManager] Parse threw exception:', parseError);
        if (parseError instanceof Error) {
          console.error('[RuntimeManager] Parse error stack:', parseError.stack);
        }
        throw new Error(`ShepThon parse failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      console.log('[RuntimeManager] Parse result:', parseResult);

      if (!parseResult.app) {
        const errors = parseResult.diagnostics
          ?.map((d: { message: string }) => d.message)
          .join('\n') || 'Parse failed';
        console.error('[RuntimeManager] Parse failed:', errors);
        throw new Error(errors);
      }

      console.log('[RuntimeManager] Parse successful, app:', parseResult.app.name);

      // Create runtime
      console.log('[RuntimeManager] Creating ShepThonRuntime...');
      const runtime = new ShepThonRuntime(parseResult.app);
      console.log('[RuntimeManager] Runtime created');

      // Store runtime
      this.activeRuntimes.set(uri, runtime);
      bridgeService.setRuntime(runtime);
      console.log('[RuntimeManager] Runtime stored and set in bridge');

      // Start jobs
      console.log('[RuntimeManager] Starting jobs...');
      runtime.startJobs();
      console.log('[RuntimeManager] Jobs started');

      this.updateStatus(
        '$(database) ShepThon Active',
        `${parseResult.app.name} - ${parseResult.app.endpoints.length} endpoints`
      );

      vscode.window.showInformationMessage(
        `✅ ShepThon backend loaded: ${parseResult.app.name}`
      );
      console.log('[RuntimeManager] Backend loading complete ✅');
    } catch (error) {
      console.error('[RuntimeManager] Error loading backend:', error);
      console.error('[RuntimeManager] Error stack:', error instanceof Error ? error.stack : 'no stack');
      
      this.updateStatus('$(error) ShepThon Error', 'Click to retry');
      
      vscode.window.showErrorMessage(
        `Failed to load ShepThon backend: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      
      throw error; // Re-throw so caller knows it failed
    }
  }

  /**
   * Stop and remove a backend
   */
  public stopBackend(uri: string): void {
    const runtime = this.activeRuntimes.get(uri);
    if (runtime) {
      runtime.stopJobs();
      this.activeRuntimes.delete(uri);
      if (this.activeRuntimes.size === 0) {
        bridgeService.clearRuntime();
        this.statusBarItem.hide();
      }
    }
  }

  /**
   * Restart a backend
   */
  public async restartBackend(uri: string): Promise<void> {
    this.stopBackend(uri);
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(uri));
    await this.loadBackend(document);
  }

  /**
   * Get runtime for a document
   */
  public getRuntime(uri: string): any | null {
    return this.activeRuntimes.get(uri) || null;
  }

  /**
   * Update status bar
   */
  private updateStatus(text: string, tooltip: string): void {
    this.statusBarItem.text = text;
    this.statusBarItem.tooltip = tooltip;
    this.statusBarItem.show();
  }

  /**
   * Dispose all runtimes
   */
  public dispose(): void {
    for (const [uri, runtime] of this.activeRuntimes.entries()) {
      runtime.stopJobs();
    }
    this.activeRuntimes.clear();
    bridgeService.clearRuntime();
  }
}
