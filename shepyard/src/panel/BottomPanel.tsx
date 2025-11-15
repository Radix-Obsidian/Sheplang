/**
 * BottomPanel Component
 * VS Code-style bottom panel with tabs
 * FULLY WIRED with real functionality
 */

import { useState } from 'react';
import { OutputView } from './OutputView';
import { ProblemsView } from './ProblemsView';
import { RealTerminalView } from './RealTerminalView';
import { CLIView } from './CLIView';

type PanelTab = 'output' | 'problems' | 'terminal' | 'cli' | 'debug';

interface BottomPanelProps {
  defaultTab?: PanelTab;
  onClose?: () => void;
}

export function BottomPanel({ defaultTab = 'output', onClose }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(defaultTab);

  const tabs: { id: PanelTab; label: string; icon: string }[] = [
    { id: 'output', label: 'Output', icon: '📤' },
    { id: 'problems', label: 'Problems', icon: '⚠️' },
    { id: 'terminal', label: 'Terminal', icon: '⌨️' },
    { id: 'cli', label: 'ShepLang CLI', icon: '🐑' },
    { id: 'debug', label: 'Debug Console', icon: '🐛' },
  ];

  return (
    <div className="h-full flex flex-col bg-vscode-panel">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-vscode-border bg-vscode-activityBar">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-vscode-statusBar text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 text-gray-400 hover:text-white hover:bg-vscode-hover transition-colors"
            title="Hide Panel (Ctrl+J)"
          >
            ✕
          </button>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'output' && <OutputView />}
        {activeTab === 'problems' && <ProblemsView />}
        {activeTab === 'terminal' && <RealTerminalView />}
        {activeTab === 'cli' && <CLIView />}
        {activeTab === 'debug' && (
          <div className="p-4 text-gray-400 text-sm">
            Debug Console - Available when debugging
          </div>
        )}
      </div>
    </div>
  );
}
