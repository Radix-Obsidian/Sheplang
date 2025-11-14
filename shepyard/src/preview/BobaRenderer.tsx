/**
 * BobaScript Renderer for ShepYard
 * 
 * Interprets BobaScript App objects and renders them using React.
 * Follows React's official createElement patterns for dynamic rendering.
 * 
 * Phase 2: Live Preview Renderer
 */

import { createElement, useState, type ReactElement } from 'react';

interface BobaComponent {
  render: () => {
    type: string;
    props: Record<string, any>;
    children?: any[];
  };
}

interface BobaRoute {
  path: string;
  component: string;
  target?: string;
}

interface BobaApp {
  name: string;
  components?: Record<string, BobaComponent>;
  routes?: BobaRoute[];
  state?: Record<string, any>;
}

interface BobaRendererProps {
  app: BobaApp;
  className?: string;
}

/**
 * Renders a BobaScript element tree into React elements
 * Using React.createElement as per official React docs
 */
function renderBobaElement(element: any, key?: string | number): ReactElement | string | number | null {
  // Handle primitive values
  if (typeof element === 'string') {
    return element;
  }
  
  if (typeof element === 'number') {
    return element;
  }

  if (!element || typeof element !== 'object') {
    return null;
  }

  // Handle BobaScript element structure: { type, props, children }
  const { type, props = {}, children = [] } = element;

  if (!type) {
    return null;
  }

  // Add key to props if provided
  const elementProps = key !== undefined ? { ...props, key } : props;

  // Recursively render children
  const renderedChildren = children
    .map((child: any, index: number) => renderBobaElement(child, index))
    .filter((child: any) => child !== null);

  // Create React element using official createElement API
  return createElement(
    type,
    elementProps,
    ...renderedChildren
  );
}

/**
 * Main BobaScript Renderer Component
 * 
 * Renders a BobaScript App object with:
 * - Component rendering
 * - Route navigation
 * - Mock action handlers
 */
export function BobaRenderer({ app, className = '' }: BobaRendererProps) {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Handle null app (Phase 4: Error handling)
  if (!app) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-500">No app data available</p>
      </div>
    );
  }

  // Find current component based on route
  const getCurrentComponent = (): string => {
    if (!app.routes || app.routes.length === 0) {
      // No routes defined, show first component or default
      return app.components && Object.keys(app.components).length > 0
        ? Object.keys(app.components)[0]
        : 'Dashboard';
    }

    // Find matching route
    const route = app.routes.find(r => r.path === currentRoute);
    return route?.component || Object.keys(app.components || {})[0] || 'Dashboard';
  };

  const currentComponentName = getCurrentComponent();
  const component = app.components?.[currentComponentName];

  // Note: handleAction can be used for future interactive button handling
  // Currently routes are navigated via route buttons in the UI

  // Render the component if it exists
  // Phase 4: Remove try-catch to let errors bubble to ErrorBoundary
  let componentElement: ReactElement | string | number | null = null;
  
  if (component?.render) {
    const bobaElement = component.render();
    componentElement = renderBobaElement(bobaElement);
  }

  return (
    <div className={`h-full flex flex-col ${className}`} data-testid="boba-renderer">
      {/* App Header */}
      <div className="bg-indigo-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">{app.name || 'ShepLang App'}</h2>
        <p className="text-sm opacity-90 mt-1">Live Preview</p>
      </div>

      {/* Navigation Bar (if routes exist) */}
      {app.routes && app.routes.length > 0 && (
        <div className="bg-gray-100 border-b border-gray-300 px-6 py-3">
          <div className="flex gap-2 flex-wrap">
            {app.routes.map((route, index) => (
              <button
                key={index}
                onClick={() => setCurrentRoute(route.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentRoute === route.path
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {route.component}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Component Preview Area */}
      <div className="flex-1 overflow-auto bg-white">
        {componentElement ? (
          <div className="p-6">
            {componentElement}
          </div>
        ) : (
          <div className="p-6 text-gray-500">
            <p>No component to render</p>
            <p className="text-sm mt-2">Current route: {currentRoute}</p>
            <p className="text-sm">Current component: {currentComponentName}</p>
          </div>
        )}
      </div>

      {/* Action Log (collapsible) */}
      {actionLog.length > 0 && (
        <div className="border-t border-gray-300 bg-gray-50 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Action Log</h3>
            <button
              onClick={() => setActionLog([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto bg-white rounded border border-gray-200 p-2">
            {actionLog.map((log, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State Info (debug panel) */}
      {app.state && Object.keys(app.state).length > 0 && (
        <div className="border-t border-gray-300 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Data Models</h3>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(app.state).map((stateName, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {stateName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
