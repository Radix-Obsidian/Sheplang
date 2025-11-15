/**
 * ExplorerView - Project structure explorer
 * 
 * Founder-friendly file tree showing:
 * - Screens (ShepLang views)
 * - Logic (ShepThon backends)
 * - Data (Models)
 * 
 * Phase 3: Project Panel Alpha
 */

import { SHEP_EXAMPLES, SHEPTHON_EXAMPLES } from '../examples/exampleList';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';

export function ExplorerView() {
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const setActiveExample = useWorkspaceStore((state) => state.setActiveExample);
  const shepthonMetadata = useWorkspaceStore((state) => state.shepthon.metadata);

  return (
    <div className="p-4 space-y-4">
      {/* Screens Section (ShepLang) */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          📱 Screens
        </h3>
        <div className="space-y-1">
          {SHEP_EXAMPLES.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeExampleId === example.id
                  ? 'bg-indigo-100 text-indigo-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Logic Section (ShepThon) */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          ⚡ Logic
        </h3>
        <div className="space-y-1">
          {SHEPTHON_EXAMPLES.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeExampleId === example.id
                  ? 'bg-indigo-100 text-indigo-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Data Models (when backend loaded) */}
      {shepthonMetadata && shepthonMetadata.models.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            📦 Data
          </h3>
          <div className="space-y-1">
            {shepthonMetadata.models.map((model, index) => (
              <div
                key={index}
                className="px-3 py-2 rounded-lg text-sm bg-gray-50 text-gray-600"
              >
                {model.name}
                <span className="text-xs text-gray-400 ml-2">
                  ({model.fieldCount} fields)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
