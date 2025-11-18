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
exports.errorRecovery = exports.ErrorRecoveryService = void 0;
const vscode = __importStar(require("vscode"));
const outputChannel_1 = require("./outputChannel");
class ErrorRecoveryService {
    /**
     * Handle error with smart recovery suggestions
     */
    async handleError(error, context, suggestions) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Log to output channel
        outputChannel_1.outputChannel.error(`${context}: ${errorMessage}`, error);
        // Get smart suggestions if not provided
        const smartSuggestions = suggestions || this.getSuggestionsForError(errorMessage, context);
        // Show error with recovery options
        if (smartSuggestions.length > 0) {
            await this.showErrorWithSuggestions(context, errorMessage, smartSuggestions);
        }
        else {
            vscode.window.showErrorMessage(`${context}: ${errorMessage}`);
        }
    }
    /**
     * Get smart suggestions based on error message
     */
    getSuggestionsForError(errorMessage, context) {
        const suggestions = [];
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
            }
            else {
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
    async showErrorWithSuggestions(context, errorMessage, suggestions) {
        const items = suggestions
            .filter(s => s.action)
            .map(s => ({
            title: s.action.title,
            command: s.action.command,
            args: s.action.args
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
        const selected = await vscode.window.showErrorMessage(fullMessage, ...items);
        if (selected && selected.command) {
            const actionItem = selected;
            await vscode.commands.executeCommand(actionItem.command, ...(actionItem.args || []));
        }
    }
    /**
     * Show warning with suggestion
     */
    async showWarningWithSuggestion(message, suggestion, action) {
        outputChannel_1.outputChannel.warn(message);
        const items = [];
        if (action) {
            items.push({ title: action.title });
        }
        const selected = await vscode.window.showWarningMessage(`${message}\n\n💡 ${suggestion}`, ...items);
        if (selected && action) {
            await vscode.commands.executeCommand(action.command, ...(action.args || []));
        }
    }
    /**
     * Show success message
     */
    showSuccess(message) {
        outputChannel_1.outputChannel.success(message);
        vscode.window.showInformationMessage(`✓ ${message}`);
    }
}
exports.ErrorRecoveryService = ErrorRecoveryService;
// Singleton instance
exports.errorRecovery = new ErrorRecoveryService();
//# sourceMappingURL=errorRecovery.js.map