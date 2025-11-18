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
    constructor(app) {
        this.db = {};
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
        console.log(`[DirectRuntime] Available endpoints:`, this.app.endpoints.map(e => `${e.method} ${e.path}`));
        // Find matching endpoint
        const endpoint = this.app.endpoints.find(e => {
            const matches = e.method === method && this.matchPath(e.path, path);
            console.log(`[DirectRuntime] Checking ${e.method} ${e.path} against ${method} ${path}: ${matches}`);
            return matches;
        });
        if (!endpoint) {
            console.error(`[DirectRuntime] ❌ No endpoint found for ${method} ${path}`);
            console.error(`[DirectRuntime] Available: ${this.app.endpoints.map(e => `${e.method} ${e.path}`).join(', ')}`);
            throw new Error(`Endpoint not found: ${method} ${path}`);
        }
        console.log(`[DirectRuntime] ✅ Found endpoint: ${endpoint.method} ${endpoint.path}`);
        // Dynamic model handling based on path
        // Extract model name from path (e.g., /messages -> Message, /todos -> Todo)
        const pathParts = path.split('/').filter(p => p && !p.includes(':'));
        const resourceName = pathParts[0]; // e.g., "messages", "todos", "contacts"
        // Find the model by matching the plural resource name
        const model = this.app.models.find(m => {
            const pluralName = m.name.toLowerCase() + 's';
            return pluralName === resourceName;
        });
        if (!model) {
            console.warn('[DirectRuntime] No model found for resource:', resourceName);
            return { message: 'Endpoint called' };
        }
        const tableName = model.name;
        console.log('[DirectRuntime] Using table:', tableName, 'for resource:', resourceName);
        // GET - return all items
        if (method === 'GET' && pathParts.length === 1) {
            const items = this.db[tableName] || [];
            console.log(`[DirectRuntime] GET ${path} returning ${items.length} items`);
            return items;
        }
        // POST - create new item
        if (method === 'POST' && body) {
            const newId = (this.db[tableName]?.length || 0) + 1;
            const newItem = { id: newId, ...body };
            if (!this.db[tableName])
                this.db[tableName] = [];
            this.db[tableName].push(newItem);
            console.log(`[DirectRuntime] POST ${path} created:`, newItem);
            return newItem;
        }
        // PUT - update item by ID
        if (method === 'PUT') {
            const idStr = pathParts[pathParts.length - 1];
            const id = parseInt(idStr || '0', 10);
            if (!isNaN(id) && this.db[tableName]) {
                const itemIndex = this.db[tableName].findIndex((item) => item.id === id);
                if (itemIndex >= 0) {
                    this.db[tableName][itemIndex] = { ...this.db[tableName][itemIndex], ...body };
                    console.log(`[DirectRuntime] PUT ${path} updated:`, this.db[tableName][itemIndex]);
                    return this.db[tableName][itemIndex];
                }
                else {
                    throw new Error(`${tableName} with id ${id} not found`);
                }
            }
        }
        // DELETE - delete item by ID
        if (method === 'DELETE') {
            const idStr = pathParts[pathParts.length - 1];
            const id = parseInt(idStr || '0', 10);
            if (!isNaN(id) && this.db[tableName]) {
                const beforeLength = this.db[tableName].length;
                this.db[tableName] = this.db[tableName].filter((item) => item.id !== id);
                const afterLength = this.db[tableName].length;
                console.log(`[DirectRuntime] DELETE ${path} removed item ${id}. Count: ${beforeLength} -> ${afterLength}`);
                return { success: true };
            }
        }
        // Default response
        console.warn('[DirectRuntime] Unhandled endpoint:', method, path);
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