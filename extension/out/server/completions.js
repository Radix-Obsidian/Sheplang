"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletions = getCompletions;
const node_1 = require("vscode-languageserver/node");
function getCompletions(document, position) {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const isShepLang = document.languageId === 'sheplang';
    const isShepThon = document.languageId === 'shepthon';
    if (isShepLang) {
        return getShepLangCompletions(text, offset);
    }
    else if (isShepThon) {
        return getShepThonCompletions(text, offset);
    }
    return [];
}
function getShepLangCompletions(text, offset) {
    const completions = [];
    // Detect context
    const context = detectContext(text, offset);
    // Context-aware suggestions
    if (context === 'fields') {
        // Inside fields block - suggest field types
        return getFieldTypeCompletions();
    }
    else if (context === 'app' || context === 'root') {
        // Top level - suggest data, view, action
        return getTopLevelCompletions();
    }
    else if (context === 'view') {
        // Inside view - suggest widgets and model references
        return getViewWidgetCompletions(text);
    }
    else if (context === 'action') {
        // Inside action - suggest statements and view/model references
        return getActionStatementCompletions(text);
    }
    // Fallback: all keywords
    const keywords = [
        { label: 'app', kind: node_1.CompletionItemKind.Keyword, detail: 'Define application' },
        { label: 'data', kind: node_1.CompletionItemKind.Keyword, detail: 'Define data model' },
        { label: 'view', kind: node_1.CompletionItemKind.Keyword, detail: 'Define UI view' },
        { label: 'action', kind: node_1.CompletionItemKind.Keyword, detail: 'Define action' },
        { label: 'button', kind: node_1.CompletionItemKind.Keyword, detail: 'Add button' },
        { label: 'list', kind: node_1.CompletionItemKind.Keyword, detail: 'Display list' },
        { label: 'show', kind: node_1.CompletionItemKind.Keyword, detail: 'Show text or view' },
        { label: 'call', kind: node_1.CompletionItemKind.Keyword, detail: 'Call backend endpoint' },
        { label: 'load', kind: node_1.CompletionItemKind.Keyword, detail: 'Load data from backend' },
        { label: 'if', kind: node_1.CompletionItemKind.Keyword, detail: 'Conditional' },
        { label: 'else', kind: node_1.CompletionItemKind.Keyword, detail: 'Else branch' },
        { label: 'for', kind: node_1.CompletionItemKind.Keyword, detail: 'Loop' },
        { label: 'in', kind: node_1.CompletionItemKind.Keyword, detail: 'Iterator' },
        { label: 'when', kind: node_1.CompletionItemKind.Keyword, detail: 'Event handler' },
        { label: 'add', kind: node_1.CompletionItemKind.Keyword, detail: 'Add to state' },
        { label: 'set', kind: node_1.CompletionItemKind.Keyword, detail: 'Update state' }
    ];
    completions.push(...keywords);
    // Snippets
    completions.push({
        label: 'model',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'model ${1:Name} {\n  $2\n}',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Create a new model'
    });
    completions.push({
        label: 'view',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'view ${1:Home}:\n  show "${2:Hello}"\n  $3',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Create a new view'
    });
    completions.push({
        label: 'action',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'action ${1:DoSomething}:\n  $2',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Create a new action'
    });
    completions.push({
        label: 'button',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'button "${1:Click Me}" -> ${2:ActionName}',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Add a button'
    });
    return completions;
}
// Helper: Detect context at cursor position
function detectContext(text, offset) {
    const before = text.substring(0, offset);
    const lines = before.split('\n');
    // Check what blocks we're inside
    let inData = false;
    let inFields = false;
    let inView = false;
    let inAction = false;
    let afterApp = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('app ')) {
            afterApp = true;
        }
        else if (trimmed.startsWith('data ')) {
            inData = true;
            inView = false;
            inAction = false;
        }
        else if (trimmed.startsWith('view ')) {
            inView = true;
            inData = false;
            inAction = false;
        }
        else if (trimmed.startsWith('action ')) {
            inAction = true;
            inData = false;
            inView = false;
        }
        else if (trimmed === 'fields:') {
            inFields = true;
        }
    }
    if (inFields)
        return 'fields';
    if (inView)
        return 'view';
    if (inAction)
        return 'action';
    if (afterApp)
        return 'app';
    return 'root';
}
// Helper: Field type completions
function getFieldTypeCompletions() {
    return [
        {
            label: 'text',
            kind: node_1.CompletionItemKind.TypeParameter,
            detail: 'Text field',
            insertText: 'text',
            documentation: 'A text string field'
        },
        {
            label: 'number',
            kind: node_1.CompletionItemKind.TypeParameter,
            detail: 'Number field',
            insertText: 'number',
            documentation: 'A numeric field'
        },
        {
            label: 'yes/no',
            kind: node_1.CompletionItemKind.TypeParameter,
            detail: 'Boolean field',
            insertText: 'yes/no',
            documentation: 'A true/false field'
        },
        {
            label: 'date',
            kind: node_1.CompletionItemKind.TypeParameter,
            detail: 'Date field',
            insertText: 'date',
            documentation: 'A date/time field'
        },
        {
            label: 'email',
            kind: node_1.CompletionItemKind.TypeParameter,
            detail: 'Email field',
            insertText: 'email',
            documentation: 'An email address field'
        },
        {
            label: 'id',
            kind: node_1.CompletionItemKind.TypeParameter,
            detail: 'ID field',
            insertText: 'id',
            documentation: 'A unique identifier field'
        }
    ];
}
// Helper: Top-level completions (after app)
function getTopLevelCompletions() {
    return [
        {
            label: 'data',
            kind: node_1.CompletionItemKind.Snippet,
            insertText: 'data ${1:ModelName}:\n  fields:\n    ${2:fieldName}: ${3:text}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Define a data model',
            documentation: 'Create a new data model with fields'
        },
        {
            label: 'view',
            kind: node_1.CompletionItemKind.Snippet,
            insertText: 'view ${1:ViewName}:\n  ${2:list Todo}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Define a view',
            documentation: 'Create a new UI view'
        },
        {
            label: 'action',
            kind: node_1.CompletionItemKind.Snippet,
            insertText: 'action ${1:ActionName}():\n  ${2:show Dashboard}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Define an action',
            documentation: 'Create a new action'
        }
    ];
}
// Helper: View widget completions
function getViewWidgetCompletions(text) {
    const completions = [
        {
            label: 'list',
            kind: node_1.CompletionItemKind.Snippet,
            insertText: 'list ${1:ModelName}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Display a list',
            documentation: 'Show a list of items from a data model'
        },
        {
            label: 'button',
            kind: node_1.CompletionItemKind.Snippet,
            insertText: 'button "${1:Button Text}" -> ${2:ActionName}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Add a button',
            documentation: 'Add an interactive button'
        },
        {
            label: 'input',
            kind: node_1.CompletionItemKind.Snippet,
            insertText: 'input ${1:fieldName}: ${2:text}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Add an input field',
            documentation: 'Add an input field to the view'
        }
    ];
    // Add existing model names as suggestions
    if (text) {
        const modelNames = extractModelNames(text);
        for (const name of modelNames) {
            completions.push({
                label: name,
                kind: node_1.CompletionItemKind.Class,
                insertText: name,
                detail: 'Data model',
                documentation: `Reference to ${name} data model`
            });
        }
    }
    return completions;
}
// Helper: Action statement completions
function getActionStatementCompletions(text) {
    const completions = [
        {
            label: 'show',
            kind: node_1.CompletionItemKind.Keyword,
            insertText: 'show ${1:ViewName}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Navigate to view',
            documentation: 'Show a view or display text'
        },
        {
            label: 'add',
            kind: node_1.CompletionItemKind.Keyword,
            insertText: 'add ${1:ModelName} with ${2:field}=${3:value}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Add item',
            documentation: 'Add a new item to a data model'
        },
        {
            label: 'call',
            kind: node_1.CompletionItemKind.Keyword,
            insertText: 'call ${1:POST} "${2:/endpoint}"',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Call backend',
            documentation: 'Make an API call to the backend'
        },
        {
            label: 'load',
            kind: node_1.CompletionItemKind.Keyword,
            insertText: 'load ${1:GET} "${2:/endpoint}" into ${3:variable}',
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            detail: 'Load data',
            documentation: 'Load data from backend endpoint'
        }
    ];
    // Add existing view names for "show" command
    if (text) {
        const viewNames = extractViewNames(text);
        for (const name of viewNames) {
            completions.push({
                label: name,
                kind: node_1.CompletionItemKind.Interface,
                insertText: name,
                detail: 'View',
                documentation: `Reference to ${name} view`
            });
        }
        // Add model names for "add" command
        const modelNames = extractModelNames(text);
        for (const name of modelNames) {
            completions.push({
                label: name,
                kind: node_1.CompletionItemKind.Class,
                insertText: name,
                detail: 'Data model',
                documentation: `Reference to ${name} data model`
            });
        }
    }
    return completions;
}
// Helper: Extract model names from document
function extractModelNames(text) {
    const names = [];
    const lines = text.split('\n');
    for (const line of lines) {
        const match = line.trim().match(/^data\s+([A-Za-z_]\w*):/);
        if (match) {
            names.push(match[1]);
        }
    }
    return names;
}
// Helper: Extract view names from document
function extractViewNames(text) {
    const names = [];
    const lines = text.split('\n');
    for (const line of lines) {
        const match = line.trim().match(/^view\s+([A-Za-z_]\w*):/);
        if (match) {
            names.push(match[1]);
        }
    }
    return names;
}
function getShepThonCompletions(text, offset) {
    const completions = [];
    // Keywords
    const keywords = [
        { label: 'app', kind: node_1.CompletionItemKind.Keyword, detail: 'Define application' },
        { label: 'model', kind: node_1.CompletionItemKind.Keyword, detail: 'Define data model' },
        { label: 'endpoint', kind: node_1.CompletionItemKind.Keyword, detail: 'Define API endpoint' },
        { label: 'job', kind: node_1.CompletionItemKind.Keyword, detail: 'Define scheduled job' },
        { label: 'GET', kind: node_1.CompletionItemKind.Keyword, detail: 'GET request' },
        { label: 'POST', kind: node_1.CompletionItemKind.Keyword, detail: 'POST request' },
        { label: 'PUT', kind: node_1.CompletionItemKind.Keyword, detail: 'PUT request' },
        { label: 'DELETE', kind: node_1.CompletionItemKind.Keyword, detail: 'DELETE request' },
        { label: 'let', kind: node_1.CompletionItemKind.Keyword, detail: 'Declare variable' },
        { label: 'return', kind: node_1.CompletionItemKind.Keyword, detail: 'Return value' },
        { label: 'if', kind: node_1.CompletionItemKind.Keyword, detail: 'Conditional' },
        { label: 'else', kind: node_1.CompletionItemKind.Keyword, detail: 'Else branch' },
        { label: 'for', kind: node_1.CompletionItemKind.Keyword, detail: 'Loop' },
        { label: 'in', kind: node_1.CompletionItemKind.Keyword, detail: 'Iterator' },
        { label: 'every', kind: node_1.CompletionItemKind.Keyword, detail: 'Schedule interval' }
    ];
    completions.push(...keywords);
    // Database operations
    const dbOps = [
        { label: 'db', kind: node_1.CompletionItemKind.Variable, detail: 'Database access' },
        { label: 'find', kind: node_1.CompletionItemKind.Method, detail: 'Find one record' },
        { label: 'findAll', kind: node_1.CompletionItemKind.Method, detail: 'Find all records' },
        { label: 'create', kind: node_1.CompletionItemKind.Method, detail: 'Create new record' },
        { label: 'update', kind: node_1.CompletionItemKind.Method, detail: 'Update record' },
        { label: 'delete', kind: node_1.CompletionItemKind.Method, detail: 'Delete record' }
    ];
    completions.push(...dbOps);
    // Snippets
    completions.push({
        label: 'endpoint-get',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'endpoint GET "${1:/path}" -> ${2:[Model]} {\n  return db.${3:Model}.findAll()\n}',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Create GET endpoint'
    });
    completions.push({
        label: 'endpoint-post',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'endpoint POST "${1:/path}" (${2:param}: ${3:string}) -> ${4:Model} {\n  let item = db.${4:Model}.create({ ${2:param} })\n  return item\n}',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Create POST endpoint'
    });
    completions.push({
        label: 'job',
        kind: node_1.CompletionItemKind.Snippet,
        insertText: 'job "${1:task-name}" every ${2:5} ${3|minutes,hours,days|} {\n  $4\n}',
        insertTextFormat: node_1.InsertTextFormat.Snippet,
        documentation: 'Create scheduled job'
    });
    return completions;
}
//# sourceMappingURL=completions.js.map