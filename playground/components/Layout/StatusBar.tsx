import React from 'react';

interface StatusBarProps {
  status: 'idle' | 'parsing' | 'success' | 'error';
  errorCount?: number;
  warningCount?: number;
  parsingTime?: number;
  characterCount?: number;
  lineCount?: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  status = 'idle',
  errorCount = 0,
  warningCount = 0,
  parsingTime = 0,
  characterCount = 0,
  lineCount = 0,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'parsing':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'parsing':
        return 'Analyzing...';
      case 'success':
        return errorCount === 0 && warningCount === 0 
          ? 'No Problems' 
          : `${errorCount} error${errorCount !== 1 ? 's' : ''}, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
      case 'error':
        return `${errorCount} error${errorCount !== 1 ? 's' : ''}${warningCount > 0 ? `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}` : ''}`;
      default:
        return 'Ready';
    }
  };

  return (
    <div className="status-bar bg-blue-600 dark:bg-blue-700 border-t border-blue-700 dark:border-blue-800 px-3 py-1 text-xs flex items-center justify-between">
      {/* Left: Status and Diagnostics */}
      <div className="flex items-center gap-3 text-white">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}>
            <span className="sr-only">Status</span>
          </span>
          <span className="font-medium">{getStatusText()}</span>
        </div>
      </div>
      
      {/* Right: Metrics */}
      <div className="flex items-center gap-2 text-blue-100">
        {lineCount > 0 && (
          <>
            <span className="font-mono">Ln {lineCount}</span>
            <span className="text-blue-300">•</span>
          </>
        )}
        <span className="font-mono">{characterCount} chars</span>
        {parsingTime > 0 && (
          <>
            <span className="text-blue-300">•</span>
            <span className="font-mono">{parsingTime}ms</span>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
