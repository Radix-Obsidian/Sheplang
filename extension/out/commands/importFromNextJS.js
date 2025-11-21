"use strict";
/**
 * Import from Next.js/React Command
 *
 * VS Code command to import Next.js/React/Vite projects into ShepLang.
 *
 * Supports:
 * - Next.js + Prisma (Lovable, v0.dev, Builder.io)
 * - Vite + React (Figma Make, custom React apps)
 * - React + TypeScript (general React projects)
 *
 * Flow:
 * 1. Select project folder
 * 2. Detect stack (Next.js, Vite, or React)
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
const shepthonGenerator_1 = require("../generators/shepthonGenerator");
const scaffoldGenerator_1 = require("../generators/scaffoldGenerator");
const semanticWizard_1 = require("../wizard/semanticWizard");
const architectureWizard_1 = require("../wizard/architectureWizard");
const intelligentScaffold_1 = require("../generators/intelligentScaffold");
const outputChannel_1 = require("../services/outputChannel");
/**
 * Main import command
 */
async function importFromNextJS(context) {
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
        if (!stackInfo.isValid) {
            vscode.window.showErrorMessage('This does not appear to be a supported project. Please select a folder containing package.json with Next.js, Vite, or React dependencies.');
            return;
        }
        // Show framework-specific success message
        if (stackInfo.framework === 'nextjs') {
            outputChannel_1.outputChannel.success('✓ Next.js project detected');
        }
        else if (stackInfo.framework === 'vite') {
            outputChannel_1.outputChannel.success('✓ Vite + React project detected');
        }
        else if (stackInfo.framework === 'react') {
            outputChannel_1.outputChannel.success('✓ React project detected');
        }
        if (stackInfo.hasPrisma) {
            outputChannel_1.outputChannel.success('✓ Prisma ORM detected');
        }
        else if (stackInfo.framework === 'nextjs') {
            outputChannel_1.outputChannel.info('⚠ No Prisma schema found - entities will be inferred from code');
        }
        // Step 3: Analyze project
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Analyzing ${stackInfo.framework} project...`,
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Parsing React components...' });
            const appModel = await (0, astAnalyzer_1.analyzeProject)(projectRoot);
            progress.report({ message: 'Extracting entities, views, and actions...' });
            outputChannel_1.outputChannel.info(`Found: ${appModel.entities.length} entities, ${appModel.views.length} views, ${appModel.actions.length} actions`);
            // Step 4: Show wizard for refinement
            progress.report({ message: 'Launching semantic wizard...' });
            const wizardInput = await (0, semanticWizard_1.showSemanticWizard)(context, {
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
                            source: 'user-input',
                            fields: [
                                { name: 'id', type: 'text', required: true },
                                { name: 'name', type: 'text', required: true }
                            ]
                        });
                    }
                }
            }
            if (wizardInput.customInstructions && wizardInput.customInstructions.trim().length > 0) {
                const instr = wizardInput.customInstructions.trim().toLowerCase();
                // Don't add if user said "no", "none", etc.
                const skipWords = ['no', 'none', 'n/a', 'skip', 'nothing'];
                const shouldSkip = skipWords.some(word => instr === word);
                if (!shouldSkip) {
                    appModel.todos.unshift(`Custom instruction: ${wizardInput.customInstructions}`);
                }
            }
            // Step 5: Choose architecture approach
            const approach = await vscode.window.showQuickPick([
                {
                    label: '$(sparkle) AI Architect (Recommended)',
                    value: 'intelligent',
                    description: 'AI designs custom architecture based on your project'
                },
                {
                    label: '$(folder) Organized folders',
                    value: 'scaffold',
                    description: 'Generic organized structure (models/, views/, api/)'
                },
                {
                    label: '$(file) Single file',
                    value: 'single',
                    description: 'Simple single .shep file'
                }
            ], {
                placeHolder: 'How should we build your project structure?',
                ignoreFocusOut: true
            });
            if (!approach) {
                outputChannel_1.outputChannel.info('Import cancelled by user');
                return;
            }
            const outputFolder = await selectOutputFolder();
            if (!outputFolder) {
                outputChannel_1.outputChannel.info('Import cancelled - no output folder selected');
                return;
            }
            let mainFilePath;
            let report;
            if (approach.value === 'intelligent') {
                // NEW: AI-designed architecture
                progress.report({ message: 'Launching Architecture Wizard...' });
                const architecturePlan = await (0, architectureWizard_1.showArchitectureWizard)(context, appModel);
                if (!architecturePlan) {
                    outputChannel_1.outputChannel.info('Import cancelled during architecture planning');
                    return;
                }
                progress.report({ message: 'Generating custom project structure...' });
                const project = await (0, intelligentScaffold_1.generateFromPlan)(appModel, architecturePlan, outputFolder);
                outputChannel_1.outputChannel.success(`✓ Created ${project.files.length} files`);
                outputChannel_1.outputChannel.success(`Architecture: ${architecturePlan.structure}`);
                mainFilePath = path.join(outputFolder, 'README.md');
                report = project.report;
            }
            else if (approach.value === 'scaffold') {
                // Generic scaffold
                progress.report({ message: 'AI is analyzing project structure...' });
                const scaffold = await (0, scaffoldGenerator_1.generateScaffold)(context, appModel, projectRoot);
                progress.report({ message: 'Creating organized folders...' });
                await (0, scaffoldGenerator_1.writeScaffold)(scaffold, outputFolder);
                outputChannel_1.outputChannel.success(`✓ Created ${scaffold.folders.length} folders`);
                for (const folder of scaffold.folders) {
                    outputChannel_1.outputChannel.success(`  - ${folder.name}/ (${folder.files.length} files)`);
                }
                const firstViewFolder = scaffold.folders.find(f => f.name.toLowerCase().includes('view'));
                if (firstViewFolder && firstViewFolder.files.length > 0) {
                    mainFilePath = path.join(outputFolder, firstViewFolder.name, firstViewFolder.files[0].name);
                }
                else {
                    const appFile = scaffold.rootFiles.find(f => f.name === 'app.shep');
                    mainFilePath = appFile
                        ? path.join(outputFolder, appFile.name)
                        : path.join(outputFolder, 'README.md');
                }
                report = generateScaffoldReport(appModel, scaffold);
            }
            else {
                // Single file
                progress.report({ message: 'Generating ShepLang files...' });
                const files = (0, shepGenerator_1.generateShepLangFiles)(appModel);
                report = (0, shepGenerator_1.generateImportReport)(appModel, files);
                progress.report({ message: 'Writing files...' });
                for (const file of files) {
                    const filePath = path.join(outputFolder, file.fileName);
                    fs.writeFileSync(filePath, file.content, 'utf-8');
                    outputChannel_1.outputChannel.success(`✓ Created: ${file.fileName}`);
                }
                mainFilePath = path.join(outputFolder, files[0].fileName);
            }
            // Write report
            const reportPath = path.join(outputFolder, 'IMPORT_REPORT.md');
            fs.writeFileSync(reportPath, report, 'utf-8');
            outputChannel_1.outputChannel.success(`✓ Created: IMPORT_REPORT.md`);
            // Step 6.5: Ask about backend generation
            const generateBackend = await vscode.window.showQuickPick(['Yes, generate backend', 'No, just frontend'], {
                placeHolder: 'Generate .shepthon backend file with AI? (Recommended for Builder.io, Figma imports)',
                ignoreFocusOut: true
            });
            let backendFile;
            if (generateBackend === 'Yes, generate backend') {
                progress.report({ message: 'AI is generating backend...' });
                // Get first .shep file content for backend generation
                const firstShepContent = approach.value === 'single'
                    ? fs.readFileSync(mainFilePath, 'utf-8')
                    : '// App content will be used by AI';
                const shepthonResult = await (0, shepthonGenerator_1.generateShepThonBackend)(context, appModel, firstShepContent);
                if (shepthonResult) {
                    const shepthonPath = path.join(outputFolder, shepthonResult.fileName);
                    fs.writeFileSync(shepthonPath, shepthonResult.content, 'utf-8');
                    outputChannel_1.outputChannel.success(`✓ Created: ${shepthonResult.fileName}`);
                    backendFile = shepthonPath;
                }
                else {
                    outputChannel_1.outputChannel.info('⚠ Backend generation failed - you can create it manually later');
                }
            }
            // Step 7: Open generated files
            if (fs.existsSync(mainFilePath)) {
                const doc = await vscode.workspace.openTextDocument(mainFilePath);
                await vscode.window.showTextDocument(doc);
            }
            // Success message
            const buttons = ['Open Report'];
            if (backendFile) {
                buttons.push('Open Backend');
            }
            vscode.window.showInformationMessage(`✓ Successfully imported ${appModel.appName}! ${backendFile ? 'Backend ready to test.' : 'Review .shep file and fill in TODOs.'}`, ...buttons).then(selection => {
                if (selection === 'Open Report') {
                    vscode.workspace.openTextDocument(reportPath).then(doc => {
                        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                    });
                }
                else if (selection === 'Open Backend' && backendFile) {
                    vscode.workspace.openTextDocument(backendFile).then(doc => {
                        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
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
        title: 'Select React/Next.js/Vite Project Folder',
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
            framework: 'unknown',
            hasPrisma: false,
            hasTypeScript: false,
            isValid: false
        };
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    // Detect framework
    let framework = 'unknown';
    if ('next' in allDeps) {
        framework = 'nextjs';
    }
    else if ('vite' in allDeps) {
        framework = 'vite';
    }
    else if ('react' in allDeps) {
        framework = 'react';
    }
    return {
        framework,
        hasPrisma: 'prisma' in allDeps || '@prisma/client' in allDeps,
        hasTypeScript: 'typescript' in allDeps,
        isValid: framework !== 'unknown'
    };
}
/**
 * Generate import report for scaffold structure
 */
function generateScaffoldReport(appModel, scaffold) {
    let report = '';
    report += `# Import Report: ${appModel.appName}\n\n`;
    report += `**Project:** ${appModel.projectRoot}\n\n`;
    // Summary
    report += `## Summary\n\n`;
    report += `- **Structure:** ${scaffold.type}\n`;
    report += `- **Folders:** ${scaffold.folders.length}\n`;
    report += `- **Entities:** ${appModel.entities.length}\n`;
    report += `- **Views:** ${appModel.views.length}\n`;
    report += `- **Actions:** ${appModel.actions.length}\n\n`;
    // Folder structure
    report += `## Generated Structure\n\n`;
    for (const folder of scaffold.folders) {
        report += `### ${folder.name}/\n`;
        report += `${folder.description}\n\n`;
        for (const file of folder.files) {
            report += `- ${file.name}\n`;
        }
        report += `\n`;
    }
    // Entities
    if (appModel.entities.length > 0) {
        report += `## Entities\n\n`;
        for (const entity of appModel.entities) {
            const source = entity.source === 'prisma' ? '(from Prisma)' : '(inferred)';
            report += `- **${entity.name}** ${source} - ${entity.fields.length} fields\n`;
        }
        report += `\n`;
    }
    // TODOs
    if (appModel.todos.length > 0) {
        report += `## TODOs\n\n`;
        for (const todo of appModel.todos) {
            report += `- ${todo}\n`;
        }
        report += `\n`;
    }
    // Next steps
    report += `## Next Steps\n\n`;
    report += `1. Review the generated folder structure\n`;
    report += `2. Explore each folder and customize the files\n`;
    report += `3. Fill in TODO comments with your business logic\n`;
    report += `4. Run \`sheplang dev\` to start development\n`;
    return report;
}
//# sourceMappingURL=importFromNextJS.js.map