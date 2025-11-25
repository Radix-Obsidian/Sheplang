"use client";

import React, { useState } from 'react';
import type { ShepLangDiagnostic } from '@/services/sheplangAnalyzer';

interface ProblemsPanelProps {
  diagnostics: ShepLangDiagnostic[];
  onNavigateToProblem?: (line: number, column: number) => void;
}

/**
 * Problems Panel Component
 * Displays all diagnostics with click-to-navigate functionality
 */
const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
  diagnostics,
  onNavigateToProblem
}) => {
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings' | 'info'>('all');
  
  // Filter diagnostics based on selected filter
  const filteredDiagnostics = diagnostics.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'errors') return d.severity === 'error';
    if (filter === 'warnings') return d.severity === 'warning';
    if (filter === 'info') return d.severity === 'info';
    return true;
  });
  
  // Count diagnostics by severity
  const errorCount = diagnostics.filter(d => d.severity === 'error').length;
  const warningCount = diagnostics.filter(d => d.severity === 'warning').length;
  const infoCount = diagnostics.filter(d => d.severity === 'info').length;
  
  // Get SVG icon for severity
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      default:
        return <div className="w-4 h-4" />;
    }
  };
  
  // Get color class for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const handleProblemClick = (diagnostic: ShepLangDiagnostic) => {
    if (onNavigateToProblem) {
      onNavigateToProblem(diagnostic.line, diagnostic.column);
    }
  };
  
  return (
    <div className="problems-panel flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Summary Bar */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-300">Problems</span>
          <span className="text-gray-500 dark:text-gray-400">
            {errorCount} {errorCount === 1 ? 'error' : 'errors'} • {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
          </span>
        </div>
        {/* Filter buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              filter === 'errors'
                ? 'bg-red-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {errorCount}
          </button>
          <button
            onClick={() => setFilter('warnings')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              filter === 'warnings'
                ? 'bg-yellow-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {warningCount}
          </button>
        </div>
      </div>
      
      {/* Header with filter */}
      <div className="problems-header border-b dark:border-gray-700 px-3 py-1.5 bg-gray-100 dark:bg-gray-850">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {filter === 'all' ? 'All Problems' : filter === 'errors' ? 'Errors Only' : filter === 'warnings' ? 'Warnings Only' : 'Info Only'}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filteredDiagnostics.length} {filteredDiagnostics.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
      
      {/* Problems list */}
      <div className="problems-list flex-1 overflow-auto">
        {filteredDiagnostics.length === 0 ? (
          <div className="p-3 text-center text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 mx-auto mb-2 text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-xs">No problems found</p>
          </div>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {filteredDiagnostics.map((diagnostic, index) => (
              <li
                key={index}
                onClick={() => handleProblemClick(diagnostic)}
                className="problem-item px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 mt-0.5 ${getSeverityColor(diagnostic.severity)}`}>
                    {getSeverityIcon(diagnostic.severity)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-gray-100 leading-relaxed">
                      {diagnostic.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                      Ln {diagnostic.line}, Col {diagnostic.column}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProblemsPanel;
