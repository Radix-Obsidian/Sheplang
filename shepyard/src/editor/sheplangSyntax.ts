/**
 * ShepLang & ShepThon Syntax Highlighting for Monaco Editor
 * Defines language tokens, keywords, and theme colors
 */

import type * as Monaco from 'monaco-editor';

export function registerShepLangSyntax(monaco: typeof Monaco) {
  // Register ShepLang language
  monaco.languages.register({ id: 'sheplang' });

  // Define ShepLang tokens
  monaco.languages.setMonarchTokensProvider('sheplang', {
    tokenizer: {
      root: [
        // Keywords
        [/\b(App|Screen|View|Button|Text|Input|List|State|Route|on|show|if|else|for|in|let|const|fun|return)\b/, 'keyword'],
        
        // Types
        [/\b(string|int|float|bool|datetime|json|any)\b/, 'type'],
        
        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, 'string', '@stringS single'],
        
        // Numbers
        [/\d+\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        
        // Comments
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        
        // Identifiers
        [/[a-zA-Z_]\w*/, 'identifier'],
        
        // Operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, 'operator'],
        
        // Whitespace
        [/[ \t\r\n]+/, 'white'],
      ],
      
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],
      
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
      
      stringSingle: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop']
      ],
    },
  });

  // Register ShepThon language
  monaco.languages.register({ id: 'shepthon' });

  // Define ShepThon tokens
  monaco.languages.setMonarchTokensProvider('shepthon', {
    tokenizer: {
      root: [
        // Keywords
        [/\b(App|Model|Endpoint|Job|GET|POST|PUT|DELETE|PATCH|every|minutes|hours|days|weeks|on)\b/, 'keyword'],
        
        // Types
        [/\b(id|string|int|float|bool|datetime|json)\b/, 'type'],
        
        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        
        // Numbers
        [/\d+\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        
        // Comments
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        
        // Routes/Paths
        [/\/[a-zA-Z0-9_\/\-:]*/, 'string.key'],
        
        // Identifiers
        [/[a-zA-Z_]\w*/, 'identifier'],
        
        // Operators
        [/[{}()\[\]]/, '@brackets'],
        [/@symbols/, 'operator'],
        
        // Whitespace
        [/[ \t\r\n]+/, 'white'],
      ],
      
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],
      
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
    },
  });

  // Define custom theme with VS Code Dark+ colors
  monaco.editor.defineTheme('sheplang-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.key', foreground: 'CE9178', fontStyle: 'italic' },
      { token: 'string.invalid', foreground: 'F48771' },
      { token: 'string.escape', foreground: 'D7BA7D' },
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.float', foreground: 'B5CEA8' },
      { token: 'identifier', foreground: '9CDCFE' },
      { token: 'operator', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#2A2A2A',
      'editorLineNumber.foreground': '#858585',
      'editorCursor.foreground': '#AEAFAD',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
    },
  });
}

// Language configuration for auto-closing brackets, comments, etc.
export function configureShepLangLanguage(monaco: typeof Monaco) {
  monaco.languages.setLanguageConfiguration('sheplang', {
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
  });

  monaco.languages.setLanguageConfiguration('shepthon', {
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
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });
}
