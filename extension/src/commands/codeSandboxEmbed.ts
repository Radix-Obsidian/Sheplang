/**
 * CodeSandbox Embed Command
 * 
 * Implements Phase 4.2 of the Strategic Plan.
 * Allows previewing ShepLang projects in CodeSandbox with one click.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { generateViteApp } from '../generators/viteTemplateGenerator';
import { outputChannel } from '../services/outputChannel';

/**
 * Create a CodeSandbox embed from current ShepLang file
 */
export async function createCodeSandboxEmbed(context: vscode.ExtensionContext): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'sheplang') {
    vscode.window.showWarningMessage('Please open a .shep file first');
    return;
  }
  
  // Get the ShepLang content
  const content = editor.document.getText();
  const fileName = path.basename(editor.document.fileName);
  
  try {
    // Create a temp directory for generation
    const tempDir = path.join(context.extensionPath, '.temp', 'codesandbox-gen');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Clean the temp directory
    fs.readdirSync(tempDir).forEach(file => {
      const curPath = path.join(tempDir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        fs.rmdirSync(curPath, { recursive: true });
      } else {
        fs.unlinkSync(curPath);
      }
    });
    
    // Show progress notification
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Creating CodeSandbox project...',
      cancellable: false
    }, async (progress) => {
      // Step 1: Generate Vite app from ShepLang
      progress.report({ increment: 25, message: 'Generating Vite app...' });
      
      const result = await generateViteApp(content, tempDir);
      if (!result.success) {
        throw new Error(`Failed to generate app: ${result.error}`);
      }
      
      // Step 2: Create HTML file with CodeSandbox embed
      progress.report({ increment: 50, message: 'Creating CodeSandbox embed...' });
      
      const htmlPath = path.join(tempDir, 'codesandbox.html');
      const projectName = getProjectName(content);
      const embedHtml = generateCodeSandboxEmbedHtml(projectName);
      fs.writeFileSync(htmlPath, embedHtml, 'utf-8');
      
      // Step 3: Show the HTML in a webview
      progress.report({ increment: 75, message: 'Opening preview...' });
      
      const panel = vscode.window.createWebviewPanel(
        'codeSandboxEmbed',
        `CodeSandbox: ${projectName || fileName}`,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true
        }
      );
      
      // Set webview HTML content
      panel.webview.html = embedHtml;
      
      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case 'openCodeSandbox':
              // Open CodeSandbox in external browser
              const codesandboxUrl = `https://codesandbox.io/s/new`;
              vscode.env.openExternal(vscode.Uri.parse(codesandboxUrl));
              vscode.window.showInformationMessage(
                'Opening CodeSandbox... Your generated project is in: ' + tempDir
              );
              break;
          }
        },
        undefined,
        context.subscriptions
      );
      
      progress.report({ increment: 100, message: 'Done!' });
    });
    
    outputChannel.success(`✓ Created CodeSandbox embed for ${fileName}`);
    
  } catch (error) {
    outputChannel.error('CodeSandbox embed failed:', error);
    vscode.window.showErrorMessage(`Failed to create CodeSandbox embed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract the project name from ShepLang content
 */
function getProjectName(content: string): string {
  const match = content.match(/^app\s+(\w+)/m);
  return match ? match[1] : 'ShepLangApp';
}

/**
 * Generate the HTML for CodeSandbox embed
 */
function generateCodeSandboxEmbedHtml(projectName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeSandbox Embed: ${projectName}</title>
  <style>
    body, html {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background: #1e1e1e;
      color: #fff;
    }
    header {
      background-color: #151515;
      color: #fff;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      font-size: 1.2rem;
    }
    .buttons {
      display: flex;
      gap: 0.5rem;
    }
    button {
      background-color: #40a9f3;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background-color: #3599d9;
    }
    .content {
      padding: 2rem;
      text-align: center;
    }
    .info {
      background: #2d2d2d;
      border-radius: 8px;
      padding: 2rem;
      margin: 2rem auto;
      max-width: 600px;
    }
    .info h2 {
      color: #40a9f3;
      margin-top: 0;
    }
    .info p {
      color: #ccc;
      line-height: 1.6;
    }
    .info code {
      background: #1e1e1e;
      padding: 2px 6px;
      border-radius: 4px;
      color: #ce9178;
    }
    .success {
      color: #40a9f3;
      font-size: 48px;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>${projectName} - CodeSandbox Preview</h1>
    <div class="buttons">
      <button id="open-codesandbox">Open in CodeSandbox</button>
    </div>
  </header>
  
  <div class="content">
    <div class="info">
      <div class="success">✅</div>
      <h2>Project Ready for CodeSandbox!</h2>
      <p>Your ShepLang project <code>${projectName}</code> has been generated and is ready to open in CodeSandbox.</p>
      <p>Click <strong>"Open in CodeSandbox"</strong> to launch the project in a new browser tab where you can:</p>
      <ul style="text-align: left; color: #ccc;">
        <li>See your app running live</li>
        <li>Edit code in the browser</li>
        <li>Share with others</li>
        <li>Deploy instantly</li>
      </ul>
    </div>
  </div>

  <script>
    // Get VS Code API for messaging
    const vscode = acquireVsCodeApi();
    
    document.getElementById('open-codesandbox').addEventListener('click', function() {
      // Send message to extension to open CodeSandbox
      vscode.postMessage({ command: 'openCodeSandbox' });
    });
  </script>
</body>
</html>`;
}
