"use strict";
/**
 * Direct ShepThon Parser Implementation
 *
 * This is a simplified direct implementation of the ShepThon parser
 * that works in CommonJS format for VS Code extension compatibility.
 *
 * It replicates the core functionality of @sheplang/shepthon parser
 * but without the ESM compatibility issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShepThonRuntime = void 0;
exports.parseShepThon = parseShepThon;
/**
 * Simple ShepThon parser that just extracts the basic structure
 * This is NOT a full parser, just enough to get the app name and models
 */
function parseShepThon(source) {
    console.log('[DirectParser] Starting direct parse...');
    try {
        // First, attempt to extract app name using regex
        const appNameMatch = source.match(/app\s+(\w+)\s*\{/);
        const appName = appNameMatch ? appNameMatch[1] : 'UnknownApp';
        console.log('[DirectParser] Found app name:', appName);
        // Extract models using regex
        const models = [];
        const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/g;
        let modelMatch;
        while ((modelMatch = modelRegex.exec(source)) !== null) {
            const modelName = modelMatch[1];
            const modelBody = modelMatch[2];
            console.log('[DirectParser] Found model:', modelName);
            // Extract fields
            const fields = [];
            const fieldRegex = /(\w+)\s*:\s*(\w+)/g;
            let fieldMatch;
            while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
                fields.push({
                    name: fieldMatch[1],
                    type: fieldMatch[2]
                });
            }
            models.push({
                name: modelName,
                fields
            });
        }
        // Extract endpoints using regex
        const endpoints = [];
        const endpointRegex = /(GET|POST|PUT|DELETE)\s+"([^"]+)"/g;
        let endpointMatch;
        while ((endpointMatch = endpointRegex.exec(source)) !== null) {
            endpoints.push({
                method: endpointMatch[1],
                path: endpointMatch[2]
            });
        }
        // Extract jobs using regex
        const jobs = [];
        const jobRegex = /job\s+"([^"]+)"\s+every\s+(\d+)\s+(minutes|hours|days)/g;
        let jobMatch;
        while ((jobMatch = jobRegex.exec(source)) !== null) {
            jobs.push({
                name: jobMatch[1],
                schedule: {
                    every: parseInt(jobMatch[2], 10),
                    unit: jobMatch[3]
                }
            });
        }
        console.log('[DirectParser] Parse complete. Found:');
        console.log(`- ${models.length} models`);
        console.log(`- ${endpoints.length} endpoints`);
        console.log(`- ${jobs.length} jobs`);
        const app = {
            name: appName,
            models,
            endpoints,
            jobs
        };
        return {
            app,
            diagnostics: []
        };
    }
    catch (error) {
        console.error('[DirectParser] Parse failed with error:', error);
        return {
            app: null,
            diagnostics: [{
                    severity: 'error',
                    message: `Parse failed: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
/**
 * Very simplified ShepThon runtime for in-memory database
 * This just provides the essential functionality needed for the preview
 */
class ShepThonRuntime {
    app;
    db = {};
    constructor(app) {
        console.log('[DirectRuntime] Creating runtime for app:', app.name);
        this.app = app;
        // Initialize database tables based on models
        app.models.forEach(model => {
            this.db[model.name] = [];
            console.log('[DirectRuntime] Created table:', model.name);
        });
    }
    startJobs() {
        console.log('[DirectRuntime] Starting jobs...');
        // Just log for now - we don't need to actually run the jobs for the preview
    }
    stopJobs() {
        console.log('[DirectRuntime] Stopping jobs...');
    }
    async callEndpoint(method, path, body) {
        console.log(`[DirectRuntime] Calling ${method} ${path}`, body);
        // Find matching endpoint
        const endpoint = this.app.endpoints.find(e => e.method === method && this.matchPath(e.path, path));
        if (!endpoint) {
            throw new Error(`Endpoint not found: ${method} ${path}`);
        }
        // Mock responses based on endpoint
        if (path.includes('/todos')) {
            if (method === 'GET') {
                return this.db.Todo || [];
            }
            else if (method === 'POST' && body) {
                const newId = (this.db.Todo?.length || 0) + 1;
                const newTodo = { id: newId, ...body };
                if (!this.db.Todo)
                    this.db.Todo = [];
                this.db.Todo.push(newTodo);
                return newTodo;
            }
            else if (method === 'PUT') {
                // Extract ID from path like /todos/1
                const pathParts = path.split('/').filter(p => p);
                const idStr = pathParts[pathParts.length - 1];
                const id = parseInt(idStr || '0', 10);
                if (!isNaN(id) && this.db.Todo) {
                    const todoIndex = this.db.Todo.findIndex((t) => t.id === id);
                    if (todoIndex >= 0) {
                        this.db.Todo[todoIndex] = { ...this.db.Todo[todoIndex], ...body };
                        console.log('[DirectRuntime] Updated todo:', this.db.Todo[todoIndex]);
                        return this.db.Todo[todoIndex];
                    }
                    else {
                        throw new Error(`Todo with id ${id} not found`);
                    }
                }
            }
            else if (method === 'DELETE') {
                // Extract ID from path like /todos/1
                const pathParts = path.split('/').filter(p => p);
                const idStr = pathParts[pathParts.length - 1];
                const id = parseInt(idStr || '0', 10);
                if (!isNaN(id) && this.db.Todo) {
                    this.db.Todo = this.db.Todo.filter((t) => t.id !== id);
                    console.log('[DirectRuntime] Deleted todo:', id);
                    return { success: true };
                }
            }
        }
        // Default response for unhandled endpoints
        return { message: 'Endpoint called' };
    }
    matchPath(pattern, actual) {
        // Simple path matching that handles basic patterns like /todos/:id
        const patternParts = pattern.split('/');
        const actualParts = actual.split('/');
        if (patternParts.length !== actualParts.length) {
            return false;
        }
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                // This is a parameter, skip matching
                continue;
            }
            if (patternParts[i] !== actualParts[i]) {
                return false;
            }
        }
        return true;
    }
}
exports.ShepThonRuntime = ShepThonRuntime;
//# sourceMappingURL=direct-parser.js.map