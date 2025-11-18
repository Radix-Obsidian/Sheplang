"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShepLangDefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Definition Provider for ShepLang/ShepThon
 * Enables "Go to Definition" for models, views, actions, endpoints
 */
class ShepLangDefinitionProvider {
    provideDefinition(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }
        const word = document.getText(wordRange);
        // Phase 2: Parse AST and find definition
        // For now, do simple text search
        return this.findDefinitionByText(document, word);
    }
    findDefinitionByText(document, word) {
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
        }
        else if (isShepThon) {
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
exports.ShepLangDefinitionProvider = ShepLangDefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map