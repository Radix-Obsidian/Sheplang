/**
 * EndpointsList Component
 * 
 * Displays API endpoints from ShepThon backend.
 * Shows HTTP method, path, parameters, and return type.
 * 
 * Phase 3: Backend Panel UI
 */

import type { EndpointInfo } from '../services/shepthonService';

interface EndpointsListProps {
  endpoints: EndpointInfo[];
}

export function EndpointsList({ endpoints }: EndpointsListProps) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <span>🌐</span>
        <span>Endpoints ({endpoints.length})</span>
      </h4>
      <div className="space-y-2">
        {endpoints.map((endpoint, index) => (
          <div
            key={index}
            className="p-3 bg-green-50 rounded-lg border border-green-200"
          >
            {/* Method + Path */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  endpoint.method === 'GET'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {endpoint.method}
              </span>
              <span className="font-mono text-sm text-gray-900">
                {endpoint.path}
              </span>
            </div>

            {/* Parameters */}
            {endpoint.parameters.length > 0 && (
              <div className="text-xs mb-1">
                <span className="text-gray-600">Parameters: </span>
                {endpoint.parameters.map((param, paramIndex) => (
                  <span key={paramIndex}>
                    <span className="font-mono text-gray-700">{param.name}</span>
                    <span className="text-gray-500">: {param.type}</span>
                    {param.optional && (
                      <span className="text-gray-400 italic">?</span>
                    )}
                    {paramIndex < endpoint.parameters.length - 1 && (
                      <span className="text-gray-400">, </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Return Type */}
            <div className="text-xs text-gray-600">
              → <span className="font-mono text-green-700">{endpoint.returnType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
