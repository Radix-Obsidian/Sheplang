import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentSymbol, SymbolKind, Range } from 'vscode-languageserver/node';

export function getDocumentSymbols(document: TextDocument): DocumentSymbol[] {
  const text = document.getText();
  const lines = text.split('\n');
  const symbols: DocumentSymbol[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Match data declarations
    const dataMatch = trimmed.match(/^data\s+([A-Za-z_]\w*):/);
    if (dataMatch) {
      const name = dataMatch[1];
      const range = Range.create(i, 0, i, line.length);
      symbols.push({
        name,
        kind: SymbolKind.Class,
        range,
        selectionRange: range,
        detail: 'data model'
      });
      continue;
    }

    // Match view declarations
    const viewMatch = trimmed.match(/^view\s+([A-Za-z_]\w*):/);
    if (viewMatch) {
      const name = viewMatch[1];
      const range = Range.create(i, 0, i, line.length);
      symbols.push({
        name,
        kind: SymbolKind.Interface,
        range,
        selectionRange: range,
        detail: 'view'
      });
      continue;
    }

    // Match action declarations
    const actionMatch = trimmed.match(/^action\s+([A-Za-z_]\w*)\(/);
    if (actionMatch) {
      const name = actionMatch[1];
      const range = Range.create(i, 0, i, line.length);
      symbols.push({
        name,
        kind: SymbolKind.Function,
        range,
        selectionRange: range,
        detail: 'action'
      });
      continue;
    }
  }

  return symbols;
}
