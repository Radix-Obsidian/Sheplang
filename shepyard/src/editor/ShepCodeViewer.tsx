/**
 * ShepCodeViewer Component
 * 
 * Monaco editor for ShepLang/ShepThon source code.
 * NOW EDITABLE! VS Code Dark theme applied.
 */

import Editor, { OnMount } from '@monaco-editor/react';
import { registerMonacoTheme } from '../themes/monacoTheme';

interface ShepCodeViewerProps {
  source: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  className?: string;
}

export function ShepCodeViewer({ 
  source, 
  onChange,
  readOnly = false,
  className = '' 
}: ShepCodeViewerProps) {
  const handleEditorMount: OnMount = (editor, monaco) => {
    // Register and apply custom dark theme
    registerMonacoTheme(monaco);
    monaco.editor.setTheme('shepyard-dark');
  };

  return (
    <div className={`h-full bg-vscode-bg ${className}`} data-testid="shep-code-viewer">
      <Editor
        height="100%"
        language="plaintext"
        value={source}
        onChange={onChange}
        theme="shepyard-dark"
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
        }}
      />
    </div>
  );
}
