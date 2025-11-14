/**
 * Error Fallback Components
 * 
 * Friendly error UI for different contexts using react-error-boundary.
 * Official React recommendation for error handling.
 * 
 * References:
 * - https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 * - https://github.com/bvaughn/react-error-boundary
 * 
 * Phase 4: Stability Hardening
 */

import { FallbackProps } from 'react-error-boundary';

/**
 * Generic error fallback for unexpected errors
 */
export function GenericErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-red-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-red-700 mb-4">
          An unexpected error occurred. Please try again.
        </p>
        
        {/* Error details (development only) */}
        {(import.meta as any).env?.DEV && (
          <details className="text-left bg-white rounded-lg p-4 border border-red-200 mb-4">
            <summary className="cursor-pointer font-semibold text-red-800 mb-2">
              Error Details (Dev Mode)
            </summary>
            <pre className="text-xs text-gray-700 overflow-auto">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * Transpiler error fallback with helpful guidance
 */
export function TranspilerErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center h-full bg-orange-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-orange-600 text-5xl mb-4">🔧</div>
        <h2 className="text-xl font-bold text-orange-900 mb-2">
          Transpilation Failed
        </h2>
        <p className="text-sm text-orange-700 mb-4">
          There was an error processing your ShepLang code.
        </p>
        
        {/* Error message */}
        <div className="bg-white rounded-lg p-4 border border-orange-200 mb-4 text-left">
          <p className="text-sm font-mono text-gray-800">
            {error.message || 'Unknown transpilation error'}
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renderer error fallback for preview failures
 */
export function RendererErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center h-full bg-purple-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-purple-600 text-5xl mb-4">🎨</div>
        <h2 className="text-xl font-bold text-purple-900 mb-2">
          Preview Rendering Failed
        </h2>
        <p className="text-sm text-purple-700 mb-4">
          The live preview couldn't render your app.
        </p>
        
        {/* Friendly suggestions */}
        <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4 text-left">
          <p className="text-sm text-gray-800 mb-2 font-semibold">
            Common causes:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Invalid component structure</li>
            <li>Missing required fields</li>
            <li>Syntax errors in transpiled code</li>
          </ul>
        </div>

        {/* Error details in dev mode */}
        {(import.meta as any).env?.DEV && (
          <details className="text-left bg-white rounded-lg p-4 border border-purple-200 mb-4">
            <summary className="cursor-pointer font-semibold text-purple-800 mb-2">
              Error Details (Dev Mode)
            </summary>
            <pre className="text-xs text-gray-700 overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * Monaco Editor error fallback
 */
export function EditorErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center h-full bg-blue-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-blue-600 text-5xl mb-4">📝</div>
        <h2 className="text-xl font-bold text-blue-900 mb-2">
          Editor Failed to Load
        </h2>
        <p className="text-sm text-blue-700 mb-4">
          The code editor couldn't initialize properly.
        </p>
        
        <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4 text-left">
          <p className="text-sm text-gray-800">
            {error.message || 'Unknown editor error'}
          </p>
        </div>

        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reload Editor
        </button>
      </div>
    </div>
  );
}
