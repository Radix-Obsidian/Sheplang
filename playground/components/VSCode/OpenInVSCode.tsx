'use client';

import React, { useState } from 'react';

interface OpenInVSCodeProps {
  code: string;
  className?: string;
}

const OpenInVSCode: React.FC<OpenInVSCodeProps> = ({ code, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenInVSCode = () => {
    if (!code || !code.trim()) {
      setError('No code to open');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // Extract app name for filename
      const appMatch = code.match(/^\s*app\s+(\w+)/m);
      const appName = appMatch ? appMatch[1] : 'ShepLangFile';
      const filename = `${appName}.shep`;

      // Create a downloadable file
      const blob = new Blob([code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success tooltip
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 6000);

    } catch (err: any) {
      console.error('VS Code open error:', err);
      setError('Failed to download file');
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpenInVSCode}
        disabled={!code || !code.trim()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
          !code || !code.trim()
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } ${className}`}
        title="Open in VS Code with ShepLang extension"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        Open in VS Code
      </button>
      
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 bg-green-600 text-white text-xs px-3 py-2 rounded shadow-lg z-10 w-72">
          <p className="font-semibold mb-1.5">✓ File downloaded!</p>
          <ol className="list-decimal list-inside space-y-1 text-green-50">
            <li>Open the downloaded .shep file in VS Code</li>
            <li>Install ShepLang extension if you haven't</li>
            <li>Use extension features: validation, preview, deploy</li>
          </ol>
          <a 
            href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-green-100 hover:text-white underline"
          >
            Get the extension →
          </a>
        </div>
      )}
      
      {error && (
        <div className="absolute top-full mt-2 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default OpenInVSCode;
