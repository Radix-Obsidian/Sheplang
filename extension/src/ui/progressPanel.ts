/**
 * Enhanced Progress Panel for ShepLang Project Generation
 * 
 * Provides real-time visual feedback during project creation
 */

import * as vscode from 'vscode';
import { GenerationProgress } from '../wizard/types';
import { outputChannel } from '../services/outputChannel';

export interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  details?: string[];
  error?: Error;
}

export interface ProgressPanelOptions {
  title?: string;
  showDetails?: boolean;
  showTiming?: boolean;
  autoClose?: boolean;
}

export class ProgressPanel {
  private panel: vscode.WebviewPanel | undefined;
  private steps: ProgressStep[] = [];
  private currentStepIndex = -1;
  private options: ProgressPanelOptions;
  private _onDidClose: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidClose: vscode.Event<void> = this._onDidClose.event;

  constructor(options: ProgressPanelOptions = {}) {
    this.options = {
      title: 'ShepLang Project Generation',
      showDetails: true,
      showTiming: true,
      autoClose: false,
      ...options
    };
  }

  /**
   * Show the progress panel
   */
  public show(): void {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'sheplang-progress',
      this.options.title!,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(''), 'out')]
      }
    );

    this.panel.webview.html = this.getWebviewContent();
    this.panel.onDidDispose(() => {
      this.panel = undefined;
      this._onDidClose.fire();
    });

    // Start with empty steps
    this.updateDisplay();
  }

  /**
   * Initialize progress steps
   */
  public initializeSteps(steps: Omit<ProgressStep, 'status'>[]): void {
    this.steps = steps.map(step => ({
      ...step,
      status: 'pending'
    }));
    this.currentStepIndex = -1;
    this.updateDisplay();
  }

  /**
   * Start a specific step
   */
  public startStep(stepId: string, details?: string[]): void {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'in-progress';
      step.startTime = Date.now();
      step.details = details;
      this.currentStepIndex = this.steps.indexOf(step);
      this.updateDisplay();
    }
  }

  /**
   * Complete a step
   */
  public completeStep(stepId: string, details?: string[]): void {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'completed';
      step.endTime = Date.now();
      if (details) {
        step.details = [...(step.details || []), ...details];
      }
      this.updateDisplay();
    }
  }

  /**
   * Mark a step as failed
   */
  public failStep(stepId: string, error: Error, details?: string[]): void {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'error';
      step.endTime = Date.now();
      step.error = error;
      if (details) {
        step.details = [...(step.details || []), ...details];
      }
      this.updateDisplay();
    }
  }

  /**
   * Update progress from scaffolding agent
   */
  public updateProgress(progress: GenerationProgress): void {
    // Map progress messages to steps
    const stepMap: { [key: string]: string } = {
      'Creating project structure': 'structure',
      'Generating entities': 'entities',
      'Generating flows': 'flows',
      'Generating screens': 'screens',
      'Setting up integrations': 'integrations',
      'Creating documentation': 'documentation',
      'Saving configuration': 'config'
    };

    const stepId = stepMap[progress.message];
    if (stepId) {
      if (progress.error) {
        this.failStep(stepId, progress.error);
      } else if (progress.percentage >= 100) {
        this.completeStep(stepId);
      } else {
        this.startStep(stepId, [`${progress.percentage}% complete`]);
      }
    }

    // Update overall progress
    this.updateDisplay();
  }

  /**
   * Update the webview display
   */
  private updateDisplay(): void {
    if (this.panel) {
      this.panel.webview.postMessage({
        type: 'update',
        steps: this.steps,
        currentStepIndex: this.currentStepIndex,
        overallProgress: this.calculateOverallProgress()
      });
    }
  }

  /**
   * Calculate overall progress percentage
   */
  private calculateOverallProgress(): number {
    if (this.steps.length === 0) return 0;
    
    const completedSteps = this.steps.filter(s => s.status === 'completed').length;
    const inProgressSteps = this.steps.filter(s => s.status === 'in-progress').length;
    
    return Math.round(((completedSteps + inProgressSteps * 0.5) / this.steps.length) * 100);
  }

  /**
   * Get webview HTML content
   */
  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.options.title}</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎯 ${this.options.title}</h1>
            <div class="overall-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="overallProgress"></div>
                </div>
                <div class="progress-text" id="progressText">0%</div>
            </div>
        </header>

        <main>
            <div class="steps-container" id="stepsContainer">
                <!-- Steps will be populated here -->
            </div>
        </main>

        <footer>
            <div class="actions">
                <button id="showLogs" class="secondary">📋 Show Logs</button>
                <button id="cancel" class="danger">✖ Cancel</button>
            </div>
        </footer>
    </div>

    <script>
        ${this.getScript()}
    </script>
</body>
</html>`;
  }

  /**
   * Get CSS styles
   */
  private getStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
            font-size: var(--vscode-font-size, 14px);
            color: var(--vscode-foreground, #cccccc);
            background-color: var(--vscode-editor-background, #1e1e1e);
            line-height: 1.5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        header {
            margin-bottom: 30px;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: var(--vscode-foreground, #cccccc);
        }

        .overall-progress {
            background: var(--vscode-editor-background, #252526);
            border: 1px solid var(--vscode-panel-border, #cccccc20);
            border-radius: 6px;
            padding: 16px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--vscode-progressBar-background, #3e3e42);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--vscode-progressBar-foreground, #007acc), var(--vscode-charts-blue, #007fd4));
            border-radius: 4px;
            transition: width 0.3s ease;
            width: 0%;
        }

        .progress-text {
            font-size: 12px;
            color: var(--vscode-descriptionForeground, #9d9d9d);
            text-align: center;
        }

        .steps-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .step {
            background: var(--vscode-editor-background, #252526);
            border: 1px solid var(--vscode-panel-border, #cccccc20);
            border-radius: 6px;
            padding: 16px;
            transition: all 0.2s ease;
        }

        .step.active {
            border-color: var(--vscode-charts-blue, #007fd4);
            box-shadow: 0 0 0 1px var(--vscode-charts-blue, #007fd4);
        }

        .step.completed {
            border-color: var(--vscode-testing-iconPassed, #4caf50);
        }

        .step.error {
            border-color: var(--vscode-testing-iconFailed, #f44336);
        }

        .step-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }

        .step-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }

        .step.pending .step-icon {
            background: var(--vscode-progressBar-background, #3e3e42);
            color: var(--vscode-descriptionForeground, #9d9d9d);
        }

        .step.in-progress .step-icon {
            background: var(--vscode-charts-blue, #007fd4);
            color: white;
            animation: pulse 1.5s infinite;
        }

        .step.completed .step-icon {
            background: var(--vscode-testing-iconPassed, #4caf50);
            color: white;
        }

        .step.error .step-icon {
            background: var(--vscode-testing-iconFailed, #f44336);
            color: white;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .step-info {
            flex: 1;
        }

        .step-name {
            font-weight: 600;
            color: var(--vscode-foreground, #cccccc);
        }

        .step-description {
            font-size: 12px;
            color: var(--vscode-descriptionForeground, #9d9d9d);
            margin-top: 2px;
        }

        .step-timing {
            font-size: 11px;
            color: var(--vscode-descriptionForeground, #9d9d9d);
        }

        .step-details {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--vscode-panel-border, #cccccc20);
        }

        .detail-item {
            font-size: 12px;
            color: var(--vscode-descriptionForeground, #9d9d9d);
            margin-bottom: 4px;
        }

        .error-message {
            color: var(--vscode-testing-iconFailed, #f44336);
            font-size: 12px;
            margin-top: 8px;
            padding: 8px;
            background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
            border-radius: 4px;
        }

        footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid var(--vscode-panel-border, #cccccc20);
        }

        .actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        button.secondary {
            background: var(--vscode-button-secondaryBackground, #3c3c3c);
            color: var(--vscode-button-secondaryForeground, #cccccc);
        }

        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground, #4a4a4a);
        }

        button.danger {
            background: var(--vscode-button-dangerBackground, #f44336);
            color: white;
        }

        button.danger:hover {
            background: #d32f2f;
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
  }

  /**
   * Get JavaScript for the webview
   */
  private getScript(): string {
    return `
        let steps = [];
        let currentStepIndex = -1;
        let overallProgress = 0;

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'update') {
                steps = message.steps || [];
                currentStepIndex = message.currentStepIndex || -1;
                overallProgress = message.overallProgress || 0;
                renderSteps();
                updateOverallProgress();
            }
        });

        function renderSteps() {
            const container = document.getElementById('stepsContainer');
            if (!container) return;

            container.innerHTML = steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const icon = getStepIcon(step.status);
                const timing = getStepTiming(step);
                
                return \`
                    <div class="step \${step.status} \${isActive ? 'active' : ''}">
                        <div class="step-header">
                            <div class="step-icon">\${icon}</div>
                            <div class="step-info">
                                <div class="step-name">\${step.name}</div>
                                <div class="step-description">\${step.description}</div>
                            </div>
                            \${timing ? \`<div class="step-timing">\${timing}</div>\` : ''}
                        </div>
                        \${renderStepDetails(step)}
                    </div>
                \`;
            }).join('');
        }

        function getStepIcon(status) {
            switch (status) {
                case 'pending': return '○';
                case 'in-progress': return '⟳';
                case 'completed': return '✓';
                case 'error': return '✖';
                default: return '○';
            }
        }

        function getStepTiming(step) {
            if (!step.startTime) return '';
            
            const start = new Date(step.startTime);
            const end = step.endTime ? new Date(step.endTime) : new Date();
            const duration = (end - start) / 1000;
            
            return duration > 0 ? \`\${duration.toFixed(1)}s\` : '';
        }

        function renderStepDetails(step) {
            if (!step.details || step.details.length === 0) return '';
            
            const detailsHtml = step.details.map(detail => 
                \`<div class="detail-item">• \${detail}</div>\`
            ).join('');
            
            const errorHtml = step.error ? 
                \`<div class="error-message">\${step.error.message}</div>\` : '';
            
            return \`
                <div class="step-details">
                    \${detailsHtml}
                    \${errorHtml}
                </div>
            \`;
        }

        function updateOverallProgress() {
            const progressFill = document.getElementById('overallProgress');
            const progressText = document.getElementById('progressText');
            
            if (progressFill) {
                progressFill.style.width = overallProgress + '%';
            }
            
            if (progressText) {
                progressText.textContent = overallProgress + '%';
            }
        }

        // Button handlers
        document.getElementById('showLogs')?.addEventListener('click', () => {
            // Request to show output channel
            vscode.postMessage({
                command: 'showLogs'
            });
        });

        document.getElementById('cancel')?.addEventListener('click', () => {
            // Request to cancel generation
            vscode.postMessage({
                command: 'cancel'
            });
        });

        // Initial render
        renderSteps();
        updateOverallProgress();
    `;
  }

  /**
   * Close the progress panel
   */
  public close(): void {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }
  }

  /**
   * Check if panel is visible
   */
  public isVisible(): boolean {
    return this.panel !== undefined;
  }

  /**
   * Handle messages from webview
   */
  public handleMessage(message: any): void {
    switch (message.command) {
      case 'showLogs':
        outputChannel.show();
        break;
      case 'cancel':
        // Emit cancel event if needed
        break;
    }
  }
}
