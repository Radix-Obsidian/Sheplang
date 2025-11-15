/**
 * StatusBar Component
 * VS Code-style status bar at bottom
 */

interface StatusBarProps {
  shepthonReady?: boolean;
  problemCount?: number;
  currentExample?: string;
}

export function StatusBar({ 
  shepthonReady = false, 
  problemCount = 0,
  currentExample 
}: StatusBarProps) {
  return (
    <div className="h-6 bg-vscode-statusBar flex items-center justify-between px-3 text-xs text-white">
      <div className="flex items-center space-x-4">
        {/* ShepThon Status */}
        <div className="flex items-center space-x-1">
          <span>{shepthonReady ? '⚡' : '○'}</span>
          <span>{shepthonReady ? 'ShepThon Ready' : 'ShepThon Inactive'}</span>
        </div>
        
        {/* Problems */}
        <div className="flex items-center space-x-1">
          <span>⚠️</span>
          <span>{problemCount} {problemCount === 1 ? 'Problem' : 'Problems'}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Current File */}
        {currentExample && (
          <div className="text-gray-200">
            {currentExample}
          </div>
        )}
        
        {/* Language */}
        <div>ShepLang/ShepThon</div>
        
        {/* Spaces */}
        <div>Spaces: 2</div>
        
        {/* Encoding */}
        <div>UTF-8</div>
      </div>
    </div>
  );
}
