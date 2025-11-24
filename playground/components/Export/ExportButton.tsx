'use client';

import React, { useState } from 'react';

interface ExportButtonProps {
  code: string;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ code, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!code || !code.trim()) {
      setError('No code to export');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Extract app name from code
      const appMatch = code.match(/^\s*app\s+(\w+)/m);
      const appName = appMatch ? appMatch[1] : 'ShepLangProject';

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, appName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export project');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting || !code || !code.trim()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          isExporting || !code || !code.trim()
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        } ${className}`}
        title="Download project as ZIP"
      >
        {isExporting ? 'Exporting...' : '↓ Export ZIP'}
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
