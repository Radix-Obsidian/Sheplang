/**
 * ShepCodeViewer Component
 * 
 * Monaco editor for ShepLang/ShepThon source code.
 * NOW EDITABLE! VS Code Dark theme + SYNTAX HIGHLIGHTING!
 * With inline error decorations and diagnostics.
 */

import * as React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { registerMonacoTheme } from '../themes/monacoTheme';
import { registerShepLangSyntax, configureShepLangLanguage } from './sheplangSyntax';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { SHEPTHON_EXAMPLES } from '../examples/exampleList';
import type { ErrorSuggestion } from '../errors/SmartErrorRecovery';

interface ShepCodeViewerProps {
  source: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  className?: string;
  errorSuggestions?: ErrorSuggestion[];
}

export function ShepCodeViewer({ 
  source, 
  onChange,
  readOnly = false,
  className = '',
  errorSuggestions = []
}: ShepCodeViewerProps) {
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);
  
  // Detect language based on active example
  const isShepThon = SHEPTHON_EXAMPLES.some(ex => ex.id === activeExampleId);
  const language = isShepThon ? 'shepthon' : 'sheplang';

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Register ShepLang/ShepThon syntax
    registerShepLangSyntax(monaco);
    configureShepLangLanguage(monaco);
    
    // Register and apply custom dark theme
    registerMonacoTheme(monaco);
    monaco.editor.setTheme('sheplang-dark');
    
    // Store editor instance in workspace store for auto-fix and navigation
    useWorkspaceStore.getState().setEditorInstance(editor);
  };

  // Update error markers when errorSuggestions change
  React.useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;
    
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Convert ErrorSuggestions to Monaco markers
    const markers = errorSuggestions.map((suggestion) => ({
      severity: suggestion.severity === 'error' 
        ? monaco.MarkerSeverity.Error 
        : suggestion.severity === 'warning'
        ? monaco.MarkerSeverity.Warning
        : monaco.MarkerSeverity.Info,
      message: suggestion.message,
      startLineNumber: suggestion.line,
      startColumn: suggestion.column,
      endLineNumber: suggestion.line,
      endColumn: suggestion.endColumn || suggestion.column + 1,
    }));

    // Set markers on the model
    monaco.editor.setModelMarkers(model, 'sheplang', markers);
  }, [errorSuggestions]);

  // MEMORY FIX: Dispose editor on unmount
  React.useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`h-full bg-vscode-bg ${className}`} data-testid="shep-code-viewer">
      <Editor
        height="100%"
        language={language}
        value={source}
        onChange={onChange}
        theme="sheplang-dark"
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: true, side: 'right' },
          fontSize: 14,
          fontFamily: 'Cascadia Code, Fira Code, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          cursorStyle: 'line',
          renderWhitespace: 'selection',
          smoothScrolling: true,
          mouseWheelZoom: true,
          tabSize: 2,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          guides: {
            indentation: true,
            bracketPairs: true,
          },
        }}
      />
    </div>
  );
}
