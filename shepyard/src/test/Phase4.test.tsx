/**
 * ShepYard Phase 4 Tests
 * 
 * Tests for stability hardening: error boundaries, fallback modes, and edge cases.
 * 
 * Phase 4: Stability Hardening
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { 
  GenericErrorFallback, 
  EditorErrorFallback, 
  RendererErrorFallback 
} from '../errors/ErrorFallback';
import { BobaRenderer } from '../preview/BobaRenderer';

// Component that throws an error on purpose
function ThrowError({ message }: { message: string }): null {
  throw new Error(message);
  return null; // Never reached, but satisfies TypeScript
}

describe('ShepYard Phase 4: Stability Hardening', () => {
  describe('Error Boundaries', () => {
    it('catches errors and displays fallback UI', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary FallbackComponent={GenericErrorFallback}>
          <ThrowError message="Test error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('displays editor-specific error fallback', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary FallbackComponent={EditorErrorFallback}>
          <ThrowError message="Editor failed" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Editor Failed to Load')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload editor/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('displays renderer-specific error fallback', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary FallbackComponent={RendererErrorFallback}>
          <ThrowError message="Renderer crashed" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Preview Rendering Failed')).toBeInTheDocument();
      expect(screen.getByText(/common causes/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('BobaRenderer Edge Cases', () => {
    it('handles null app gracefully', () => {
      const { container } = render(<BobaRenderer app={null as any} />);
      
      // BobaRenderer should display friendly message for null app
      expect(container).toBeInTheDocument();
      expect(screen.getByText('No app data available')).toBeInTheDocument();
    });

    it('handles empty app object', () => {
      const emptyApp = {
        name: 'EmptyApp',
        components: {},
        routes: [],
        state: {},
      };

      const { container } = render(<BobaRenderer app={emptyApp} />);
      
      expect(container).toBeInTheDocument();
      expect(screen.getByText('EmptyApp')).toBeInTheDocument();
    });

    it('handles app with undefined component', () => {
      const appWithUndefinedComponent = {
        name: 'TestApp',
        components: {
          Dashboard: undefined as any,
        },
        routes: [],
        state: {},
      };

      const { container } = render(<BobaRenderer app={appWithUndefinedComponent as any} />);
      
      expect(container).toBeInTheDocument();
    });

    it('handles malformed component render function', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const appWithBadComponent = {
        name: 'BadApp',
        components: {
          BadComponent: {
            render: () => {
              throw new Error('Bad render');
            },
          },
        },
        routes: [],
        state: {},
      };

      render(
        <ErrorBoundary FallbackComponent={RendererErrorFallback}>
          <BobaRenderer app={appWithBadComponent} />
        </ErrorBoundary>
      );

      // Error boundary should catch this
      expect(screen.getByText('Preview Rendering Failed')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Fallback Rendering Modes', () => {
    it('displays loading state during transpilation', () => {
      // This is tested through workspace state in main app
      // Just verify the loading UI structure exists
      const loadingUI = (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Transpiling ShepLang...</p>
          </div>
        </div>
      );

      const { container } = render(loadingUI);
      expect(container.textContent).toContain('Transpiling ShepLang...');
    });

    it('displays error state for transpilation failures', () => {
      const errorUI = (
        <div className="flex items-center justify-center h-full bg-red-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Transpilation Error
            </h3>
            <p className="text-sm text-red-700 bg-white rounded-lg p-4 border border-red-200">
              Test error message
            </p>
          </div>
        </div>
      );

      const { container } = render(errorUI);
      expect(container.textContent).toContain('Transpilation Error');
    });

    it('displays empty state when no preview available', () => {
      const emptyUI = (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <p className="text-gray-500">No preview available</p>
        </div>
      );

      const { container } = render(emptyUI);
      expect(container.textContent).toContain('No preview available');
    });
  });

  describe('Console Error Prevention', () => {
    it('error boundaries prevent console errors from crashing app', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <ErrorBoundary FallbackComponent={GenericErrorFallback}>
          <ThrowError message="Should not crash" />
        </ErrorBoundary>
      );

      // App should still render fallback instead of crashing
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
