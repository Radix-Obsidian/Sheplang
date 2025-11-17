import * as vscode from 'vscode';

/**
 * Definition Provider for ShepLang/ShepThon
 * Enables "Go to Definition" for models, views, actions, endpoints
 */
export class ShepLangDefinitionProvider implements vscode.DefinitionProvider {
  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);
    
    // Phase 2: Parse AST and find definition
    // For now, do simple text search
    return this.findDefinitionByText(document, word);
  }

  private findDefinitionByText(
    document: vscode.TextDocument,
    word: string
  ): vscode.Location | null {
    const text = document.getText();
    const isShepLang = document.languageId === 'sheplang';
    const isShepThon = document.languageId === 'shepthon';

    if (isShepLang) {
      // Search for model, view, or action definitions
      const patterns = [
        new RegExp(`model\\s+${word}\\s*\\{`, 'i'),
        new RegExp(`view\\s+${word}:`, 'i'),
        new RegExp(`action\\s+${word}:`, 'i')
      ];

      for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
          const position = document.positionAt(match.index);
          return new vscode.Location(document.uri, position);
        }
      }
    } else if (isShepThon) {
      // Search for model or endpoint definitions
      const patterns = [
        new RegExp(`model\\s+${word}\\s*\\{`, 'i'),
        new RegExp(`endpoint\\s+(GET|POST|PUT|DELETE)\\s+"[^"]*"\\s*\\([^)]*\\)\\s*->\\s*\\[?${word}\\]?`, 'i')
      ];

      for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
          const position = document.positionAt(match.index);
          return new vscode.Location(document.uri, position);
        }
      }
    }

    return null;
  }
}
