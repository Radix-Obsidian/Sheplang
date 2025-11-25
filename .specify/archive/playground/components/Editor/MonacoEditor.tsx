import React, { useEffect, useRef, useState } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface MonacoEditorProps {
  initialValue?: string;
  theme?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
  height?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  initialValue = '',
  theme = 'vs-dark',
  onChange,
  className = '',
  height = '100%'
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [value, setValue] = useState(initialValue);

  // Define ShepLang language
  const defineShepLang = (monaco: Monaco) => {
    monaco.languages.register({ id: 'sheplang' });
    
    monaco.languages.setMonarchTokensProvider('sheplang', {
      tokenizer: {
        root: [
          // Comments
          [/\/\/.*$/, 'comment'],
          
          // Keywords
          [/\b(app|data|view|action|fields|rules|props|state|show)\b/, 'keyword'],
          
          // String literals
          [/"([^"\\]|\\.)*"/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          
          // Numbers
          [/\d+/, 'number'],
          
          // Operators and special characters
          [/[{}()\[\]<>]/, '@brackets'],
          [/[;,.]/, 'delimiter'],
          [/[=!]+/, 'operator'],
        ]
      }
    });
    
    monaco.languages.setLanguageConfiguration('sheplang', {
      comments: {
        lineComment: '//',
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
      folding: {
        markers: {
          start: new RegExp('^\\s*//\\s*#?region\\b'),
          end: new RegExp('^\\s*//\\s*#?endregion\\b')
        }
      }
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    defineShepLang(monaco);
    editor.updateOptions({
      tabSize: 2,
      insertSpaces: true,
      minimap: { enabled: true },
      lineNumbers: 'on',
      folding: true,
      scrollBeyondLastLine: false,
    });
  };

  const handleChange = (value: string | undefined) => {
    setValue(value || '');
    if (onChange) {
      onChange(value);
    }
  };

  useEffect(() => {
    // Save to localStorage when the value changes
    if (value) {
      localStorage.setItem('sheplang-code', value);
    }
  }, [value]);

  return (
    <div className={`monaco-editor-container ${className}`} style={{ height, minHeight: "300px" }}>
      <Editor
        height="100%"
        defaultLanguage="sheplang"
        defaultValue={initialValue}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
