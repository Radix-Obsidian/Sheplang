"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PreviewPanelProps {
  code: string;
  onError?: (error: string) => void;
}

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, onError }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generatePreview = useCallback(async (sheplangCode: string) => {
    setLoading(true);
    setError(null);
    setHtml(null); // Clear existing preview to show loading state

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: sheplangCode }),
      });

      if (!response.ok) {
        throw new Error(`Preview generation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.html) {
        setHtml(data.html);
      } else {
        throw new Error(data.error || 'Failed to generate preview');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate preview';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const generatePreviewDebounced = useCallback((sheplangCode: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      generatePreview(sheplangCode);
    }, 1000); // 1 second debounce
  }, [generatePreview]);

  useEffect(() => {
    if (code && code.trim()) {
      generatePreviewDebounced(code);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, generatePreviewDebounced]);

  const getDeviceDimensions = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dimensions = getDeviceDimensions();

  return (
    <div className="preview-panel flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Preview Header */}
      <div className="preview-header border-b dark:border-gray-700 px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preview</h3>
          {loading && (
            <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-medium">
              Updating...
            </span>
          )}
          {!loading && html && (
            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Mobile (375x667)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect width="7" height="16" x="6" y="4" rx="1" />
              <path d="M9 20h0" />
            </svg>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded transition-colors ${
              deviceMode === 'tablet'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Tablet (768x1024)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M12 18h0" />
            </svg>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Desktop (Full Width)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </button>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          <button
            onClick={() => {
              if (code && code.trim()) {
                generatePreview(code);
              }
            }}
            disabled={!code || !code.trim()}
            className={`p-1.5 rounded transition-colors ${
              !code || !code.trim()
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Refresh Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="preview-content flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 overflow-auto">
        {error ? (
          <div className="text-center text-red-500 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm font-semibold mb-1">Preview Error</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-2 animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-sm">Generating preview...</p>
          </div>
        ) : html ? (
          <div
            className="preview-iframe-container bg-white rounded-lg shadow-lg"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: '100%',
              maxHeight: '100%',
              transition: 'all 0.3s ease',
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={html}
              title="ShepLang Preview"
              className="w-full h-full rounded-lg"
              sandbox="allow-scripts"
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-xl mb-2">📝</p>
            <p className="text-sm">Start typing to see your app preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
