"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentSymbols = getDocumentSymbols;
const node_1 = require("vscode-languageserver/node");
function getDocumentSymbols(document) {
    const text = document.getText();
    const lines = text.split('\n');
    const symbols = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        // Match data declarations
        const dataMatch = trimmed.match(/^data\s+([A-Za-z_]\w*):/);
        if (dataMatch) {
            const name = dataMatch[1];
            const range = node_1.Range.create(i, 0, i, line.length);
            symbols.push({
                name,
                kind: node_1.SymbolKind.Class,
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
            const range = node_1.Range.create(i, 0, i, line.length);
            symbols.push({
                name,
                kind: node_1.SymbolKind.Interface,
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
            const range = node_1.Range.create(i, 0, i, line.length);
            symbols.push({
                name,
                kind: node_1.SymbolKind.Function,
                range,
                selectionRange: range,
                detail: 'action'
            });
            continue;
        }
    }
    return symbols;
}
//# sourceMappingURL=symbols.js.map