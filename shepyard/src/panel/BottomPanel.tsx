/**
 * BottomPanel Component
 * VS Code-style bottom panel with tabs
 */

import { useState } from 'react';
import { OutputView } from './OutputView';
import { ProblemsView } from './ProblemsView';
import { TerminalView } from './TerminalView';

type PanelTab = 'output' | 'problems' | 'terminal' | 'debug';

interface BottomPanelProps {
  defaultTab?: PanelTab;
}

export function BottomPanel({ defaultTab = 'output' }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(defaultTab);

  const tabs: { id: PanelTab; label: string; icon: string }[] = [
    { id: 'output', label: 'Output', icon: '📤' },
    { id: 'problems', label: 'Problems', icon: '⚠️' },
    { id: 'terminal', label: 'Terminal', icon: '⌨️' },
    { id: 'debug', label: 'Debug Console', icon: '🐛' },
  ];

  return (
    <div className="h-full flex flex-col bg-vscode-panel border-t border-vscode-border">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-vscode-border bg-vscode-activityBar">
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

      {/* Panel Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'output' && <OutputView />}
        {activeTab === 'problems' && <ProblemsView />}
        {activeTab === 'terminal' && <TerminalView />}
        {activeTab === 'debug' && (
          <div className="p-4 text-gray-400 text-sm">
            Debug Console - Available when debugging
          </div>
        )}
      </div>
    </div>
  );
}
