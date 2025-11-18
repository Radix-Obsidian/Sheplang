"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const completions_1 = require("./completions");
const hover_1 = require("./hover");
const definition_1 = require("./definition");
const symbols_1 = require("./symbols");
const diagnostics_1 = require("./diagnostics");
// Create a connection for the server
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.', ':', ' ']
            },
            hoverProvider: true,
            definitionProvider: true,
            documentSymbolProvider: true
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes
        connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});
// The content of a text document has changed
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});
async function validateTextDocument(textDocument) {
    const diagnostics = await (0, diagnostics_1.validateDocument)(textDocument);
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received a file change event');
});
// Code completion handler
connection.onCompletion((textDocumentPosition) => {
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) {
        return [];
    }
    return (0, completions_1.getCompletions)(document, textDocumentPosition.position);
});
// Completion item resolve handler (for additional info)
connection.onCompletionResolve((item) => {
    return item;
});
// Hover handler
connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    return (0, hover_1.getHoverInfo)(document, params.position);
});
// Definition handler (Go to Definition)
connection.onDefinition(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    return await (0, definition_1.getDefinition)(document, params.position);
});
// Document symbols handler (Outline view)
connection.onDocumentSymbol((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    return (0, symbols_1.getDocumentSymbols)(document);
});
// Make the text document manager listen on the connection
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map