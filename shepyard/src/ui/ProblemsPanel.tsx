/**
 * Problems Panel Component
 * 
 * A dedicated panel for displaying transpilation errors and suggestions
 * with auto-fix and navigation capabilities.
 * 
 * Can be used in:
 * - Bottom panel (VS Code style)
 * - Sidebar
 * - Modal/dialog
 * - Inline in any layout
 */

import React from 'react';
import { ErrorPanel } from '../errors/SmartErrorRecovery';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { analyzeTranspilerErrors } from '../services/errorAnalysisService';
import { SHEPTHON_EXAMPLES } from '../examples/exampleList';

interface ProblemsPanelProps {
  className?: string;
  showHeader?: boolean;
  onClose?: () => void;
}

export function ProblemsPanel({ 
  className = '', 
  showHeader = true,
  onClose 
}: ProblemsPanelProps) {
  const transpile = useWorkspaceStore((state) => state.transpile);
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const applyAutoFix = useWorkspaceStore((state) => state.applyAutoFix);
  const navigateToLine = useWorkspaceStore((state) => state.navigateToLine);

  // Determine if this is a ShepThon example
  const isShepThon = SHEPTHON_EXAMPLES.some(ex => ex.id === activeExampleId);

  // Generate error suggestions
  const suggestions = React.useMemo(() => {
    if (!transpile.error) return [];

    if (transpile.errorDetails) {
      return analyzeTranspilerErrors(
        transpile.errorDetails.message,
        transpile.errorDetails.source,
        isShepThon
      );
    }

    // Fallback for errors without details
    return [{
      severity: 'error' as const,
      message: transpile.error,
      line: 1,
      column: 1,
      errorType: 'unknown',
      confidence: 0.5
    }];
  }, [transpile.error, transpile.errorDetails, isShepThon]);

  // Show success state when no errors
  if (!transpile.error) {
    return (
      <div className={`problems-panel ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h3 className="text-sm font-semibold text-gray-700">Problems</h3>
              <span className="text-xs text-green-600 font-medium">0 errors</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="p-6 bg-gray-50">
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-sm text-gray-600">
              No problems detected
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show errors
  return (
    <div className={`problems-panel h-full flex flex-col ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <h3 className="text-sm font-semibold text-gray-700">Problems</h3>
            <span className="text-xs text-red-600 font-medium">
              {suggestions.length} {suggestions.length === 1 ? 'error' : 'errors'}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ErrorPanel
          suggestions={suggestions}
          onApplyFix={(suggestion) => {
            applyAutoFix(suggestion);
          }}
          onJumpToLine={(line) => {
            navigateToLine(line);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Compact Problems Counter
 * 
 * Shows a compact error count indicator that can be clicked
 * to open the problems panel.
 */
interface ProblemsCounterProps {
  onClick?: () => void;
  className?: string;
}

export function ProblemsCounter({ onClick, className = '' }: ProblemsCounterProps) {
  const transpile = useWorkspaceStore((state) => state.transpile);
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const isShepThon = SHEPTHON_EXAMPLES.some(ex => ex.id === activeExampleId);

  const errorCount = React.useMemo(() => {
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

  if (errorCount === 0) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors ${className}`}
      >
        <span>✅</span>
        <span>No problems</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors ${className}`}
    >
      <span>⚠️</span>
      <span>{errorCount} {errorCount === 1 ? 'problem' : 'problems'}</span>
    </button>
  );
}
