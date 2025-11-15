/**
 * ShepThon Web Worker
 * 
 * Runs ShepThon parser and runtime in background thread.
 * Prevents blocking main UI thread.
 * 
 * Pattern: Monaco Editor Language Server, VS Code
 * Reference: vite-plugin-comlink official examples
 */

import { parseShepThon, ShepThonRuntime } from '@sheplang/shepthon';
import type { ParseResult } from '@sheplang/shepthon';
import type { AppMetadata } from './types';

/**
 * Parse ShepThon source in Web Worker
 * Non-blocking - runs in background thread
 */
export function parseShepThonWorker(source: string): ParseResult {
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
    console.log('[Worker] Starting parse...');
    const result = parseShepThon(source);
    console.log('[Worker] Parse complete:', result.app ? 'success' : 'failed');
    return result;
  } catch (error) {
    console.error('[Worker] Parse error:', error);
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
 * Load ShepThon and extract metadata in Web Worker
 * This is the main function called from the main thread
 */
export function loadShepThonWorker(source: string): {
  success: boolean;
  metadata?: AppMetadata;
  error?: string;
} {
  console.log('[Worker] loadShepThonWorker called');
  const parseResult = parseShepThonWorker(source);

  if (!parseResult.app) {
    const errorMessage = parseResult.diagnostics
      .map((d: any) => `[${d.severity}] ${d.message}`)
      .join('\n') || 'Failed to parse ShepThon source';

    console.error('[Worker] Parse failed:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }

  try {
    console.log('[Worker] Creating runtime...');
    // Create runtime (in worker thread)
    const runtime = new ShepThonRuntime(parseResult.app);
    console.log('[Worker] Runtime created successfully');

    // Extract metadata
    const metadata: AppMetadata = {
      name: parseResult.app.name,
      models: parseResult.app.models.map(m => ({
        name: m.name,
        fieldCount: m.fields.length,
        fields: m.fields.map(f => ({
          name: f.name,
          type: f.type,
          hasDefault: f.defaultValue !== undefined
        }))
      })),
      endpoints: parseResult.app.endpoints.map(e => ({
        method: e.method,
        path: e.path,
        parameterCount: e.parameters.length,
        parameters: e.parameters.map(p => ({
          name: p.name,
          type: p.type,
          optional: p.optional || false
        })),
        returnType: e.returnType.isArray 
          ? `[${e.returnType.type}]`
          : e.returnType.type
      })),
      jobs: parseResult.app.jobs.map(j => ({
        name: j.name,
        schedule: `every ${j.schedule.every} ${j.schedule.unit}`,
        statementCount: j.body.length
      }))
    };

    console.log('[Worker] Metadata extracted:', metadata.name);
    return {
      success: true,
      metadata
    };
  } catch (error) {
    console.error('[Worker] Runtime creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create runtime'
    };
  }
}
