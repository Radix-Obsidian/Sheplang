import * as monaco from 'monaco-editor';

/**
 * Monaco Editor wrapper for ShepLang Sandbox Alpha
 * Provides syntax highlighting, keyboard shortcuts, and editor configuration
 */

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

// ShepLang language configuration
const SHEPLANG_CONFIG: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

// ShepLang syntax highlighting
const SHEPLANG_TOKENS: monaco.languages.IMonarchLanguage = {
  keywords: [
    'app',
    'data',
    'view',
    'action',
    'route',
    'component',
  ],
  
  controlKeywords: [
    'fields',
    'rules',
    'list',
    'buttons',
    'ops',
    'if',
    'else',
    'show',
    'add',
    'update',
    'delete',
    'can',
    'user',
    'admin',
  ],
  
  typeKeywords: [
    'text',
    'number',
    'boolean',
    'date',
    'email',
  ],
  
  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '==',
    '<=',
    '>=',
    '!=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '^',
    '%',
    '<<',
    '>>',
    '>>>',
    '+=',
    '-=',
    '*=',
    '/=',
    '&=',
    '|=',
    '^=',
    '%=',
    '<<=',
    '>>=',
    '>>>=',
  ],
  
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  
  tokenizer: {
    root: [
      // Keywords
      [/\b(app|data|view|action|route|component)\b/, 'keyword'],
      [/\b(fields|rules|list|buttons|ops|if|else|show|add|update|delete|can|user|admin)\b/, 'keyword.control'],
      [/\b(text|number|boolean|date|email)\b/, 'type'],
      
      // Identifiers
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@controlKeywords': 'keyword.control',
          '@typeKeywords': 'type',
          '@default': 'identifier',
        },
      }],
      
      // Whitespace
      { include: '@whitespace' },
      
      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': '',
        },
      }],
      
      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],
      
      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],
    ],
    
    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
    
    comment: [
      [/[^\/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],
    
    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop'],
    ],
    
    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop'],
    ],
  },
};

export interface EditorOptions {
  container: HTMLElement;
  initialValue?: string;
  onChange?: (value: string) => void;
  onRun?: () => void;
  onSave?: () => void;
}

/**
 * Initialize Monaco editor with ShepLang syntax highlighting
 */
export function createEditor(options: EditorOptions): monaco.editor.IStandaloneCodeEditor {
  const { container, initialValue = '', onChange, onRun, onSave } = options;
  
  // Register ShepLang language
  monaco.languages.register({ id: 'sheplang' });
  monaco.languages.setLanguageConfiguration('sheplang', SHEPLANG_CONFIG);
  monaco.languages.setMonarchTokensProvider('sheplang', SHEPLANG_TOKENS);
  
  // Create editor instance
  editorInstance = monaco.editor.create(container, {
    value: initialValue,
    language: 'sheplang',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'off',
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'none',
    folding: true,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    roundedSelection: false,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  });
  
  // Keyboard shortcuts
  editorInstance.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    () => {
      if (onRun) {
        onRun();
      }
    }
  );
  
  editorInstance.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
    () => {
      if (onSave) {
        onSave();
      }
    }
  );
  
  // Listen for content changes
  if (onChange) {
    editorInstance.onDidChangeModelContent(() => {
      onChange(editorInstance?.getValue() ?? '');
    });
  }
  
  return editorInstance;
}

/**
 * Get editor value
 */
export function getEditorValue(): string {
  return editorInstance?.getValue() ?? '';
}

/**
 * Set editor value
 */
export function setEditorValue(value: string): void {
  if (editorInstance) {
    editorInstance.setValue(value);
  }
}

/**
 * Dispose editor instance
 */
export function disposeEditor(): void {
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }
}

/**
 * Focus editor
 */
export function focusEditor(): void {
  if (editorInstance) {
    editorInstance.focus();
  }
}

/**
 * Get editor instance (for advanced usage)
 */
export function getEditorInstance(): monaco.editor.IStandaloneCodeEditor | null {
  return editorInstance;
}
