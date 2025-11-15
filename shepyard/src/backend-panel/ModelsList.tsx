/**
 * ModelsList Component
 * 
 * Displays database models from ShepThon backend.
 * Shows model names, fields, and types.
 * 
 * Phase 3: Backend Panel UI
 */

import type { ModelInfo } from '../services/shepthonService';

interface ModelsListProps {
  models: ModelInfo[];
}

export function ModelsList({ models }: ModelsListProps) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <span>📦</span>
        <span>Models ({models.length})</span>
      </h4>
      <div className="space-y-3">
        {models.map((model, index) => (
          <div
            key={index}
            className="p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="font-mono text-sm font-semibold text-blue-900 mb-2">
              {model.name}
            </div>
            <div className="space-y-1">
              {model.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-gray-600">•</span>
                  <span className="font-mono text-gray-700">{field.name}</span>
                  <span className="text-gray-500">:</span>
                  <span className="text-blue-700">{field.type}</span>
                  {field.hasDefault && (
                    <span className="text-gray-400 italic">(default)</span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {model.fieldCount} {model.fieldCount === 1 ? 'field' : 'fields'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
