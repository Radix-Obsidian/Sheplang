/**
 * BobaScript Renderer for ShepYard
 * 
 * Interprets BobaScript App objects and renders them using React.
 * Follows React's official createElement patterns for dynamic rendering.
 * 
 * Phase 2: Live Preview Renderer
 */

import { createElement, useState, useCallback, useEffect, type ReactElement } from 'react';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { callShepThonEndpoint } from '../services/bridgeService';

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
  const [state, setState] = useState<Record<string, any>>({});
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigateToLine = useWorkspaceStore((state) => state.navigateToLine);
  
  // Click-to-navigate handler
  const handleElementClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Find closest element with data-shep-line attribute
    const shepElement = target.closest('[data-shep-line]');
    if (!shepElement) return;
    
    const line = shepElement.getAttribute('data-shep-line');
    if (line) {
      event.stopPropagation();
      navigateToLine(parseInt(line, 10));
    }
  }, [navigateToLine]);

  // Action execution handler - THE CRITICAL BRIDGE CONNECTION
  const handleAction = useCallback(async (actionName: string, params: Record<string, any> = {}) => {
    // Find the action in app.actions
    const action = (app as any).actions?.find((a: any) => a.name === actionName);
    if (!action) {
      console.error(`[Action] Action not found: ${actionName}`);
      return;
    }

    setIsExecutingAction(true);
    setApiError(null);
    console.log(`[Action] Executing: ${actionName}`, params);

    try {
      // Execute each operation in the action
      for (const op of action.ops) {
        if (op.kind === 'call') {
          // 🔥 THE CRITICAL CONNECTION - Call ShepThon endpoint via bridge
          console.log(`[Action] Calling ${op.method} ${op.path}`);
          const result = await callShepThonEndpoint(op.method, op.path, params);
          console.log(`[Action] Result:`, result);
          setActionLog(prev => [...prev, `✅ ${op.method} ${op.path} → Success`]);
          
        } else if (op.kind === 'load') {
          // 🔥 Load data into state
          console.log(`[Action] Loading ${op.method} ${op.path} into ${op.target}`);
          const result = await callShepThonEndpoint(op.method, op.path, params);
          console.log(`[Action] Loaded ${op.target}:`, result);
          
          // Store in state
          setState(prev => ({ ...prev, [op.target]: result }));
          setActionLog(prev => [...prev, `✅ Loaded ${op.target}: ${Array.isArray(result) ? result.length : 1} items`]);
          
        } else if (op.kind === 'show') {
          // Navigate to view
          console.log(`[Action] Showing view: ${op.view}`);
          setCurrentRoute('/' + op.view);
          
        } else if (op.kind === 'add') {
          // Add operation (log for now)
          console.log(`[Action] Add to ${op.data}:`, op.fields);
          setActionLog(prev => [...prev, `➕ Added to ${op.data}`]);
          
        } else if (op.kind === 'raw') {
          // Raw statement
          console.log(`[Action] Raw:`, op.text);
          setActionLog(prev => [...prev, op.text]);
        }
      }
      
      console.log(`[Action] ✅ ${actionName} completed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Action] ❌ ${actionName} failed:`, errorMessage);
      setApiError(errorMessage);
      setActionLog(prev => [...prev, `❌ Error: ${errorMessage}`]);
    } finally {
      setIsExecutingAction(false);
    }
  }, [app]);

  // Expose handleAction globally so buttons can call it
  useEffect(() => {
    (window as any).bobaActionHandler = handleAction;
    return () => {
      delete (window as any).bobaActionHandler;
    };
  }, [handleAction]);

  // Auto-execute InitApp action if it exists
  useEffect(() => {
    if (app && (app as any).actions) {
      const initAction = (app as any).actions.find((a: any) => a.name === 'InitApp');
      if (initAction) {
        console.log('[App] 🚀 Auto-executing InitApp');
        handleAction('InitApp', {});
      }
    }
  }, [app, handleAction]);

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
      <div className="flex-1 overflow-auto bg-white" onClick={handleElementClick}>
        {componentElement ? (
          <div className="p-6 shep-preview-content">
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

      {/* Loaded Data Panel - THE PROOF IT WORKS */}
      {Object.keys(state).length > 0 && (
        <div className="border-t border-green-300 bg-green-50 p-4">
          <h3 className="font-semibold text-green-700 mb-2">🔥 Loaded Data (Bridge Working!)</h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {Object.entries(state).map(([key, value]) => (
              <div key={key} className="p-2 bg-white rounded border border-green-200">
                <div className="font-mono text-sm font-bold text-green-600">{key}</div>
                <div className="text-xs text-gray-600 font-mono mt-1">
                  {Array.isArray(value) ? (
                    <div>
                      <div className="font-bold">{value.length} items</div>
                      <pre className="mt-1 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                    </div>
                  ) : (
                    <pre className="overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {apiError && (
        <div className="border-t border-red-300 bg-red-50 p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-red-700">⚠️ API Error</h3>
            <button
              onClick={() => setApiError(null)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-2 text-sm text-red-600 font-mono">{apiError}</div>
        </div>
      )}

      {/* Loading Indicator */}
      {isExecutingAction && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Executing action...</span>
          </div>
        </div>
      )}
    </div>
  );
}
