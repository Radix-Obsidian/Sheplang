/**
 * ShepLang Scaffolding Agent
 * 
 * Orchestrates the generation of ShepLang projects from questionnaire data
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectQuestionnaire, ProjectStructure, GenerationProgress } from './types';
import { outputChannel } from '../services/outputChannel';
import { EntityGenerator } from '../generators/entityGenerator';
import { FlowGenerator } from '../generators/flowGenerator';
import { ScreenGenerator } from '../generators/screenGenerator';
import { IntegrationGenerator } from '../generators/integrationGenerator';
import { ReadmeGenerator } from '../generators/readmeGenerator';
import { SyntaxValidator } from '../validation/syntaxValidator';
import { ProgressPanel } from '../ui/progressPanel';

export class ScaffoldingAgent {
  private workspaceRoot: string;
  private progressCallback?: (progress: GenerationProgress) => void;
  private syntaxValidator: SyntaxValidator;
  private progressPanel?: ProgressPanel;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.syntaxValidator = SyntaxValidator.getInstance();
  }

  /**
   * Generate complete ShepLang project from questionnaire
   */
  public async generateProject(
    questionnaire: ProjectQuestionnaire,
    progressCallback?: (progress: GenerationProgress) => void
  ): Promise<void> {
    this.progressCallback = progressCallback;
    
    // Initialize progress panel
    this.progressPanel = new ProgressPanel({
      title: `🎯 Generating ${questionnaire.projectName}`,
      showDetails: true,
      showTiming: true,
      autoClose: false
    });
    
    this.progressPanel.show();
    
    // Initialize progress steps
    this.progressPanel.initializeSteps([
      {
        id: 'structure',
        name: 'Create Project Structure',
        description: 'Setting up folders and basic files'
      },
      {
        id: 'entities',
        name: 'Generate Entities',
        description: 'Creating data models and relationships'
      },
      {
        id: 'flows',
        name: 'Generate Flows',
        description: 'Building business logic and workflows'
      },
      {
        id: 'screens',
        name: 'Generate Screens',
        description: 'Creating user interfaces and views'
      },
      {
        id: 'integrations',
        name: 'Setup Integrations',
        description: 'Configuring external services'
      },
      {
        id: 'documentation',
        name: 'Create Documentation',
        description: 'Generating README and guides'
      },
      {
        id: 'config',
        name: 'Save Configuration',
        description: 'Finalizing project settings'
      }
    ]);
    
    // Handle panel messages
    this.progressPanel.onDidClose(() => {
      outputChannel.info('Progress panel closed');
    });
    
    try {
      outputChannel.section('Generating ShepLang Project');
      outputChannel.info(`Project: ${questionnaire.projectName}`);
      outputChannel.info(`Type: ${questionnaire.projectType}`);

      // Step 1: Create project structure
      this.progressPanel.startStep('structure', ['Creating folders...', 'Setting up basic structure...']);
      await this.updateProgress('Creating project structure...', 10);
      const projectPath = await this.createProjectStructure(questionnaire);
      this.progressPanel.completeStep('structure', ['Project structure created successfully']);

      // Step 2: Generate entities
      this.progressPanel.startStep('entities', ['Parsing entities...', 'Generating .shep files...']);
      await this.updateProgress('Generating entities...', 30);
      await this.generateEntities(questionnaire, projectPath);
      this.progressPanel.completeStep('entities', ['All entities generated']);

      // Step 3: Generate flows
      this.progressPanel.startStep('flows', ['Creating auth flow...', 'Generating feature flows...']);
      await this.updateProgress('Generating flows...', 50);
      await this.generateFlows(questionnaire, projectPath);
      this.progressPanel.completeStep('flows', ['All flows generated']);

      // Step 4: Generate screens
      this.progressPanel.startStep('screens', ['Creating dashboard...', 'Generating entity screens...']);
      await this.updateProgress('Generating screens...', 70);
      await this.generateScreens(questionnaire, projectPath);
      this.progressPanel.completeStep('screens', ['All screens generated']);

      // Step 5: Generate integrations
      this.progressPanel.startStep('integrations', ['Setting up services...', 'Configuring webhooks...']);
      await this.updateProgress('Setting up integrations...', 85);
      await this.generateIntegrations(questionnaire, projectPath);
      this.progressPanel.completeStep('integrations', ['All integrations configured']);

      // Step 6: Generate documentation
      this.progressPanel.startStep('documentation', ['Creating README...', 'Generating guides...']);
      await this.updateProgress('Creating documentation...', 95);
      await this.generateDocumentation(questionnaire, projectPath);
      this.progressPanel.completeStep('documentation', ['Documentation created']);

      // Step 7: Save configuration
      this.progressPanel.startStep('config', ['Saving project settings...']);
      await this.updateProgress('Saving configuration...', 100);
      await this.saveConfiguration(questionnaire, projectPath);
      this.progressPanel.completeStep('config', ['Configuration saved']);

      // Success!
      await this.updateProgress('✅ Project generated successfully!', 100);
      
      // Show success message
      vscode.window.showInformationMessage(
        `🎉 ${questionnaire.projectName} generated successfully! Check the folder to get started.`
      );

      // Open the main README
      const readmePath = path.join(projectPath, 'README.md');
      const readmeUri = vscode.Uri.file(readmePath);
      await vscode.commands.executeCommand('vscode.open', readmeUri);

    } catch (error) {
      outputChannel.error('Project generation failed:', error);
      await this.updateProgress('❌ Generation failed', 0, error as Error);
      
      // Mark current step as failed
      if (this.progressPanel) {
        const currentStep = this.progressPanel['steps']?.find((s: any) => s.status === 'in-progress');
        if (currentStep) {
          this.progressPanel.failStep(currentStep.id, error as Error);
        }
      }
      
      vscode.window.showErrorMessage(
        `Project generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      throw error;
    } finally {
      // Close progress panel after a delay
      setTimeout(() => {
        if (this.progressPanel) {
          this.progressPanel.close();
        }
      }, 3000);
    }
  }

  /**
   * Validate and write a file with syntax checking
   */
  private async validateAndWriteFile(filePath: string, content: string, fileType: string): Promise<boolean> {
    try {
      // Validate syntax for .shep files
      if (filePath.endsWith('.shep')) {
        const validation = await this.syntaxValidator.validate(content, filePath);
        
        if (!validation.isValid) {
          outputChannel.error(`Syntax errors in ${filePath}:`, validation.errors);
          
          // Try auto-fix
          if (validation.fixed) {
            outputChannel.info(`Attempting auto-fix for ${filePath}...`);
            const fixedValidation = await this.syntaxValidator.validate(validation.fixed, filePath);
            
            if (fixedValidation.isValid) {
              await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                Buffer.from(validation.fixed, 'utf8')
              );
              outputChannel.success(`Auto-fixed and saved ${filePath}`);
              return true;
            }
          }
          
          // Show errors to user
          this.syntaxValidator.showValidationErrors(validation.errors, filePath);
          
          // Still write the file with errors so user can fix manually
          await vscode.workspace.fs.writeFile(
            vscode.Uri.file(filePath),
            Buffer.from(content, 'utf8')
          );
          
          return false;
        }
      }
      
      // Write the file
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(content, 'utf8')
      );
      
      return true;
      
    } catch (error) {
      outputChannel.error(`Failed to write ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Create the basic project folder structure
   */
  private async createProjectStructure(questionnaire: ProjectQuestionnaire): Promise<string> {
    const projectPath = path.join(this.workspaceRoot, questionnaire.projectName);
    
    // Create main project folder
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectPath));
    
    // Create subdirectories
    const folders = [
      '.sheplang',
      'entities',
      'flows',
      'screens',
      'integrations',
      'config'
    ];

    for (const folder of folders) {
      const folderPath = path.join(projectPath, folder);
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderPath));
    }

    // Create flow subdirectories based on features
    if (questionnaire.features.length > 0) {
      for (const feature of questionnaire.features) {
        const featureFolder = this.sanitizeFolderName(feature.name);
        const flowPath = path.join(projectPath, 'flows', featureFolder);
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(flowPath));
      }
    }

    // Create screen subdirectories
    const screenFolders = ['dashboard', 'user', 'admin'];
    if (questionnaire.projectType === 'saas-dashboard') {
      screenFolders.push('analytics', 'settings');
    } else if (questionnaire.projectType === 'ecommerce') {
      screenFolders.push('products', 'cart', 'checkout');
    } else if (questionnaire.projectType === 'content-platform') {
      screenFolders.push('articles', 'authors');
    }

    for (const screenFolder of screenFolders) {
      const screenPath = path.join(projectPath, 'screens', screenFolder);
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(screenPath));
    }

    outputChannel.info(`Project structure created at: ${projectPath}`);
    return projectPath;
  }

  /**
   * Generate entity files
   */
  private async generateEntities(questionnaire: ProjectQuestionnaire, projectPath: string): Promise<void> {
    const entityGenerator = new EntityGenerator();
    const entitiesPath = path.join(projectPath, 'entities');

    for (const entity of questionnaire.entities) {
      const entityContent = entityGenerator.generateEntity(entity, questionnaire);
      const entityFile = path.join(entitiesPath, `${entity.name}.shep`);
      
      const success = await this.validateAndWriteFile(entityFile, entityContent, 'entity');
      
      if (success) {
        outputChannel.info(`Generated entity: ${entity.name}.shep`);
      } else {
        outputChannel.warning(`Generated entity with syntax errors: ${entity.name}.shep`);
      }
    }
  }

  /**
   * Generate flow files
   */
  private async generateFlows(questionnaire: ProjectQuestionnaire, projectPath: string): Promise<void> {
    const flowGenerator = new FlowGenerator();
    const flowsPath = path.join(projectPath, 'flows');

    // Generate auth flow
    const authFlow = flowGenerator.generateAuthFlow(questionnaire);
    const authPath = path.join(flowsPath, 'auth', 'authentication.shep');
    
    const authSuccess = await this.validateAndWriteFile(authPath, authFlow, 'flow');
    if (authSuccess) {
      outputChannel.info('Generated auth flow: authentication.shep');
    } else {
      outputChannel.warning('Generated auth flow with syntax errors: authentication.shep');
    }

    // Generate feature flows
    for (const feature of questionnaire.features) {
      const featureFlow = flowGenerator.generateFeatureFlow(feature, questionnaire);
      const featureFolder = this.sanitizeFolderName(feature.name);
      const featurePath = path.join(flowsPath, featureFolder, `${featureFolder}.shep`);
      
      const success = await this.validateAndWriteFile(featurePath, featureFlow, 'flow');
      
      if (success) {
        outputChannel.info(`Generated flow: ${featureFolder}.shep`);
      } else {
        outputChannel.warning(`Generated flow with syntax errors: ${featureFolder}.shep`);
      }
    }

    // Generate webhook flows if integrations exist
    if (questionnaire.integrations.length > 0) {
      const webhookFlow = flowGenerator.generateWebhookFlow(questionnaire);
      const webhookPath = path.join(flowsPath, 'webhooks', 'integrations.shep');
      
      const webhookSuccess = await this.validateAndWriteFile(webhookPath, webhookFlow, 'flow');
      if (webhookSuccess) {
        outputChannel.info('Generated webhook flow: integrations.shep');
      } else {
        outputChannel.warning('Generated webhook flow with syntax errors: integrations.shep');
      }
    }
  }

  /**
   * Generate screen files
   */
  private async generateScreens(questionnaire: ProjectQuestionnaire, projectPath: string): Promise<void> {
    const screenGenerator = new ScreenGenerator();
    const screensPath = path.join(projectPath, 'screens');

    // Generate dashboard screen
    const dashboardScreen = screenGenerator.generateDashboard(questionnaire);
    const dashboardPath = path.join(screensPath, 'dashboard', 'main.shep');
    
    const dashboardSuccess = await this.validateAndWriteFile(dashboardPath, dashboardScreen, 'screen');
    if (dashboardSuccess) {
      outputChannel.info('Generated screen: dashboard/main.shep');
    } else {
      outputChannel.warning('Generated screen with syntax errors: dashboard/main.shep');
    }

    // Generate entity list screens
    for (const entity of questionnaire.entities) {
      const listScreen = screenGenerator.generateEntityList(entity, questionnaire);
      const entityFolder = entity.name.toLowerCase();
      const listPath = path.join(screensPath, entityFolder, 'list.shep');
      
      const listSuccess = await this.validateAndWriteFile(listPath, listScreen, 'screen');
      
      if (listSuccess) {
        outputChannel.info(`Generated screen: ${entityFolder}/list.shep`);
      } else {
        outputChannel.warning(`Generated screen with syntax errors: ${entityFolder}/list.shep`);
      }

      // Generate detail screen
      const detailScreen = screenGenerator.generateEntityDetail(entity, questionnaire);
      const detailPath = path.join(screensPath, entityFolder, 'detail.shep');
      
      const detailSuccess = await this.validateAndWriteFile(detailPath, detailScreen, 'screen');
      
      if (detailSuccess) {
        outputChannel.info(`Generated screen: ${entityFolder}/detail.shep`);
      } else {
        outputChannel.warning(`Generated screen with syntax errors: ${entityFolder}/detail.shep`);
      }
    }
  }

  /**
   * Generate integration files
   */
  private async generateIntegrations(questionnaire: ProjectQuestionnaire, projectPath: string): Promise<void> {
    const integrationGenerator = new IntegrationGenerator();
    const integrationsPath = path.join(projectPath, 'integrations');

    for (const integration of questionnaire.integrations) {
      const integrationContent = integrationGenerator.generateIntegration(integration, questionnaire);
      const integrationFile = path.join(integrationsPath, `${integration.service.toLowerCase()}.shep`);
      
      const success = await this.validateAndWriteFile(integrationFile, integrationContent, 'integration');
      
      if (success) {
        outputChannel.info(`Generated integration: ${integration.service.toLowerCase()}.shep`);
      } else {
        outputChannel.warning(`Generated integration with syntax errors: ${integration.service.toLowerCase()}.shep`);
      }
    }
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(questionnaire: ProjectQuestionnaire, projectPath: string): Promise<void> {
    const readmeGenerator = new ReadmeGenerator();

    // Generate main README
    const mainReadme = readmeGenerator.generateMainReadme(questionnaire);
    const readmePath = path.join(projectPath, 'README.md');
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(readmePath),
      Buffer.from(mainReadme, 'utf8')
    );

    // Generate folder READMEs
    const folderReadmes = [
      { folder: 'entities', title: 'Entities', content: readmeGenerator.generateEntitiesReadme(questionnaire) },
      { folder: 'flows', title: 'Flows', content: readmeGenerator.generateFlowsReadme(questionnaire) },
      { folder: 'screens', title: 'Screens', content: readmeGenerator.generateScreensReadme(questionnaire) },
      { folder: 'integrations', title: 'Integrations', content: readmeGenerator.generateIntegrationsReadme(questionnaire) }
    ];

    for (const { folder, content } of folderReadmes) {
      const folderReadmePath = path.join(projectPath, folder, 'README.md');
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(folderReadmePath),
        Buffer.from(content, 'utf8')
      );
    }

    // Generate NEXT_STEPS.md
    const nextSteps = readmeGenerator.generateNextSteps(questionnaire);
    const nextStepsPath = path.join(projectPath, 'NEXT_STEPS.md');
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(nextStepsPath),
      Buffer.from(nextSteps, 'utf8')
    );
  }

  /**
   * Save project configuration
   */
  private async saveConfiguration(questionnaire: ProjectQuestionnaire, projectPath: string): Promise<void> {
    const sheplangPath = path.join(projectPath, '.sheplang');

    // Save JSON config
    const configJson = JSON.stringify(questionnaire, null, 2);
    const jsonPath = path.join(sheplangPath, 'project-config.json');
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(jsonPath),
      Buffer.from(configJson, 'utf8')
    );

    // Save Markdown config
    const configMd = this.generateMarkdownConfig(questionnaire);
    const mdPath = path.join(sheplangPath, 'project-config.md');
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(mdPath),
      Buffer.from(configMd, 'utf8')
    );
  }

  /**
   * Generate markdown configuration
   */
  private generateMarkdownConfig(questionnaire: ProjectQuestionnaire): string {
    return `# ${questionnaire.projectName}

Generated by ShepLang Wizard on ${new Date().toLocaleDateString()}

## Project Overview

**Type:** ${questionnaire.projectType}  
**Name:** ${questionnaire.projectName}  
**Description:** ${questionnaire.description}

## Features

${questionnaire.features.map((f, i) => `${i + 1}. ${f.name}`).join('\n')}

## Data Model

${questionnaire.entities.map(e => `
### ${e.name}
${e.fields.map(f => `- **${f.name}**: ${f.type}${f.required ? ' (required)' : ''}`).join('\n')}
`).join('\n')}

## User Roles

**Type:** ${questionnaire.roleType}
${questionnaire.roles?.map(r => `- ${r.name}`).join('\n') || ''}

## Integrations

${questionnaire.integrations.map(i => `- ${i.service} (${i.category})`).join('\n') || 'None'}

## Technical Configuration

- **API Style:** ${questionnaire.apiStyle}
- **Real-time:** ${questionnaire.realtime ? 'Yes' : 'No'}
- **Deployment:** ${questionnaire.deployment}

---

*This project was generated with ❤️ by ShepLang*
`;
  }

  /**
   * Update progress and notify callback
   */
  private async updateProgress(message: string, percentage: number, error?: Error): Promise<void> {
    const progress: GenerationProgress = {
      message,
      percentage,
      currentStep: Math.ceil(percentage / 10),
      totalSteps: 10,
      error
    };

    if (this.progressCallback) {
      this.progressCallback(progress);
    }

    outputChannel.info(`[${percentage}%] ${message}`);
  }

  /**
   * Sanitize folder name from feature name
   */
  private sanitizeFolderName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
