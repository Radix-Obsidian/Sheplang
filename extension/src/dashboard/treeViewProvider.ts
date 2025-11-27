/**
 * ShepVerify Tree View Provider
 * 
 * Implements VS Code TreeDataProvider for the verification dashboard.
 * Based on official VS Code Tree View API:
 * https://code.visualstudio.com/api/extension-guides/tree-view
 */

import * as vscode from 'vscode';
import { VerificationReport, createEmptyReport } from './types';

/**
 * Tree item types for the dashboard
 */
export type DashboardItemType = 
  | 'root'
  | 'summary'
  | 'score'
  | 'phase'
  | 'error'
  | 'warning'
  | 'history'
  | 'historyEntry';

/**
 * Custom tree item for the ShepVerify dashboard
 */
export class ShepVerifyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly itemType: DashboardItemType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: ShepVerifyTreeItem[]
  ) {
    super(label, collapsibleState);
    this.contextValue = itemType;
  }
}

/**
 * ShepVerify Tree Data Provider
 * 
 * Provides data for the verification dashboard tree view.
 */
export class ShepVerifyTreeProvider implements vscode.TreeDataProvider<ShepVerifyTreeItem> {
  
  // Event emitter for tree refresh
  private _onDidChangeTreeData: vscode.EventEmitter<ShepVerifyTreeItem | undefined | null | void> = 
    new vscode.EventEmitter<ShepVerifyTreeItem | undefined | null | void>();
  
  readonly onDidChangeTreeData: vscode.Event<ShepVerifyTreeItem | undefined | null | void> = 
    this._onDidChangeTreeData.event;

  // Current verification report
  private report: VerificationReport = createEmptyReport();

  // Root items for the tree
  private rootItems: ShepVerifyTreeItem[] = [];

  constructor() {
    this.buildTree();
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this.buildTree();
    this._onDidChangeTreeData.fire();
  }

  /**
   * Update with a new verification report
   */
  updateReport(report: VerificationReport): void {
    this.report = report;
    this.refresh();
  }

  /**
   * Get the current report
   */
  getReport(): VerificationReport {
    return this.report;
  }

  /**
   * Build the tree structure from the current report
   */
  private buildTree(): void {
    this.rootItems = [];

    // Summary section
    const summaryItem = this.createSummaryItem();
    this.rootItems.push(summaryItem);

    // Score section (collapsed by default)
    const scoreItem = this.createScoreItem();
    this.rootItems.push(scoreItem);

    // Phases section (collapsed by default)
    const phasesItem = this.createPhasesItem();
    this.rootItems.push(phasesItem);

    // History section (collapsed by default)
    const historyItem = this.createHistoryItem();
    this.rootItems.push(historyItem);
  }

  /**
   * Create the summary section item
   */
  private createSummaryItem(): ShepVerifyTreeItem {
    const statusIcon = this.getStatusIcon(this.report.status);
    const statusText = this.getStatusText(this.report.status);
    const timeAgo = this.report.timestamp 
      ? this.formatTimeAgo(this.report.timestamp)
      : 'Never';

    const item = new ShepVerifyTreeItem(
      `${statusIcon} ${statusText}`,
      'summary',
      vscode.TreeItemCollapsibleState.None
    );
    
    item.description = `Last run: ${timeAgo}`;
    item.tooltip = `Verification Status: ${statusText}\nLast Run: ${timeAgo}\n\nClick to re-run verification`;
    
    // Add [Re-run] button command
    item.command = {
      command: 'shepverify.rerun',
      title: 'Re-run Verification',
      arguments: []
    };
    
    return item;
  }

  /**
   * Create the score section item
   */
  private createScoreItem(): ShepVerifyTreeItem {
    const scoreDisplay = this.report.status === 'none' 
      ? '--' 
      : `${this.report.score}%`;
    
    const item = new ShepVerifyTreeItem(
      `📊 Score: ${scoreDisplay}`,
      'score',
      vscode.TreeItemCollapsibleState.Collapsed
    );

    item.tooltip = 'Verification score breakdown';
    
    return item;
  }

  /**
   * Create the phases section item
   */
  private createPhasesItem(): ShepVerifyTreeItem {
    const totalErrors = this.getTotalErrors();
    const totalWarnings = this.getTotalWarnings();
    
    let label = '📋 Phases';
    if (totalErrors > 0) {
      label += ` (${totalErrors} errors)`;
    } else if (totalWarnings > 0) {
      label += ` (${totalWarnings} warnings)`;
    }

    const item = new ShepVerifyTreeItem(
      label,
      'phase',
      vscode.TreeItemCollapsibleState.Collapsed
    );

    item.tooltip = 'Verification phases breakdown';
    item.contextValue = 'phases-section';  // Unique identifier for top-level phases
    
    return item;
  }

  /**
   * Create the history section item
   */
  private createHistoryItem(): ShepVerifyTreeItem {
    const historyCount = this.report.history.length;
    
    const item = new ShepVerifyTreeItem(
      `📜 History (${historyCount})`,
      'history',
      vscode.TreeItemCollapsibleState.Collapsed
    );

    item.tooltip = 'Past verification runs';
    
    return item;
  }

  /**
   * Get status icon based on verification status
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed': return '✅';
      case 'warning': return '⚠️';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  }

  /**
   * Get status text based on verification status
   */
  private getStatusText(status: string): string {
    switch (status) {
      case 'passed': return 'Verified';
      case 'warning': return 'Issues Detected';
      case 'failed': return 'Failed';
      default: return 'No file open';
    }
  }

  /**
   * Format timestamp as "X minutes ago" or similar
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get total error count across all phases
   */
  private getTotalErrors(): number {
    const { typeSafety, nullSafety, apiContracts, exhaustiveness } = this.report.phases;
    return (
      typeSafety.errors.length +
      nullSafety.errors.length +
      apiContracts.errors.length +
      exhaustiveness.errors.length
    );
  }

  /**
   * Get total warning count across all phases
   */
  private getTotalWarnings(): number {
    const { typeSafety, nullSafety, apiContracts, exhaustiveness } = this.report.phases;
    return (
      typeSafety.warnings.length +
      nullSafety.warnings.length +
      apiContracts.warnings.length +
      exhaustiveness.warnings.length
    );
  }

  // ========================================
  // TreeDataProvider Interface Methods
  // ========================================

  /**
   * Get tree item for display
   * Required by TreeDataProvider
   */
  getTreeItem(element: ShepVerifyTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children of a tree item
   * Required by TreeDataProvider
   */
  getChildren(element?: ShepVerifyTreeItem): Thenable<ShepVerifyTreeItem[]> {
    if (!element) {
      // Return root items
      return Promise.resolve(this.rootItems);
    }

    // Return children based on item type and context
    if (element.itemType === 'score') {
      return Promise.resolve(this.getScoreChildren());
    } else if (element.contextValue === 'phases-section') {
      // This is the top-level Phases section (📋 Phases)
      return Promise.resolve(this.getPhaseChildren());
    } else if (element.contextValue?.startsWith('phase:')) {
      // This is an individual phase (Type Safety, Null Safety, etc.)
      return Promise.resolve(this.getPhaseErrorChildren(element));
    } else if (element.itemType === 'history') {
      return Promise.resolve(this.getHistoryChildren());
    }

    return Promise.resolve([]);
  }

  /**
   * Get parent of a tree item
   * Required by TreeDataProvider for reveal() functionality
   */
  getParent(element: ShepVerifyTreeItem): vscode.ProviderResult<ShepVerifyTreeItem> {
    // For root items, return undefined (no parent)
    if (this.rootItems.includes(element)) {
      return undefined;
    }
    
    // For phase children (Type Safety, Null Safety, etc.), parent is Phases section
    if (element.contextValue?.startsWith('phase:')) {
      return this.rootItems.find(item => item.contextValue === 'phases-section');
    }
    
    // For error/warning items, find their phase parent
    if (element.itemType === 'error' || element.itemType === 'warning') {
      // These are children of phase items - return undefined for now
      // (would need to track parent references for full implementation)
      return undefined;
    }
    
    // For history entries, parent is History section
    if (element.itemType === 'historyEntry') {
      return this.rootItems.find(item => item.itemType === 'history');
    }
    
    return undefined;
  }

  /**
   * Get error children for a specific phase
   */
  private getPhaseErrorChildren(phaseItem: ShepVerifyTreeItem): ShepVerifyTreeItem[] {
    // Extract phase name from contextValue
    const phaseKey = phaseItem.contextValue?.replace('phase:', '') || '';
    
    let phase;
    switch (phaseKey) {
      case 'type-safety':
        phase = this.report.phases.typeSafety;
        break;
      case 'null-safety':
        phase = this.report.phases.nullSafety;
        break;
      case 'api-contracts':
        phase = this.report.phases.apiContracts;
        break;
      case 'exhaustiveness':
        phase = this.report.phases.exhaustiveness;
        break;
      default:
        return [];
    }

    const errorItems: ShepVerifyTreeItem[] = [];

    // Add errors
    phase.errors.forEach((error, idx) => {
      const item = new ShepVerifyTreeItem(
        `✖ ${error.message}`,
        'error',
        vscode.TreeItemCollapsibleState.None
      );
      
      item.tooltip = `${error.file}:${error.line}:${error.column}\n${error.message}\n\nClick to open file at error location`;
      item.description = `Line ${error.line}`;
      
      // Make error clickable to open file
      item.command = {
        command: 'shepverify.openError',
        title: 'Open Error Location',
        arguments: [error.file, error.line, error.column]
      };
      
      errorItems.push(item);
    });

    // Add warnings
    phase.warnings.forEach((warning, idx) => {
      const item = new ShepVerifyTreeItem(
        `⚠ ${warning.message}`,
        'warning',
        vscode.TreeItemCollapsibleState.None
      );
      
      item.tooltip = `${warning.file}:${warning.line}:${warning.column}\n${warning.message}`;
      item.description = `Line ${warning.line}`;
      
      // Make warning clickable to open file
      item.command = {
        command: 'shepverify.openError',
        title: 'Open Warning Location',
        arguments: [warning.file, warning.line, warning.column]
      };
      
      errorItems.push(item);
    });

    return errorItems;
  }

  /**
   * Get children for the score section
   */
  private getScoreChildren(): ShepVerifyTreeItem[] {
    if (this.report.status === 'none') {
      return [
        new ShepVerifyTreeItem(
          'No verification data',
          'score',
          vscode.TreeItemCollapsibleState.None
        )
      ];
    }

    const { frontend, backend, schema, flow } = this.report.scores;
    
    return [
      this.createScoreChildItem('Frontend', frontend),
      this.createScoreChildItem('Backend', backend),
      this.createScoreChildItem('Schema', schema),
      this.createScoreChildItem('Flow', flow)
    ];
  }

  /**
   * Create a score child item with color indicator
   */
  private createScoreChildItem(name: string, score: number): ShepVerifyTreeItem {
    const indicator = this.getScoreIndicator(score);
    const item = new ShepVerifyTreeItem(
      `${name}: ${score}% ${indicator}`,
      'score',
      vscode.TreeItemCollapsibleState.None
    );
    return item;
  }

  /**
   * Get visual indicator for score
   */
  private getScoreIndicator(score: number): string {
    if (score >= 90) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  }

  /**
   * Get children for the phases section
   */
  private getPhaseChildren(): ShepVerifyTreeItem[] {
    return [
      this.createPhaseChildItem('Type Safety', this.report.phases.typeSafety),
      this.createPhaseChildItem('Null Safety', this.report.phases.nullSafety),
      this.createPhaseChildItem('API Contracts', this.report.phases.apiContracts),
      this.createPhaseChildItem('Exhaustiveness', this.report.phases.exhaustiveness)
    ];
  }

  /**
   * Create a phase child item (now collapsible with error children)
   */
  private createPhaseChildItem(name: string, phase: { errors: any[]; warnings: any[]; status: string }): ShepVerifyTreeItem {
    const errorCount = phase.errors.length;
    const warningCount = phase.warnings.length;
    const hasIssues = errorCount > 0 || warningCount > 0;
    
    let icon = '✅';
    let suffix = '';
    
    if (errorCount > 0) {
      icon = '❌';
      suffix = ` (${errorCount} error${errorCount > 1 ? 's' : ''})`;
    } else if (warningCount > 0) {
      icon = '⚠️';
      suffix = ` (${warningCount} warning${warningCount > 1 ? 's' : ''})`;
    }

    const item = new ShepVerifyTreeItem(
      `${icon} ${name}${suffix}`,
      'phase',
      hasIssues ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );
    
    // Store phase data for retrieval when expanded
    item.contextValue = `phase:${name.toLowerCase().replace(/\s+/g, '-')}`;
    
    return item;
  }

  /**
   * Get children for the history section
   */
  private getHistoryChildren(): ShepVerifyTreeItem[] {
    if (this.report.history.length === 0) {
      return [
        new ShepVerifyTreeItem(
          'No history yet',
          'historyEntry',
          vscode.TreeItemCollapsibleState.None
        )
      ];
    }

    // Show most recent 5 entries
    return this.report.history.slice(0, 5).map(entry => {
      const icon = this.getStatusIcon(entry.status);
      const time = this.formatHistoryTime(entry.timestamp);
      const issues = entry.errorCount + entry.warningCount;
      
      let label = `${icon} ${time}`;
      if (entry.status === 'passed') {
        label += ' – Verified';
      } else if (issues > 0) {
        const errorText = entry.errorCount > 0 ? `${entry.errorCount} error${entry.errorCount > 1 ? 's' : ''}` : '';
        const warningText = entry.warningCount > 0 ? `${entry.warningCount} warning${entry.warningCount > 1 ? 's' : ''}` : '';
        const issueText = [errorText, warningText].filter(Boolean).join(', ');
        label += ` – ${issueText}`;
      }
      
      const item = new ShepVerifyTreeItem(
        label,
        'historyEntry',
        vscode.TreeItemCollapsibleState.None
      );
      
      item.tooltip = `Verified at ${entry.timestamp.toLocaleString()}\n${entry.projectPath}`;
      
      return item;
    });
  }

  /**
   * Format timestamp for history display
   */
  private formatHistoryTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 1 minute ago
    if (diffMins < 1) {
      return 'Just now';
    }
    
    // Less than 1 hour ago
    if (diffHours < 1) {
      return `${diffMins}m ago`;
    }
    
    // Today - show time
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }
    
    // This week - show day
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
