"use strict";
/**
 * Runtime Manager - Manages ShepThon backend lifecycle
 * Phase 2: Full implementation
 */
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
exports.RuntimeManager = void 0;
const vscode = __importStar(require("vscode"));
const bridgeService_1 = require("./bridgeService");
// Import our direct CommonJS-compatible implementation
const direct_parser_1 = require("./direct-parser");
class RuntimeManager {
    activeRuntimes = new Map();
    statusBarItem;
    constructor(context) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'sheplang.restartBackend';
        context.subscriptions.push(this.statusBarItem);
    }
    /**
     * Load and start a ShepThon backend from document
     */
    async loadBackend(document) {
        const uri = document.uri.toString();
        console.log('[RuntimeManager] loadBackend called for:', uri);
        try {
            // Using direct parser implementation
            console.log('[RuntimeManager] Using direct parser implementation');
            this.updateStatus('$(sync~spin) Loading...', 'Loading ShepThon backend');
            // Parse source with detailed error handling
            console.log('[RuntimeManager] Parsing ShepThon source...');
            const source = document.getText();
            console.log('[RuntimeManager] Source length:', source.length);
            // Save source to temp file for debugging (first 100 chars)
            console.log('[RuntimeManager] Source preview:', source.substring(0, 100));
            // Try parse with extra error handling
            let parseResult;
            try {
                console.log('[RuntimeManager] Calling parseShepThon directly...');
                parseResult = (0, direct_parser_1.parseShepThon)(source);
                console.log('[RuntimeManager] Parse succeeded');
            }
            catch (parseError) {
                console.error('[RuntimeManager] Parse threw exception:', parseError);
                if (parseError instanceof Error) {
                    console.error('[RuntimeManager] Parse error stack:', parseError.stack);
                }
                throw new Error(`ShepThon parse failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
            }
            console.log('[RuntimeManager] Parse result:', parseResult);
            if (!parseResult.app) {
                const errors = parseResult.diagnostics
                    ?.map((d) => d.message)
                    .join('\n') || 'Parse failed';
                console.error('[RuntimeManager] Parse failed:', errors);
                throw new Error(errors);
            }
            console.log('[RuntimeManager] Parse successful, app:', parseResult.app.name);
            // Create runtime
            console.log('[RuntimeManager] Creating ShepThonRuntime...');
            const runtime = new direct_parser_1.ShepThonRuntime(parseResult.app);
            console.log('[RuntimeManager] Runtime created');
            // Store runtime
            this.activeRuntimes.set(uri, runtime);
            bridgeService_1.bridgeService.setRuntime(runtime);
            console.log('[RuntimeManager] Runtime stored and set in bridge');
            // Start jobs
            console.log('[RuntimeManager] Starting jobs...');
            runtime.startJobs();
            console.log('[RuntimeManager] Jobs started');
            this.updateStatus('$(database) ShepThon Active', `${parseResult.app.name} - ${parseResult.app.endpoints.length} endpoints`);
            vscode.window.showInformationMessage(`✅ ShepThon backend loaded: ${parseResult.app.name}`);
            console.log('[RuntimeManager] Backend loading complete ✅');
        }
        catch (error) {
            console.error('[RuntimeManager] Error loading backend:', error);
            console.error('[RuntimeManager] Error stack:', error instanceof Error ? error.stack : 'no stack');
            this.updateStatus('$(error) ShepThon Error', 'Click to retry');
            vscode.window.showErrorMessage(`Failed to load ShepThon backend: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error; // Re-throw so caller knows it failed
        }
    }
    /**
     * Stop and remove a backend
     */
    stopBackend(uri) {
        const runtime = this.activeRuntimes.get(uri);
        if (runtime) {
            runtime.stopJobs();
            this.activeRuntimes.delete(uri);
            if (this.activeRuntimes.size === 0) {
                bridgeService_1.bridgeService.clearRuntime();
                this.statusBarItem.hide();
            }
        }
    }
    /**
     * Restart a backend
     */
    async restartBackend(uri) {
        this.stopBackend(uri);
        const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(uri));
        await this.loadBackend(document);
    }
    /**
     * Get runtime for a document
     */
    getRuntime(uri) {
        return this.activeRuntimes.get(uri) || null;
    }
    /**
     * Update status bar
     */
    updateStatus(text, tooltip) {
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.show();
    }
    /**
     * Dispose all runtimes
     */
    dispose() {
        for (const [uri, runtime] of this.activeRuntimes.entries()) {
            runtime.stopJobs();
        }
        this.activeRuntimes.clear();
        bridgeService_1.bridgeService.clearRuntime();
    }
}
exports.RuntimeManager = RuntimeManager;
//# sourceMappingURL=runtimeManager.js.map