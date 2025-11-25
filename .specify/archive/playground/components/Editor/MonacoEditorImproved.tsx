import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { analyzeCode, convertToMonacoMarkers } from '@/services/sheplangAnalyzer';

import type { ShepLangDiagnostic } from '@/services/sheplangAnalyzer';

interface MonacoEditorImprovedProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onAnalysisComplete?: (diagnostics: ShepLangDiagnostic[], parseTime: number) => void;
  theme?: 'vs-dark' | 'vs-light' | 'vs';
  options?: editor.IStandaloneEditorConstructionOptions;
  filename?: string;
}

/**
 * Improved Monaco editor component with proper initialization and sizing
 */
const MonacoEditorImproved: React.FC<MonacoEditorImprovedProps> = ({
  value = '',
  onChange,
  onAnalysisComplete,
  theme = 'vs-dark',
  options = {},
  filename
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Define ShepLang language configuration
  const defineShepLang = (monaco: Monaco) => {
    // Register language if not already registered
    if (!monaco.languages.getLanguages().some((lang: { id: string }) => lang.id === 'sheplang')) {
      monaco.languages.register({ id: 'sheplang' });
      
      // Syntax highlighting
      monaco.languages.setMonarchTokensProvider('sheplang', {
        tokenizer: {
          root: [
            // Comments
            [/\/\/.*$/, 'comment'],
            
            // Keywords
            [/\b(app|data|view|action|fields|rules|props|state|show|call|load|with|into)\b/, 'keyword'],
            
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
      
      // Language configuration
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
      
      // Register hover provider for ShepLang
      monaco.languages.registerHoverProvider('sheplang', {
        provideHover: function(model: editor.ITextModel, position: any) {
          // Get markers at this position
          const markers = monaco.editor.getModelMarkers({ resource: model.uri });
          const marker = markers.find((m: editor.IMarker) => 
            m.startLineNumber <= position.lineNumber && 
            m.endLineNumber >= position.lineNumber &&
            m.startColumn <= position.column &&
            m.endColumn >= position.column
          );
          
          if (marker) {
            return {
              contents: [
                { value: `**${marker.message}**` }
              ]
            };
          }
          
          return null;
        }
      });
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set editor options
    editor.updateOptions({
      tabSize: 2,
      insertSpaces: true,
      minimap: { enabled: true },
      lineNumbers: 'on',
      folding: true,
      scrollBeyondLastLine: false,
      automaticLayout: true, // Important for resizing
      ...options
    });
    
    // Analyze initial code
    if (value) {
      analyzeCodeWithDebounce(value);
    }
  };
  
  // Analyze code function
  const performAnalysis = useCallback(async (code: string) => {
    if (!editorRef.current || !monacoRef.current) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeCode(code);
      
      if (result.success && result.diagnostics) {
        const markers = convertToMonacoMarkers(result.diagnostics);
        const model = editorRef.current.getModel();
        
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'sheplang', markers);
        }
        
        // Notify parent of analysis completion
        if (onAnalysisComplete) {
          onAnalysisComplete(result.diagnostics, result.parseTime);
        }
      }
    } catch (error: unknown) {
      console.error('Analysis error:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);
  
  // Debounced analysis
  const analyzeCodeWithDebounce = useCallback((code: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performAnalysis(code);
    }, 500); // 500ms debounce
  }, [performAnalysis]);

  // Handle value changes
  const handleChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
    
    // Trigger analysis on code change
    if (value) {
      analyzeCodeWithDebounce(value);
    }
  };

  // Save value to localStorage when it changes
  useEffect(() => {
    if (value) {
      localStorage.setItem('sheplang-code', value);
    }
  }, [value]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Extract app name from code for filename
  const appMatch = value.match(/^\s*app\s+(\w+)/m);
  const displayFilename = filename || (appMatch ? `${appMatch[1]}.shep` : 'main.shep');
  
  return (
    <div 
      className="monaco-editor-improved-container flex flex-col" 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '300px',
        position: 'relative'
      }}
    >
      {/* Editor Header/Tab */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Left: Filename */}
        <div className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayFilename}</span>
        </div>
        
        {/* Center: Language Badge */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
          ShepLang
        </span>
        
        {/* Right: Analysis Status */}
        <div className="flex items-center gap-1.5">
          {isAnalyzing ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Analyzing...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Ready</span>
            </>
          )}
        </div>
      </div>
      
      {/* Editor */}
      <div ref={containerRef} className="flex-1" style={{ overflow: 'hidden' }}>
        <Editor
          defaultLanguage="sheplang"
          value={value}
          theme={theme}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          beforeMount={defineShepLang}
          options={{
            automaticLayout: true,
            ...options
          }}
          height="100%"
          loading="Loading editor..."
          keepCurrentModel={true}
        />
      </div>
    </div>
  );
};

export default MonacoEditorImproved;
