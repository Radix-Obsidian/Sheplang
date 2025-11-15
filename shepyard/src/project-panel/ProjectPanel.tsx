/**
 * ProjectPanel - Main project navigation panel
 * 
 * Modern, founder-friendly sidebar for Shepyard.
 * Replaces traditional file tree with grouped views.
 * 
 * Phase 3: Project Panel Alpha
 * Pattern: VS Code Activity Bar + Sidebar
 */

import { useState } from 'react';
import { ExplorerView } from './ExplorerView';
import { BackendPanel } from '../backend-panel/BackendPanel';
import { FileManager } from '../sidebar/FileManager';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { startJobs, stopJobs } from '../services/bridgeService';

type PanelView = 'explorer' | 'backend' | 'files' | 'search' | 'debug';

export function ProjectPanel() {
  const [activeView, setActiveView] = useState<PanelView>('explorer');
  const shepthonMetadata = useWorkspaceStore((state) => state.shepthon.metadata);
  const shepthonError = useWorkspaceStore((state) => state.shepthon.error);
  const shepthonLoading = useWorkspaceStore((state) => state.shepthon.isLoading);
  const jobsRunning = useWorkspaceStore((state) => state.shepthon.jobsRunning);
  const setJobsRunning = useWorkspaceStore((state) => state.setJobsRunning);
  
  // Debug logging
  console.log('[ProjectPanel] ShepThon state:', { 
    hasMetadata: !!shepthonMetadata, 
    metadata: shepthonMetadata,
    error: shepthonError,
    loading: shepthonLoading
  });

  const handleStartJobs = () => {
    try {
      startJobs();
      setJobsRunning(true);
    } catch (error) {
      console.error('Failed to start jobs:', error);
    }
  };

  const handleStopJobs = () => {
    try {
      stopJobs();
      setJobsRunning(false);
    } catch (error) {
      console.error('Failed to stop jobs:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-vscode-sidebar border-r border-vscode-border">
      {/* Activity Bar */}
      <div className="flex border-b border-vscode-border bg-vscode-activityBar">
        <button
          onClick={() => setActiveView('explorer')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeView === 'explorer'
              ? 'bg-vscode-sidebar text-vscode-fg border-b-2 border-vscode-statusBar'
              : 'text-gray-400 hover:text-vscode-fg'
          }`}
          title="Examples Explorer"
        >
          📱 Examples
        </button>
        <button
          onClick={() => setActiveView('files')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeView === 'files'
              ? 'bg-vscode-sidebar text-vscode-fg border-b-2 border-vscode-statusBar'
              : 'text-gray-400 hover:text-vscode-fg'
          }`}
          title="File Manager"
        >
          📁 Files
        </button>
        <button
          onClick={() => setActiveView('backend')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeView === 'backend'
              ? 'bg-vscode-sidebar text-vscode-fg border-b-2 border-vscode-statusBar'
              : 'text-gray-400 hover:text-vscode-fg'
          }`}
          title="Backend Panel"
        >
          ⚡ Backend
        </button>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto relative">
        {activeView === 'explorer' && <ExplorerView />}
        {activeView === 'files' && <FileManager />}
        {activeView === 'backend' && (
          <div className="p-4">
            {shepthonLoading && (
              <div className="text-center py-8 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vscode-statusBar mx-auto mb-2"></div>
                <p>Loading backend...</p>
              </div>
            )}
            {shepthonError && (
              <div className="bg-vscode-panel border border-vscode-error rounded-lg p-4 mb-4">
                <h3 className="text-vscode-error font-semibold mb-2">Backend Error</h3>
                <p className="text-sm text-gray-300">{shepthonError}</p>
              </div>
            )}
            <BackendPanel
              metadata={shepthonMetadata}
              onStartJobs={handleStartJobs}
              onStopJobs={handleStopJobs}
              jobsRunning={jobsRunning}
              defaultOpen={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
