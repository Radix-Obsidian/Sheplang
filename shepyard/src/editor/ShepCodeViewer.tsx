/**
 * ShepCodeViewer Component
 * 
 * Read-only Monaco editor for displaying ShepLang source code.
 * Provides syntax highlighting and a clean viewing experience.
 */

import Editor from '@monaco-editor/react';

interface ShepCodeViewerProps {
  source: string;
  className?: string;
}

export function ShepCodeViewer({ source, className = '' }: ShepCodeViewerProps) {
  return (
    <div className={`h-full ${className}`} data-testid="shep-code-viewer">
      <Editor
        height="100%"
        language="plaintext"
        value={source}
        theme="vs-light"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
