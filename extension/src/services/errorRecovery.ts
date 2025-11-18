import * as vscode from 'vscode';
import { outputChannel } from './outputChannel';

/**
 * Error recovery service with smart suggestions
 * Provides actionable recovery steps for common errors
 */

export interface ErrorSuggestion {
  message: string;
  action?: {
    title: string;
    command: string;
    args?: any[];
  };
}

interface ActionMessageItem extends vscode.MessageItem {
  command?: string;
  args?: any[];
}

export class ErrorRecoveryService {
  /**
   * Handle error with smart recovery suggestions
   */
  async handleError(
    error: Error | unknown,
    context: string,
    suggestions?: ErrorSuggestion[]
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log to output channel
    outputChannel.error(`${context}: ${errorMessage}`, error);
    
    // Get smart suggestions if not provided
    const smartSuggestions = suggestions || this.getSuggestionsForError(errorMessage, context);
    
    // Show error with recovery options
    if (smartSuggestions.length > 0) {
      await this.showErrorWithSuggestions(context, errorMessage, smartSuggestions);
    } else {
      vscode.window.showErrorMessage(`${context}: ${errorMessage}`);
    }
  }

  /**
   * Get smart suggestions based on error message
   */
  private getSuggestionsForError(errorMessage: string, context: string): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];

    // File not found errors
    if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
      if (context.includes('shepthon') || context.includes('backend')) {
        suggestions.push({
          message: 'ShepThon backend file not found. Create a .shepthon file with the same name as your .shep file.',
          action: {
            title: 'Create Backend File',
            command: 'sheplang.createBackendFile'
          }
        });
      } else {
        suggestions.push({
          message: 'File not found. Check the file path and try again.'
        });
      }
    }

    // Parse errors
    if (errorMessage.includes('parse') || errorMessage.includes('syntax')) {
      suggestions.push({
        message: 'Syntax error detected. Check your ShepLang syntax.',
        action: {
          title: 'View Documentation',
          command: 'vscode.open',
          args: [vscode.Uri.parse('https://github.com/Radix-Obsidian/Sheplang-BobaScript')]
        }
      });
    }

    // Runtime errors
    if (errorMessage.includes('runtime') || errorMessage.includes('execution')) {
      suggestions.push({
        message: 'Runtime error. Try restarting the backend.',
        action: {
          title: 'Restart Backend',
          command: 'sheplang.restartBackend'
        }
      });
    }

    // Connection errors
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection')) {
      suggestions.push({
        message: 'Backend connection failed. The backend might not be running.',
        action: {
          title: 'Restart Backend',
          command: 'sheplang.restartBackend'
        }
      });
    }

    // Port already in use
    if (errorMessage.includes('EADDRINUSE') || errorMessage.includes('port')) {
      suggestions.push({
        message: 'Port already in use. Another instance might be running.',
        action: {
          title: 'Restart VS Code',
          command: 'workbench.action.reloadWindow'
        }
      });
    }

    // No active editor
    if (errorMessage.includes('No active editor') || context.includes('editor')) {
      suggestions.push({
        message: 'Open a .shep file first, then try again.'
      });
    }

    // Wrong file type
    if (errorMessage.includes('only available for .shep')) {
      suggestions.push({
        message: 'This command only works with .shep files.'
      });
    }

    // Generic fallback
    if (suggestions.length === 0) {
      suggestions.push({
        message: 'View output logs for more details.',
        action: {
          title: 'Show Logs',
          command: 'sheplang.showOutput'
        }
      });
    }

    return suggestions;
  }

  /**
   * Show error with actionable suggestions
   */
  private async showErrorWithSuggestions(
    context: string,
    errorMessage: string,
    suggestions: ErrorSuggestion[]
  ): Promise<void> {
    const items: ActionMessageItem[] = suggestions
      .filter(s => s.action)
      .map(s => ({
        title: s.action!.title,
        command: s.action!.command,
        args: s.action!.args
      }));

    // Add "Show Logs" option
    items.push({
      title: 'Show Logs',
      command: 'sheplang.showOutput'
    });

    // Build full message with suggestions
    const suggestionText = suggestions
      .map(s => `• ${s.message}`)
      .join('\n');
    
    const fullMessage = `${context}\n\n${errorMessage}\n\n💡 Suggestions:\n${suggestionText}`;

    const selected = await vscode.window.showErrorMessage(
      fullMessage,
      ...items
    );

    if (selected && (selected as ActionMessageItem).command) {
      const actionItem = selected as ActionMessageItem;
      await vscode.commands.executeCommand(actionItem.command!, ...(actionItem.args || []));
    }
  }

  /**
   * Show warning with suggestion
   */
  async showWarningWithSuggestion(
    message: string,
    suggestion: string,
    action?: { title: string; command: string; args?: any[] }
  ): Promise<void> {
    outputChannel.warn(message);
    
    const items: vscode.MessageItem[] = [];
    if (action) {
      items.push({ title: action.title });
    }

    const selected = await vscode.window.showWarningMessage(
      `${message}\n\n💡 ${suggestion}`,
      ...items
    );

    if (selected && action) {
      await vscode.commands.executeCommand(action.command, ...(action.args || []));
    }
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    outputChannel.success(message);
    vscode.window.showInformationMessage(`✓ ${message}`);
  }
}

// Singleton instance
export const errorRecovery = new ErrorRecoveryService();
