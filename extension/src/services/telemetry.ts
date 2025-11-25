/**
 * Telemetry Service for Slice 7
 * 
 * Privacy-first telemetry for tracking import success/failure.
 * - Opt-in via VS Code setting (default: disabled)
 * - Respects VS Code global telemetry setting
 * - No PII collected (no file paths, project names, or code)
 * - Only aggregate counts and timings
 */

import * as vscode from 'vscode';

/**
 * Telemetry event types
 */
export type TelemetryEventType = 
  | 'import_start'
  | 'import_success'
  | 'import_failure'
  | 'wizard_open'
  | 'wizard_complete'
  | 'wizard_cancel';

/**
 * Import telemetry event data
 */
export interface ImportTelemetryData {
  /** Detected framework (nextjs, vite, react) */
  framework?: string;
  
  /** Whether Prisma was detected */
  hasPrisma?: boolean;
  
  /** Count of detected entities */
  entityCount?: number;
  
  /** Count of detected views */
  viewCount?: number;
  
  /** Count of detected actions */
  actionCount?: number;
  
  /** Count of detected API routes */
  routeCount?: number;
  
  /** Overall confidence score (0-1) */
  confidence?: number;
  
  /** Duration in milliseconds */
  durationMs?: number;
  
  /** Error type (for failures) */
  errorType?: string;
  
  /** Error message (sanitized, no paths) */
  errorMessage?: string;
}

/**
 * Telemetry event structure
 */
interface TelemetryEvent {
  event: TelemetryEventType;
  timestamp: string;
  sessionId: string;
  extensionVersion: string;
  data?: ImportTelemetryData;
}

/**
 * Telemetry service singleton
 */
class TelemetryService {
  private static instance: TelemetryService;
  private sessionId: string;
  private extensionVersion: string;
  private eventQueue: TelemetryEvent[] = [];
  private importStartTime?: number;

  private constructor() {
    // Generate anonymous session ID (not tied to user)
    this.sessionId = this.generateSessionId();
    this.extensionVersion = this.getExtensionVersion();
  }

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    // Check VS Code global telemetry setting first
    const globalTelemetry = vscode.env.isTelemetryEnabled;
    if (!globalTelemetry) {
      return false;
    }

    // Check ShepLang-specific setting
    const config = vscode.workspace.getConfiguration('sheplang');
    return config.get<boolean>('telemetry.enabled', false);
  }

  /**
   * Track an import start event
   */
  trackImportStart(framework?: string, hasPrisma?: boolean): void {
    this.importStartTime = Date.now();
    
    this.track('import_start', {
      framework,
      hasPrisma
    });
  }

  /**
   * Track an import success event
   */
  trackImportSuccess(data: ImportTelemetryData): void {
    const durationMs = this.importStartTime 
      ? Date.now() - this.importStartTime 
      : undefined;

    this.track('import_success', {
      ...data,
      durationMs
    });

    this.importStartTime = undefined;
  }

  /**
   * Track an import failure event
   */
  trackImportFailure(errorType: string, errorMessage?: string): void {
    const durationMs = this.importStartTime 
      ? Date.now() - this.importStartTime 
      : undefined;

    // Sanitize error message - remove any paths
    const sanitizedMessage = errorMessage 
      ? this.sanitizeErrorMessage(errorMessage)
      : undefined;

    this.track('import_failure', {
      errorType,
      errorMessage: sanitizedMessage,
      durationMs
    });

    this.importStartTime = undefined;
  }

  /**
   * Track wizard open event
   */
  trackWizardOpen(data: ImportTelemetryData): void {
    this.track('wizard_open', data);
  }

  /**
   * Track wizard completion
   */
  trackWizardComplete(data: ImportTelemetryData): void {
    this.track('wizard_complete', data);
  }

  /**
   * Track wizard cancellation
   */
  trackWizardCancel(): void {
    this.track('wizard_cancel');
  }

  /**
   * Core tracking method
   */
  private track(event: TelemetryEventType, data?: ImportTelemetryData): void {
    if (!this.isEnabled()) {
      return;
    }

    const telemetryEvent: TelemetryEvent = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      extensionVersion: this.extensionVersion,
      data
    };

    // Queue the event
    this.eventQueue.push(telemetryEvent);

    // Log locally for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', telemetryEvent);
    }

    // Flush queue if it gets too large
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Flush queued events to backend
   * Note: In production, this would send to an analytics endpoint
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // In production, this would send to analytics
    // For now, just log the flush
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry] Flushing', events.length, 'events');
    }

    // TODO: Send to analytics endpoint when ready
    // await fetch('https://analytics.goldensheep.ai/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events })
    // });
  }

  /**
   * Generate anonymous session ID
   */
  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get extension version
   */
  private getExtensionVersion(): string {
    try {
      const extension = vscode.extensions.getExtension('goldensheep.sheplang');
      return extension?.packageJSON?.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Sanitize error message to remove any file paths
   */
  private sanitizeErrorMessage(message: string): string {
    // Remove Windows paths
    let sanitized = message.replace(/[A-Z]:\\[^\s]+/gi, '[PATH]');
    
    // Remove Unix paths
    sanitized = sanitized.replace(/\/[^\s]+/g, '[PATH]');
    
    // Truncate to reasonable length
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200) + '...';
    }
    
    return sanitized;
  }
}

/**
 * Get the telemetry service singleton
 */
export function getTelemetry(): TelemetryService {
  return TelemetryService.getInstance();
}

/**
 * Convenience function to track import start
 */
export function trackImportStart(framework?: string, hasPrisma?: boolean): void {
  getTelemetry().trackImportStart(framework, hasPrisma);
}

/**
 * Convenience function to track import success
 */
export function trackImportSuccess(data: ImportTelemetryData): void {
  getTelemetry().trackImportSuccess(data);
}

/**
 * Convenience function to track import failure
 */
export function trackImportFailure(errorType: string, errorMessage?: string): void {
  getTelemetry().trackImportFailure(errorType, errorMessage);
}

/**
 * Check if telemetry is enabled
 */
export function isTelemetryEnabled(): boolean {
  return getTelemetry().isEnabled();
}
