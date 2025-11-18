import * as vscode from 'vscode';

/**
 * Centralized output channel for ShepLang extension logging
 * Provides clear, actionable feedback to developers
 */
class OutputChannelManager {
  private channel: vscode.OutputChannel;
  private isVisible: boolean = false;

  constructor() {
    this.channel = vscode.window.createOutputChannel('ShepLang', 'log');
  }

  /**
   * Log info message with timestamp
   */
  info(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formatted = this.formatMessage('INFO', timestamp, message, args);
    this.channel.appendLine(formatted);
    console.log(`[ShepLang] ${message}`, ...args);
  }

  /**
   * Log success message with timestamp
   */
  success(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formatted = this.formatMessage('✓ SUCCESS', timestamp, message, args);
    this.channel.appendLine(formatted);
    console.log(`[ShepLang] ✓ ${message}`, ...args);
  }

  /**
   * Log warning message with timestamp
   */
  warn(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formatted = this.formatMessage('⚠ WARNING', timestamp, message, args);
    this.channel.appendLine(formatted);
    console.warn(`[ShepLang] ${message}`, ...args);
  }

  /**
   * Log error message with timestamp and show channel
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formatted = this.formatMessage('✗ ERROR', timestamp, message, args);
    this.channel.appendLine(formatted);
    
    if (error instanceof Error) {
      this.channel.appendLine(`  → ${error.message}`);
      if (error.stack) {
        this.channel.appendLine(`  Stack trace:`);
        error.stack.split('\n').forEach(line => {
          this.channel.appendLine(`    ${line}`);
        });
      }
    }
    
    console.error(`[ShepLang] ${message}`, error, ...args);
    
    // Auto-show channel on errors
    if (!this.isVisible) {
      this.show();
    }
  }

  /**
   * Log debug message (only if verbose logging enabled)
   */
  debug(message: string, ...args: any[]): void {
    const config = vscode.workspace.getConfiguration('sheplang');
    const verboseLogging = config.get<boolean>('verboseLogging', false);
    
    if (verboseLogging) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const formatted = this.formatMessage('DEBUG', timestamp, message, args);
      this.channel.appendLine(formatted);
    }
    
    console.debug(`[ShepLang] ${message}`, ...args);
  }

  /**
   * Show the output channel
   */
  show(): void {
    this.channel.show(true);
    this.isVisible = true;
  }

  /**
   * Clear all output
   */
  clear(): void {
    this.channel.clear();
  }

  /**
   * Add a separator line
   */
  separator(): void {
    this.channel.appendLine('─'.repeat(80));
  }

  /**
   * Log a section header
   */
  section(title: string): void {
    this.separator();
    this.channel.appendLine(`▶ ${title.toUpperCase()}`);
    this.separator();
  }

  /**
   * Format message with level and timestamp
   */
  private formatMessage(level: string, timestamp: string, message: string, args: any[]): string {
    const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : '';
    return `[${timestamp}] [${level}] ${message}${argsStr}`;
  }

  /**
   * Dispose the output channel
   */
  dispose(): void {
    this.channel.dispose();
  }
}

// Singleton instance
export const outputChannel = new OutputChannelManager();
