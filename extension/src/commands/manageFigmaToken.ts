import * as vscode from 'vscode';

/**
 * Manage (update or clear) the saved Figma Personal Access Token.
 *
 * Official VS Code docs for configuration APIs:
 * https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration
 */
export async function manageFigmaToken() {
  const config = vscode.workspace.getConfiguration('sheplang');
  const currentToken = config.get<string>('figmaAccessToken');

  const action = await vscode.window.showQuickPick(
    [
      { label: 'Enter new token', description: 'Replace the saved Figma Personal Access Token', value: 'update' },
      { label: 'Clear saved token', description: 'Remove the stored token from VS Code settings', value: 'clear' },
      currentToken
        ? { label: 'View current token (masked)', description: maskToken(currentToken), value: 'view' }
        : undefined
    ].filter(Boolean) as { label: string; description?: string; value: 'update' | 'clear' | 'view' }[],
    {
      placeHolder: 'Manage Figma Personal Access Token'
    }
  );

  if (!action) {
    return;
  }

  if (action.value === 'view') {
    vscode.window.showInformationMessage(
      currentToken ? `Current token: ${maskToken(currentToken)}` : 'No token saved.'
    );
    return;
  }

  if (action.value === 'clear') {
    await config.update('figmaAccessToken', undefined, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('Figma token removed. You will be prompted next time you import.');
    return;
  }

  const newToken = await vscode.window.showInputBox({
    prompt: 'Enter your new Figma Personal Access Token',
    placeHolder: 'figd_...',
    password: true,
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value) {
        return 'Token is required';
      }
      if (!value.startsWith('figd_')) {
        return 'Token should start with "figd_"';
      }
      return null;
    }
  });

  if (!newToken) {
    return;
  }

  await config.update('figmaAccessToken', newToken, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage('Figma token updated and saved.');
}

function maskToken(token: string): string {
  if (token.length <= 8) {
    return '••••';
  }
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}
