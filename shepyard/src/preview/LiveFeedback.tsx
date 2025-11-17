/**
 * Live Feedback Component
 * 
 * Shows real-time updates and change indicators in the preview panel.
 * Helps founders see the immediate impact of their changes.
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LiveFeedbackProps {
  lastUpdate: Date | null;
  backendConnected?: boolean;
  modelCount?: number;
  endpointCount?: number;
  jobCount?: number;
  changedComponents?: string[];
}

export function LiveFeedback({
  lastUpdate,
  backendConnected = false,
  modelCount = 0,
  endpointCount = 0,
  jobCount = 0,
  changedComponents = [],
}: LiveFeedbackProps) {
  const [showPulse, setShowPulse] = React.useState(false);

  React.useEffect(() => {
    if (lastUpdate) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Update Indicator */}
          {lastUpdate && (
            <div className="flex items-center gap-2">
              <div className={`transition-all duration-300 ${showPulse ? 'scale-110' : 'scale-100'}`}>
                <div className="relative">
                  <span className="text-green-600 text-lg">✅</span>
                  {showPulse && (
                    <span className="absolute inset-0 animate-ping">
                      <span className="text-green-400 text-lg">✅</span>
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Backend Status */}
          {backendConnected && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Backend Connected</span>
            </div>
          )}

          {/* Backend Stats */}
          {(modelCount > 0 || endpointCount > 0 || jobCount > 0) && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
              {modelCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-600 text-sm">📦</span>
                  <span className="text-xs text-gray-600">{modelCount} model{modelCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {endpointCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-green-600 text-sm">🌐</span>
                  <span className="text-xs text-gray-600">{endpointCount} endpoint{endpointCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {jobCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-purple-600 text-sm">⏰</span>
                  <span className="text-xs text-gray-600">{jobCount} job{jobCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Changed Components */}
          {changedComponents.length > 0 && showPulse && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-300">
              <span className="text-sm text-indigo-600 font-medium">
                ✨ {changedComponents.join(', ')} updated
              </span>
            </div>
          )}
        </div>

        {/* Preview Mode Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white rounded-full border border-gray-300 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Live Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to track AST changes and detect which components changed
 */
export function useChangeDetection(currentAst: any, previousAst: any) {
  const [changedComponents, setChangedComponents] = React.useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (!currentAst || !previousAst) {
      if (currentAst) {
        setLastUpdate(new Date());
      }
      return;
    }

    // Detect changes in components
    const changes: string[] = [];
    
    // Compare components (simplified - could be more sophisticated)
    const currentComponents = extractComponentNames(currentAst);
    const previousComponents = extractComponentNames(previousAst);

    // Find new or modified components
    for (const comp of currentComponents) {
      if (!previousComponents.includes(comp)) {
        changes.push(comp);
      }
    }

    if (changes.length > 0 || JSON.stringify(currentAst) !== JSON.stringify(previousAst)) {
      setChangedComponents(changes);
      setLastUpdate(new Date());

      // Clear changed components after animation
      const timer = setTimeout(() => setChangedComponents([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentAst, previousAst]);

  return { changedComponents, lastUpdate };
}

function extractComponentNames(ast: any): string[] {
  if (!ast || !ast.body || !Array.isArray(ast.body)) {
    return [];
  }

  return ast.body
    .filter((node: any) => node.type === 'ComponentDecl' || node.type === 'ViewDecl')
    .map((node: any) => node.name || 'Unknown');
}

/**
 * Analyze ShepThon backend to get stats
 */
export function analyzeBackendStats(shepthonCode: string) {
  const modelCount = (shepthonCode.match(/model\s+\w+/g) || []).length;
  const endpointCount = (shepthonCode.match(/endpoint\s+(GET|POST|PUT|DELETE|PATCH)/g) || []).length;
  const jobCount = (shepthonCode.match(/job\s+"[^"]+"/g) || []).length;

  return {
    modelCount,
    endpointCount,
    jobCount,
    backendConnected: modelCount > 0 || endpointCount > 0 || jobCount > 0,
  };
}
