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
exports.safeImportParseShepThon = safeImportParseShepThon;
/**
 * ShepThon Import Wrapper
 *
 * This module provides a safer way to import ShepThon ES modules
 * by handling potential ESM compatibility issues.
 */
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Safe import of parseShepThon function with comprehensive error handling
 */
async function safeImportParseShepThon() {
    try {
        console.log('[ImportWrapper] Importing @sheplang/shepthon...');
        // Direct dynamic import - this is optional, ShepThon backend may not be available
        // @ts-expect-error - ShepThon package is optional and may not be installed
        const shepthon = await import('@sheplang/shepthon');
        console.log('[ImportWrapper] Import successful, functions:', Object.keys(shepthon));
        return {
            parseShepThon: shepthon.parseShepThon,
            ShepThonRuntime: shepthon.ShepThonRuntime
        };
    }
    catch (error) {
        console.error('[ImportWrapper] Import failed:', error);
        // Return dummy implementations as fallback
        return {
            parseShepThon: (source) => {
                console.error('[ImportWrapper] Using fallback parseShepThon');
                // Log diagnostic information about the module system
                try {
                    console.log('[ImportWrapper][DEBUG] Node version:', process.version);
                    console.log('[ImportWrapper][DEBUG] __dirname:', __dirname);
                    // Check the shepthon directory structure
                    const extensionPath = path.dirname(path.dirname(__dirname));
                    const nodeModulesPath = path.join(extensionPath, 'node_modules');
                    const shepthonPath = path.join(nodeModulesPath, '@sheplang', 'shepthon');
                    console.log('[ImportWrapper][DEBUG] ShepThon path exists:', fs.existsSync(shepthonPath));
                    if (fs.existsSync(shepthonPath)) {
                        const packageJsonPath = path.join(shepthonPath, 'package.json');
                        if (fs.existsSync(packageJsonPath)) {
                            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                            console.log('[ImportWrapper][DEBUG] ShepThon package.json:', packageJson);
                            console.log('[ImportWrapper][DEBUG] Module type:', packageJson.type);
                            console.log('[ImportWrapper][DEBUG] Main entry:', packageJson.main);
                            console.log('[ImportWrapper][DEBUG] Exports:', packageJson.exports);
                        }
                        // List files in the shepthon dist directory
                        const distPath = path.join(shepthonPath, 'dist');
                        if (fs.existsSync(distPath)) {
                            console.log('[ImportWrapper][DEBUG] Files in dist:', fs.readdirSync(distPath));
                        }
                    }
                }
                catch (debugError) {
                    console.error('[ImportWrapper][DEBUG] Error during diagnostics:', debugError);
                }
                vscode.window.showInformationMessage('ShepThon backend is not available. This is optional - ShepLang (.shep) files will work normally.');
                return {
                    app: {
                        name: 'IMPORT_ERROR',
                        models: [],
                        endpoints: [],
                        jobs: []
                    },
                    diagnostics: [{
                            severity: 'error',
                            message: `Failed to import @sheplang/shepthon: ${error instanceof Error ? error.message : 'unknown error'}`,
                            line: 1,
                            column: 1
                        }]
                };
            },
            ShepThonRuntime: class FallbackRuntime {
                constructor(app) {
                    console.error('[ImportWrapper] Using fallback ShepThonRuntime');
                }
                startJobs() { }
                stopJobs() { }
            }
        };
    }
}
//# sourceMappingURL=shepthon-import-wrapper.js.map