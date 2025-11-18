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
exports.ShepLangPreviewProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Preview Provider for ShepLang files
 * Phase 2: Full webview-based preview with BobaScript runtime
 */
class ShepLangPreviewProvider {
    static register(context) {
        const provider = new ShepLangPreviewProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ShepLangPreviewProvider.viewType, provider);
        return providerRegistration;
    }
    constructor(context) {
        this.context = context;
    }
    async resolveCustomTextEditor(document, webviewPanel, _token) {
        // Setup initial content
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        // Update preview when document changes
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview(document, webviewPanel.webview);
            }
        });
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
        // Initial update
        this.updateWebview(document, webviewPanel.webview);
    }
    updateWebview(document, webview) {
        // Phase 2: Transpile and render
        // For now, just send the raw text
        webview.postMessage({
            type: 'update',
            text: document.getText(),
        });
    }
    getHtmlForWebview(webview) {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ShepLang Preview</title>
        <style>
          body {
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f5f5;
          }
          .preview {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            margin: 0 0 16px 0;
            font-size: 24px;
          }
        </style>
      </head>
      <body>
        <div class="preview">
          <h1>🚀 ShepLang Preview</h1>
          <div id="content">Loading...</div>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          
          window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
              case 'update':
                document.getElementById('content').textContent = message.text;
                break;
            }
          });
        </script>
      </body>
      </html>
    `;
    }
}
exports.ShepLangPreviewProvider = ShepLangPreviewProvider;
ShepLangPreviewProvider.viewType = 'sheplang.preview';
//# sourceMappingURL=previewProvider.js.map