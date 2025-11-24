import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { ShepLangDiagnostic } from '@/types';
import { analyzeCode } from '@/services/sheplangAnalyzer';
import './CodeEditor.css';

interface CodeEditorProps {
  value: string;
  theme: 'light' | 'dark';
  onChange: (value: string) => void;
  onAnalysisComplete: (results: { diagnostics: ShepLangDiagnostic[], parseTime: number }) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  theme, 
  onChange,
  onAnalysisComplete
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const analysisTimeoutRef = useRef<number | null>(null);

  // Define ShepLang language in Monaco
  const defineShepLang = (monaco: any) => {
    monaco.languages.register({ id: 'sheplang' });
    
    // Define ShepLang syntax highlighting rules
    monaco.languages.setMonarchTokensProvider('sheplang', {
      keywords: [
        'app', 'view', 'data', 'action', 'fields', 'text', 'button', 'list', 'input',
        'add', 'show', 'toggle', 'delete', 'where', 'with', 'as'
      ],
      tokenizer: {
        root: [
          // Keywords
          [/\b(app|view|data|action|fields|add|show|toggle|delete|where|with|as)\b/, 'keyword'],
          
          // UI Elements
          [/\b(text|button|list|input)\b/, 'type'],
          
          // String literals
          [/"([^"\\]|\\.)*$/, 'string.invalid'], // Non-terminated string
          [/'([^'\\]|\\.)*$/, 'string.invalid'], // Non-terminated string
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string_double' }],
          [/'/, { token: 'string.quote', bracket: '@open', next: '@string_single' }],
          
          // Comments (not in official ShepLang but good for notes)
          [/#.*$/, 'comment'],
          
          // Identifiers
          [/[a-zA-Z_]\w*/, 'identifier'],
          
          // Arrow operator
          [/->/, 'operator'],
          
          // Numbers
          [/\d+/, 'number'],
          
          // Whitespace
          [/\s+/, 'white'],
        ],
        
        string_double: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ]
      }
    });

    // Define basic language configuration
    monaco.languages.setLanguageConfiguration('sheplang', {
      comments: {
        lineComment: '#',
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string'] },
        { open: "'", close: "'", notIn: ['string'] },
      ]
    });

    // Add intelligent code snippets (like VS Code extension!)
    monaco.languages.registerCompletionItemProvider('sheplang', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'app',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'app ${1:AppName}\n\ndata ${2:Model}:\n  fields:\n    ${3:field}: ${4:text}\n\nview ${5:Dashboard}:\n  text "${6:Welcome!}"\n  button "${7:Click Me}" -> ${8:Action}\n\naction ${8:Action}():\n  add ${2:Model} with ${3:field} = "${9:value}"\n  show ${5:Dashboard}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '🚀 Create a complete ShepLang app'
          },
          {
            label: 'data',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'data ${1:Model}:\n  fields:\n    ${2:field}: ${3:text}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '📝 Define a data model'
          },
          {
            label: 'view',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'view ${1:Dashboard}:\n  text "${2:Welcome!}"\n  button "${3:Click Me}" -> ${4:Action}\n  list ${5:Model}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '🎨 Create a UI view'
          },
          {
            label: 'action',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'action ${1:Action}(${2:param}):\n  add ${3:Model} with ${4:field} = ${2:param}\n  show ${5:Dashboard}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '⚡ Define an action'
          }
        ]
      })
    });

    // Add hover information (like VS Code extension!)
    monaco.languages.registerHoverProvider('sheplang', {
      provideHover: (model: any, position: any) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;
        
        const hoverMap: Record<string, string> = {
          'app': '🚀 **App Declaration**\nDefines your application name and scope',
          'data': '📝 **Data Model**\nDefines the structure of your data entities',
          'view': '🎨 **UI View**\nDefines the user interface screens',
          'action': '⚡ **Action**\nDefines interactive behavior and logic',
          'add': '➕ **Add Operation**\nAdds new items to your data',
          'show': '👁️ **Show View**\nNavigates to a different view',
          'list': '📋 **List Component**\nDisplays a list of data items',
          'button': '🔘 **Button**\nClickable UI element that triggers actions'
        };
        
        const info = hoverMap[word.word];
        if (info) {
          return {
            contents: [{ value: info }]
          };
        }
      }
    });
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Define ShepLang language
    defineShepLang(monaco);
    
    // Set the language for the current model
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, 'sheplang');
    
    // Initial analysis
    performAnalysis(value);
  };

  // Analyze code with debounce
  const performAnalysis = async (code: string) => {
    try {
      if (!monacoRef.current) return;
      
      const startTime = performance.now();
      const diagnostics = await analyzeCode(code);
      const parseTime = performance.now() - startTime;
      
      // Convert diagnostics to Monaco markers
      const markers = diagnostics.map(d => ({
        startLineNumber: d.range?.startLineNumber || 1,
        startColumn: d.range?.startColumn || 1,
        endLineNumber: d.range?.endLineNumber || 1,
        endColumn: d.range?.endColumn || 1,
        message: d.message,
        severity: d.severity === 'error' 
          ? monacoRef.current.MarkerSeverity.Error
          : d.severity === 'warning'
            ? monacoRef.current.MarkerSeverity.Warning
            : monacoRef.current.MarkerSeverity.Info
      }));
      
      // Set markers on the model
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelMarkers(model, 'sheplang', markers);
      
      // Notify parent component
      onAnalysisComplete({ diagnostics, parseTime });
      
    } catch (error: unknown) {
      console.error('Analysis error:', error instanceof Error ? error.message : String(error));
      onAnalysisComplete({ diagnostics: [], parseTime: 0 });
    }
  };

  // Handle code changes with debounced analysis
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
    
    analysisTimeoutRef.current = window.setTimeout(() => {
      performAnalysis(value);
    }, 300);
    
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [value]);

  return (
    <div className="code-editor">
      <Editor
        height="100%"
        defaultLanguage="sheplang"
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          }
        }}
      />
    </div>
  );
};

export default CodeEditor;
