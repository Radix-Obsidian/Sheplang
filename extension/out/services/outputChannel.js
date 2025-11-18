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
exports.outputChannel = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Centralized output channel for ShepLang extension logging
 * Provides clear, actionable feedback to developers
 */
class OutputChannelManager {
    channel;
    isVisible = false;
    constructor() {
        this.channel = vscode.window.createOutputChannel('ShepLang', 'log');
    }
    /**
     * Log info message with timestamp
     */
    info(message, ...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const formatted = this.formatMessage('INFO', timestamp, message, args);
        this.channel.appendLine(formatted);
        console.log(`[ShepLang] ${message}`, ...args);
    }
    /**
     * Log success message with timestamp
     */
    success(message, ...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const formatted = this.formatMessage('✓ SUCCESS', timestamp, message, args);
        this.channel.appendLine(formatted);
        console.log(`[ShepLang] ✓ ${message}`, ...args);
    }
    /**
     * Log warning message with timestamp
     */
    warn(message, ...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const formatted = this.formatMessage('⚠ WARNING', timestamp, message, args);
        this.channel.appendLine(formatted);
        console.warn(`[ShepLang] ${message}`, ...args);
    }
    /**
     * Log error message with timestamp and show channel
     */
    error(message, error, ...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const formatted = this.formatMessage('✗ ERROR', timestamp, message, args);
        this.channel.appendLine(formatted);
        if (error instanceof Error) {
            this.channel.appendLine(`  → ${error.message}`);
            if (error.stack) {
                this.channel.appendLine(`  Stack trace:`);
                error.stack.split('\n').forEach(line => {
                    this.channel.appendLine(`    ${line}`);
                });
            }
        }
        console.error(`[ShepLang] ${message}`, error, ...args);
        // Auto-show channel on errors
        if (!this.isVisible) {
            this.show();
        }
    }
    /**
     * Log debug message (only if verbose logging enabled)
     */
    debug(message, ...args) {
        const config = vscode.workspace.getConfiguration('sheplang');
        const verboseLogging = config.get('verboseLogging', false);
        if (verboseLogging) {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const formatted = this.formatMessage('DEBUG', timestamp, message, args);
            this.channel.appendLine(formatted);
        }
        console.debug(`[ShepLang] ${message}`, ...args);
    }
    /**
     * Show the output channel
     */
    show() {
        this.channel.show(true);
        this.isVisible = true;
    }
    /**
     * Clear all output
     */
    clear() {
        this.channel.clear();
    }
    /**
     * Add a separator line
     */
    separator() {
        this.channel.appendLine('─'.repeat(80));
    }
    /**
     * Log a section header
     */
    section(title) {
        this.separator();
        this.channel.appendLine(`▶ ${title.toUpperCase()}`);
        this.separator();
    }
    /**
     * Format message with level and timestamp
     */
    formatMessage(level, timestamp, message, args) {
        const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : '';
        return `[${timestamp}] [${level}] ${message}${argsStr}`;
    }
    /**
     * Dispose the output channel
     */
    dispose() {
        this.channel.dispose();
    }
}
// Singleton instance
exports.outputChannel = new OutputChannelManager();
//# sourceMappingURL=outputChannel.js.map