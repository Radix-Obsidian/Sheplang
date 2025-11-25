/**
 * ShepLang Project Wizard
 * 
 * Multi-step wizard for creating new ShepLang projects with exceptional UX
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectQuestionnaire, ProjectType, UserRoleType, EntityDefinition, Integration, ProjectFeature, DesignAnnotation } from './types';
import { AnnotationParser } from './parsers/annotationParser';
import { getWizardStyles, getWizardScripts } from './wizardHtml';
import { outputChannel } from '../services/outputChannel';
import { generateSuggestions, applySuggestion, type ProjectSuggestion } from '../ai/suggestionService';
import { generateSuggestionPanelHtml, getSuggestionPanelStyles, getSuggestionPanelScripts } from './suggestionPanel';

export class ShepLangProjectWizard {
  private panel: vscode.WebviewPanel | undefined;
  private context: vscode.ExtensionContext;
  private questionnaire: Partial<ProjectQuestionnaire> = {};
  private currentStep: number = 1;
  private readonly totalSteps: number = 7;
  private suggestions: ProjectSuggestion[] = [];
  private suggestionsLoading: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Start the wizard
   */
  public async start(): Promise<ProjectQuestionnaire | undefined> {
    outputChannel.section('ShepLang Project Wizard');

    // Create webview panel with better positioning
    this.panel = vscode.window.createWebviewPanel(
      'shepLangWizard',
      '🎯 New ShepLang Project',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ]
      }
    );

    // Add delay for VS Code UI to settle before setting content
    setTimeout(() => {
      if (this.panel) {
        this.panel.webview.html = this.getWizardHtml(1);
        // Reveal the panel to ensure proper positioning
        this.panel.reveal(vscode.ViewColumn.One);
      }
    }, 100);

    // Handle messages from webview
    return new Promise<ProjectQuestionnaire | undefined>((resolve) => {
      this.panel!.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case 'nextStep':
              await this.handleNextStep(message.data);
              break;
            case 'previousStep':
              await this.handlePreviousStep();
              break;
            case 'complete':
              await this.handleComplete(message.data);
              resolve(this.questionnaire as ProjectQuestionnaire);
              this.panel?.dispose();
              break;
            case 'cancel':
              outputChannel.info('Wizard cancelled by user');
              resolve(undefined);
              this.panel?.dispose();
              break;
            case 'parseEntities':
              this.handleParseEntities(message.data);
              break;
            case 'goToStep':
              this.handleGoToStep(message.data);
              break;
            case 'applySuggestion':
              await this.handleApplySuggestion(message.index);
              break;
            case 'dismissSuggestion':
              this.handleDismissSuggestion(message.index);
              break;
          }
        },
        undefined,
        this.context.subscriptions
      );

      // Handle panel disposal
      this.panel!.onDidDispose(() => {
        resolve(undefined);
      });
    });
  }

  /**
   * Handle moving to next step
   */
  private async handleNextStep(data: any): Promise<void> {
    // Save current step data
    this.saveStepData(this.currentStep, data);

    // Move to next step
    this.currentStep++;

    if (this.currentStep > this.totalSteps) {
      this.currentStep = this.totalSteps;
      return;
    }

    // Generate AI suggestions after step 2 (when we have project type and description)
    if (this.currentStep === 3 && this.questionnaire.projectName && this.questionnaire.projectType) {
      this.generateAISuggestions();
    }

    // Update webview with delay to ensure smooth transition
    if (this.panel) {
      setTimeout(() => {
        if (this.panel) {
          this.panel.webview.html = this.getWizardHtml(this.currentStep);
        }
      }, 50);
    }
  }

  /**
   * Handle moving to previous step
   */
  private async handlePreviousStep(): Promise<void> {
    this.currentStep--;

    if (this.currentStep < 1) {
      this.currentStep = 1;
      return;
    }

    // Update webview with delay to ensure smooth transition
    if (this.panel) {
      setTimeout(() => {
        if (this.panel) {
          this.panel.webview.html = this.getWizardHtml(this.currentStep);
        }
      }, 50);
    }
  }

  /**
   * Handle wizard completion
   */
  private async handleComplete(data: any): Promise<void> {
    this.saveStepData(this.currentStep, data);
    outputChannel.info('Wizard completed successfully');
  }

  /**
   * Handle jumping to specific step (for editing)
   */
  private handleGoToStep(step: number): Promise<void> {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      if (this.panel) {
        setTimeout(() => {
          if (this.panel) {
            this.panel.webview.html = this.getWizardHtml(this.currentStep);
          }
        }, 50);
      }
    }
    return Promise.resolve();
  }

  /**
   * Save data from current step
   */
  private saveStepData(step: number, data: any): void {
    switch (step) {
      case 1: // Project Type
        this.questionnaire.projectType = data.projectType;
        this.questionnaire.projectName = data.projectName;
        this.questionnaire.description = data.description;
        if (data.projectType === 'custom') {
          this.questionnaire.customDescription = data.customDescription;
        }
        break;

      case 2: // Core Features
        this.questionnaire.features = data.features;
        break;

      case 3: // Design & Accessibility
        this.questionnaire.designNotes = data.designNotes;
        if (data.designNotes) {
          const parser = new AnnotationParser();
          this.questionnaire.designAnnotation = parser.parse(data.designNotes);
        }
        break;

      case 4: // Data Model
        this.questionnaire.entities = data.entities;
        break;

      case 5: // User Roles
        this.questionnaire.roleType = data.roleType;
        if (data.roleType !== 'single-user') {
          this.questionnaire.roles = data.roles;
        }
        break;

      case 6: // Integrations
        this.questionnaire.integrations = data.integrations;
        break;

      case 7: // Technical Preferences
        this.questionnaire.apiStyle = data.apiStyle;
        this.questionnaire.realtime = data.realtime;
        this.questionnaire.deployment = data.deployment;
        break;
    }
  }

  /**
   * Parse natural language entity descriptions
   */
  private handleParseEntities(text: string): void {
    // Simple parsing logic - can be enhanced with AI
    const entities: EntityDefinition[] = [];

    // Look for patterns like "customers, orders, products"
    const words = text.toLowerCase().split(/[,\s]+/);
    const uniqueWords = new Set(words);

    // Common business entities to prioritize
    const businessEntities = ['user', 'customer', 'order', 'product', 'post', 'comment', 'team', 'member', 'subscription', 'payment'];

    for (const word of uniqueWords) {
      if (word.length > 2 && !['and', 'the', 'with', 'for', 'need', 'track', 'my', 'i', 'to'].includes(word)) {
        // Capitalize first letter
        const entityName = word.charAt(0).toUpperCase() + word.slice(1);

        // Smart field suggestions based on entity type
        const fields = this.getDefaultFieldsForEntity(entityName);

        entities.push({
          name: entityName,
          fields: fields
        });
      }
    }

    // Limit to reasonable number
    if (entities.length > 6) {
      entities.length = 6;
    }

    // Send parsed entities back to webview
    this.panel?.webview.postMessage({
      command: 'entitiesParsed',
      entities: entities
    });
  }

  /**
   * Get default fields for common entity types
   */
  private getDefaultFieldsForEntity(entityName: string): any[] {
    const name = entityName.toLowerCase();

    if (name.includes('user') || name.includes('customer')) {
      return [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'createdAt', type: 'date' }
      ];
    }

    if (name.includes('order') || name.includes('payment')) {
      return [
        { name: 'amount', type: 'number', required: true },
        { name: 'status', type: 'text', required: true },
        { name: 'createdAt', type: 'date' }
      ];
    }

    if (name.includes('product')) {
      return [
        { name: 'title', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'description', type: 'text' }
      ];
    }

    if (name.includes('post') || name.includes('article')) {
      return [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'publishedAt', type: 'date' }
      ];
    }

    if (name.includes('team') || name.includes('organization')) {
      return [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' }
      ];
    }

    // Default fields
    return [
      { name: 'name', type: 'text', required: true },
      { name: 'createdAt', type: 'date' }
    ];
  }

  /**
   * Generate HTML for wizard step
   */
  private getWizardHtml(step: number): string {
    const progress = Math.round((step / this.totalSteps) * 100);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShepLang Project Wizard</title>
  <style>
    ${getWizardStyles()}
    ${getSuggestionPanelStyles()}
  </style>
</head>
<body>
  <div class="wizard-container">
    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">Step ${step} of ${this.totalSteps}</div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      ${this.getStepContent(step)}
      ${step === 3 && this.suggestions.length > 0 ? generateSuggestionPanelHtml(this.suggestions) : ''}
      ${step === 3 && this.suggestionsLoading ? '<div class="suggestion-loading">💡 Generating AI suggestions...</div>' : ''}
    </div>

    <!-- Navigation -->
    <div class="navigation">
      ${step > 1 ? '<button class="btn btn-secondary" onclick="previousStep()">← Back</button>' : '<div></div>'}
      ${step < this.totalSteps
        ? '<button class="btn btn-primary" onclick="nextStep()">Next →</button>'
        : '<button class="btn btn-success" onclick="complete()">Generate Project 🚀</button>'
      }
    </div>
  </div>

  <script>
    ${getWizardScripts()}
    ${getSuggestionPanelScripts()}
  </script>
</body>
</html>`;
  }

  /**
   * Get step-specific content
   */
  private getStepContent(step: number): string {
    switch (step) {
      case 1:
        return this.getStep1Content();
      case 2:
        return this.getStep2Content();
      case 3:
        return this.getStep3Content();
      case 4:
        return this.getStep4Content();
      case 5:
        return this.getStep5Content();
      case 6:
        return this.getStep6Content();
      case 7:
        return this.getStep7Content();
      default:
        return '';
    }
  }

  /**
   * Step 1: Project Type
   */
  private getStep1Content(): string {
    const projectName = this.questionnaire.projectName || '';
    const selectedType = this.questionnaire.projectType || '';

    return `
      <h1>What are you building?</h1>
      <p class="subtitle">Choose the type that best describes your project</p>

      <div class="input-group">
        <label for="projectName">Project Name</label>
        <input type="text" id="projectName" placeholder="My Awesome App" value="${projectName}">
      </div>

      <div class="option-card ${selectedType === 'mobile-first' ? 'selected' : ''}" data-type="mobile-first" role="radio" aria-checked="${selectedType === 'mobile-first'}" tabindex="0">
        <div class="option-icon">📱</div>
        <div class="option-title">Mobile-first app</div>
        <div class="option-description">Social networks, on-demand services, consumer apps</div>
      </div>

      <div class="option-card ${selectedType === 'saas-dashboard' ? 'selected' : ''}" data-type="saas-dashboard" role="radio" aria-checked="${selectedType === 'saas-dashboard'}" tabindex="0">
        <div class="option-icon">💼</div>
        <div class="option-title">SaaS dashboard</div>
        <div class="option-description">B2B tools, internal platforms, team collaboration</div>
      </div>

      <div class="option-card ${selectedType === 'ecommerce' ? 'selected' : ''}" data-type="ecommerce" role="radio" aria-checked="${selectedType === 'ecommerce'}" tabindex="0">
        <div class="option-icon">🛒</div>
        <div class="option-title">E-commerce store</div>
        <div class="option-description">Products, shopping carts, checkout, inventory</div>
      </div>

      <div class="option-card ${selectedType === 'content-platform' ? 'selected' : ''}" data-type="content-platform" role="radio" aria-checked="${selectedType === 'content-platform'}" tabindex="0">
        <div class="option-icon">📰</div>
        <div class="option-title">Content platform</div>
        <div class="option-description">Blogs, portfolios, media sites, publishing</div>
      </div>

      <div class="option-card ${selectedType === 'custom' ? 'selected' : ''}" data-type="custom" role="radio" aria-checked="${selectedType === 'custom'}" tabindex="0">
        <div class="option-icon">🎯</div>
        <div class="option-title">Custom application</div>
        <div class="option-description">Describe your unique vision below</div>
      </div>

      <div id="customDescription" style="display: ${selectedType === 'custom' ? 'block' : 'none'}; margin-top: 20px;">
        <div class="input-group">
          <label for="customDesc">Describe your application</label>
          <textarea id="customDesc" placeholder="Tell us what you're building...">${this.questionnaire.customDescription || ''}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Step 2: Core Features
   */
  private getStep2Content(): string {
    const features = this.questionnaire.features || [];
    const placeholders = this.getFeaturePlaceholders(this.questionnaire.projectType);

    return `
      <h1>What are the main things users will do?</h1>
      <p class="subtitle">List 3-5 key features (we'll help you build them)</p>

      <div id="featuresList">
        ${features.map((f, i) => `
          <div class="feature-input">
            <input type="text" class="feature-field" placeholder="${placeholders[i] || 'Feature ' + (i + 1)}" value="${f.name}">
            <button class="btn btn-small btn-secondary" onclick="removeFeature(this)">Remove</button>
          </div>
        `).join('')}
        ${features.length === 0 ? placeholders.slice(0, 3).map((p, i) => `
          <div class="feature-input">
            <input type="text" class="feature-field" placeholder="${p}">
          </div>
        `).join('') : ''}
      </div>

      <button class="btn btn-secondary btn-small" onclick="addFeature()" style="margin-top: 10px;">+ Add Feature</button>
    `;
  }

  /**
   * Step 3: Design & Accessibility
   */
  private getStep3Content(): string {
    const notes = this.questionnaire.designNotes || '';

    return `
      <h1>Design & Accessibility</h1>
      <p class="subtitle">Optional: Add design details or skip if you're not sure</p>

      <div class="help-panel" style="background: var(--vscode-textBlockQuote-background); border-left: 3px solid var(--vscode-textBlockQuote-border); padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="font-size: 24px;">💡</span>
          <div>
            <strong>Not a designer? No problem!</strong>
            <p style="margin: 5px 0 0 0; opacity: 0.9; line-height: 1.5;">
              This step is completely optional. You can:
              <br>• Leave it blank and we'll create a professional default design
              <br>• Add simple notes like "I want a clean, modern look"
              <br>• Paste Figma annotations if you have them
            </p>
          </div>
        </div>
      </div>

      <div class="input-group">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label>Design Notes (Optional)</label>
          <button type="button" class="btn-help" onclick="showDesignHelp()" style="background: transparent; border: 1px solid var(--vscode-button-border); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            📖 Show Examples
          </button>
        </div>
        
        <div id="designExamples" style="display: none; background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 15px; margin: 10px 0;">
          <h4 style="margin: 0 0 10px 0;">Example Design Notes:</h4>
          
          <div class="example-section" style="margin-bottom: 15px;">
            <strong>Simple Preference:</strong>
            <pre style="background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 4px; margin: 5px 0; font-size: 13px;">I want a clean, modern dashboard with easy-to-read fonts</pre>
          </div>
          
          <div class="example-section" style="margin-bottom: 15px;">
            <strong>Specific Requirements:</strong>
            <pre style="background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 4px; margin: 5px 0; font-size: 13px;">Screen: Dashboard
- Large action buttons for main tasks
- Card-based layout for metrics
Accessibility: WCAG 2.1 AA compliant</pre>
          </div>
          
          <div class="example-section">
            <strong>Figma Annotations:</strong>
            <pre style="background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 4px; margin: 5px 0; font-size: 13px;">@Screen: UserList
@Flow: Click "Add User" → Modal opens
@A11y: Keyboard navigation required
@Component: DataTable with sorting</pre>
          </div>
          
          <button type="button" onclick="useExample('clean')" style="margin-top: 10px; padding: 6px 12px; border-radius: 4px; cursor: pointer; background: var(--vscode-button-secondaryBackground); border: 1px solid var(--vscode-button-border);">
            Use "Clean & Modern" Template
          </button>
        </div>
        
        <textarea 
          id="designNotes" 
          placeholder="Optional: Describe your design preferences, or leave blank for smart defaults..."
          style="min-height: 150px; font-family: var(--vscode-editor-font-family); font-size: 14px;"
        >${notes}</textarea>
        
        <div class="help-text" style="margin-top: 10px; font-size: 13px; opacity: 0.8; display: flex; align-items: start; gap: 8px;">
          <span>💭</span>
          <span>
            <strong>Pro Tip:</strong> Start simple! You can always refine the design later. 
            ShepLang will create beautiful, accessible interfaces by default.
          </span>
        </div>
      </div>

      <script>
        function showDesignHelp() {
          const examples = document.getElementById('designExamples');
          examples.style.display = examples.style.display === 'none' ? 'block' : 'none';
        }
        
        function useExample(type) {
          const textarea = document.getElementById('designNotes');
          if (type === 'clean') {
            textarea.value = 'I want a clean, modern design with:\\n- Easy-to-read typography\\n- Card-based layout for content\\n- Smooth animations\\n- Mobile-friendly responsive design\\n\\nAccessibility: High contrast mode support';
          }
          document.getElementById('designExamples').style.display = 'none';
        }
      </script>
    `;
  }

  /**
   * Step 4: Data Model
   */
  private getStep4Content(): string {
    const entities = this.questionnaire.entities || [];

    return `
      <h1>What information will your app store?</h1>
      <p class="subtitle">Tell us about the main things your users create or manage</p>

      <div class="input-group">
        <label for="entityInput">Describe your data (e.g., "customers, orders, products")</label>
        <textarea id="entityInput" placeholder="I need to track: customers, orders, and products"></textarea>
        <button class="btn btn-secondary btn-small" onclick="parseEntities()" style="margin-top: 10px;">Parse Entities</button>
      </div>

      <div id="entitiesList">
        ${entities.map((entity, i) => `
          <div class="entity-card">
            <div class="entity-header">
              <div class="entity-name">${entity.name}</div>
              <button class="btn btn-small btn-secondary" onclick="removeEntity(this)">Remove</button>
            </div>
            <div class="field-list">
              ${entity.fields.map((field, j) => `
                <div class="field-item">
                  <input type="text" placeholder="Field name" value="${field.name}" style="flex: 1;">
                  <select style="width: 120px;">
                    <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
                    <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
                    <option value="date" ${field.type === 'date' ? 'selected' : ''}>Date</option>
                    <option value="yes/no" ${field.type === 'yes/no' ? 'selected' : ''}>Yes/No</option>
                    <option value="image" ${field.type === 'image' ? 'selected' : ''}>Image</option>
                  </select>
                  <button class="btn btn-small btn-secondary" onclick="removeField(this)">×</button>
                </div>
              `).join('')}
              <button class="btn btn-small btn-secondary" onclick="addField(this)">+ Add Field</button>
            </div>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-secondary btn-small" onclick="addEntity()">+ Add Entity</button>
    `;
  }

  /**
   * Step 5: User Roles
   */
  private getStep5Content(): string {
    const roleType = this.questionnaire.roleType || 'single-user';

    return `
      <h1>Who will use your app?</h1>
      <p class="subtitle">Define user access levels</p>

      <div class="option-card ${roleType === 'single-user' ? 'selected' : ''}" data-role="single-user" role="radio" aria-checked="${roleType === 'single-user'}" tabindex="0">
        <div class="option-title">Single user type</div>
        <div class="option-description">Everyone has the same access</div>
      </div>

      <div class="option-card ${roleType === 'multiple-roles' ? 'selected' : ''}" data-role="multiple-roles" role="radio" aria-checked="${roleType === 'multiple-roles'}" tabindex="0">
        <div class="option-title">Multiple roles</div>
        <div class="option-description">Admin, regular users, etc.</div>
      </div>

      <div class="option-card ${roleType === 'team-based' ? 'selected' : ''}" data-role="team-based" role="radio" aria-checked="${roleType === 'team-based'}" tabindex="0">
        <div class="option-title">Team-based</div>
        <div class="option-description">Organizations, workspaces, teams</div>
      </div>

      <div id="rolesSection" style="display: ${roleType !== 'single-user' ? 'block' : 'none'}; margin-top: 30px;">
        <h3>Define Roles</h3>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="role-admin" checked>
            <label for="role-admin">Admin (full access)</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="role-manager">
            <label for="role-manager">Manager (limited admin)</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="role-user" checked>
            <label for="role-user">Regular User</label>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Step 6: Integrations
   */
  private getStep6Content(): string {
    return `
      <h1>Which services will you integrate?</h1>
      <p class="subtitle">Select the external services your app needs</p>

      <div class="integration-category">
        <div class="category-title">💳 Payments</div>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="int-stripe" data-category="payments" data-service="Stripe">
            <label for="int-stripe">Stripe</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="int-paypal" data-category="payments" data-service="PayPal">
            <label for="int-paypal">PayPal</label>
          </div>
        </div>
      </div>

      <div class="integration-category">
        <div class="category-title">📧 Email</div>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="int-sendgrid" data-category="email" data-service="SendGrid">
            <label for="int-sendgrid">SendGrid</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="int-resend" data-category="email" data-service="Resend">
            <label for="int-resend">Resend</label>
          </div>
        </div>
      </div>

      <div class="integration-category">
        <div class="category-title">☁️ Storage</div>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="int-s3" data-category="storage" data-service="AWS S3">
            <label for="int-s3">AWS S3</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="int-cloudinary" data-category="storage" data-service="Cloudinary">
            <label for="int-cloudinary">Cloudinary</label>
          </div>
        </div>
      </div>

      <div class="integration-category">
        <div class="category-title">🔐 Authentication</div>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="int-clerk" data-category="auth" data-service="Clerk">
            <label for="int-clerk">Clerk</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="int-auth0" data-category="auth" data-service="Auth0">
            <label for="int-auth0">Auth0</label>
          </div>
        </div>
      </div>

      <button class="btn btn-secondary btn-small" style="margin-top: 20px;">Skip for now</button>
    `;
  }

  /**
   * Step 7: Review & Generate
   */
  private getStep7Content(): string {
    const q = this.questionnaire;

    return `
      <h1>Review Your Project</h1>
      <p class="subtitle">Everything look good? Let's generate your ShepLang project!</p>

      <div class="review-section">
        <div class="review-title">Project Overview <a href="#" class="edit-link" onclick="editSection(1)">Edit</a></div>
        <div class="review-item">
          <span class="review-label">Type:</span>
          <span class="review-value">${this.formatProjectType(q.projectType)}</span>
        </div>
        <div class="review-item">
          <span class="review-label">Name:</span>
          <span class="review-value">${q.projectName}</span>
        </div>
      </div>

      <div class="review-section">
        <div class="review-title">Features (${q.features?.length || 0}) <a href="#" class="edit-link" onclick="editSection(2)">Edit</a></div>
        ${q.features?.map((f, i) => `
          <div class="review-item">${i + 1}. ${f.name}</div>
        `).join('') || '<div class="review-item">No features defined</div>'}
      </div>

      <div class="review-section">
        <div class="review-title">Design & Accessibility <a href="#" class="edit-link" onclick="editSection(3)">Edit</a></div>
        <div class="review-item">
          <span class="review-label">Screens detected:</span>
          <span class="review-value">${q.designAnnotation?.screens.length || 0}</span>
        </div>
        <div class="review-item">
            <span class="review-label">A11y Rules:</span>
            <span class="review-value">${q.designAnnotation?.accessibilityRules.length || 0}</span>
        </div>
      </div>

      <div class="review-section">
        <div class="review-title">Data Model (${q.entities?.length || 0} entities) <a href="#" class="edit-link" onclick="editSection(4)">Edit</a></div>
        ${q.entities?.map(e => `
          <div class="review-item">
            <strong>${e.name}</strong> (${e.fields.length} fields)
          </div>
        `).join('') || '<div class="review-item">No entities defined</div>'}
      </div>

      <div class="review-section">
        <div class="review-title">User Roles <a href="#" class="edit-link" onclick="editSection(5)">Edit</a></div>
        <div class="review-item">
          <span class="review-value">${this.formatRoleType(q.roleType)}</span>
        </div>
      </div>

      <div class="review-section">
        <div class="review-title">Integrations (${q.integrations?.length || 0}) <a href="#" class="edit-link" onclick="editSection(6)">Edit</a></div>
        ${q.integrations?.map(i => `
          <div class="review-item">${i.service}</div>
        `).join('') || '<div class="review-item">No integrations selected</div>'}
      </div>

      <div class="review-section">
        <div class="review-title">Technical Preferences</div>
        <div class="review-item">
          <span class="review-label">API Style:</span>
          <span class="review-value">${q.apiStyle || 'REST'}</span>
        </div>
        <div class="review-item">
          <span class="review-label">Real-time:</span>
          <span class="review-value">${q.realtime ? 'Yes' : 'No'}</span>
        </div>
        <div class="review-item">
          <span class="review-label">Deployment:</span>
          <span class="review-value">${q.deployment || 'Vercel'}</span>
        </div>
      </div>
    `;
  }

  /**
   * Get feature placeholders based on project type
   */
  private getFeaturePlaceholders(projectType?: ProjectType): string[] {
    const placeholders: Record<ProjectType, string[]> = {
      'mobile-first': [
        'User authentication',
        'Social feed',
        'Push notifications'
      ],
      'saas-dashboard': [
        'Manage team members',
        'Track analytics',
        'Process payments'
      ],
      'ecommerce': [
        'Browse products',
        'Shopping cart',
        'Checkout process'
      ],
      'content-platform': [
        'Create articles',
        'Manage authors',
        'Comment system'
      ],
      'custom': [
        'Core feature 1',
        'Core feature 2',
        'Core feature 3'
      ]
    };

    return placeholders[projectType || 'custom'];
  }

  /**
   * Format project type for display
   */
  private formatProjectType(type?: ProjectType): string {
    const types: Record<ProjectType, string> = {
      'mobile-first': 'Mobile-first app',
      'saas-dashboard': 'SaaS dashboard',
      'ecommerce': 'E-commerce store',
      'content-platform': 'Content platform',
      'custom': 'Custom application'
    };

    return types[type || 'custom'];
  }

  /**
   * Format role type for display
   */
  private formatRoleType(type?: UserRoleType): string {
    const types: Record<UserRoleType, string> = {
      'single-user': 'Single user type',
      'multiple-roles': 'Multiple roles (Admin, User)',
      'team-based': 'Team-based (Organizations)'
    };

    return types[type || 'single-user'];
  }

  /**
   * Generate AI suggestions based on current questionnaire state
   */
  private async generateAISuggestions(): Promise<void> {
    if (this.suggestionsLoading) {
      return;
    }

    this.suggestionsLoading = true;
    outputChannel.info('Generating AI suggestions...');

    try {
      const suggestionContext = {
        projectName: this.questionnaire.projectName || '',
        projectType: this.questionnaire.projectType || '',
        description: this.questionnaire.description,
        features: this.questionnaire.features,
        entities: this.questionnaire.entities
      };

      this.suggestions = await generateSuggestions(this.context, suggestionContext);
      outputChannel.info(`Generated ${this.suggestions.length} suggestions`);

      // Refresh the current step to show suggestions
      if (this.panel && this.currentStep === 3) {
        this.panel.webview.html = this.getWizardHtml(this.currentStep);
      }
    } catch (error) {
      outputChannel.error('Failed to generate suggestions:', error);
      this.suggestions = [];
    } finally {
      this.suggestionsLoading = false;
    }
  }

  /**
   * Handle applying a suggestion
   */
  private async handleApplySuggestion(index: number): Promise<void> {
    if (index < 0 || index >= this.suggestions.length) {
      outputChannel.warn(`Invalid suggestion index: ${index}`);
      return;
    }

    const suggestion = this.suggestions[index];
    outputChannel.info(`Applying suggestion: ${suggestion.title}`);

    try {
      // Apply the suggestion to the questionnaire
      this.questionnaire = applySuggestion(
        this.questionnaire as ProjectQuestionnaire,
        suggestion
      );

      // Show success message
      vscode.window.showInformationMessage(
        `✓ Applied: ${suggestion.title}`,
        'View Changes'
      ).then(selection => {
        if (selection === 'View Changes') {
          // Navigate to the relevant step
          if (suggestion.type === 'entity' && this.currentStep < 3) {
            this.currentStep = 3;
            if (this.panel) {
              this.panel.webview.html = this.getWizardHtml(this.currentStep);
            }
          }
        }
      });

      // Remove the applied suggestion from the list
      this.suggestions.splice(index, 1);

    } catch (error) {
      outputChannel.error('Failed to apply suggestion:', error);
      vscode.window.showErrorMessage(`Failed to apply suggestion: ${error}`);
    }
  }

  /**
   * Handle dismissing a suggestion
   */
  private handleDismissSuggestion(index: number): void {
    if (index < 0 || index >= this.suggestions.length) {
      return;
    }

    const suggestion = this.suggestions[index];
    outputChannel.info(`Dismissed suggestion: ${suggestion.title}`);

    // Remove the suggestion from the list
    this.suggestions.splice(index, 1);
  }
}
