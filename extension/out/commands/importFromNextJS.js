"use strict";
/**
 * Import from Next.js Command
 *
 * VS Code command to import Next.js/React projects into ShepLang.
 *
 * Flow:
 * 1. Select Next.js project folder
 * 2. Detect stack (Next.js + Prisma)
 * 3. Analyze project structure
 * 4. Show semantic wizard for refinement
 * 5. Generate .shep files
 * 6. Open generated files
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
exports.importFromNextJS = importFromNextJS;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const astAnalyzer_1 = require("../parsers/astAnalyzer");
const shepGenerator_1 = require("../generators/shepGenerator");
const semanticWizard_1 = require("../wizard/semanticWizard");
const outputChannel_1 = require("../services/outputChannel");
/**
 * Main import command
 */
async function importFromNextJS() {
    outputChannel_1.outputChannel.section('Next.js Import');
    try {
        // Step 1: Select project folder
        const projectRoot = await selectProjectFolder();
        if (!projectRoot) {
            outputChannel_1.outputChannel.info('Import cancelled by user');
            return;
        }
        outputChannel_1.outputChannel.info(`Selected project: ${projectRoot}`);
        // Step 2: Detect stack
        const stackInfo = await detectStack(projectRoot);
        if (!stackInfo.isNextJS) {
            vscode.window.showErrorMessage('This does not appear to be a Next.js project. Please select a folder containing package.json with Next.js dependencies.');
            return;
        }
        outputChannel_1.outputChannel.success('✓ Next.js project detected');
        if (stackInfo.hasPrisma) {
            outputChannel_1.outputChannel.success('✓ Prisma ORM detected');
        }
        else {
            outputChannel_1.outputChannel.info('⚠ No Prisma schema found - entities will be inferred from code');
        }
        // Step 3: Analyze project
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing Next.js project...',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Parsing React components...' });
            const appModel = await (0, astAnalyzer_1.analyzeProject)(projectRoot);
            progress.report({ message: 'Extracting entities, views, and actions...' });
            outputChannel_1.outputChannel.info(`Found: ${appModel.entities.length} entities, ${appModel.views.length} views, ${appModel.actions.length} actions`);
            // Step 4: Show wizard for refinement
            progress.report({ message: 'Launching semantic wizard...' });
            const wizardInput = await (0, semanticWizard_1.showSemanticWizard)({
                appName: appModel.appName,
                detectedEntities: appModel.entities.map(e => e.name),
                detectedScreens: appModel.views.length
            });
            if (!wizardInput) {
                outputChannel_1.outputChannel.info('Import cancelled during wizard');
                return;
            }
            // Apply wizard refinements
            if (wizardInput.appType) {
                appModel.appName = wizardInput.appType.replace(/\s+/g, '');
            }
            if (wizardInput.entities && wizardInput.entities.length > 0) {
                // User provided entity names - merge with detected
                for (const entityName of wizardInput.entities) {
                    const exists = appModel.entities.some(e => e.name === entityName);
                    if (!exists) {
                        appModel.entities.push({
                            name: entityName,
                            source: 'inferred',
                            fields: [
                                { name: 'id', type: 'text', required: true },
                                { name: 'name', type: 'text', required: true }
                            ]
                        });
                    }
                }
            }
            if (wizardInput.customInstructions) {
                appModel.todos.unshift(`Custom instruction: ${wizardInput.customInstructions}`);
            }
            // Step 5: Generate ShepLang files
            progress.report({ message: 'Generating ShepLang files...' });
            const files = (0, shepGenerator_1.generateShepLangFiles)(appModel);
            const report = (0, shepGenerator_1.generateImportReport)(appModel, files);
            // Step 6: Write files to disk
            const outputFolder = await selectOutputFolder();
            if (!outputFolder) {
                outputChannel_1.outputChannel.info('Import cancelled - no output folder selected');
                return;
            }
            progress.report({ message: 'Writing files...' });
            for (const file of files) {
                const filePath = path.join(outputFolder, file.fileName);
                fs.writeFileSync(filePath, file.content, 'utf-8');
                outputChannel_1.outputChannel.success(`✓ Created: ${file.fileName}`);
            }
            // Write report
            const reportPath = path.join(outputFolder, 'IMPORT_REPORT.md');
            fs.writeFileSync(reportPath, report, 'utf-8');
            outputChannel_1.outputChannel.success(`✓ Created: IMPORT_REPORT.md`);
            // Step 7: Open generated files
            const mainFilePath = path.join(outputFolder, files[0].fileName);
            const doc = await vscode.workspace.openTextDocument(mainFilePath);
            await vscode.window.showTextDocument(doc);
            // Success message
            vscode.window.showInformationMessage(`✓ Successfully imported ${appModel.appName}! Review the generated .shep file and fill in TODOs.`, 'Open Report').then(selection => {
                if (selection === 'Open Report') {
                    vscode.workspace.openTextDocument(reportPath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
            outputChannel_1.outputChannel.success(`✓ Import complete!`);
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        outputChannel_1.outputChannel.error('Import failed:', errorMessage);
        vscode.window.showErrorMessage(`Import failed: ${errorMessage}`);
    }
}
/**
 * Select Next.js project folder
 */
async function selectProjectFolder() {
    // Check if current workspace is a Next.js project
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const currentFolder = workspaceFolders[0].uri.fsPath;
        const packageJsonPath = path.join(currentFolder, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const useCurrentFolder = await vscode.window.showQuickPick(['Yes', 'No, choose different folder'], {
                placeHolder: `Use current workspace (${path.basename(currentFolder)})?`
            });
            if (useCurrentFolder === 'Yes') {
                return currentFolder;
            }
        }
    }
    // Let user select folder
    const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select Next.js Project Folder',
        openLabel: 'Select'
    });
    return result?.[0].fsPath;
}
/**
 * Select output folder for generated .shep files
 */
async function selectOutputFolder() {
    // Suggest creating a new folder in workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const useWorkspace = await vscode.window.showQuickPick(['Create in workspace', 'Choose different location'], {
            placeHolder: 'Where should we save the generated .shep files?'
        });
        if (useWorkspace === 'Create in workspace') {
            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const shepFolder = path.join(workspaceRoot, 'sheplang-import');
            // Create folder if it doesn't exist
            if (!fs.existsSync(shepFolder)) {
                fs.mkdirSync(shepFolder, { recursive: true });
            }
            return shepFolder;
        }
    }
    // Let user select folder
    const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select Output Folder',
        openLabel: 'Select'
    });
    return result?.[0].fsPath;
}
/**
 * Detect project stack (Next.js, Prisma, etc.)
 */
async function detectStack(projectRoot) {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return {
            isNextJS: false,
            hasPrisma: false,
            hasTypeScript: false
        };
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    return {
        isNextJS: 'next' in allDeps && 'react' in allDeps,
        hasPrisma: 'prisma' in allDeps || '@prisma/client' in allDeps,
        hasTypeScript: 'typescript' in allDeps
    };
}
//# sourceMappingURL=importFromNextJS.js.map