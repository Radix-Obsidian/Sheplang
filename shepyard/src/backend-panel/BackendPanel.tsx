/**
 * BackendPanel Component
 * 
 * Displays ShepThon backend information in Shepyard.
 * Shows models, endpoints, and jobs from the loaded ShepThon app.
 * 
 * Phase 3: Shepyard-ShepThon Integration
 * Reference: TTD_ShepThon_Core.md C3.3
 */

import React, { useState } from 'react';
import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import { ModelsList } from './ModelsList.js';
import { EndpointsList } from './EndpointsList.js';
import { JobsList } from './JobsList.js';
import { ExplainView } from './ExplainView.js';
import type { AppMetadata } from '../services/shepthonService';

interface BackendPanelProps {
  metadata: AppMetadata | null;
  defaultOpen?: boolean;
  onStartJobs?: () => void;
  onStopJobs?: () => void;
  jobsRunning?: boolean;
}

type TabType = 'explain' | 'models' | 'endpoints' | 'jobs';

/**
 * Main Backend Panel container
 * 
 * Displays ShepThon backend structure:
 * - App name
 * - Models (database tables)
 * - Endpoints (API routes)
 * - Jobs (scheduled tasks)
 */
export function BackendPanel({ 
  metadata, 
  defaultOpen = true,
  onStartJobs,
  onStopJobs,
  jobsRunning = false
}: BackendPanelProps) {
  if (!metadata) {
    return (
      <CollapsiblePanel
        title="Backend (ShepThon)"
        icon="⚡"
        defaultOpen={defaultOpen}
      >
        <div className="text-gray-500 text-center py-8">
          <p>No backend loaded</p>
          <p className="text-sm mt-2">Load a .shepthon file to see backend structure</p>
        </div>
      </CollapsiblePanel>
    );
  }

  const [activeTab, setActiveTab] = useState<TabType>('explain');

  return (
    <CollapsiblePanel
      title={`Backend (${metadata.name})`}
      icon="⚡"
      defaultOpen={defaultOpen}
    >
      <div className="backend-panel-tabs">
        <button
          className={`tab-button ${activeTab === 'explain' ? 'active' : ''}`}
          onClick={() => setActiveTab('explain')}
        >
          📋 Explain
        </button>
        <button
          className={`tab-button ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          Models ({metadata.models.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'endpoints' ? 'active' : ''}`}
          onClick={() => setActiveTab('endpoints')}
        >
          Endpoints ({metadata.endpoints.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs ({metadata.jobs.length})
        </button>
      </div>
      <div className="space-y-4">
        {activeTab === 'explain' && (
          <ExplainView metadata={metadata} />
        )}
        {activeTab === 'models' && (
          <ModelsList models={metadata.models} />
        )}
        {activeTab === 'endpoints' && (
          <EndpointsList endpoints={metadata.endpoints} />
        )}
        {activeTab === 'jobs' && (
          <JobsList 
            jobs={metadata.jobs}
            onStart={onStartJobs}
            onStop={onStopJobs}
            isRunning={jobsRunning}
          />
        )}
        {/* Empty State */}
        {metadata.models.length === 0 && 
         metadata.endpoints.length === 0 && 
         metadata.jobs.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            <p>No models, endpoints, or jobs defined</p>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}
