/**
 * Bridge Service for Shepyard
 * 
 * Connects ShepLang frontend actions to ShepThon backend endpoints.
 * Provides the integration contract defined in TTD C3.2.
 * 
 * Phase 3: Shepyard-ShepThon Integration
 * Reference: TTD_ShepThon_Core.md C3.2
 * Reference: ShepThon-Usecases/04_frontend-integration.md
 */

import { getCurrentRuntime } from './shepthonService.js';

/**
 * HTTP methods supported by ShepThon
 */
export type HttpMethod = 'GET' | 'POST';

/**
 * Result from calling a ShepThon endpoint
 */
export interface EndpointCallResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Call a ShepThon endpoint
 * This is the main integration point between ShepLang and ShepThon
 * 
 * @param method - HTTP method (GET or POST)
 * @param path - Endpoint path (e.g., "/reminders")
 * @param body - Optional request body for POST requests
 * @returns Promise with result data or error
 * 
 * @example
 * // GET request
 * const reminders = await callShepThonEndpoint('GET', '/reminders');
 * 
 * @example
 * // POST request
 * const reminder = await callShepThonEndpoint('POST', '/reminders', {
 *   text: 'Walk dog',
 *   time: new Date()
 * });
 */
export async function callShepThonEndpoint(
  method: HttpMethod,
  path: string,
  body?: any
): Promise<any> {
  // Get current runtime
  const runtime = getCurrentRuntime();
  
  if (!runtime) {
    throw new Error('No ShepThon backend loaded. Please load a .shepthon file first.');
  }

  try {
    // Log the call (helpful for debugging)
    console.log(`[Bridge] Calling ${method} ${path}`, body ? { body } : '');
    
    // Call endpoint via runtime
    const result = await runtime.callEndpoint(method, path, body);
    
    // Log success
    console.log(`[Bridge] ${method} ${path} → Success`, result);
    
    return result;
  } catch (error) {
    // Extract user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error calling endpoint';
    
    // Log error
    console.error(`[Bridge] ${method} ${path} → Error:`, errorMessage);
    
    // Re-throw with context
    throw new Error(`Backend call failed: ${errorMessage}`);
  }
}

/**
 * Call a ShepThon endpoint with full error handling
 * Returns a result object instead of throwing
 * 
 * @param method - HTTP method
 * @param path - Endpoint path
 * @param body - Optional request body
 * @returns Result object with success flag and data or error
 */
export async function callShepThonEndpointSafe(
  method: HttpMethod,
  path: string,
  body?: any
): Promise<EndpointCallResult> {
  try {
    const data = await callShepThonEndpoint(method, path, body);
    return {
      success: true,
      data
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Check if backend is loaded and ready
 * 
 * @returns true if ShepThon runtime is available
 */
export function hasBackend(): boolean {
  return getCurrentRuntime() !== null;
}

/**
 * Get available endpoints from current backend
 * Returns empty array if no backend loaded
 * 
 * @returns Array of [method, path] tuples
 */
export function getAvailableEndpoints(): Array<[HttpMethod, string]> {
  const runtime = getCurrentRuntime();
  
  if (!runtime) {
    return [];
  }

  try {
    const router = runtime.getRouter();
    return router.getRoutes() as Array<[HttpMethod, string]>;
  } catch (error) {
    console.warn('[Bridge] Error getting endpoints:', error);
    return [];
  }
}

/**
 * Start background jobs
 * 
 * @throws Error if no backend loaded
 */
export function startJobs(): void {
  const runtime = getCurrentRuntime();
  
  if (!runtime) {
    throw new Error('No ShepThon backend loaded');
  }

  runtime.startJobs();
  console.log('[Bridge] Jobs started');
}

/**
 * Stop background jobs
 * 
 * @throws Error if no backend loaded
 */
export function stopJobs(): void {
  const runtime = getCurrentRuntime();
  
  if (!runtime) {
    throw new Error('No ShepThon backend loaded');
  }

  runtime.stopJobs();
  console.log('[Bridge] Jobs stopped');
}

/**
 * Check if jobs are running
 * Returns false if no backend loaded
 */
export function areJobsRunning(): boolean {
  const runtime = getCurrentRuntime();
  
  if (!runtime) {
    return false;
  }

  try {
    const scheduler = runtime.getScheduler();
    const jobNames = scheduler.getJobNames();
    
    // Check if any job is running
    return jobNames.some(name => scheduler.isRunning(name));
  } catch (error) {
    console.warn('[Bridge] Error checking job status:', error);
    return false;
  }
}
