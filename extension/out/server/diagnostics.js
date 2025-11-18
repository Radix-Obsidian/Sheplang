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
exports.validateDocument = validateDocument;
const node_1 = require("vscode-languageserver/node");
async function validateDocument(document) {
    const diagnostics = [];
    const text = document.getText();
    try {
        if (document.languageId === 'sheplang') {
            const { parseShep } = await Promise.resolve().then(() => __importStar(require('@sheplang/language')));
            return validateShepLang(document, text, parseShep);
        }
        else if (document.languageId === 'shepthon') {
            const { parseShepThon } = await Promise.resolve().then(() => __importStar(require('@sheplang/shepthon')));
            return validateShepThon(document, text, parseShepThon);
        }
    }
    catch (error) {
        // Parser threw an error
        diagnostics.push({
            severity: node_1.DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 }
            },
            message: error instanceof Error ? error.message : 'Parse error',
            source: document.languageId
        });
    }
    return diagnostics;
}
async function validateShepLang(document, text, parseShep) {
    const diagnostics = [];
    try {
        // Parse using ShepLang parser from @sheplang/language
        const parseResult = await parseShep(text);
        // Convert parser diagnostics to LSP diagnostics
        if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
            for (const diag of parseResult.diagnostics) {
                const severity = diag.severity === 'error' ? node_1.DiagnosticSeverity.Error :
                    diag.severity === 'warning' ? node_1.DiagnosticSeverity.Warning :
                        node_1.DiagnosticSeverity.Information;
                const line = Math.max(0, (diag.line || 1) - 1);
                const character = Math.max(0, (diag.column || 0));
                diagnostics.push({
                    severity,
                    range: {
                        start: { line, character },
                        end: { line, character: character + 1 }
                    },
                    message: diag.message,
                    source: 'sheplang'
                });
            }
        }
        // Additional semantic validation can be added in Phase 2
    }
    catch (error) {
        diagnostics.push({
            severity: node_1.DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 }
            },
            message: error instanceof Error ? error.message : 'Parse error',
            source: 'sheplang'
        });
    }
    return diagnostics;
}
async function validateShepThon(document, text, parseShepThon) {
    const diagnostics = [];
    try {
        // Parse using ShepThon parser from @sheplang/shepthon
        const parseResult = parseShepThon(text);
        // Convert parser diagnostics to LSP diagnostics
        if (parseResult.diagnostics && parseResult.diagnostics.length > 0) {
            for (const diag of parseResult.diagnostics) {
                const severity = diag.severity === 'error' ? node_1.DiagnosticSeverity.Error :
                    diag.severity === 'warning' ? node_1.DiagnosticSeverity.Warning :
                        node_1.DiagnosticSeverity.Information;
                const line = Math.max(0, (diag.line || 1) - 1);
                const character = Math.max(0, (diag.column || 0));
                diagnostics.push({
                    severity,
                    range: {
                        start: { line, character },
                        end: { line, character: character + 1 }
                    },
                    message: diag.message,
                    source: 'shepthon'
                });
            }
        }
        // Additional semantic validation
        if (parseResult.app) {
            // Check for undefined model references in endpoints
            const modelNames = new Set(parseResult.app.models.map((m) => m.name));
            for (const endpoint of parseResult.app.endpoints || []) {
                const returnType = endpoint.returnType?.type;
                if (returnType && !['string', 'number', 'bool', 'id', 'datetime'].includes(returnType)) {
                    if (!modelNames.has(returnType)) {
                        diagnostics.push({
                            severity: node_1.DiagnosticSeverity.Error,
                            range: {
                                start: { line: 0, character: 0 },
                                end: { line: 0, character: 1 }
                            },
                            message: `Model '${returnType}' is not defined`,
                            source: 'shepthon'
                        });
                    }
                }
            }
        }
    }
    catch (error) {
        diagnostics.push({
            severity: node_1.DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 }
            },
            message: error instanceof Error ? error.message : 'Parse error',
            source: 'shepthon'
        });
    }
    return diagnostics;
}
//# sourceMappingURL=diagnostics.js.map