"use strict";
/**
 * Bridge Service - Connects ShepLang frontend to ShepThon backend
 * Phase 2: Full implementation with runtime management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeService = exports.BridgeService = void 0;
const events_1 = require("events");
class BridgeService extends events_1.EventEmitter {
    runtime = null;
    isReady = false;
    constructor() {
        super();
    }
    /**
     * Set the active ShepThon runtime
     */
    setRuntime(runtime) {
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
    clearRuntime() {
        if (this.runtime) {
            try {
                this.runtime.stopJobs();
            }
            catch (error) {
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
    hasBackend() {
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
    async callEndpoint(method, path, body) {
        if (!this.runtime) {
            throw new Error('ShepThon backend is not loaded. Please open a .shepthon file first.');
        }
        try {
            console.log(`[Bridge] Executing ${method} ${path}`, body ? `with body: ${JSON.stringify(body)}` : '');
            // Call the ShepThon runtime's endpoint
            const result = await this.runtime.callEndpoint(method, path, body);
            console.log(`[Bridge] ✅ ${method} ${path} succeeded:`, result);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Bridge] ❌ ${method} ${path} failed:`, errorMessage);
            throw new Error(`Backend call failed: ${errorMessage}`);
        }
    }
    /**
     * Get runtime metadata (models, endpoints, jobs)
     */
    getMetadata() {
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
exports.BridgeService = BridgeService;
// Singleton instance
exports.bridgeService = new BridgeService();
//# sourceMappingURL=bridgeService.js.map