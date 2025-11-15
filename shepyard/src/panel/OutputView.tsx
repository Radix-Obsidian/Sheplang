/**
 * OutputView Component
 * Shows output from ShepLang transpiler and ShepThon runtime
 */

import { useState } from 'react';

type OutputChannel = 'sheplang' | 'shepthon' | 'build';

export function OutputView() {
  const [channel, setChannel] = useState<OutputChannel>('sheplang');

  const channels: { id: OutputChannel; label: string }[] = [
    { id: 'sheplang', label: 'ShepLang Transpiler' },
    { id: 'shepthon', label: 'ShepThon Runtime' },
    { id: 'build', label: 'Build' },
  ];

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
          className="text-xs text-gray-400 hover:text-white transition-colors"
          title="Clear Output"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-gray-300">
        {channel === 'sheplang' && (
          <div>
            <div className="text-vscode-success">[ShepLang] Transpiler ready</div>
            <div className="text-gray-400">Waiting for code to transpile...</div>
          </div>
        )}
        
        {channel === 'shepthon' && (
          <div>
            <div className="text-vscode-success">[ShepThon] Runtime initialized</div>
            <div className="text-gray-400">Web Worker running in background</div>
            <div className="text-vscode-info">[Worker] Parser loaded successfully</div>
          </div>
        )}
        
        {channel === 'build' && (
          <div>
            <div className="text-vscode-success">✓ Build completed</div>
            <div className="text-gray-400">All systems operational</div>
          </div>
        )}
      </div>
    </div>
  );
}
