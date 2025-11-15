/**
 * OutputView Component
 * FULLY WIRED - Shows real output from ShepLang transpiler and ShepThon runtime
 */

import { useState, useEffect } from 'react';
import { logService, type LogChannel, type LogEntry } from '../services/logService';

type OutputChannel = 'sheplang' | 'shepthon' | 'build' | 'system';

export function OutputView() {
  const [channel, setChannel] = useState<OutputChannel>('system');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logService.subscribe((allLogs) => {
      setLogs(allLogs);
    });

    // Initial load
    setLogs(logService.getLogs());

    return () => unsubscribe();
  }, []);

  const filteredLogs = channel === 'system'
    ? logs
    : logs.filter(log => log.channel === channel);

  const handleClear = () => {
    logService.clear(channel === 'system' ? undefined : channel);
  };

  const channels: { id: OutputChannel; label: string }[] = [
    { id: 'system', label: 'All Output' },
    { id: 'sheplang', label: 'ShepLang Transpiler' },
    { id: 'shepthon', label: 'ShepThon Runtime' },
    { id: 'build', label: 'Build' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-vscode-success';
      case 'error': return 'text-vscode-error';
      case 'warning': return 'text-vscode-warning';
      case 'info': return 'text-vscode-info';
      default: return 'text-gray-300';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Channel Selector */}
      <div className="flex items-center px-4 py-2 border-b border-vscode-border">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as OutputChannel)}
          className="bg-vscode-input text-vscode-fg border border-vscode-border rounded px-2 py-1 text-sm"
        >
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1" />
        
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-white transition-colors"
          title="Clear Output"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No output yet...
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className={getLevelColor(log.level)}>
                <span className="text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                {' '}
                <span className="text-gray-400">[{log.channel.toUpperCase()}]</span>
                {' '}
                <span>{getLevelIcon(log.level)}</span>
                {' '}
                {log.message}
                {log.details && (
                  <div className="ml-4 text-gray-400 text-xs mt-1">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
