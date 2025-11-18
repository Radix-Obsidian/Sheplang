"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefinition = getDefinition;
const node_1 = require("vscode-languageserver/node");
async function getDefinition(document, position) {
    const text = document.getText();
    const word = getWordAtPosition(document, position);
    if (!word) {
        return null;
    }
    // Find the definition of the word (data model, view, or action)
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        // Check if this line defines the word we're looking for
        if (trimmed.startsWith(`data ${word}:`) ||
            trimmed.startsWith(`view ${word}:`) ||
            trimmed.startsWith(`action ${word}(`)) {
            // Found the definition
            return node_1.Location.create(document.uri, node_1.Range.create(i, 0, i, line.length));
        }
    }
    return null;
}
function getWordAtPosition(document, position) {
    const text = document.getText();
    const offset = document.offsetAt(position);
    let start = offset;
    let end = offset;
    // Move start back to beginning of word
    while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
        start--;
    }
    // Move end forward to end of word
    while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) {
        end++;
    }
    if (start === end) {
        return null;
    }
    return text.substring(start, end);
}
//# sourceMappingURL=definition.js.map