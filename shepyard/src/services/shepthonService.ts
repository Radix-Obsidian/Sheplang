/**
 * ShepThon Service for Shepyard
 * 
 * Provides ShepThon backend loading and runtime management.
 * Handles parsing .shepthon files and bootstrapping the runtime.
 * 
 * Phase 3: Shepyard-ShepThon Integration
 * Reference: TTD_ShepThon_Core.md C3.1
 */

// Import from shepthon package (via workspace dependency)
import { parseShepThon, ShepThonRuntime } from '@sheplang/shepthon';
import type { ShepThonApp, ModelDefinition, EndpointDefinition, JobDefinition, ParseResult } from '@sheplang/shepthon';

/**
 * Metadata extracted from ShepThon AST for UI display
 */
export interface AppMetadata {
  name: string;
  models: ModelInfo[];
  endpoints: EndpointInfo[];
  jobs: JobInfo[];
}

export interface ModelInfo {
  name: string;
  fieldCount: number;
  fields: Array<{
    name: string;
    type: string;
    hasDefault: boolean;
  }>;
}

export interface EndpointInfo {
  method: 'GET' | 'POST';
  path: string;
  parameterCount: number;
  parameters: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
  returnType: string;
}

export interface JobInfo {
  name: string;
  schedule: string; // Human-readable: "every 5 minutes"
  statementCount: number;
}

export interface ShepThonServiceResult {
  success: boolean;
  runtime?: ShepThonRuntime;
  metadata?: AppMetadata;
  error?: string;
}

/**
 * Current runtime instance (singleton pattern for Shepyard)
 */
let currentRuntime: ShepThonRuntime | null = null;
let currentMetadata: AppMetadata | null = null;

/**
 * Parse ShepThon source code
 * 
 * @param source - ShepThon source code
 * @returns ParseResult with AST or errors
 */
export function parseShepThonSource(source: string): ParseResult {
  if (!source || source.trim().length === 0) {
    return {
      app: null,
      diagnostics: [{
        severity: 'error',
        message: 'Source code is empty',
        line: 0,
        column: 0
      }]
    };
  }

  try {
    return parseShepThon(source);
  } catch (error) {
    return {
      app: null,
      diagnostics: [{
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown parse error',
        line: 0,
        column: 0
      }]
    };
  }
}

/**
 * Load ShepThon source and create runtime
 * Replaces any existing runtime (dev-mode singleton)
 * 
 * @param source - ShepThon source code
 * @returns Result with runtime and metadata or error
 */
export function loadShepThon(source: string): ShepThonServiceResult {
  // Parse source
  const parseResult = parseShepThonSource(source);
  
  if (!parseResult.app) {
    const errorMessage = parseResult.diagnostics
      .map((d: any) => `[${d.severity}] ${d.message}`)
      .join('\n') || 'Failed to parse ShepThon source';
    
    return {
      success: false,
      error: errorMessage
    };
  }

  try {
    // Create runtime from AST
    const runtime = new ShepThonRuntime(parseResult.app);
    
    // Extract metadata for UI
    const metadata = extractMetadata(parseResult.app);
    
    // Store as current runtime
    currentRuntime = runtime;
    currentMetadata = metadata;
    
    return {
      success: true,
      runtime,
      metadata
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create ShepThon runtime';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get the current runtime instance
 * Returns null if no runtime loaded
 */
export function getCurrentRuntime(): ShepThonRuntime | null {
  return currentRuntime;
}

/**
 * Get the current app metadata
 * Returns null if no runtime loaded
 */
export function getCurrentMetadata(): AppMetadata | null {
  return currentMetadata;
}

/**
 * Clear the current runtime
 * Stops all jobs and clears singleton
 */
export function clearRuntime(): void {
  if (currentRuntime) {
    try {
      currentRuntime.stopJobs();
    } catch (error) {
      console.warn('[ShepThonService] Error stopping jobs:', error);
    }
    currentRuntime = null;
    currentMetadata = null;
  }
}

/**
 * Check if a runtime is currently loaded
 */
export function hasRuntime(): boolean {
  return currentRuntime !== null;
}

/**
 * Extract metadata from ShepThon AST for UI display
 * 
 * @param app - Parsed ShepThon application AST
 * @returns Metadata for UI rendering
 */
function extractMetadata(app: ShepThonApp): AppMetadata {
  return {
    name: app.name,
    models: app.models.map(extractModelInfo),
    endpoints: app.endpoints.map(extractEndpointInfo),
    jobs: app.jobs.map(extractJobInfo)
  };
}

/**
 * Extract model information
 */
function extractModelInfo(model: ModelDefinition): ModelInfo {
  return {
    name: model.name,
    fieldCount: model.fields.length,
    fields: model.fields.map((field) => ({
      name: field.name,
      type: field.type,
      hasDefault: field.defaultValue !== undefined
    }))
  };
}

/**
 * Extract endpoint information
 */
function extractEndpointInfo(endpoint: EndpointDefinition): EndpointInfo {
  // Format return type
  let returnTypeStr = endpoint.returnType.type;
  if (endpoint.returnType.isArray) {
    returnTypeStr = `[${returnTypeStr}]`;
  }

  return {
    method: endpoint.method,
    path: endpoint.path,
    parameterCount: endpoint.parameters.length,
    parameters: endpoint.parameters.map((param) => ({
      name: param.name,
      type: param.type,
      optional: param.optional || false
    })),
    returnType: returnTypeStr
  };
}

/**
 * Extract job information
 */
function extractJobInfo(job: JobDefinition): JobInfo {
  // Format schedule as human-readable
  const schedule = formatSchedule(job.schedule);

  return {
    name: job.name,
    schedule,
    statementCount: job.body.length
  };
}

/**
 * Format schedule expression as human-readable string
 * 
 * @example
 * { every: 5, unit: 'minutes' } → "every 5 minutes"
 */
function formatSchedule(schedule: { every: number; unit: string }): string {
  return `every ${schedule.every} ${schedule.unit}`;
}
