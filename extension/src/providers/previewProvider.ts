import * as vscode from 'vscode';

/**
 * Preview Provider for ShepLang files
 * Phase 2: Full webview-based preview with BobaScript runtime
 */
export class ShepLangPreviewProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ShepLangPreviewProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      ShepLangPreviewProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = 'sheplang.preview';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
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

  private updateWebview(document: vscode.TextDocument, webview: vscode.Webview) {
    // Phase 2: Transpile and render
    // For now, just send the raw text
    webview.postMessage({
      type: 'update',
      text: document.getText(),
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
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
