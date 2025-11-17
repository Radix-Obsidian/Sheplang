/**
 * StatusBar Component
 * VS Code-style status bar at bottom
 */

import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { analyzeTranspilerErrors } from '../services/errorAnalysisService';
import { SHEPTHON_EXAMPLES } from '../examples/exampleList';
import { useMemo } from 'react';

interface StatusBarProps {
  shepthonReady?: boolean;
  currentExample?: string;
  onProblemsClick?: () => void;
}

export function StatusBar({ 
  shepthonReady = false, 
  currentExample,
  onProblemsClick 
}: StatusBarProps) {
  const transpile = useWorkspaceStore((state) => state.transpile);
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const isShepThon = SHEPTHON_EXAMPLES.some(ex => ex.id === activeExampleId);

  // Calculate real problem count
  const problemCount = useMemo(() => {
    if (!transpile.error) return 0;
    
    if (transpile.errorDetails) {
      const suggestions = analyzeTranspilerErrors(
        transpile.errorDetails.message,
        transpile.errorDetails.source,
        isShepThon
      );
      return suggestions.length;
    }
    
    return 1;
  }, [transpile.error, transpile.errorDetails, isShepThon]);

  return (
    <div className="h-6 bg-vscode-statusBar flex items-center justify-between px-3 text-xs text-white">
      <div className="flex items-center space-x-4">
        {/* ShepThon Status */}
        <div className="flex items-center space-x-1">
          <span>{shepthonReady ? '⚡' : '○'}</span>
          <span>{shepthonReady ? 'ShepThon Ready' : 'ShepThon Inactive'}</span>
        </div>
        
        {/* Problems - Clickable */}
        <button
          onClick={onProblemsClick}
          className={`flex items-center space-x-1 hover:bg-vscode-hover px-2 py-0.5 rounded transition-colors ${
            problemCount > 0 ? 'text-red-400' : 'text-green-400'
          }`}
        >
          <span>{problemCount > 0 ? '⚠️' : '✅'}</span>
          <span>{problemCount} {problemCount === 1 ? 'Problem' : 'Problems'}</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Current File */}
        {currentExample && (
          <div className="text-gray-200">
            {currentExample}
          </div>
        )}
        
        {/* Language */}
        <div>ShepLang/ShepThon</div>
        
        {/* Spaces */}
        <div>Spaces: 2</div>
        
        {/* Encoding */}
        <div>UTF-8</div>
      </div>
    </div>
  );
}
