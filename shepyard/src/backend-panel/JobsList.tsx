/**
 * JobsList Component
 * 
 * Displays scheduled jobs from ShepThon backend.
 * Shows job names, schedules, and control buttons.
 * 
 * Phase 3: Backend Panel UI
 */

import type { JobInfo } from '../services/shepthonService';

interface JobsListProps {
  jobs: JobInfo[];
  onStart?: () => void;
  onStop?: () => void;
  isRunning?: boolean;
}

export function JobsList({ jobs, onStart, onStop, isRunning = false }: JobsListProps) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <span>⏰</span>
        <span>Jobs ({jobs.length})</span>
      </h4>
      
      {/* Job Controls */}
      {(onStart || onStop) && (
        <div className="flex gap-2 mb-3">
          {onStart && (
            <button
              onClick={onStart}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRunning ? '▶ Running...' : '▶ Start All'}
            </button>
          )}
          {onStop && (
            <button
              onClick={onStop}
              disabled={!isRunning}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                !isRunning
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ⏹ Stop All
            </button>
          )}
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-2">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="p-3 bg-purple-50 rounded-lg border border-purple-200"
          >
            <div className="font-mono text-sm font-semibold text-purple-900 mb-1">
              {job.name}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              🕐 {job.schedule}
            </div>
            <div className="text-xs text-gray-500">
              {job.statementCount} {job.statementCount === 1 ? 'statement' : 'statements'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
