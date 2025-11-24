'use client';

import { useState } from 'react';
import { FileTree } from './FileTree';
import { CodeDisplay } from './CodeDisplay';
import { MetricsPanel } from './MetricsPanel';

interface GeneratedFiles {
  files: Record<string, string>;
  entryPoint: string;
  metrics: {
    totalFiles: number;
    totalLines: number;
    components: number;
    apiRoutes: number;
    models: number;
    hooks: number;
    validation: number;
    generationTime: number;
  };
}

interface GeneratedCodeViewerProps {
  generatedFiles: GeneratedFiles;
  onClose: () => void;
}

export function GeneratedCodeViewer({ generatedFiles, onClose }: GeneratedCodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState<string>(generatedFiles.entryPoint);

  const fileContent = generatedFiles.files[selectedFile] || '// File not found';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generated Production Code</h2>
            <p className="text-sm text-gray-600 mt-1">
              Real output from ShepLang compiler - TypeScript, React, Express, Prisma
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Metrics Panel */}
        <MetricsPanel metrics={generatedFiles.metrics} />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <FileTree
              files={Object.keys(generatedFiles.files)}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          </div>

          {/* Code Display */}
          <div className="flex-1 overflow-hidden">
            <CodeDisplay
              fileName={selectedFile}
              content={fileContent}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-semibold text-green-600">✓ Authentic Code</span>
              <span className="mx-2">•</span>
              <span>Not a simulation - this is the real compiler output</span>
            </div>
            <div className="flex gap-4">
              <span>{generatedFiles.metrics.totalFiles} files</span>
              <span>•</span>
              <span>{generatedFiles.metrics.totalLines.toLocaleString()} lines</span>
              <span>•</span>
              <span>{generatedFiles.metrics.generationTime}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
