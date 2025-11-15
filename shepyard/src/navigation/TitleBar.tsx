/**
 * TitleBar Component
 * VS Code-style title bar with app name and breadcrumbs
 */

interface TitleBarProps {
  activePath?: string;
}

export function TitleBar({ activePath }: TitleBarProps) {
  return (
    <div className="h-9 bg-vscode-activityBar border-b border-vscode-border flex items-center justify-between px-3">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-base">🐑</span>
          <span className="text-sm font-semibold text-vscode-fg">ShepYard</span>
        </div>
        
        {activePath && (
          <>
            <span className="text-gray-500">/</span>
            <span className="text-sm text-gray-400">{activePath}</span>
          </>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        Alpha v0.1.0
      </div>
    </div>
  );
}
