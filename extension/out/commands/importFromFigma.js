"use strict";
/**
 * Import from Figma Command
 *
 * Full flow:
 * 1. Get Figma token
 * 2. Get Figma file URL
 * 3. Fetch file data
 * 4. Show frame selection (alpha: max 5 screens)
 * 5. Generate initial .shep files
 * 6. Show post-import wizard for semantic refinement
 * 7. Regenerate .shep files with user context
 * 8. Open generated files
 *
 * Official VS Code Extension API:
 * - Commands: https://code.visualstudio.com/api/references/vscode-api#commands
 * - Input Box: https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
 * - Quick Pick: https://code.visualstudio.com/api/references/vscode-api#window.showQuickPick
 * - Configuration: https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration
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
exports.importFromFigma = importFromFigma;
exports.showFigmaSetupInstructions = showFigmaSetupInstructions;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const api_1 = require("../figma/api");
const converter_1 = require("../figma/converter");
const outputChannel_1 = require("../services/outputChannel");
const ALPHA_MAX_SCREENS = 5;
const FEEDBACK_FORM_URL = 'https://forms.gle/YOUR_GOOGLE_FORM_ID'; // TODO: Replace with actual form
/**
 * Import from Figma command handler
 *
 * Full flow: token → URL → fetch → frame selection → generate → wizard → regenerate → open
 */
async function importFromFigma() {
    try {
        outputChannel_1.outputChannel.info('Starting Figma import...');
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
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value)
                    return 'Please enter a Figma URL or file ID';
                const fileId = api_1.FigmaAPIClient.extractFileId(value);
                if (!fileId)
                    return 'Invalid Figma URL or file ID';
                return null;
            }
        });
        if (!urlOrId) {
            outputChannel_1.outputChannel.info('User cancelled Figma import');
            return; // User cancelled
        }
        // Extract file ID
        const fileId = api_1.FigmaAPIClient.extractFileId(urlOrId);
        if (!fileId) {
            vscode.window.showErrorMessage('Invalid Figma URL or file ID');
            return;
        }
        outputChannel_1.outputChannel.info(`Extracted Figma file ID: ${fileId}`);
        // Step 3: Get workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        // Step 4: Fetch and process
        let importResult = null;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Importing from Figma',
            cancellable: false
        }, async (progress) => {
            const report = (message) => {
                progress.report({ message });
                outputChannel_1.outputChannel.info(message);
            };
            try {
                report('Fetching file data from Figma...');
                // Step 5: Fetch from Figma REST API
                const api = new api_1.FigmaAPIClient({ accessToken: token });
                const figmaData = await api.getFile(fileId);
                outputChannel_1.outputChannel.info(`Fetched Figma file: ${figmaData.name}`);
                report('Extracting frames...');
                // Step 6: Extract frames for selection
                const frames = extractFramesForSelection(figmaData);
                outputChannel_1.outputChannel.info(`Found ${frames.length} frames`);
                if (frames.length === 0) {
                    throw new Error('No frames found in Figma file');
                }
                report('Showing frame selection...');
                // Step 7: Show frame selection UI (max 5 screens)
                const selectedFrames = await showFrameSelection(frames);
                if (!selectedFrames || selectedFrames.length === 0) {
                    outputChannel_1.outputChannel.info('User cancelled frame selection');
                    return;
                }
                outputChannel_1.outputChannel.info(`Selected ${selectedFrames.length} frames`);
                // Debug: Log selected frame names
                const allFrames = extractFramesForSelection(figmaData);
                const selectedFrameNames = allFrames
                    .filter(f => selectedFrames.includes(f.id))
                    .map(f => f.name);
                outputChannel_1.outputChannel.info(`Selected frame names: ${selectedFrameNames.join(', ')}`);
                report('Converting to ShepLang spec...');
                // Step 8: Convert to FigmaShepSpec (only selected frames)
                const spec = (0, converter_1.convertFigmaToSpec)(figmaData, selectedFrames);
                outputChannel_1.outputChannel.info(`Generated spec with ${spec.entities.length} entities and ${spec.screens.length} screens`);
                if (spec.entities.length > 0) {
                    outputChannel_1.outputChannel.info(`Entities: ${spec.entities.map(e => e.name).join(', ')}`);
                }
                if (spec.screens.length > 0) {
                    outputChannel_1.outputChannel.info(`Screens: ${spec.screens.map(s => s.name).join(', ')}`);
                }
                report('Generating .shep files...');
                // Step 9: Generate initial .shep files
                const generatedFiles = await generateShepFiles(spec, workspaceFolder.uri.fsPath);
                outputChannel_1.outputChannel.info(`Generated ${generatedFiles.length} files`);
                // Store result for wizard
                importResult = {
                    generatedFiles,
                    selectedFrames,
                    figmaData,
                    spec,
                    workspaceFolder
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                outputChannel_1.outputChannel.error(`Import error: ${message}`);
                throw error;
            }
        });
        if (!importResult) {
            return;
        }
        // Step 10: Show post-import wizard for semantic refinement
        outputChannel_1.outputChannel.info('Showing post-import wizard...');
        await showPostImportWizard(importResult, workspaceFolder);
        // Step 11: Open first generated file
        if (importResult.generatedFiles && importResult.generatedFiles.length > 0) {
            const doc = await vscode.workspace.openTextDocument(importResult.generatedFiles[0]);
            await vscode.window.showTextDocument(doc);
        }
        outputChannel_1.outputChannel.success('Figma import complete!');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        outputChannel_1.outputChannel.error(`Failed to import from Figma: ${message}`);
        vscode.window.showErrorMessage(`Failed to import from Figma: ${message}`);
    }
}
/**
 * Get Figma access token from configuration or prompt user
 *
 * Official docs: https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration
 */
async function getFigmaAccessToken() {
    const config = vscode.workspace.getConfiguration('sheplang');
    let token = config.get('figmaAccessToken');
    // If token exists, offer option to use it or manage it
    if (token) {
        const action = await vscode.window.showQuickPick([
            { label: '$(check) Use saved token', description: 'Continue with import', value: 'use' },
            { label: '$(edit) Replace token', description: 'Enter a new Figma Personal Access Token', value: 'replace' },
            { label: '$(trash) Clear token', description: 'Remove saved token', value: 'clear' }
        ], {
            placeHolder: 'Figma token found. What would you like to do?',
            ignoreFocusOut: true
        });
        if (!action) {
            return null; // User cancelled
        }
        if (action.value === 'use') {
            return token;
        }
        if (action.value === 'clear') {
            await config.update('figmaAccessToken', undefined, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Figma token cleared. Please enter a new one.');
            return null; // Will prompt for new token below
        }
        if (action.value === 'replace') {
            // Fall through to prompt for new token
            token = undefined;
        }
    }
    // No token or user chose to replace - prompt for new token
    if (!token) {
        token = await vscode.window.showInputBox({
            prompt: 'Enter your Figma Personal Access Token',
            placeHolder: 'figd_...',
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value)
                    return 'Token is required';
                if (!value.startsWith('figd_'))
                    return 'Token should start with "figd_"';
                return null;
            }
        });
        if (token) {
            // Ask if user wants to save it
            const save = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Save token for future use?',
                ignoreFocusOut: true
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
 * Extract frames from Figma document for selection
 */
function extractFramesForSelection(figmaData) {
    const frames = [];
    function walkNodes(node) {
        if (node.type === 'FRAME' || node.type === 'COMPONENT') {
            frames.push({ id: node.id, name: node.name });
        }
        if (node.children) {
            for (const child of node.children) {
                walkNodes(child);
            }
        }
    }
    if (figmaData.document && figmaData.document.children) {
        for (const page of figmaData.document.children) {
            if (page.children) {
                for (const node of page.children) {
                    walkNodes(node);
                }
            }
        }
    }
    return frames;
}
/**
 * Show frame selection UI (max 5 screens for alpha)
 */
async function showFrameSelection(frames) {
    const items = frames.slice(0, ALPHA_MAX_SCREENS).map((frame, index) => ({
        label: frame.name,
        description: `Frame ${index + 1}/${Math.min(frames.length, ALPHA_MAX_SCREENS)}`,
        picked: index < 3, // Default: select first 3
        frameId: frame.id
    }));
    if (frames.length > ALPHA_MAX_SCREENS) {
        vscode.window.showWarningMessage(`Alpha limit: Only showing first ${ALPHA_MAX_SCREENS} frames. Found ${frames.length} total.`);
    }
    const selected = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        placeHolder: `Select frames to import (max ${ALPHA_MAX_SCREENS})`,
        ignoreFocusOut: true
    });
    return selected?.map((item) => item.frameId);
}
/**
 * Show post-import wizard for semantic refinement
 */
async function showPostImportWizard(importResult, workspaceFolder) {
    const { spec, generatedFiles, selectedFrames, figmaData } = importResult;
    // Summarize what was found
    const foundText = spec.screens.length > 0
        ? `- ${spec.screens.length} screens\n- ${spec.entities.length} entities\n- Detected buttons and widgets`
        : `- ${selectedFrames ? selectedFrames.length : 0} frames selected\n- ${spec.entities.length} entities\n- No widgets auto-detected (will add placeholders)`;
    const summary = `
✓ Imported "${spec.appName}" from Figma!

Found:
${foundText}

Now let's refine the semantics...
  `.trim();
    vscode.window.showInformationMessage(summary);
    // Ask app type
    const appType = await vscode.window.showQuickPick(['Food Delivery', 'E-commerce', 'Task Manager', 'Social', 'SaaS', 'Other'], { placeHolder: 'What type of app is this?' });
    if (!appType)
        return;
    // Ask for entity names
    const entityNames = await vscode.window.showInputBox({
        prompt: 'What entities does your app have? (comma-separated)',
        placeHolder: 'e.g., Restaurant, MenuItem, Order',
        value: spec.entities.map((e) => e.name).join(', ')
    });
    if (!entityNames)
        return;
    // Regenerate with user input
    const updatedSpec = {
        ...spec,
        appType,
        userEntities: entityNames.split(',').map((e) => e.trim()),
        selectedFrames: importResult.selectedFrames,
        figmaData: importResult.figmaData
    };
    // Regenerate files with context
    const updatedFiles = await generateShepFiles(updatedSpec, workspaceFolder.uri.fsPath, true);
    outputChannel_1.outputChannel.info(`Regenerated ${updatedFiles.length} files with user context`);
    vscode.window.showInformationMessage('✓ ShepLang files updated with your input! Review and customize as needed.');
    // Show feedback button
    const feedback = await vscode.window.showInformationMessage('Help us improve! Share feedback about this import.', 'Send Feedback');
    if (feedback === 'Send Feedback') {
        vscode.env.openExternal(vscode.Uri.parse(FEEDBACK_FORM_URL));
    }
}
/**
 * Generate .shep files from FigmaShepSpec
 */
async function generateShepFiles(spec, workspacePath, isRegeneration = false) {
    const fileName = `${spec.appName.toLowerCase()}.shep`;
    const filePath = path.join(workspacePath, fileName);
    const shepContent = generateSimpleShepFile(spec, isRegeneration);
    await fs.writeFile(filePath, shepContent, 'utf-8');
    return [filePath];
}
/**
 * Generate .shep file content
 */
function generateSimpleShepFile(spec, isRegeneration = false) {
    let content = `app ${spec.appName}\n\n`;
    // Generate data blocks
    const entitiesToUse = spec.userEntities ?
        spec.userEntities.map((name) => ({ name, fields: [] })) :
        spec.entities;
    for (const entity of entitiesToUse) {
        content += `data ${entity.name}:\n`;
        content += `  fields:\n`;
        if (entity.fields && entity.fields.length > 0) {
            for (const field of entity.fields) {
                content += `    ${field.name}: ${field.type}\n`;
            }
        }
        else {
            content += `    # TODO: Define fields for ${entity.name}\n`;
        }
        content += `\n`;
    }
    // Generate view blocks
    if (spec.screens && spec.screens.length > 0) {
        // Use detected screens with widgets
        for (const screen of spec.screens) {
            content += `view ${screen.name}:\n`;
            for (const widget of screen.widgets) {
                if (widget.kind === 'list' && widget.entityName) {
                    content += `  list ${widget.entityName}\n`;
                }
                else if (widget.kind === 'button' && widget.label) {
                    content += `  button "${widget.label}" -> ${widget.actionName || 'Action'}\n`;
                }
                else if (widget.kind === 'input' && widget.fieldName) {
                    content += `  input ${widget.fieldName}\n`;
                }
            }
            content += `\n`;
        }
    }
    else if (spec.selectedFrames && spec.figmaData) {
        // Generate placeholder views from selected frames (widget detection failed)
        const allFrames = findAllFrames(spec.figmaData.document);
        const selectedFrameNodes = allFrames.filter((f) => spec.selectedFrames.includes(f.id));
        for (const frame of selectedFrameNodes) {
            const viewName = sanitizeViewName(frame.name);
            content += `view ${viewName}:\n`;
            content += `  # TODO: Add widgets for this screen\n`;
            content += `  # Example: button "Click me" -> HandleAction\n`;
            content += `\n`;
        }
    }
    // Generate action blocks
    const actionsSeen = new Set();
    for (const screen of spec.screens) {
        for (const widget of screen.widgets) {
            if (widget.kind === 'button' && widget.actionName) {
                if (actionsSeen.has(widget.actionName)) {
                    continue;
                }
                actionsSeen.add(widget.actionName);
                const entityName = screen.entityName || entitiesToUse[0]?.name;
                const fields = entitiesToUse.find((e) => e.name === entityName)?.fields || [];
                content += `action ${widget.actionName}(${fields.map((f) => f.name).join(', ')}):\n`;
                content += `  # TODO: Implement ${widget.actionName} logic\n`;
                content += `  show ${screen.name}\n`;
                content += `\n`;
            }
        }
    }
    if (isRegeneration) {
        content += `# Regenerated with user context\n`;
    }
    return content;
}
/**
 * Find all frames in Figma document (recursive)
 */
function findAllFrames(node) {
    const frames = [];
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        frames.push(node);
    }
    if (node.children) {
        for (const child of node.children) {
            frames.push(...findAllFrames(child));
        }
    }
    return frames;
}
/**
 * Sanitize frame name to valid view name
 */
function sanitizeViewName(name) {
    return name
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^[0-9]/, 'View$&'); // Prefix with "View" if starts with number
}
/**
 * Show Figma token setup instructions
 */
async function showFigmaSetupInstructions() {
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
//# sourceMappingURL=importFromFigma.js.map