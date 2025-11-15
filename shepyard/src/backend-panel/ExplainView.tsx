/**
 * Explain View - Plain English summary of ShepThon backend
 * 
 * Provides human-readable explanations of backend structure.
 * From PRD: "Clickable UI that summarizes ShepThon backend in plain English"
 */

import React from 'react';
import { getCurrentMetadata, type AppMetadata } from '../services/shepthonService.js';

interface ExplainViewProps {
  metadata: AppMetadata | null;
}

/**
 * ExplainView Component
 * 
 * Shows plain English summary of ShepThon backend:
 * - App overview
 * - Models explained
 * - Endpoints explained
 * - Jobs explained
 */
export function ExplainView({ metadata }: ExplainViewProps): JSX.Element {
  if (!metadata) {
    return (
      <div className="explain-view explain-empty">
        <p>No backend loaded. Load a .shepthon file to see explanation.</p>
      </div>
    );
  }

  return (
    <div className="explain-view">
      <div className="explain-section">
        <h3>📋 App Overview</h3>
        <p className="explain-text">
          Your app is called <strong>{metadata.name}</strong>.
          {metadata.models.length > 0 && (
            <> It has <strong>{metadata.models.length}</strong> data model{metadata.models.length !== 1 ? 's' : ''}.</>
          )}
          {metadata.endpoints.length > 0 && (
            <> It provides <strong>{metadata.endpoints.length}</strong> API endpoint{metadata.endpoints.length !== 1 ? 's' : ''}.</>
          )}
          {metadata.jobs.length > 0 && (
            <> It runs <strong>{metadata.jobs.length}</strong> background job{metadata.jobs.length !== 1 ? 's' : ''}.</>
          )}
        </p>
      </div>

      {metadata.models.length > 0 && (
        <div className="explain-section">
          <h3>📦 Data Models</h3>
          {metadata.models.map((model) => (
            <div key={model.name} className="explain-item">
              <h4>{model.name}</h4>
              <p className="explain-text">
                This model stores information about <strong>{model.name.toLowerCase()}</strong> entities.
                Each {model.name.toLowerCase()} has <strong>{model.fieldCount}</strong> field{model.fieldCount !== 1 ? 's' : ''}:
              </p>
              <ul className="explain-list">
                {model.fields.map((field) => (
                  <li key={field.name}>
                    <strong>{field.name}</strong> ({field.type})
                    {field.hasDefault && <span className="explain-badge">has default</span>}
                    {' - '}
                    {explainField(field.name, field.type)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {metadata.endpoints.length > 0 && (
        <div className="explain-section">
          <h3>🌐 API Endpoints</h3>
          {metadata.endpoints.map((endpoint, idx) => (
            <div key={`${endpoint.method}-${endpoint.path}-${idx}`} className="explain-item">
              <h4>
                <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                  {endpoint.method}
                </span>
                {endpoint.path}
              </h4>
              <p className="explain-text">
                {explainEndpoint(endpoint)}
              </p>
              {endpoint.parameters.length > 0 && (
                <>
                  <p className="explain-label">Requires:</p>
                  <ul className="explain-list">
                    {endpoint.parameters.map((param) => (
                      <li key={param.name}>
                        <strong>{param.name}</strong> ({param.type})
                        {param.optional && <span className="explain-badge">optional</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="explain-label">
                Returns: <strong>{endpoint.returnType}</strong>
              </p>
            </div>
          ))}
        </div>
      )}

      {metadata.jobs.length > 0 && (
        <div className="explain-section">
          <h3>⏰ Background Jobs</h3>
          {metadata.jobs.map((job) => (
            <div key={job.name} className="explain-item">
              <h4>{job.name}</h4>
              <p className="explain-text">
                This job runs <strong>{job.schedule}</strong> and performs{' '}
                <strong>{job.statementCount}</strong> action{job.statementCount !== 1 ? 's' : ''}.
              </p>
              <p className="explain-text">
                {explainJob(job.name)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Explain what a field stores based on its name and type
 */
function explainField(name: string, type: string): string {
  const lowerName = name.toLowerCase();
  
  // Common patterns
  if (name === 'id') return 'Unique identifier';
  if (lowerName.includes('name')) return 'Name or title';
  if (lowerName.includes('email')) return 'Email address';
  if (lowerName.includes('text') || lowerName.includes('content')) return 'Text content';
  if (lowerName.includes('time') || lowerName.includes('date')) return 'Date/time information';
  if (lowerName.includes('done') || lowerName.includes('complete')) return 'Completion status';
  if (lowerName.includes('active') || lowerName.includes('enabled')) return 'Active/enabled flag';
  if (lowerName.includes('count') || lowerName.includes('number')) return 'Numeric value';
  
  // By type
  if (type === 'string') return 'Text value';
  if (type === 'number') return 'Numeric value';
  if (type === 'bool') return 'True/false flag';
  if (type === 'datetime') return 'Date and time';
  if (type === 'id') return 'Unique identifier';
  
  return 'Data field';
}

/**
 * Explain what an endpoint does
 */
function explainEndpoint(endpoint: { method: string; path: string; returnType: string }): string {
  const { method, path, returnType } = endpoint;
  
  // Extract resource name from path
  const pathParts = path.split('/').filter(Boolean);
  const resource = pathParts[0] || 'resource';
  
  switch (method) {
    case 'GET':
      if (returnType.startsWith('[')) {
        return `Gets a list of all ${resource}.`;
      }
      return `Gets a single ${resource} by ID.`;
    
    case 'POST':
      return `Creates a new ${resource}.`;
    
    case 'PUT':
    case 'PATCH':
      return `Updates an existing ${resource}.`;
    
    case 'DELETE':
      return `Deletes a ${resource}.`;
    
    default:
      return `Performs an operation on ${resource}.`;
  }
}

/**
 * Explain what a job does based on its name
 */
function explainJob(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('cleanup') || lowerName.includes('clean')) {
    return 'Periodically cleans up old or unnecessary data.';
  }
  if (lowerName.includes('backup')) {
    return 'Creates backups of important data.';
  }
  if (lowerName.includes('sync') || lowerName.includes('synchronize')) {
    return 'Synchronizes data with external systems.';
  }
  if (lowerName.includes('notify') || lowerName.includes('notification')) {
    return 'Sends notifications to users.';
  }
  if (lowerName.includes('mark') || lowerName.includes('update')) {
    return 'Updates records based on certain conditions.';
  }
  if (lowerName.includes('process') || lowerName.includes('handle')) {
    return 'Processes queued items or pending tasks.';
  }
  
  return 'Performs scheduled background maintenance.';
}

/**
 * Export helper to get current explanation
 */
export function getExplanation(): string | null {
  const metadata = getCurrentMetadata();
  if (!metadata) return null;
  
  let explanation = `Your app "${metadata.name}" provides:\n\n`;
  
  if (metadata.models.length > 0) {
    explanation += `📦 ${metadata.models.length} data model(s):\n`;
    metadata.models.forEach((model) => {
      explanation += `  - ${model.name} (${model.fieldCount} fields)\n`;
    });
    explanation += '\n';
  }
  
  if (metadata.endpoints.length > 0) {
    explanation += `🌐 ${metadata.endpoints.length} API endpoint(s):\n`;
    metadata.endpoints.forEach((endpoint) => {
      explanation += `  - ${endpoint.method} ${endpoint.path}\n`;
    });
    explanation += '\n';
  }
  
  if (metadata.jobs.length > 0) {
    explanation += `⏰ ${metadata.jobs.length} background job(s):\n`;
    metadata.jobs.forEach((job) => {
      explanation += `  - ${job.name} (${job.schedule})\n`;
    });
  }
  
  return explanation;
}
