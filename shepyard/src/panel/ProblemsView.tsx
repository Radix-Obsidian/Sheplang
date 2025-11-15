/**
 * ProblemsView Component
 * Shows errors and warnings
 */

export function ProblemsView() {
  const problems: any[] = []; // In real app, get from store

  return (
    <div className="h-full">
      {/* Toolbar */}
      <div className="flex items-center px-4 py-2 border-b border-vscode-border text-xs">
        <span className="text-gray-400">
          {problems.length} {problems.length === 1 ? 'Problem' : 'Problems'}
        </span>
        <div className="flex-1" />
        <button className="text-gray-400 hover:text-white transition-colors">
          Clear All
        </button>
      </div>

      {/* Problems List */}
      <div className="overflow-auto">
        {problems.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <div className="text-4xl mb-4">✓</div>
            <div>No problems detected</div>
            <div className="text-xs mt-2 text-gray-500">
              Your code is looking good!
            </div>
          </div>
        ) : (
          <div className="divide-y divide-vscode-border">
            {problems.map((problem, i) => (
              <div key={i} className="px-4 py-2 hover:bg-vscode-hover cursor-pointer">
                <div className="flex items-start text-sm">
                  <span className={`mr-2 ${
                    problem.severity === 'error' ? 'text-vscode-error' : 'text-vscode-warning'
                  }`}>
                    {problem.severity === 'error' ? '❌' : '⚠️'}
                  </span>
                  <div className="flex-1">
                    <div className="text-vscode-fg">{problem.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {problem.file}:{problem.line}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
