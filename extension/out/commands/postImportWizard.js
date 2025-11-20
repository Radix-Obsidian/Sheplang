"use strict";
/**
 * Post-Import Wizard
 *
 * After Figma import, shows what we found and asks user for context
 * to generate better ShepLang code.
 *
 * Official VS Code Extension API:
 * - Input Box: https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
 * - Quick Pick: https://code.visualstudio.com/api/references/vscode-api#window.showQuickPick
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
exports.showPostImportWizard = showPostImportWizard;
const vscode = __importStar(require("vscode"));
/**
 * Shows post-import wizard to get user context for better code generation
 */
async function showPostImportWizard(foundElements, onComplete) {
    // Show what we found
    const foundMessage = buildFoundMessage(foundElements);
    const proceed = await vscode.window.showInformationMessage(foundMessage, { modal: true }, 'Continue', 'Skip Wizard');
    if (proceed !== 'Continue') {
        await onComplete(createDefaultContext());
        return;
    }
    // Get app type
    const appType = await askAppType();
    if (!appType) {
        await onComplete(createDefaultContext());
        return;
    }
    // Get entities
    const entities = await askEntities(appType);
    if (!entities) {
        await onComplete(createDefaultContext());
        return;
    }
    // Map buttons to actions
    const buttonMappings = await mapButtonsToActions(foundElements.buttons, appType, entities);
    // Map lists to entities
    const listMappings = await mapListsToEntities(foundElements.lists, entities);
    const context = {
        appType,
        entities,
        buttonMappings,
        listMappings
    };
    await onComplete(context);
}
/**
 * Build message showing what we found in Figma
 */
function buildFoundMessage(elements) {
    let message = `✓ Imported ${elements.screens.length} screens from Figma!\n\n`;
    message += 'We detected:\n';
    if (elements.buttons.length > 0) {
        message += `• ${elements.buttons.length} button${elements.buttons.length > 1 ? 's' : ''}: ${elements.buttons.slice(0, 3).join(', ')}${elements.buttons.length > 3 ? '...' : ''}\n`;
    }
    if (elements.lists > 0) {
        message += `• ${elements.lists} list${elements.lists > 1 ? 's' : ''} (repeated card patterns)\n`;
    }
    message += '\n🤔 Help us generate better code by answering a few questions about your app.';
    return message;
}
/**
 * Ask user what type of app this is
 */
async function askAppType() {
    const appTypes = [
        { label: '📱 Food Delivery', value: 'food-delivery' },
        { label: '🛒 E-commerce', value: 'ecommerce' },
        { label: '📋 Task Manager', value: 'task-manager' },
        { label: '📅 Calendar/Event', value: 'calendar' },
        { label: '💬 Social Media', value: 'social' },
        { label: '📰 News/Blog', value: 'news' },
        { label: '🎯 Other', value: 'other' }
    ];
    const selected = await vscode.window.showQuickPick(appTypes, {
        placeHolder: 'What type of app is this?',
        ignoreFocusOut: true
    });
    return selected?.value || null;
}
/**
 * Ask user what entities their app has
 */
async function askEntities(appType) {
    const suggestedEntities = getSuggestedEntities(appType);
    const entityInput = await vscode.window.showInputBox({
        prompt: 'What entities does your app have?',
        placeHolder: `e.g., ${suggestedEntities.join(', ')}`,
        value: suggestedEntities.join(', '),
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Please enter at least one entity name';
            }
            return null;
        }
    });
    if (!entityInput)
        return null;
    // Parse entities
    const entityNames = entityInput.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    if (entityNames.length === 0)
        return null;
    // For each entity, ask for fields
    const entities = [];
    for (const entityName of entityNames) {
        const fields = await askEntityFields(entityName, appType);
        if (fields) {
            entities.push({ name: entityName, fields });
        }
    }
    return entities.length > 0 ? entities : null;
}
/**
 * Ask user what fields an entity should have
 */
async function askEntityFields(entityName, appType) {
    const suggestedFields = getSuggestedFields(entityName, appType);
    const fieldInput = await vscode.window.showInputBox({
        prompt: `What fields does "${entityName}" have?`,
        placeHolder: `e.g., ${suggestedFields.join(', ')}`,
        value: suggestedFields.join(', '),
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Please enter at least one field';
            }
            return null;
        }
    });
    if (!fieldInput)
        return null;
    // Parse fields
    const fieldNames = fieldInput.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    return fieldNames.map(fieldName => ({
        name: fieldName,
        type: guessFieldType(fieldName)
    }));
}
/**
 * Map buttons to actions
 */
async function mapButtonsToActions(buttonLabels, appType, entities) {
    const mappings = [];
    for (const buttonLabel of buttonLabels) {
        const suggestedAction = suggestActionForButton(buttonLabel, appType, entities);
        const actionInput = await vscode.window.showInputBox({
            prompt: `What should "${buttonLabel}" button do?`,
            placeHolder: `e.g., ${suggestedAction}`,
            value: suggestedAction,
            ignoreFocusOut: true
        });
        if (actionInput && actionInput.trim()) {
            mappings.push({
                buttonLabel,
                actionName: sanitizeActionName(actionInput.trim()),
                description: actionInput.trim()
            });
        }
    }
    return mappings;
}
/**
 * Map lists to entities
 */
async function mapListsToEntities(listCount, entities) {
    if (listCount === 0 || entities.length === 0)
        return [];
    const mappings = [];
    for (let i = 0; i < listCount; i++) {
        const entityOptions = entities.map(e => ({
            label: `${e.name} (fields: ${e.fields.map(f => f.name).join(', ')})`,
            entity: e
        }));
        const selected = await vscode.window.showQuickPick(entityOptions, {
            placeHolder: `What entity does list ${i + 1} display?`,
            ignoreFocusOut: true
        });
        if (selected) {
            mappings.push({
                listIndex: i,
                entityName: selected.entity.name
            });
        }
    }
    return mappings;
}
/**
 * Get suggested entities for app type
 */
function getSuggestedEntities(appType) {
    const suggestions = {
        'food-delivery': ['Restaurant', 'MenuItem', 'Order', 'User'],
        'ecommerce': ['Product', 'Category', 'Cart', 'Order'],
        'task-manager': ['Task', 'Project', 'User'],
        'calendar': ['Event', 'Calendar', 'Reminder'],
        'social': ['Post', 'User', 'Comment', 'Like'],
        'news': ['Article', 'Category', 'Author']
    };
    return suggestions[appType] || ['Item', 'Category'];
}
/**
 * Get suggested fields for entity
 */
function getSuggestedFields(entityName, appType) {
    const suggestions = {
        'food-delivery': {
            'Restaurant': ['name', 'cuisine', 'rating', 'deliveryTime'],
            'MenuItem': ['name', 'price', 'description', 'image'],
            'Order': ['items', 'total', 'status', 'deliveryAddress'],
            'User': ['name', 'email', 'phone', 'address']
        },
        'ecommerce': {
            'Product': ['name', 'price', 'description', 'image', 'category'],
            'Order': ['items', 'total', 'status', 'shippingAddress']
        },
        'task-manager': {
            'Task': ['title', 'description', 'completed', 'dueDate', 'priority']
        }
    };
    return suggestions[appType]?.[entityName] || ['name', 'description'];
}
/**
 * Guess field type from field name
 */
function guessFieldType(fieldName) {
    const name = fieldName.toLowerCase();
    if (name.includes('price') || name.includes('cost') || name.includes('total')) {
        return 'number';
    }
    if (name.includes('date') || name.includes('time')) {
        return 'datetime-local';
    }
    if (name.includes('email')) {
        return 'text'; // email type not supported yet
    }
    if (name.includes('phone')) {
        return 'text'; // tel type not supported yet
    }
    if (name.includes('rating') || name.includes('count')) {
        return 'number';
    }
    return 'text';
}
/**
 * Suggest action for button
 */
function suggestActionForButton(buttonLabel, appType, entities) {
    const label = buttonLabel.toLowerCase();
    if (label.includes('order') || label.includes('buy')) {
        return 'CreateOrder';
    }
    if (label.includes('add') || label.includes('create')) {
        const entity = entities[0]?.name || 'Item';
        return `Create${entity}`;
    }
    if (label.includes('delete') || label.includes('remove')) {
        const entity = entities[0]?.name || 'Item';
        return `Delete${entity}`;
    }
    if (label.includes('view') || label.includes('show')) {
        return 'ViewDetails';
    }
    return `Handle${sanitizeActionName(buttonLabel)}`;
}
/**
 * Sanitize action name
 */
function sanitizeActionName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '');
}
/**
 * Create default context (no wizard)
 */
function createDefaultContext() {
    return {
        appType: 'other',
        entities: [{
                name: 'Item',
                fields: [
                    { name: 'title', type: 'text' },
                    { name: 'description', type: 'text' }
                ]
            }],
        buttonMappings: [],
        listMappings: []
    };
}
//# sourceMappingURL=postImportWizard.js.map