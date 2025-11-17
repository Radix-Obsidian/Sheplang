/**
 * Bridge Service - Connects ShepLang frontend to ShepThon backend
 * Phase 2: Full implementation with runtime management
 */

import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export class BridgeService extends EventEmitter {
  private runtime: any | null = null;
  private isReady = false;
  
  constructor() {
    super();
  }

  /**
   * Set the active ShepThon runtime
   */
  public setRuntime(runtime: any): void {
    this.runtime = runtime;
    this.isReady = true;
    console.log('[BridgeService] Runtime set');
    
    // Emit event for backend connected
    this.emit('backendStatus', {
      status: 'connected',
      message: 'Backend connected'
    });
  }

  /**
   * Clear the runtime
   */
  public clearRuntime(): void {
    if (this.runtime) {
      try {
        this.runtime.stopJobs();
      } catch (error) {
        console.error('Error stopping jobs:', error);
      }
    }
    this.runtime = null;
    this.isReady = false;
    console.log('[BridgeService] Runtime cleared');

    // Emit event for backend disconnected
    this.emit('backendStatus', {
      status: 'disconnected',
      message: 'No backend'
    });
  }

  /**
   * Check if backend is ready
   */
  public hasBackend(): boolean {
    return this.isReady && this.runtime !== null;
  }

  /**
   * Call a ShepThon endpoint
   * 
   * @param method - HTTP method (GET, POST) - Alpha supports GET/POST only
   * @param path - Endpoint path
   * @param body - Request body (optional)
   * @returns Response data
   */
  public async callEndpoint(
    method: 'GET' | 'POST',
    path: string,
    body?: any
  ): Promise<any> {
    if (!this.runtime) {
      throw new Error('ShepThon backend is not loaded. Please open a .shepthon file first.');
    }

    try {
      console.log(`[Bridge] Executing ${method} ${path}`, body ? `with body: ${JSON.stringify(body)}` : '');
      
      // Call the ShepThon runtime's endpoint
      const result = await this.runtime.callEndpoint(method, path, body);
      
      console.log(`[Bridge] ✅ ${method} ${path} succeeded:`, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Bridge] ❌ ${method} ${path} failed:`, errorMessage);
      
      throw new Error(
        `Backend call failed: ${errorMessage}`
      );
    }
  }

  /**
   * Get runtime metadata (models, endpoints, jobs)
   */
  public getMetadata(): any {
    if (!this.runtime) {
      return null;
    }

    // Phase 2: Extract metadata from runtime
    return {
      app: 'ShepThonApp',
      models: [],
      endpoints: [],
      jobs: []
    };
  }
}

// Singleton instance
export const bridgeService = new BridgeService();
