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
exports.manageFigmaToken = manageFigmaToken;
const vscode = __importStar(require("vscode"));
/**
 * Manage (update or clear) the saved Figma Personal Access Token.
 *
 * Official VS Code docs for configuration APIs:
 * https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration
 */
async function manageFigmaToken() {
    const config = vscode.workspace.getConfiguration('sheplang');
    const currentToken = config.get('figmaAccessToken');
    const action = await vscode.window.showQuickPick([
        { label: 'Enter new token', description: 'Replace the saved Figma Personal Access Token', value: 'update' },
        { label: 'Clear saved token', description: 'Remove the stored token from VS Code settings', value: 'clear' },
        currentToken
            ? { label: 'View current token (masked)', description: maskToken(currentToken), value: 'view' }
            : undefined
    ].filter(Boolean), {
        placeHolder: 'Manage Figma Personal Access Token'
    });
    if (!action) {
        return;
    }
    if (action.value === 'view') {
        vscode.window.showInformationMessage(currentToken ? `Current token: ${maskToken(currentToken)}` : 'No token saved.');
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
function maskToken(token) {
    if (token.length <= 8) {
        return '••••';
    }
    return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}
//# sourceMappingURL=manageFigmaToken.js.map