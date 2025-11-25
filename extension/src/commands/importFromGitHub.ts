/**
 * ALPHA: Import from GitHub
 * 
 * Clone a GitHub repository and convert it to ShepLang.
 * Uses the same conversion pipeline as local import for consistency.
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GitService } from '../services/gitService';
import { outputChannel } from '../services/outputChannel';
import { extractEntities } from '../parsers/entityExtractor';
import { parseReactFile, ReactComponent } from '../parsers/reactParser';
import { mapProjectToShepLang } from '../parsers/viewMapper';
import { generateFromPlan } from '../generators/intelligentScaffold';
// AppModel interface for import
interface AppModel {
    appName: string;
    projectRoot: string;
    entities: any[];
    views: any[];
    actions: any[];
    todos: any[];
}

/**
 * Parse all React/TSX files in a project
 */
function parseReactProject(projectRoot: string): ReactComponent[] {
    const components: ReactComponent[] = [];
    
    const scanDirs = [
        path.join(projectRoot, 'src'),
        path.join(projectRoot, 'app'),
        path.join(projectRoot, 'pages'),
        path.join(projectRoot, 'components'),
        path.join(projectRoot, 'src', 'components'),
        path.join(projectRoot, 'src', 'app'),
        path.join(projectRoot, 'src', 'pages')
    ];
    
    for (const dir of scanDirs) {
        if (fs.existsSync(dir)) {
            const files = findReactFiles(dir);
            for (const file of files) {
                try {
                    const component = parseReactFile(file);
                    if (component) {
                        components.push(component);
                    }
                } catch (error) {
                    outputChannel.warn(`Failed to parse ${file}: ${error}`);
                }
            }
        }
    }
    
    return components;
}

/**
 * Recursively find all React/TSX files in a directory
 */
function findReactFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                continue;
            }
            
            if (entry.isDirectory()) {
                files.push(...findReactFiles(fullPath));
            } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Ignore permission errors
    }
    
    return files;
}

export async function importFromGitHubCommand() {
    const gitService = new GitService();

    // 1. Check Git Installation
    if (!await gitService.isGitInstalled()) {
        vscode.window.showErrorMessage('Git is not installed or not found in PATH. Please install Git to use this feature.');
        return;
    }

    // 2. Prompt for GitHub URL
    const repoUrl = await vscode.window.showInputBox({
        prompt: 'Enter GitHub repository URL',
        placeHolder: 'https://github.com/user/repo',
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (!value) return 'Please enter a URL';
            if (!value.includes('github.com')) return 'Please enter a valid GitHub URL';
            return null;
        }
    });

    if (!repoUrl) return;

    // 3. Ask where to save
    const saveLocation = await vscode.window.showSaveDialog({
        title: 'Choose location for your ShepLang project',
        defaultUri: vscode.Uri.file(path.join(
            process.env.USERPROFILE || process.env.HOME || '',
            'Desktop',
            repoUrl.split('/').pop()?.replace('.git', '') || 'sheplang-project'
        )),
        filters: { 'All Files': ['*'] }
    });

    if (!saveLocation) return;

    const outputFolder = saveLocation.fsPath;
    const projectName = path.basename(outputFolder).replace(/-/g, '');

    // 4. Clone and Convert
    outputChannel.section(`🐑 Importing from GitHub: ${projectName}`);

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: '🐑 ShepLang Import',
            cancellable: false
        },
        async (progress) => {
            try {
                // Step 1: Create temp directory for clone
                progress.report({ message: '🐙 Cloning repository...', increment: 10 });
                
                const tempCloneDir = path.join(outputFolder, '.sheplang-source');
                if (fs.existsSync(tempCloneDir)) {
                    fs.rmSync(tempCloneDir, { recursive: true, force: true });
                }
                fs.mkdirSync(tempCloneDir, { recursive: true });

                outputChannel.info(`Cloning ${repoUrl} to ${tempCloneDir}`);
                await gitService.cloneRepo(repoUrl, tempCloneDir);
                outputChannel.success('Repository cloned successfully');

                progress.report({ message: '🔍 Analyzing project...', increment: 20 });

                // Step 2: Extract entities (Prisma, TypeScript types, etc.)
                const entityResult = await extractEntities(tempCloneDir);
                outputChannel.info(`Found ${entityResult.entities.length} entities from ${entityResult.source}`);

                progress.report({ message: '🐑 Parsing React components...', increment: 20 });

                // Parse React components
                const components = parseReactProject(tempCloneDir);
                outputChannel.info(`Found ${components.length} React components`);

                progress.report({ message: '🔄 Converting to ShepLang...', increment: 20 });

                // Map to ShepLang views and actions
                const projectMapping = mapProjectToShepLang(components, entityResult.entities);
                outputChannel.info(`Mapped ${projectMapping.views.length} views, ${projectMapping.actions.length} actions`);

                // Build proper AppModel
                const appModel: AppModel = {
                    appName: projectName,
                    projectRoot: tempCloneDir,
                    entities: entityResult.entities,
                    views: projectMapping.views,
                    actions: projectMapping.actions,
                    todos: []
                };

                // Create simple architecture plan
                const plan = {
                    projectType: 'imported-github',
                    structure: 'layer-based',
                    folders: [],
                    conventions: {
                        naming: 'PascalCase for components',
                        fileOrganization: 'By type',
                        importStrategy: 'Relative'
                    },
                    reasoning: `Imported from GitHub: ${repoUrl}`
                };

                progress.report({ message: '📝 Generating ShepLang files...', increment: 20 });

                // Generate ShepLang project
                const project = await generateFromPlan(appModel, plan as any, outputFolder);
                outputChannel.success(`Generated ${project.files.length} ShepLang files`);

                progress.report({ message: '✨ Opening your new project!', increment: 10 });

                // Open the project
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(outputFolder), {
                    forceReuseWindow: true
                });

                vscode.window.showInformationMessage(
                    `🐑 Successfully imported ${projectName}! ${entityResult.entities.length} entities, ${projectMapping.views.length} views converted.`
                );

            } catch (error: any) {
                outputChannel.error(`Import failed: ${error.message}`);
                vscode.window.showErrorMessage(`🐑 Import failed: ${error.message}`);
            }
        }
    );
}
