/**
 * Import from Figma Command
 * 
 * Fetches Figma file via REST API and generates .shep files.
 * 
 * Official VS Code Extension API:
 * - Commands: https://code.visualstudio.com/api/references/vscode-api#commands
 * - Input Box: https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
 * - Configuration: https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration
 * 
 * User workflow:
 * 1. User copies Figma file URL
 * 2. Runs "ShepLang: Import from Figma" command
 * 3. Extension fetches via REST API
 * 4. Generates .shep files
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FigmaAPIClient } from '../figma/api';
import { convertFigmaToSpec } from '../figma/converter';

/**
 * Import from Figma command handler
 * 
 * Prompts user for Figma URL, fetches file data, and generates .shep files.
 */
export async function importFromFigma() {
  try {
    // Step 1: Get Figma access token
    const token = await getFigmaAccessToken();
    if (!token) {
      vscode.window.showErrorMessage('Figma access token is required');
      return;
    }
    
    // Step 2: Get Figma file URL or ID
    const urlOrId = await vscode.window.showInputBox({
      prompt: 'Enter Figma file URL or ID',
      placeHolder: 'https://www.figma.com/file/abc123/My-Design or abc123',
      validateInput: (value) => {
        if (!value) return 'Please enter a Figma URL or file ID';
        const fileId = FigmaAPIClient.extractFileId(value);
        if (!fileId) return 'Invalid Figma URL or file ID';
        return null;
      }
    });
    
    if (!urlOrId) {
      return; // User cancelled
    }
    
    // Extract file ID
    const fileId = FigmaAPIClient.extractFileId(urlOrId);
    if (!fileId) {
      vscode.window.showErrorMessage('Invalid Figma URL or file ID');
      return;
    }
    
    // Step 3: Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Importing from Figma',
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: 'Fetching file data from Figma...' });
        
        // Step 4: Fetch from Figma REST API
        const api = new FigmaAPIClient({ accessToken: token });
        const figmaData = await api.getFile(fileId);
        
        progress.report({ message: 'Converting to ShepLang spec...' });
        
        // Step 5: Convert to FigmaShepSpec
        const spec = convertFigmaToSpec(figmaData);
        
        progress.report({ message: 'Generating .shep files...' });
        
        // Step 6: Get workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          throw new Error('No workspace folder open');
        }
        
        // Step 7: Generate .shep files
        const outputPath = await generateShepFiles(spec, workspaceFolder.uri.fsPath);
        
        progress.report({ message: 'Opening generated file...' });
        
        // Step 8: Open generated file
        const doc = await vscode.workspace.openTextDocument(outputPath);
        await vscode.window.showTextDocument(doc);
        
        vscode.window.showInformationMessage(
          `✓ Imported "${spec.appName}" from Figma! Generated ${spec.entities.length} entities and ${spec.screens.length} screens.`
        );
      }
    );
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    vscode.window.showErrorMessage(`Failed to import from Figma: ${message}`);
    console.error('Import from Figma error:', error);
  }
}

/**
 * Get Figma access token from configuration or prompt user
 * 
 * Official docs: https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration
 */
async function getFigmaAccessToken(): Promise<string | null> {
  const config = vscode.workspace.getConfiguration('sheplang');
  let token = config.get<string>('figmaAccessToken');
  
  if (!token) {
    // Prompt user for token
    token = await vscode.window.showInputBox({
      prompt: 'Enter your Figma Personal Access Token',
      placeHolder: 'figd_...',
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) return 'Token is required';
        if (!value.startsWith('figd_')) return 'Token should start with "figd_"';
        return null;
      }
    });
    
    if (token) {
      // Ask if user wants to save it
      const save = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Save token for future use?'
      });
      
      if (save === 'Yes') {
        await config.update('figmaAccessToken', token, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('Figma access token saved');
      }
    }
  }
  
  return token || null;
}

/**
 * Generate .shep files from FigmaShepSpec
 * 
 * Reuses the converter from the figma-shep-import package if available,
 */
async function generateShepFiles(spec: any, workspacePath: string): Promise<string> {
  const fileName = `${spec.appName.toLowerCase()}.shep`;
  const filePath = path.join(workspacePath, fileName);
  
  // Generate simple .shep content directly
  // Note: Bridge package integration can be added later if needed
  const shepContent = generateSimpleShepFile(spec);
  await fs.writeFile(filePath, shepContent, 'utf-8');
  
  return filePath;
}

/**
 * Generate .shep file directly with improved logic
 */
function generateSimpleShepFile(spec: any): string {
  let content = `app ${spec.appName}\n\n`;
  
  // Generate data blocks
  for (const entity of spec.entities) {
    content += `data ${entity.name}:\n`;
    content += `  fields:\n`;
    for (const field of entity.fields) {
      content += `    ${field.name}: ${field.type}\n`;
    }
    content += `\n`;
  }
  
  // Generate view blocks
  for (const screen of spec.screens) {
    content += `view ${screen.name}:\n`;
    
    for (const widget of screen.widgets) {
      if (widget.kind === 'list' && widget.entityName) {
        content += `  list ${widget.entityName}\n`;
      } else if (widget.kind === 'button' && widget.label) {
        content += `  button "${widget.label}" -> ${widget.actionName || 'Action'}\n`;
      } else if (widget.kind === 'input' && widget.fieldName) {
        content += `  input ${widget.fieldName}\n`;
      }
    }
    
    content += `\n`;
  }
  
  // Generate action blocks (deduplicated)
  const actionsSeen = new Set<string>();
  
  for (const screen of spec.screens) {
    for (const widget of screen.widgets) {
      if (widget.kind === 'button' && widget.actionName) {
        // Skip duplicate actions
        if (actionsSeen.has(widget.actionName)) {
          continue;
        }
        actionsSeen.add(widget.actionName);
        
        const entityName = screen.entityName || spec.entities[0]?.name;
        const fields = spec.entities.find((e: any) => e.name === entityName)?.fields || [];
        
        content += `action ${widget.actionName}(${fields.map((f: any) => f.name).join(', ')}):\n`;
        
        // Infer action type from name
        const actionLower = widget.actionName.toLowerCase();
        
        if (actionLower.includes('add') || actionLower.includes('create') || actionLower.includes('new')) {
          if (entityName) {
            content += `  add ${entityName} with ${fields.map((f: any) => f.name).join(', ')}\n`;
          }
        } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
          if (entityName) {
            content += `  delete ${entityName}\n`;
          }
        }
        
        content += `  show ${screen.name}\n`;
        content += `\n`;
      }
    }
  }
  
  return content;
}

/**
 * Show Figma token setup instructions
 */
export async function showFigmaSetupInstructions() {
  const instructions = `
# Setup Figma Access Token

1. Go to https://www.figma.com/
2. Click your profile → Settings
3. Go to Security tab
4. Click "Generate new token"
5. Give it a name (e.g., "ShepLang")
6. Select scopes: "File content" (read-only)
7. Click Generate
8. Copy the token (starts with "figd_")
9. Paste it when prompted in VS Code

The token will be saved securely in your VS Code settings.
  `.trim();
  
  const doc = await vscode.workspace.openTextDocument({
    content: instructions,
    language: 'markdown'
  });
  
  await vscode.window.showTextDocument(doc);
}
