import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GitService } from '../services/gitService';
import { ProjectAnalyzer } from '../features/importer/analyzer';
import { ScaffoldGenerator } from '../features/importer/scaffoldGenerator';
import { ProgressTracker } from '../services/progressTracker';
import { outputChannel } from '../services/outputChannel';

export async function importFromGitHubCommand() {
    const gitService = new GitService();
    const analyzer = new ProjectAnalyzer();
    const generator = new ScaffoldGenerator();

    // 1. Check Git Installation
    if (!await gitService.isGitInstalled()) {
        vscode.window.showErrorMessage('Git is not installed or not found in PATH. Please install Git to use this feature.');
        return;
    }

    // 2. Prompt for URL
    const repoUrl = await vscode.window.showInputBox({
        prompt: 'Enter Git repository URL (e.g. https://github.com/user/repo)',
        placeHolder: 'https://github.com/vercel/next.js',
        ignoreFocusOut: true
    });

    if (!repoUrl) return;

    // 3. Determine Target Path
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let targetPath: string;

    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Please open a folder or workspace before importing.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'imported-project';
    targetPath = path.join(rootPath, '.sheplang-imports', repoName);

    // 4. Execute Import Flow with enhanced progress tracking
    outputChannel.section(`Importing Git Repository: ${repoName}`);
    
    const progressTracker = new ProgressTracker(`ShepLang: Importing ${repoName}...`)
        .setSteps([
            { name: 'Init', description: 'Preparing workspace...', percentage: 5 },
            { name: 'Clone', description: 'Cloning repository...', percentage: 15 },
            { name: 'Detect', description: 'Detecting project structure...', percentage: 10 },
            { name: 'Analyze', description: 'Analyzing codebase...', percentage: 30 },
            { name: 'Generate', description: 'Generating ShepLang code...', percentage: 30 },
            { name: 'Finalize', description: 'Setting up project...', percentage: 10 }
        ]);

    await progressTracker.start(async (tracker) => {
        try {
            // Step 1: Init
            tracker.nextStep('Preparing workspace...');
            if (fs.existsSync(targetPath)) {
                tracker.detail(`Directory exists: ${targetPath}`);
                const isConfirmed = await vscode.window.showWarningMessage(
                    `Target directory already exists: ${targetPath}. Continue and overwrite?`,
                    { modal: true },
                    'Continue', 'Cancel'
                ) === 'Continue';
                
                if (!isConfirmed) {
                    tracker.detail('Import cancelled by user');
                    return;
                }
                
                // Ensure directory is empty
                tracker.detail('Clearing existing directory...');
                fs.rmSync(targetPath, { recursive: true, force: true });
                fs.mkdirSync(targetPath, { recursive: true });
            } else {
                tracker.detail('Creating target directory...');
                fs.mkdirSync(targetPath, { recursive: true });
            }
            
            // Step 2: Clone repo
            tracker.nextStep('Cloning repository...');
            tracker.detail(`Source: ${repoUrl}`);
            tracker.detail(`Destination: ${targetPath}`);
            await gitService.cloneRepo(repoUrl, targetPath);
            
            // Step 3: Detect project type
            tracker.nextStep('Detecting project structure...');
            const fileCount = fs.readdirSync(targetPath).length;
            tracker.detail(`Found ${fileCount} items in repository root`);

            // Step 4: Deep analysis
            tracker.nextStep('Analyzing codebase...');
            const analysis = await analyzer.analyze(targetPath);
            tracker.detail(`Detected framework: ${analysis.framework}`);
            if (analysis.entities?.length) {
                tracker.detail(`Found ${analysis.entities.length} potential entities`);
            }
            
            // Step 5: Generate scaffold
            tracker.nextStep('Generating ShepLang code...');
            await generator.generate(analysis, targetPath);
            
            // Step 6: Finalize
            tracker.nextStep('Setting up project...');
            tracker.detail('Writing metadata and configuration files');
            
            const action = await vscode.window.showInformationMessage(
                `Successfully imported ${repoName}. Detected framework: ${analysis.framework}`,
                'Open Project Brief',
                'Open Entities'
            );

            if (action === 'Open Project Brief') {
                const briefPath = path.join(targetPath, '.specify', 'wizard', 'project-brief.md');
                const doc = await vscode.workspace.openTextDocument(briefPath);
                await vscode.window.showTextDocument(doc);
            } else if (action === 'Open Entities') {
                // Try to open the first entity file found
                const entitiesDir = path.join(targetPath, 'app', 'entities');
                if (fs.existsSync(entitiesDir)) {
                    const files = fs.readdirSync(entitiesDir);
                    if (files.length > 0) {
                        const doc = await vscode.workspace.openTextDocument(path.join(entitiesDir, files[0]));
                        await vscode.window.showTextDocument(doc);
                    }
                }
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Import failed: ${error.message}`);
            // Clean up if clone was partial? Maybe keep for debugging.
        }
    });
}
