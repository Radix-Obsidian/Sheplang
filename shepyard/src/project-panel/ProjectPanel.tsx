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
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { startJobs, stopJobs } from '../services/bridgeService';

type PanelView = 'explorer' | 'backend' | 'search' | 'debug';

export function ProjectPanel() {
  const [activeView, setActiveView] = useState<PanelView>('explorer');
  const shepthonMetadata = useWorkspaceStore((state) => state.shepthon.metadata);
  const jobsRunning = useWorkspaceStore((state) => state.shepthon.jobsRunning);
  const setJobsRunning = useWorkspaceStore((state) => state.setJobsRunning);

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
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Activity Bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveView('explorer')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeView === 'explorer'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Project Explorer"
        >
          📁 Explorer
        </button>
        <button
          onClick={() => setActiveView('backend')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeView === 'backend'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Backend Panel"
        >
          ⚡ Backend
        </button>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto">
        {activeView === 'explorer' && <ExplorerView />}
        {activeView === 'backend' && (
          <div className="p-4">
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
