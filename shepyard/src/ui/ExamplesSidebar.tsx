/**
 * ExamplesSidebar Component
 * 
 * Displays a list of available ShepLang examples.
 * Clicking an example sets it as the active example in the workspace.
 */

import { SHEP_EXAMPLES } from '../examples/exampleList';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';

export function ExamplesSidebar() {
  const { activeExampleId, setActiveExample } = useWorkspaceStore();

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Examples</h2>
        <p className="text-sm text-gray-500 mt-1">
          Click to view ShepLang code
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {SHEP_EXAMPLES.map((example) => (
          <button
            key={example.id}
            onClick={() => setActiveExample(example.id)}
            data-testid={`example-${example.id}`}
            className={`
              w-full text-left p-3 rounded-lg mb-2 transition-colors
              ${
                activeExampleId === example.id
                  ? 'bg-indigo-50 border-2 border-indigo-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <div className="font-medium text-gray-900">{example.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {example.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
