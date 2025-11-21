"use strict";
/**
 * AST Analyzer for Next.js Projects
 *
 * High-level analyzer that combines React and Prisma parsing
 * to extract the app's semantic structure:
 * - Data models (entities)
 * - Views (pages/screens)
 * - Actions (handlers/API routes)
 *
 * Output: Intermediate app model ready for ShepLang generation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProject = analyzeProject;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const reactParser_1 = require("./reactParser");
const prismaParser_1 = require("./prismaParser");
/**
 * Analyze a Next.js, Vite, or React project and extract app model
 */
async function analyzeProject(projectRoot) {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    // Detect framework
    let framework = 'react';
    if ('next' in allDeps)
        framework = 'nextjs';
    else if ('vite' in allDeps)
        framework = 'vite';
    const appModel = {
        appName: inferAppName(projectRoot),
        projectRoot,
        entities: [],
        views: [],
        actions: [],
        todos: []
    };
    // Step 1: Extract entities from Prisma (if available)
    const prismaSchemaPath = (0, prismaParser_1.findPrismaSchema)(projectRoot);
    if (prismaSchemaPath) {
        const prismaSchema = (0, prismaParser_1.parsePrismaSchema)(prismaSchemaPath);
        if (prismaSchema) {
            appModel.entities = extractEntitiesFromPrisma(prismaSchema);
        }
    }
    else {
        appModel.todos.push('No Prisma schema found - entities will need to be defined manually');
    }
    // Step 2: Parse React components based on framework
    let components = [];
    if (framework === 'nextjs') {
        components = (0, reactParser_1.parseReactProject)(projectRoot);
    }
    else if (framework === 'vite' || framework === 'react') {
        components = parseViteReactProject(projectRoot);
    }
    // Step 3: Extract views and actions based on framework
    if (framework === 'nextjs') {
        appModel.views = extractViewsFromNextJSComponents(components, appModel.entities);
        appModel.actions = extractActionsFromComponents(components, appModel.entities);
    }
    else {
        // For Vite/React single-page apps
        appModel.views = extractViewsFromSinglePageComponents(components, appModel.entities);
        appModel.actions = extractActionsFromComponents(components, appModel.entities);
    }
    // Step 4: Infer missing entities from views
    inferMissingEntities(appModel);
    return appModel;
}
/**
 * Infer app name from project root
 */
function inferAppName(projectRoot) {
    const dirName = path.basename(projectRoot);
    // Clean up common suffixes
    let cleaned = dirName
        .replace(/-app$/, '')
        .replace(/-web$/, '')
        .replace(/-frontend$/, '')
        .replace(/-client$/, '');
    // PascalCase
    return cleaned
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}
/**
 * Extract entities from Prisma schema
 */
function extractEntitiesFromPrisma(schema) {
    return schema.models.map(model => ({
        name: model.name,
        source: 'prisma',
        fields: model.fields.map(field => ({
            name: field.name,
            type: field.shepType,
            required: field.required
        }))
    }));
}
/**
 * Extract views from React components
 */
function extractViewsFromComponents(components, entities) {
    const views = [];
    // Only process pages (not regular components)
    const pages = components.filter(c => c.type === 'page');
    for (const page of pages) {
        const view = {
            name: sanitizeViewName(page.name),
            filePath: page.filePath,
            widgets: []
        };
        // Extract widgets from JSX elements
        for (const element of page.elements) {
            if (element.kind === 'list' && element.mapEntityHint) {
                // Match list to entity
                const entity = findEntityByName(element.mapEntityHint, entities);
                view.widgets.push({
                    kind: 'list',
                    entityName: entity?.name || element.mapEntityHint
                });
            }
            else if (element.kind === 'button' && element.text) {
                // Infer action name from button text
                const actionName = inferActionName(element.text);
                view.widgets.push({
                    kind: 'button',
                    label: element.text,
                    actionName
                });
            }
            else if (element.kind === 'form') {
                view.widgets.push({
                    kind: 'form',
                    actionName: 'HandleFormSubmit' // Generic, will be refined in wizard
                });
            }
        }
        views.push(view);
    }
    return views;
}
/**
 * Extract actions from components
 */
function extractActionsFromComponents(components, entities) {
    const actions = [];
    const seenActions = new Set();
    for (const component of components) {
        // Extract from handlers
        for (const handler of component.handlers) {
            if (!seenActions.has(handler.name)) {
                const action = {
                    name: pascalCase(handler.name),
                    source: 'handler',
                    parameters: [], // Will be inferred from API calls
                    apiCalls: [],
                    todos: []
                };
                // Find API calls made by this handler
                const handlerCalls = component.apiCalls.filter(call => call.inHandler === handler.name);
                action.apiCalls = handlerCalls.map(call => ({
                    method: call.method,
                    path: call.path
                }));
                // Infer parameters from API path or method
                if (action.apiCalls.length > 0) {
                    const firstCall = action.apiCalls[0];
                    if (firstCall.method === 'POST' || firstCall.method === 'PUT') {
                        // Infer entity from path
                        const entity = inferEntityFromAPIPath(firstCall.path, entities);
                        if (entity) {
                            action.parameters = entity.fields.map(f => f.name);
                        }
                        else {
                            action.todos.push('TODO: Define parameters for this action');
                        }
                    }
                }
                actions.push(action);
                seenActions.add(handler.name);
            }
        }
        // Extract from API calls (without explicit handlers)
        for (const apiCall of component.apiCalls) {
            if (!apiCall.inHandler) {
                const actionName = inferActionNameFromAPICall(apiCall);
                if (!seenActions.has(actionName)) {
                    actions.push({
                        name: actionName,
                        source: 'api-route',
                        parameters: [],
                        apiCalls: [{
                                method: apiCall.method,
                                path: apiCall.path
                            }],
                        todos: ['TODO: Define parameters and logic for this action']
                    });
                    seenActions.add(actionName);
                }
            }
        }
    }
    return actions;
}
/**
 * Infer missing entities from views (e.g., lists without Prisma models)
 */
function inferMissingEntities(appModel) {
    for (const view of appModel.views) {
        for (const widget of view.widgets) {
            if (widget.kind === 'list' && widget.entityName) {
                const exists = appModel.entities.some(e => e.name === widget.entityName);
                if (!exists) {
                    appModel.entities.push({
                        name: widget.entityName,
                        source: 'inferred',
                        fields: [
                            { name: 'id', type: 'text', required: true },
                            { name: 'name', type: 'text', required: true }
                        ]
                    });
                    appModel.todos.push(`TODO: Define fields for inferred entity "${widget.entityName}"`);
                }
            }
        }
    }
}
/**
 * Find entity by name (fuzzy match)
 */
function findEntityByName(name, entities) {
    // Exact match
    const exact = entities.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (exact)
        return exact;
    // Plural/singular match
    const singular = name.endsWith('s') ? name.slice(0, -1) : name;
    const plural = name.endsWith('s') ? name : name + 's';
    return entities.find(e => e.name.toLowerCase() === singular.toLowerCase() ||
        e.name.toLowerCase() === plural.toLowerCase());
}
/**
 * Sanitize view name (remove 'Page', 'View' suffixes, PascalCase)
 */
function sanitizeViewName(name) {
    let cleaned = name
        .replace(/Page$/, '')
        .replace(/View$/, '')
        .replace(/Component$/, '');
    return pascalCase(cleaned);
}
/**
 * Infer action name from button text
 */
function inferActionName(buttonText) {
    // Common patterns
    const patterns = [
        { regex: /add|create|new/i, prefix: 'Create' },
        { regex: /edit|update|modify/i, prefix: 'Update' },
        { regex: /delete|remove/i, prefix: 'Delete' },
        { regex: /view|show|see/i, prefix: 'View' },
        { regex: /submit|save/i, prefix: 'Submit' },
        { regex: /cancel/i, prefix: 'Cancel' }
    ];
    for (const pattern of patterns) {
        if (pattern.regex.test(buttonText)) {
            return pattern.prefix + 'Entity';
        }
    }
    // Fallback: clean up button text
    return pascalCase(buttonText);
}
/**
 * Infer action name from API call
 */
function inferActionNameFromAPICall(apiCall) {
    const pathParts = apiCall.path.split('/').filter(p => p && !p.startsWith(':'));
    const resource = pathParts[pathParts.length - 1] || 'Item';
    const resourceSingular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    const methodMap = {
        'GET': 'Load',
        'POST': 'Create',
        'PUT': 'Update',
        'PATCH': 'Update',
        'DELETE': 'Delete'
    };
    const verb = methodMap[apiCall.method] || 'Handle';
    return verb + pascalCase(resourceSingular);
}
/**
 * Infer entity from API path
 */
function inferEntityFromAPIPath(apiPath, entities) {
    const pathParts = apiPath.split('/').filter(p => p && !p.startsWith(':'));
    const resource = pathParts[pathParts.length - 1];
    if (!resource)
        return undefined;
    return findEntityByName(resource, entities);
}
/**
 * Parse React components in a Vite project structure
 */
function parseViteReactProject(projectRoot) {
    const components = [];
    // In Vite projects, look in src/ directory
    const srcDir = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) {
        return components;
    }
    function walkSrcDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // Skip common non-component directories
                if (!['node_modules', 'dist', 'build', 'public', 'assets'].includes(file)) {
                    walkSrcDir(filePath);
                }
            }
            else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                try {
                    const component = (0, reactParser_1.parseReactFile)(filePath);
                    if (component) {
                        // Mark main App component as a "page" for single-page apps
                        if (file === 'App.tsx' || file === 'App.jsx') {
                            component.type = 'page';
                        }
                        components.push(component);
                    }
                }
                catch (error) {
                    console.warn(`Failed to parse ${filePath}:`, error);
                }
            }
        }
    }
    walkSrcDir(srcDir);
    return components;
}
/**
 * Extract views from Next.js components (pages)
 */
function extractViewsFromNextJSComponents(components, entities) {
    return extractViewsFromComponents(components, entities);
}
/**
 * Extract views from single-page React components
 */
function extractViewsFromSinglePageComponents(components, entities) {
    const views = [];
    // In single-page apps, the main App component represents the primary view
    const appComponent = components.find(c => c.type === 'page' || c.name === 'App');
    if (appComponent) {
        const view = {
            name: 'MainView', // Default name for single-page apps
            filePath: appComponent.filePath,
            widgets: []
        };
        // Extract widgets from the main component
        for (const element of appComponent.elements) {
            if (element.kind === 'list' && element.mapEntityHint) {
                const entity = findEntityByName(element.mapEntityHint, entities);
                view.widgets.push({
                    kind: 'list',
                    entityName: entity?.name || element.mapEntityHint
                });
            }
            else if (element.kind === 'button' && element.text) {
                const actionName = inferActionName(element.text);
                view.widgets.push({
                    kind: 'button',
                    label: element.text,
                    actionName
                });
            }
            else if (element.kind === 'form') {
                view.widgets.push({
                    kind: 'form',
                    actionName: 'HandleFormSubmit'
                });
            }
        }
        views.push(view);
    }
    return views;
}
/**
 * Convert string to PascalCase
 */
function pascalCase(str) {
    return str
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter(w => w)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}
//# sourceMappingURL=astAnalyzer.js.map