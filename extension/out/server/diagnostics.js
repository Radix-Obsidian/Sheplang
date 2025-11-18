"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDocument = validateDocument;
const node_1 = require("vscode-languageserver/node");
async function validateDocument(document) {
    const diagnostics = [];
    const text = document.getText();
    try {
        if (document.languageId === 'sheplang') {
            const { parseShep } = await import('@radix-obsidian/sheplang-language');
            return validateShepLang(document, text, parseShep);
        }
        else if (document.languageId === 'shepthon') {
            // ShepThon support is optional - return empty diagnostics if not available
            try {
                // @ts-expect-error - ShepThon package is optional and may not be installed
                const { parseShepThon } = await import('@sheplang/shepthon');
                return validateShepThon(document, text, parseShepThon);
            }
            catch (importError) {
                // ShepThon package not available - return informational message
                return [{
                        severity: node_1.DiagnosticSeverity.Information,
                        range: {
                            start: { line: 0, character: 0 },
                            end: { line: 0, character: 1 }
                        },
                        message: 'ShepThon backend validation not available. Install @sheplang/shepthon package to enable.',
                        source: 'shepthon'
                    }];
            }
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