"use strict";
/**
 * ShepLang Generator
 *
 * Converts intermediate app model to ShepLang code (.shep files)
 *
 * Takes the analyzed app structure (entities, views, actions)
 * and generates clean, readable ShepLang code with TODOs where needed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShepLangFiles = generateShepLangFiles;
exports.generateImportReport = generateImportReport;
/**
 * Generate ShepLang files from app model
 */
function generateShepLangFiles(appModel) {
    const files = [];
    // For v1, generate a single .shep file
    const content = generateMainShepFile(appModel);
    files.push({
        fileName: `${appModel.appName}.shep`,
        content
    });
    return files;
}
/**
 * Generate main .shep file content
 */
function generateMainShepFile(appModel) {
    let output = '';
    // Header comment
    output += `// ${appModel.appName}\n`;
    output += `// Generated from Next.js project: ${appModel.projectRoot}\n`;
    output += `// \n`;
    output += `// This is a generated ShepLang scaffold. Review and customize:\n`;
    output += `// - Fill in TODO comments with your business logic\n`;
    output += `// - Refine entity fields as needed\n`;
    output += `// - Add validation rules\n`;
    output += `// - Customize view layouts\n`;
    output += `\n`;
    // App declaration
    output += `app ${appModel.appName} {\n\n`;
    // High-level TODOs
    if (appModel.todos && appModel.todos.length > 0) {
        output += `// TODOs from import:\n`;
        for (const todo of appModel.todos || []) {
            output += `// - ${todo}\n`;
        }
        output += `\n`;
    }
    // Data blocks
    if (appModel.entities.length > 0) {
        output += `// ========================================\n`;
        output += `// Data Models\n`;
        output += `// ========================================\n\n`;
        for (const entity of appModel.entities) {
            output += generateDataBlock(entity);
            output += `\n`;
        }
    }
    // View blocks
    output += `// ========================================\n`;
    output += `// Views (Screens)\n`;
    output += `// ========================================\n\n`;
    // Ensure we have at least one view
    const views = appModel.views.length > 0 ? appModel.views : [createDefaultView(appModel)];
    // Auto-create Dashboard view if actions reference it
    const needsDashboard = appModel.actions.some(a => a.apiCalls.length === 0);
    if (needsDashboard && !views.find(v => v.name === 'Dashboard')) {
        views.push(createDashboardView(appModel));
    }
    for (const view of views) {
        output += generateViewBlock(view, appModel.entities);
        output += `\n`;
    }
    // Action blocks
    if (appModel.actions.length > 0) {
        output += `// ========================================\n`;
        output += `// Actions (Business Logic)\n`;
        output += `// ========================================\n\n`;
        for (const action of appModel.actions) {
            output += generateActionBlock(action, appModel.entities);
            output += `\n`;
        }
    }
    // Footer
    output += `// ========================================\n`;
    output += `// End of ${appModel.appName}\n`;
    output += `// ========================================\n`;
    output += `}\n`;
    return output;
}
/**
 * Generate data block for an entity
 */
function generateDataBlock(entity) {
    let output = '';
    // Source comment
    if (entity.source === 'prisma') {
        output += `// From Prisma model\n`;
    }
    else if (entity.source === 'user-input') {
        output += `// You told us to track this ✓\n`;
    }
    else {
        output += `// Inferred from views\n`;
    }
    // Updated to use braces syntax
    output += `data ${entity.name} {\n`;
    output += `  fields: {\n`;
    // Fields
    for (const field of entity.fields) {
        const requiredComment = field.required ? '' : ' // optional';
        output += `    ${field.name}: ${field.type}${requiredComment}\n`;
    }
    output += `  }\n`;
    // Add TODO if entity was inferred or user-provided
    if (entity.source === 'inferred') {
        output += `  // TODO: Add more fields as needed\n`;
    }
    else if (entity.source === 'user-input') {
        output += `  // TODO: Add the specific fields you need for ${entity.name}\n`;
    }
    output += `}\n`;
    return output;
}
/**
 * Generate view block
 */
function generateViewBlock(view, entities) {
    let output = '';
    // Source comment
    output += `// From: ${view.filePath}\n`;
    output += `view ${view.name} {\n`;
    // Widgets
    if (!view.widgets || view.widgets.length === 0) {
        output += `  // TODO: Add widgets for this view\n`;
        output += `  // Example: list EntityName\n`;
        output += `  // Example: button "Click me" -> HandleAction\n`;
    }
    else {
        for (const widget of view.widgets || []) {
            if (widget.kind === 'list') {
                output += `  list ${widget.entityName}\n`;
            }
            else if (widget.kind === 'button') {
                const label = widget.label || 'Click';
                const action = widget.actionName || 'HandleAction';
                output += `  button "${label}" -> ${action}\n`;
            }
            else if (widget.kind === 'form') {
                const action = widget.actionName || 'HandleSubmit';
                output += `  // TODO: Define form inputs\n`;
                output += `  // form for ${action}\n`;
            }
        }
    }
    output += `}\n`;
    return output;
}
/**
 * Generate action block
 */
function generateActionBlock(action, entities) {
    let output = '';
    // Source comment
    output += `// Source: ${action.source}\n`;
    // Parameters
    const params = action.parameters && action.parameters.length > 0
        ? action.parameters.join(', ')
        : 'params';
    output += `action ${action.name}(${params}) {\n`;
    // Action TODOs
    if (action.todos && action.todos.length > 0) {
        for (const todo of action.todos || []) {
            output += `  // ${todo}\n`;
        }
    }
    // API calls
    if (action.apiCalls.length > 0) {
        for (const apiCall of action.apiCalls) {
            if (apiCall.method === 'GET') {
                // Load data
                const variable = inferVariableFromPath(apiCall.path || '');
                output += `  load ${apiCall.method} "${apiCall.path || ''}" into ${variable}\n`;
            }
            else {
                // Mutate data
                const fields = action.parameters && action.parameters.length > 0
                    ? ` with ${action.parameters.join(', ')}`
                    : '';
                output += `  call ${apiCall.method} "${apiCall.path || ''}"${fields}\n`;
                // Reload after mutation
                const reloadPath = getReloadPath(apiCall.path || '');
                const reloadVar = inferVariableFromPath(reloadPath);
                output += `  load GET "${reloadPath}" into ${reloadVar}\n`;
            }
        }
        // Navigate to view
        const targetView = inferTargetView(action.name, entities);
        output += `  show ${targetView}\n`;
    }
    else {
        output += `  // TODO: Implement action logic\n`;
        output += `  show Dashboard\n`;
    }
    output += `}\n`;
    return output;
}
/**
 * Infer variable name from API path
 * Example: "/api/restaurants" -> "restaurants"
 */
function inferVariableFromPath(path) {
    const parts = path.split('/').filter(p => p && !p.startsWith(':'));
    const resource = parts[parts.length - 1] || 'items';
    return resource.toLowerCase();
}
/**
 * Get reload path after mutation
 * Example: POST "/api/restaurants" -> GET "/api/restaurants"
 */
function getReloadPath(path) {
    // Remove ID parameters
    return path.replace(/\/:[^/]+/g, '');
}
/**
 * Infer target view after action
 */
function inferTargetView(actionName, entities) {
    // Try to extract entity name from action
    for (const entity of entities) {
        if (actionName.includes(entity.name)) {
            return `${entity.name}List`;
        }
    }
    // Common patterns
    if (actionName.includes('Create') || actionName.includes('Add')) {
        return 'Dashboard';
    }
    else if (actionName.includes('Delete') || actionName.includes('Remove')) {
        return 'Dashboard';
    }
    else if (actionName.includes('Update') || actionName.includes('Edit')) {
        return 'Dashboard';
    }
    return 'Dashboard';
}
/**
 * Create default view for apps with no detected views
 */
function createDefaultView(appModel) {
    return {
        name: 'MainView',
        filePath: '',
        elements: [],
        widgets: []
    };
}
/**
 * Create Dashboard view (common pattern for app builders)
 */
function createDashboardView(appModel) {
    const widgets = [];
    // Add list widget for each entity
    for (const entity of appModel.entities) {
        widgets.push({
            kind: 'list',
            entityName: entity.name
        });
    }
    return {
        name: 'Dashboard',
        filePath: appModel.projectRoot,
        elements: [],
        widgets
    };
}
/**
 * Generate import report (markdown summary)
 */
function generateImportReport(appModel, files) {
    let report = '';
    report += `# Import Report: ${appModel.appName}\n\n`;
    report += `**Project:** ${appModel.projectRoot}\n\n`;
    // Summary
    report += `## Summary\n\n`;
    report += `- **Entities:** ${appModel.entities.length}\n`;
    report += `- **Views:** ${appModel.views.length}\n`;
    report += `- **Actions:** ${appModel.actions.length}\n`;
    report += `- **Generated Files:** ${files.length}\n\n`;
    // Entities
    if (appModel.entities.length > 0) {
        report += `## Entities\n\n`;
        for (const entity of appModel.entities) {
            const source = entity.source === 'prisma' ? '(from Prisma)' : '(inferred)';
            report += `- **${entity.name}** ${source} - ${entity.fields.length} fields\n`;
        }
        report += `\n`;
    }
    // Views
    if (appModel.views.length > 0) {
        report += `## Views\n\n`;
        for (const view of appModel.views) {
            report += `- **${view.name}** - ${view.widgets?.length || 0} widgets\n`;
        }
        report += `\n`;
    }
    // Actions
    if (appModel.actions.length > 0) {
        report += `## Actions\n\n`;
        for (const action of appModel.actions) {
            report += `- **${action.name}** - ${action.apiCalls.length} API calls\n`;
        }
        report += `\n`;
    }
    // TODOs
    if (appModel.todos && appModel.todos.length > 0) {
        report += `## TODOs\n\n`;
        for (const todo of appModel.todos || []) {
            report += `- ${todo}\n`;
        }
        report += `\n`;
    }
    // Next steps
    report += `## Next Steps\n\n`;
    report += `1. Review the generated \`.shep\` file: \`${files[0].fileName}\`\n`;
    report += `2. Fill in TODO comments with your business logic\n`;
    report += `3. Refine entity fields and add validation rules\n`;
    report += `4. Customize view layouts and widgets\n`;
    report += `5. Test your app with \`sheplang dev\`\n`;
    return report;
}
//# sourceMappingURL=shepGenerator.js.map