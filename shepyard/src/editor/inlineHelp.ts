/**
 * Inline Help & Autocomplete for ShepLang & ShepThon
 * 
 * Provides contextual help, explanations, and code snippets
 * directly in the Monaco editor.
 */

import type * as Monaco from 'monaco-editor';

// ============================================================================
// KEYWORD DOCUMENTATION
// ============================================================================

interface KeywordDoc {
  name: string;
  description: string;
  explanation: string;
  snippet: string;
  example: string;
  tags: string[];
}

const SHEPLANG_KEYWORDS_DOCS: KeywordDoc[] = [
  {
    name: 'app',
    description: 'Define your application',
    explanation: '💡 **Every ShepLang app starts with this**\n\nThe `app` keyword gives your application a name. It\'s like the title of your project.',
    snippet: 'app ${1:MyApp}',
    example: 'app DogReminders',
    tags: ['app', 'start', 'begin'],
  },
  {
    name: 'data',
    description: 'Define a data structure',
    explanation: '💡 **Store information about things**\n\nData models are like containers for information. Think of them as a form with fields to fill out.',
    snippet: 'data ${1:Item}:\n  fields:\n    ${2:name}: text',
    example: 'data Todo:\n  fields:\n    title: text\n    done: yes/no',
    tags: ['data', 'model', 'structure'],
  },
  {
    name: 'view',
    description: 'Create a screen in your app',
    explanation: '💡 **Views are like pages in your app**\n\nEach view shows information and lets users interact with buttons and lists.',
    snippet: 'view ${1:Home}:\n  show "${2:Welcome}"\n  ${3}',
    example: 'view Dashboard:\n  list Todo\n  button "Add Task" -> CreateTodo',
    tags: ['view', 'screen', 'page', 'ui'],
  },
  {
    name: 'action',
    description: 'Define what happens when users interact',
    explanation: '💡 **Actions make things happen**\n\nWhen a user clicks a button or submits a form, actions run. They can add data, update records, or navigate to other views.',
    snippet: 'action ${1:DoSomething}():\n  ${2}',
    example: 'action CreateTodo(title):\n  add Todo with title, done=false\n  show Dashboard',
    tags: ['action', 'event', 'handler', 'function'],
  },
  {
    name: 'list',
    description: 'Show a list of items',
    explanation: '💡 **Display multiple items**\n\nThe `list` keyword shows all items of a data type. You can filter them with `where`.',
    snippet: 'list ${1:Item}',
    example: 'list Todo\nlist Todo where done = false',
    tags: ['list', 'display', 'show'],
  },
  {
    name: 'button',
    description: 'Add a clickable button',
    explanation: '💡 **Buttons trigger actions**\n\nButtons let users do things. The `->` points to which action should run.',
    snippet: 'button "${1:Label}" -> ${2:Action}',
    example: 'button "Add Task" -> CreateTodo',
    tags: ['button', 'click', 'action'],
  },
  {
    name: 'show',
    description: 'Display text or navigate to a view',
    explanation: '💡 **Show can mean two things**\n\n1. Inside a view: displays text\n2. Inside an action: navigates to a view',
    snippet: 'show ${1}',
    example: 'show "Welcome!"\nshow Dashboard',
    tags: ['show', 'display', 'navigate'],
  },
  {
    name: 'add',
    description: 'Create a new record',
    explanation: '💡 **Add creates new data**\n\nUse `add` to create a new item with specific field values.',
    snippet: 'add ${1:Item} with ${2:field}=${3:value}',
    example: 'add Todo with title="Buy milk", done=false',
    tags: ['add', 'create', 'insert'],
  },
  {
    name: 'update',
    description: 'Modify an existing record',
    explanation: '💡 **Update changes existing data**\n\nUse `update` to change field values of an item you already have.',
    snippet: 'update ${1:item} set ${2:field}=${3:value}',
    example: 'update todo set done=true',
    tags: ['update', 'modify', 'change'],
  },
  {
    name: 'delete',
    description: 'Remove records',
    explanation: '💡 **Delete removes data**\n\nCarefully remove items or entire collections.',
    snippet: 'delete ${1:item}',
    example: 'delete todo\ndelete all Todo',
    tags: ['delete', 'remove'],
  },
  {
    name: 'load',
    description: 'Fetch data from backend',
    explanation: '💡 **Load calls your API**\n\nUse `load` to get data from your backend endpoints.',
    snippet: 'load GET "${1:/path}" into ${2:variable}',
    example: 'load GET "/reminders" into reminders',
    tags: ['load', 'fetch', 'api', 'get'],
  },
  {
    name: 'call',
    description: 'Make an API request',
    explanation: '💡 **Call your backend endpoints**\n\nUse `call` to send data to your backend (POST, PUT, DELETE).',
    snippet: 'call ${1:POST} "${2:/path}"(${3:params})',
    example: 'call POST "/reminders"(text, time)',
    tags: ['call', 'api', 'post', 'request'],
  },
];

const SHEPTHON_KEYWORDS_DOCS: KeywordDoc[] = [
  {
    name: 'app',
    description: 'Define your backend application',
    explanation: '💡 **Start your backend**\n\nThe `app` keyword creates your ShepThon backend with models, endpoints, and jobs.',
    snippet: 'app ${1:MyApp} {\n  ${2}\n}',
    example: 'app DogReminders {\n  model Reminder { ... }\n}',
    tags: ['app', 'backend'],
  },
  {
    name: 'model',
    description: 'Define your database structure',
    explanation: '💡 **Models are your database tables**\n\nDefine what data you want to store with typed fields.',
    snippet: 'model ${1:Item} {\n  id: id\n  ${2:name}: string\n}',
    example: 'model Reminder {\n  id: id\n  text: string\n  time: datetime\n  done: bool\n}',
    tags: ['model', 'database', 'schema'],
  },
  {
    name: 'endpoint',
    description: 'Create an API endpoint',
    explanation: '💡 **Endpoints handle HTTP requests**\n\nDefine routes that your frontend can call to get or send data.\n\nCommon patterns:\n• **GET** - Fetch data\n• **POST** - Create data\n• **PUT** - Update data\n• **DELETE** - Remove data',
    snippet: 'endpoint ${1:GET} "${2:/path}" -> ${3:Type} {\n  ${4}\n}',
    example: 'endpoint GET "/reminders" -> [Reminder] {\n  return db.Reminder.findAll()\n}',
    tags: ['endpoint', 'api', 'route'],
  },
  {
    name: 'GET',
    description: 'Fetch data from database',
    explanation: '💡 **GET retrieves data**\n\nUse GET endpoints to read data without modifying it.',
    snippet: 'endpoint GET "${1:/path}" -> ${2:[Type]} {\n  return ${3}\n}',
    example: 'endpoint GET "/items" -> [Item] {\n  return db.Item.findAll()\n}',
    tags: ['GET', 'fetch', 'read'],
  },
  {
    name: 'POST',
    description: 'Create new data',
    explanation: '💡 **POST creates new records**\n\nAccept parameters and create new database entries.',
    snippet: 'endpoint POST "${1:/path}" (${2:params}) -> ${3:Type} {\n  ${4}\n}',
    example: 'endpoint POST "/items" (name: string) -> Item {\n  return db.Item.create({ name })\n}',
    tags: ['POST', 'create', 'add'],
  },
  {
    name: 'job',
    description: 'Schedule background tasks',
    explanation: '💡 **Jobs run automatically on a schedule**\n\nPerfect for cleanup, notifications, or periodic updates.',
    snippet: 'job "${1:name}" every ${2:1} ${3|minutes,hours,days,weeks|} {\n  ${4}\n}',
    example: 'job "cleanup" every 1 hour {\n  // cleanup logic\n}',
    tags: ['job', 'schedule', 'cron', 'background'],
  },
  {
    name: 'db',
    description: 'Access your database',
    explanation: '💡 **Database operations**\n\nThe `db` object lets you query and modify your data.\n\nMethods:\n• `findAll()` - Get all records\n• `find(id)` - Get one record\n• `create(data)` - Insert new record\n• `update(id, data)` - Modify record\n• `delete(id)` - Remove record',
    snippet: 'db.${1:Model}.${2:findAll}()',
    example: 'db.Reminder.findAll()\ndb.Reminder.create({ text, time })',
    tags: ['db', 'database', 'query'],
  },
];

// ============================================================================
// AUTOCOMPLETE PROVIDER
// ============================================================================

export function registerInlineHelp(monaco: typeof Monaco, language: 'sheplang' | 'shepthon') {
  const keywords = language === 'sheplang' ? SHEPLANG_KEYWORDS_DOCS : SHEPTHON_KEYWORDS_DOCS;

  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = keywords.map(kw => ({
        label: kw.name,
        kind: monaco.languages.CompletionItemKind.Keyword,
        documentation: {
          value: `${kw.explanation}\n\n**Example:**\n\`\`\`${language}\n${kw.example}\n\`\`\``,
          isTrusted: true,
          supportHtml: true,
        },
        insertText: kw.snippet,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail: kw.description,
      }));

      return { suggestions };
    },
  });

  // Register hover provider for contextual help
  monaco.languages.registerHoverProvider(language, {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const keyword = keywords.find(kw => kw.name === word.word);
      if (!keyword) return null;

      return {
        contents: [
          { value: `**${keyword.name}** - ${keyword.description}` },
          { value: keyword.explanation },
          { value: `\n**Example:**\n\`\`\`${language}\n${keyword.example}\n\`\`\`` },
        ],
      };
    },
  });
}

// ============================================================================
// ENDPOINT DISCOVERY FOR FRONTEND-BACKEND BRIDGE
// ============================================================================

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  returnType?: string;
  params?: Array<{ name: string; type: string }>;
}

/**
 * Discover endpoints from ShepThon backend code
 */
export function discoverEndpoints(shepthonCode: string): Endpoint[] {
  const endpoints: Endpoint[] = [];
  
  // Simple regex-based parsing (could be enhanced with proper AST)
  const endpointRegex = /endpoint\s+(GET|POST|PUT|DELETE|PATCH)\s+"([^"]+)"(?:\s*\(([^)]*)\))?\s*->\s*(\[?\w+\]?)/g;
  
  let match;
  while ((match = endpointRegex.exec(shepthonCode)) !== null) {
    const [, method, path, paramsStr, returnType] = match;
    
    const params: Array<{ name: string; type: string }> = [];
    if (paramsStr) {
      const paramPairs = paramsStr.split(',').map(p => p.trim());
      for (const pair of paramPairs) {
        const [name, type] = pair.split(':').map(s => s.trim());
        if (name && type) {
          params.push({ name, type });
        }
      }
    }
    
    endpoints.push({
      method: method as any,
      path,
      returnType: returnType.trim(),
      params,
    });
  }
  
  return endpoints;
}

/**
 * Register autocomplete for API calls based on discovered endpoints
 */
export function registerEndpointCompletions(
  monaco: typeof Monaco,
  language: 'sheplang',
  endpoints: Endpoint[]
) {
  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters: ['"', ' '],
    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Check if we're in a load or call statement
      const isLoad = /load\s+(GET|POST|PUT|DELETE)\s+"?$/.test(textUntilPosition);
      const isCall = /call\s+(GET|POST|PUT|DELETE)\s+"?$/.test(textUntilPosition);
      
      if (!isLoad && !isCall) return { suggestions: [] };

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        endColumn: position.column,
      };

      const suggestions = endpoints.map(ep => {
        const paramsStr = ep.params && ep.params.length > 0
          ? `(${ep.params.map(p => p.name).join(', ')})`
          : '';
        
        return {
          label: `${ep.method} "${ep.path}"`,
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: {
            value: `**${ep.method} ${ep.path}**\n\nReturns: \`${ep.returnType || 'void'}\`${
              ep.params && ep.params.length > 0
                ? `\n\nParameters:\n${ep.params.map(p => `• ${p.name}: ${p.type}`).join('\n')}`
                : ''
            }`,
          },
          insertText: isLoad
            ? `${ep.method} "${ep.path}" into \${1:result}`
            : `${ep.method} "${ep.path}"${paramsStr}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: `→ ${ep.returnType || 'void'}`,
        };
      });

      return { suggestions };
    },
  });
}
