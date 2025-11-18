import * as vscode from 'vscode';
import { outputChannel } from '../services/outputChannel';

/**
 * Command to show the ShepLang output channel
 * Keyboard shortcut: Ctrl+Shift+L (Cmd+Shift+L on Mac)
 */
export async function showOutputCommand(): Promise<void> {
  outputChannel.show();
}
