/**
 * Intelligent IntelliSense
 * 
 * Context-aware autocomplete for ShepLang
 * Battle-tested pattern from TypeScript Language Server
 */

import * as vscode from 'vscode';

export function registerIntelliSense(context: vscode.ExtensionContext): void {
  // Register completion provider for .shep files
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'sheplang' },
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const currentWord = getCurrentWord(document, position);
        
        return getContextAwareCompletions(document, position, linePrefix, currentWord);
      }
    },
    ' ', ':', '\n' // Trigger characters
  );

  // Register hover provider
  const hoverProvider = vscode.languages.registerHoverProvider(
    { scheme: 'file', language: 'sheplang' },
    {
      provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const word = document.getText(document.getWordRangeAtPosition(position));
        return getHoverInformation(word, document, position);
      }
    }
  );

  context.subscriptions.push(completionProvider, hoverProvider);
}

/**
 * Get context-aware completions based on cursor position
 */
function getContextAwareCompletions(
  document: vscode.TextDocument,
  position: vscode.Position,
  linePrefix: string,
  currentWord: string
): vscode.CompletionItem[] {
  const completions: vscode.CompletionItem[] = [];

  // Context 1: After "data " - suggest entity template
  if (linePrefix.match(/data\s+\w*$/)) {
    const item = new vscode.CompletionItem('EntityName', vscode.CompletionItemKind.Struct);
    item.insertText = new vscode.SnippetString(
      '${1:EntityName}:\n  fields:\n    ${2:id}: text\n    ${3:name}: text\n    $0'
    );
    item.documentation = new vscode.MarkdownString(
      '**Create a data model**\n\nDefines the structure of your data with fields.'
    );
    item.detail = '✨ Entity template';
    completions.push(item);
  }

  // Context 2: After "fields:" - suggest field types
  if (linePrefix.match(/fields:\s*$/) || linePrefix.match(/^\s+\w+:\s*$/)) {
    const fieldTypes = [
      {
        label: 'text',
        detail: 'Text/String field',
        documentation: 'Stores any text like names, descriptions, or IDs.\n\nExample: `name: text`'
      },
      {
        label: 'number',
        detail: 'Numeric field',
        documentation: 'Stores whole or decimal numbers like age, price, or quantity.\n\nExample: `age: number`'
      },
      {
        label: 'yes/no',
        detail: 'Boolean field',
        documentation: 'Stores true/false values like active status or flags.\n\nExample: `isActive: yes/no`'
      },
      {
        label: 'date',
        detail: 'Date field',
        documentation: 'Stores dates like birthdays or deadlines.\n\nExample: `birthday: date`'
      },
      {
        label: 'time',
        detail: 'Time/DateTime field',
        documentation: 'Stores times or timestamps like appointments.\n\nExample: `createdAt: time`'
      }
    ];

    fieldTypes.forEach(type => {
      const item = new vscode.CompletionItem(type.label, vscode.CompletionItemKind.TypeParameter);
      item.detail = type.detail;
      item.documentation = new vscode.MarkdownString(type.documentation);
      completions.push(item);
    });
  }

  // Context 3: After "view " - suggest view template
  if (linePrefix.match(/view\s+\w*$/)) {
    const item = new vscode.CompletionItem('ViewName', vscode.CompletionItemKind.Interface);
    item.insertText = new vscode.SnippetString(
      '${1:Dashboard}:\n  list ${2:Entity}\n  button "${3:New Item}" -> ${4:CreateAction}\n  $0'
    );
    item.documentation = new vscode.MarkdownString(
      '**Create a screen/page**\n\nDefines what users see and interact with.'
    );
    item.detail = '✨ View template';
    completions.push(item);
  }

  // Context 4: Inside view - suggest widgets
  if (isInsideBlock(document, position, 'view')) {
    const widgets = [
      {
        label: 'list',
        snippet: 'list ${1:EntityName}',
        detail: 'Show a list of items',
        documentation: 'Displays all items from an entity.\n\nExample: `list Users`'
      },
      {
        label: 'button',
        snippet: 'button "${1:Click me}" -> ${2:ActionName}',
        detail: 'Add a clickable button',
        documentation: 'Creates a button that triggers an action.\n\nExample: `button "New User" -> CreateUser`'
      },
      {
        label: 'form',
        snippet: 'form for ${1:EntityName}',
        detail: 'Add an input form',
        documentation: 'Creates a form with fields from an entity.\n\nExample: `form for User`'
      }
    ];

    widgets.forEach(widget => {
      const item = new vscode.CompletionItem(widget.label, vscode.CompletionItemKind.Keyword);
      item.insertText = new vscode.SnippetString(widget.snippet);
      item.detail = widget.detail;
      item.documentation = new vscode.MarkdownString(widget.documentation);
      completions.push(item);
    });
  }

  // Context 5: After "action " - suggest action template
  if (linePrefix.match(/action\s+\w*$/)) {
    const item = new vscode.CompletionItem('ActionName', vscode.CompletionItemKind.Function);
    item.insertText = new vscode.SnippetString(
      '${1:CreateItem}(${2:name}):\n  add ${3:Entity} with ${2:name}\n  show ${4:Dashboard}\n  $0'
    );
    item.documentation = new vscode.MarkdownString(
      '**Create an action**\n\nDefines what happens when users interact with your app.'
    );
    item.detail = '✨ Action template';
    completions.push(item);
  }

  // Context 6: Inside action - suggest action operations
  if (isInsideBlock(document, position, 'action')) {
    const operations = [
      {
        label: 'add',
        snippet: 'add ${1:Entity} with ${2:field1}, ${3:field2}',
        detail: 'Create a new item',
        documentation: 'Adds a new item to your data.\n\nExample: `add User with name, email`'
      },
      {
        label: 'show',
        snippet: 'show ${1:ViewName}',
        detail: 'Navigate to a screen',
        documentation: 'Shows a different screen to the user.\n\nExample: `show Dashboard`'
      },
      {
        label: 'call',
        snippet: 'call ${1|POST,GET,PUT,DELETE|} "${2:/endpoint}" with ${3:data}',
        detail: 'Call API endpoint',
        documentation: 'Makes a backend API call.\n\nExample: `call POST "/users" with name, email`'
      },
      {
        label: 'load',
        snippet: 'load GET "${1:/endpoint}" into ${2:variable}',
        detail: 'Load data from API',
        documentation: 'Fetches data from backend.\n\nExample: `load GET "/users" into users`'
      }
    ];

    operations.forEach(op => {
      const item = new vscode.CompletionItem(op.label, vscode.CompletionItemKind.Method);
      item.insertText = new vscode.SnippetString(op.snippet);
      item.detail = op.detail;
      item.documentation = new vscode.MarkdownString(op.documentation);
      completions.push(item);
    });
  }

  // Context 7: After "app " - suggest app name
  if (linePrefix.match(/^app\s+\w*$/)) {
    const item = new vscode.CompletionItem('MyApp', vscode.CompletionItemKind.Module);
    item.insertText = new vscode.SnippetString('${1:MyApp}\n\n$0');
    item.documentation = new vscode.MarkdownString(
      '**Name your application**\n\nThis is the first line of every ShepLang file.'
    );
    item.detail = '✨ App declaration';
    completions.push(item);
  }

  return completions;
}

/**
 * Get hover information for word under cursor
 */
function getHoverInformation(
  word: string,
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Hover | null {
  const docs: Record<string, string> = {
    'data': `
**data** - Define a data model

Creates a reusable data structure with fields.

\`\`\`sheplang
data User:
  fields:
    name: text
    email: text
    age: number
\`\`\`
`,
    'view': `
**view** - Define a screen/page

Creates a user interface that displays data and buttons.

\`\`\`sheplang
view Dashboard:
  list Users
  button "Add User" -> CreateUser
\`\`\`
`,
    'action': `
**action** - Define user interaction

Creates behavior that happens when users click buttons.

\`\`\`sheplang
action CreateUser(name, email):
  add User with name, email
  show Dashboard
\`\`\`
`,
    'list': `
**list** - Display items

Shows all items from a data type in a view.

\`\`\`sheplang
list Users
\`\`\`
`,
    'button': `
**button** - Add clickable button

Creates a button that triggers an action.

\`\`\`sheplang
button "Click me" -> MyAction
\`\`\`
`,
    'add': `
**add** - Create new item

Adds a new item to your data.

\`\`\`sheplang
add User with name, email
\`\`\`
`,
    'show': `
**show** - Navigate to screen

Displays a different view to the user.

\`\`\`sheplang
show Dashboard
\`\`\`
`,
    'call': `
**call** - Make API request

Sends data to your backend.

\`\`\`sheplang
call POST "/users" with name, email
\`\`\`
`,
    'load': `
**load** - Fetch data from API

Gets data from your backend.

\`\`\`sheplang
load GET "/users" into users
\`\`\`
`,
    'text': '**text** - Stores any string of characters (names, descriptions, IDs)',
    'number': '**number** - Stores numeric values (age, price, quantity)',
    'yes/no': '**yes/no** - Stores true/false values (active status, flags)',
    'date': '**date** - Stores calendar dates (birthdays, deadlines)',
    'time': '**time** - Stores timestamps (created at, updated at)'
  };

  if (docs[word]) {
    return new vscode.Hover(new vscode.MarkdownString(docs[word]));
  }

  return null;
}

/**
 * Check if position is inside a specific block type
 */
function isInsideBlock(
  document: vscode.TextDocument,
  position: vscode.Position,
  blockType: string
): boolean {
  for (let i = position.line; i >= 0; i--) {
    const line = document.lineAt(i).text;
    
    // Found the block declaration
    if (line.match(new RegExp(`^${blockType}\\s+\\w+:`))) {
      return true;
    }
    
    // Found another top-level block
    if (line.match(/^(data|view|action)\s+\w+:/)) {
      return false;
    }
  }
  
  return false;
}

/**
 * Get current word being typed
 */
function getCurrentWord(document: vscode.TextDocument, position: vscode.Position): string {
  const range = document.getWordRangeAtPosition(position);
  return range ? document.getText(range) : '';
}
