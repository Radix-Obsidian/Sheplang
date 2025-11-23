import * as vscode from 'vscode';
import { outputChannel } from './outputChannel';

/**
 * Enhanced progress tracker for verbose user feedback
 * Provides detailed step tracking, error reporting, and contextual feedback
 */
export class ProgressTracker {
  private progress: vscode.Progress<{ message?: string; increment?: number }> | undefined;
  private steps: { name: string; description: string; percentage: number }[] = [];
  private currentStep: number = 0;
  private totalSteps: number = 0;
  private title: string;
  private cancellationToken?: vscode.CancellationToken;
  private isCancelled: boolean = false;
  private startTime: number;

  /**
   * Creates a new progress tracker with defined steps
   * 
   * @param title The title for the progress notification
   * @param steps Array of steps with names, descriptions and percentage values
   */
  constructor(title: string) {
    this.title = title;
    this.startTime = Date.now();
  }

  /**
   * Define the steps for this progress tracker
   */
  public setSteps(steps: { name: string; description: string; percentage: number }[]) {
    this.steps = steps;
    this.totalSteps = steps.length;
    this.validateSteps();
    return this;
  }

  /**
   * Validate that step percentages add up to 100
   */
  private validateSteps() {
    const total = this.steps.reduce((sum, step) => sum + step.percentage, 0);
    if (total !== 100) {
      console.warn(`Step percentages don't add up to 100% (got ${total}%)`);
      // Normalize to 100%
      const factor = 100 / total;
      this.steps = this.steps.map(step => ({
        ...step,
        percentage: step.percentage * factor
      }));
    }
  }

  /**
   * Start the progress tracker with a VS Code progress indicator
   */
  public async start<T>(task: (tracker: ProgressTracker) => Promise<T>): Promise<T> {
    outputChannel.info(`Starting task: ${this.title}`);
    outputChannel.info(`Steps: ${this.steps.map(s => s.name).join(' → ')}`);

    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: this.title,
      cancellable: true
    }, async (progress, token) => {
      this.progress = progress;
      this.cancellationToken = token;
      
      token.onCancellationRequested(() => {
        this.isCancelled = true;
        outputChannel.warn(`Task cancelled by user: ${this.title}`);
      });

      try {
        return await task(this);
      } catch (error: any) {
        outputChannel.error(`Task failed: ${this.title}`, error.message || error);
        throw error;
      } finally {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
        if (this.isCancelled) {
          outputChannel.warn(`Task cancelled after ${duration}s`);
        } else if (this.currentStep >= this.totalSteps) {
          outputChannel.success(`Task completed in ${duration}s`);
        } else {
          outputChannel.warn(`Task incomplete (${this.currentStep}/${this.totalSteps} steps) after ${duration}s`);
        }
      }
    });
  }

  /**
   * Advance to the next step
   */
  public nextStep(message?: string): void {
    if (this.isCancelled) return;
    if (this.currentStep >= this.totalSteps) {
      console.warn('Attempting to advance beyond the last step');
      return;
    }

    const step = this.steps[this.currentStep];
    const displayMessage = message || step.description;
    
    // Show specific step info
    if (this.progress) {
      this.progress.report({
        message: `${displayMessage} (${this.currentStep + 1}/${this.totalSteps})`,
        increment: step.percentage
      });
    }
    
    // Log to output channel
    outputChannel.info(`[${this.currentStep + 1}/${this.totalSteps}] ${step.name}: ${displayMessage}`);
    
    this.currentStep++;
  }

  /**
   * Provide detailed feedback within the current step
   */
  public detail(message: string): void {
    if (this.isCancelled) return;
    if (this.progress) {
      const currentStepInfo = this.steps[Math.min(this.currentStep, this.steps.length - 1)];
      this.progress.report({
        message: `${message} (${this.currentStep + 1}/${this.totalSteps})`
      });
    }
    outputChannel.debug(`  └─ ${message}`);
  }

  /**
   * Check if the operation was cancelled by the user
   */
  public get cancelled(): boolean {
    return this.isCancelled;
  }

  /**
   * Get the current step index (0-based)
   */
  public get currentStepIndex(): number {
    return this.currentStep;
  }

  /**
   * Get the current step name
   */
  public get currentStepName(): string {
    if (this.currentStep >= this.totalSteps) {
      return 'Complete';
    }
    return this.steps[this.currentStep].name;
  }
}
