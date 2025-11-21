/**
 * Semantic Syntax Highlighting
 * 
 * Context-aware colors beyond basic TextMate grammar
 * Makes code beautiful and easier to understand
 */

import * as vscode from 'vscode';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function () {
  const tokenTypesLegend = [
    'keyword', 'type', 'variable', 'property', 'function', 'string', 'number', 'comment'
  ];
  tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

  const tokenModifiersLegend = [
    'declaration', 'readonly', 'static', 'deprecated', 'abstract'
  ];
  tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

  return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function registerSemanticHighlighting(context: vscode.ExtensionContext): void {
  const provider: vscode.DocumentSemanticTokensProvider = {
    provideDocumentSemanticTokens(
      document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.SemanticTokens> {
      const tokensBuilder = new vscode.SemanticTokensBuilder(legend);
      const text = document.getText();
      const lines = text.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Highlight app declaration
        const appMatch = line.match(/^(app)\s+(\w+)/);
        if (appMatch) {
          tokensBuilder.push(
            new vscode.Range(i, 0, i, 3),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, 4, i, 4 + appMatch[2].length),
            'type',
            ['declaration']
          );
        }

        // Highlight data declarations
        const dataMatch = line.match(/^(data)\s+(\w+):/);
        if (dataMatch) {
          tokensBuilder.push(
            new vscode.Range(i, 0, i, 4),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, 5, i, 5 + dataMatch[2].length),
            'type',
            ['declaration']
          );
        }

        // Highlight view declarations
        const viewMatch = line.match(/^(view)\s+(\w+):/);
        if (viewMatch) {
          tokensBuilder.push(
            new vscode.Range(i, 0, i, 4),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, 5, i, 5 + viewMatch[2].length),
            'type',
            ['declaration']
          );
        }

        // Highlight action declarations
        const actionMatch = line.match(/^(action)\s+(\w+)/);
        if (actionMatch) {
          tokensBuilder.push(
            new vscode.Range(i, 0, i, 6),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, 7, i, 7 + actionMatch[2].length),
            'function',
            ['declaration']
          );
        }

        // Highlight field types with special colors
        const fieldMatch = line.match(/(\w+):\s+(text|number|yes\/no|date|time)/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2];
          const fieldStart = line.indexOf(fieldName);
          const typeStart = line.indexOf(fieldType);

          tokensBuilder.push(
            new vscode.Range(i, fieldStart, i, fieldStart + fieldName.length),
            'property',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, typeStart, i, typeStart + fieldType.length),
            'type',
            []
          );
        }

        // Highlight entity references
        const listMatch = line.match(/(list)\s+(\w+)/);
        if (listMatch) {
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf('list'), i, line.indexOf('list') + 4),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf(listMatch[2]), i, line.indexOf(listMatch[2]) + listMatch[2].length),
            'type',
            []
          );
        }

        // Highlight actions in operations
        const addMatch = line.match(/(add)\s+(\w+)/);
        if (addMatch) {
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf('add'), i, line.indexOf('add') + 3),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf(addMatch[2]), i, line.indexOf(addMatch[2]) + addMatch[2].length),
            'type',
            []
          );
        }

        // Highlight show statements
        const showMatch = line.match(/(show)\s+(\w+)/);
        if (showMatch) {
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf('show'), i, line.indexOf('show') + 4),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf(showMatch[2]), i, line.indexOf(showMatch[2]) + showMatch[2].length),
            'type',
            []
          );
        }

        // Highlight API calls
        const callMatch = line.match(/(call)\s+(GET|POST|PUT|PATCH|DELETE)/);
        if (callMatch) {
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf('call'), i, line.indexOf('call') + 4),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf(callMatch[2]), i, line.indexOf(callMatch[2]) + callMatch[2].length),
            'keyword',
            ['static']
          );
        }

        // Highlight load statements
        const loadMatch = line.match(/(load)\s+(GET)/);
        if (loadMatch) {
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf('load'), i, line.indexOf('load') + 4),
            'keyword',
            []
          );
          tokensBuilder.push(
            new vscode.Range(i, line.indexOf(loadMatch[2]), i, line.indexOf(loadMatch[2]) + loadMatch[2].length),
            'keyword',
            ['static']
          );
        }
      }

      return tokensBuilder.build();
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { scheme: 'file', language: 'sheplang' },
      provider,
      legend
    )
  );
}
