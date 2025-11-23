/**
 * ShepLang Project Wizard Command
 * 
 * Entry point for the project wizard that creates new ShepLang projects
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ShepLangProjectWizard } from '../wizard/projectWizard';
import { ProgressPanel } from '../ui/progressPanel';
import { ScaffoldingAgent } from '../wizard/scaffoldingAgent';
import { outputChannel } from '../services/outputChannel';

export async function startProjectWizard(context: vscode.ExtensionContext): Promise<void> {
  outputChannel.section('ShepLang Project Wizard');
  outputChannel.info('Starting project wizard...');
  
  try {
    // Check if we're in a workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage(
        'Please open a folder in VS Code before creating a new ShepLang project.'
      );
      return;
    }

    // Get the workspace root
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    
    // Show welcome message
    const welcomeResult = await vscode.window.showInformationMessage(
      '🎯 Welcome to the ShepLang Project Wizard!\n\n' +
      'I\'ll guide you through creating a new ShepLang project with:\n' +
      '• Intelligent project structure\n' +
      '• Auto-generated entities, flows, and screens\n' +
      '• Integration setup\n' +
      '• Complete documentation\n\n' +
      'Ready to get started?',
      { modal: true },
      'Start Wizard',
      'Learn More',
      'Cancel'
    );

    if (welcomeResult === 'Cancel' || !welcomeResult) {
      outputChannel.info('Wizard cancelled by user');
      return;
    }

    if (welcomeResult === 'Learn More') {
      // Show information about ShepLang
      const learnMoreResult = await vscode.window.showInformationMessage(
        '📚 ShepLang is the AI-native full-stack programming language.\n\n' +
        '✨ Features:\n' +
        '• Write less code, ship faster\n' +
        '• Built-in authentication & integrations\n' +
        '• Real-time capabilities\n' +
        '• Production-ready from day one\n\n' +
        'The wizard will create a complete project structure with:\n' +
        '• Data models (entities)\n' +
        '• Business logic (flows)\n' +
        '• User interfaces (screens)\n' +
        '• External integrations\n' +
        '• Comprehensive documentation\n\n' +
        'Ready to create your project?',
        { modal: true },
        'Start Wizard',
        'Cancel'
      );

      if (learnMoreResult === 'Cancel' || !learnMoreResult) {
        outputChannel.info('Wizard cancelled after learning more');
        return;
      }
    }

    // Start the wizard
    outputChannel.info('Initializing wizard...');
    const wizard = new ShepLangProjectWizard(context);
    
    // Show progress while wizard loads
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🎯 ShepLang Project Wizard',
        cancellable: false
      },
      async (progress) => {
        progress.report({ increment: 0, message: 'Initializing wizard...' });
        
        // Start the wizard and wait for completion
        const questionnaire = await wizard.start();
        
        if (!questionnaire) {
          outputChannel.info('Wizard cancelled or closed');
          return;
        }

        progress.report({ increment: 10, message: 'Generating project...' });
        
        // Create scaffolding agent and generate project
        const scaffoldingAgent = new ScaffoldingAgent(workspaceRoot);
        
        // Create progress channel for real-time updates
        const progressChannel = vscode.window.createOutputChannel('🎯 Project Generation');
        progressChannel.show();
        
        await scaffoldingAgent.generateProject(questionnaire, (progress) => {
          const message = `[${progress.percentage}%] ${progress.message}`;
          progressChannel.appendLine(message);
          
          if (progress.error) {
            progressChannel.appendLine(`❌ Error: ${progress.error.message}`);
          }
        });

        progress.report({ increment: 100, message: '✅ Project created successfully!' });
        
        // Show completion message
        const completionResult = await vscode.window.showInformationMessage(
          `🎉 "${questionnaire.projectName}" created successfully!\n\n` +
          `Your project is ready at:\n` +
          `${path.join(workspaceRoot, questionnaire.projectName)}\n\n` +
          `Next steps:\n` +
          `• Open the README.md file\n` +
          `• Set up your environment variables\n` +
          `• Run \`npm install\` and \`npm run dev\`\n\n` +
          `What would you like to do?`,
          { modal: true },
          'Open Project',
          'View README',
          'Close'
        );

        if (completionResult === 'Open Project') {
          // Open the project folder
          const projectPath = path.join(workspaceRoot, questionnaire.projectName);
          const projectUri = vscode.Uri.file(projectPath);
          
          // Open in new window
          vscode.commands.executeCommand('vscode.openFolder', projectUri, true);
        } else if (completionResult === 'View README') {
          // Open the README file
          const readmePath = path.join(workspaceRoot, questionnaire.projectName, 'README.md');
          const readmeUri = vscode.Uri.file(readmePath);
          await vscode.commands.executeCommand('vscode.open', readmeUri);
        }

        // Close progress channel
        progressChannel.hide();
        progressChannel.dispose();
        
        outputChannel.success(`Project "${questionnaire.projectName}" generated successfully!`);
      }
    );

  } catch (error) {
    outputChannel.error('Project wizard failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    vscode.window.showErrorMessage(
      `❌ Failed to create project: ${errorMessage}\n\n` +
      `Please check the output channel for details.`,
      'View Output',
      'Close'
    ).then(result => {
      if (result === 'View Output') {
        outputChannel.show();
      }
    });
  }
}

/**
 * Command for quick project creation with defaults
 */
export async function quickCreateProject(context: vscode.ExtensionContext): Promise<void> {
  outputChannel.section('Quick Project Creation');
  
  try {
    // Check workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('Please open a folder first.');
      return;
    }

    // Get project name
    const projectName = await vscode.window.showInputBox({
      prompt: 'Enter project name',
      placeHolder: 'my-sheplang-app',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Project name is required';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return null;
      }
    });

    if (!projectName) {
      return;
    }

    // Get project type
    const projectType = await vscode.window.showQuickPick(
      [
        { label: '📱 Mobile-first app', value: 'mobile-first' },
        { label: '💼 SaaS dashboard', value: 'saas-dashboard' },
        { label: '🛒 E-commerce store', value: 'ecommerce' },
        { label: '📰 Content platform', value: 'content-platform' },
        { label: '🎯 Custom application', value: 'custom' }
      ],
      {
        placeHolder: 'Select project type',
        canPickMany: false
      }
    );

    if (!projectType) {
      return;
    }

    // Create minimal questionnaire
    const questionnaire = {
      projectName: projectName.trim(),
      projectType: projectType.value as any,
      description: `A ${projectType.label} built with ShepLang`,
      features: [
        { name: 'User authentication', description: 'Login and registration' },
        { name: 'Dashboard', description: 'Main dashboard view' }
      ],
      entities: [
        {
          name: 'User',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'createdAt', type: 'date' }
          ]
        }
      ],
      roleType: 'single-user' as any,
      roles: [],
      integrations: [],
      apiStyle: 'REST',
      realtime: false,
      deployment: 'Vercel'
    };

    // Generate project
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const scaffoldingAgent = new ScaffoldingAgent(workspaceRoot);
    
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🚀 Creating ShepLang Project...',
        cancellable: false
      },
      async (progress) => {
        progress.report({ increment: 0, message: 'Creating project structure...' });
        
        await scaffoldingAgent.generateProject(questionnaire, (genProgress) => {
          progress.report({ 
            increment: genProgress.percentage / 100, 
            message: genProgress.message 
          });
        });

        progress.report({ increment: 100, message: '✅ Project created!' });
      }
    );

    // Show success message
    vscode.window.showInformationMessage(
      `🎉 Project "${projectName}" created successfully!\n\n` +
      `Check the "${projectName}" folder to get started.`,
      'Open Folder',
      'View README'
    ).then(result => {
      if (result === 'Open Folder') {
        const projectPath = path.join(workspaceRoot, projectName);
        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
      } else if (result === 'View README') {
        const readmePath = path.join(workspaceRoot, projectName, 'README.md');
        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(readmePath));
      }
    });

    outputChannel.success(`Quick project "${projectName}" created successfully!`);

  } catch (error) {
    outputChannel.error('Quick project creation failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    vscode.window.showErrorMessage(`Failed to create project: ${errorMessage}`);
  }
}
