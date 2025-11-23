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

export class ScaffoldingAgent {
  private workspaceRoot: string;
  private progressCallback?: (progress: GenerationProgress) => void;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Generate complete ShepLang project from questionnaire
   */
  public async generateProject(
    questionnaire: ProjectQuestionnaire,
    progressCallback?: (progress: GenerationProgress) => void
  ): Promise<void> {
    this.progressCallback = progressCallback;
    
    try {
      outputChannel.section('Generating ShepLang Project');
      outputChannel.info(`Project: ${questionnaire.projectName}`);
      outputChannel.info(`Type: ${questionnaire.projectType}`);

      // Step 1: Create project structure
      await this.updateProgress('Creating project structure...', 10);
      const projectPath = await this.createProjectStructure(questionnaire);

      // Step 2: Generate entities
      await this.updateProgress('Generating entities...', 30);
      await this.generateEntities(questionnaire, projectPath);

      // Step 3: Generate flows
      await this.updateProgress('Generating flows...', 50);
      await this.generateFlows(questionnaire, projectPath);

      // Step 4: Generate screens
      await this.updateProgress('Generating screens...', 70);
      await this.generateScreens(questionnaire, projectPath);

      // Step 5: Generate integrations
      await this.updateProgress('Setting up integrations...', 85);
      await this.generateIntegrations(questionnaire, projectPath);

      // Step 6: Generate documentation
      await this.updateProgress('Creating documentation...', 95);
      await this.generateDocumentation(questionnaire, projectPath);

      // Step 7: Save configuration
      await this.updateProgress('Saving configuration...', 100);
      await this.saveConfiguration(questionnaire, projectPath);

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
      
      vscode.window.showErrorMessage(
        `Project generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      throw error;
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
      
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(entityFile),
        Buffer.from(entityContent, 'utf8')
      );
      
      outputChannel.info(`Generated entity: ${entity.name}.shep`);
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
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(authPath),
      Buffer.from(authFlow, 'utf8')
    );

    // Generate feature flows
    for (const feature of questionnaire.features) {
      const featureFlow = flowGenerator.generateFeatureFlow(feature, questionnaire);
      const featureFolder = this.sanitizeFolderName(feature.name);
      const featurePath = path.join(flowsPath, featureFolder, `${featureFolder}.shep`);
      
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(featurePath),
        Buffer.from(featureFlow, 'utf8')
      );
    }

    // Generate webhook flows if integrations exist
    if (questionnaire.integrations.length > 0) {
      const webhookFlow = flowGenerator.generateWebhookFlow(questionnaire);
      const webhookPath = path.join(flowsPath, 'webhooks', 'integrations.shep');
      
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(webhookPath),
        Buffer.from(webhookFlow, 'utf8')
      );
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
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(dashboardPath),
      Buffer.from(dashboardScreen, 'utf8')
    );

    // Generate entity list screens
    for (const entity of questionnaire.entities) {
      const listScreen = screenGenerator.generateEntityList(entity, questionnaire);
      const entityFolder = entity.name.toLowerCase();
      const listPath = path.join(screensPath, entityFolder, 'list.shep');
      
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(listPath),
        Buffer.from(listScreen, 'utf8')
      );

      // Generate detail screen
      const detailScreen = screenGenerator.generateEntityDetail(entity, questionnaire);
      const detailPath = path.join(screensPath, entityFolder, 'detail.shep');
      
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(detailPath),
        Buffer.from(detailScreen, 'utf8')
      );
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
      
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(integrationFile),
        Buffer.from(integrationContent, 'utf8')
      );
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
