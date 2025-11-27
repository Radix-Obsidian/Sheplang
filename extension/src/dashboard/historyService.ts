/**
 * ShepVerify History Service
 * 
 * Persists verification history using VS Code's globalState.
 * Stores last 10 verification runs per project.
 */

import * as vscode from 'vscode';
import { HistoryEntry } from './types';

const HISTORY_KEY_PREFIX = 'shepverify.history';
const MAX_HISTORY_ENTRIES = 10;

/**
 * Service for managing verification history
 */
export class HistoryService {
  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Get history key for current workspace
   */
  private getHistoryKey(): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const projectPath = workspaceFolder?.uri.fsPath || 'default';
    // Use a hash or sanitized path for the key
    const sanitized = projectPath.replace(/[^a-zA-Z0-9]/g, '_');
    return `${HISTORY_KEY_PREFIX}.${sanitized}`;
  }

  /**
   * Get verification history for current project
   */
  getHistory(): HistoryEntry[] {
    const key = this.getHistoryKey();
    const history = this.context.globalState.get<HistoryEntry[]>(key, []);
    
    // Convert stored dates back to Date objects and ensure arrays exist
    return history.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
      // Ensure errors and warnings arrays are preserved
      errors: entry.errors || [],
      warnings: entry.warnings || []
    }));
  }

  /**
   * Add a new verification result to history
   */
  async addEntry(entry: HistoryEntry): Promise<void> {
    const history = this.getHistory();
    
    // Add new entry at the beginning
    history.unshift(entry);
    
    // Keep only the most recent MAX_HISTORY_ENTRIES
    const trimmed = history.slice(0, MAX_HISTORY_ENTRIES);
    
    // Save to globalState
    const key = this.getHistoryKey();
    await this.context.globalState.update(key, trimmed);
  }

  /**
   * Clear all history for current project
   */
  async clearHistory(): Promise<void> {
    const key = this.getHistoryKey();
    await this.context.globalState.update(key, []);
  }

  /**
   * Clear all history for all projects (used for debugging/testing)
   */
  async clearAllHistory(): Promise<void> {
    const keys = this.context.globalState.keys();
    for (const key of keys) {
      if (key.startsWith(HISTORY_KEY_PREFIX)) {
        await this.context.globalState.update(key, undefined);
      }
    }
  }
}
