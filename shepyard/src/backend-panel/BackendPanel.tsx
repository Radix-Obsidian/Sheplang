/**
 * BackendPanel Component
 * 
 * Displays ShepThon backend information in Shepyard.
 * Shows models, endpoints, and jobs from the loaded ShepThon app.
 * 
 * Phase 3: Shepyard-ShepThon Integration
 * Reference: TTD_ShepThon_Core.md C3.3
 */

import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import { ModelsList } from './ModelsList';
import { EndpointsList } from './EndpointsList';
import { JobsList } from './JobsList';
import type { AppMetadata } from '../services/shepthonService';

interface BackendPanelProps {
  metadata: AppMetadata | null;
  defaultOpen?: boolean;
  onStartJobs?: () => void;
  onStopJobs?: () => void;
  jobsRunning?: boolean;
}

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

  return (
    <CollapsiblePanel
      title={`Backend (${metadata.name})`}
      icon="⚡"
      defaultOpen={defaultOpen}
    >
      <div className="space-y-4">
        {/* Models Section */}
        {metadata.models.length > 0 && (
          <ModelsList models={metadata.models} />
        )}

        {/* Endpoints Section */}
        {metadata.endpoints.length > 0 && (
          <EndpointsList endpoints={metadata.endpoints} />
        )}

        {/* Jobs Section */}
        {metadata.jobs.length > 0 && (
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
