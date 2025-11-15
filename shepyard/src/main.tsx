import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from 'react-error-boundary'
import { ResizableLayout } from './layout/ResizableLayout'
import { ProjectPanel } from './project-panel/ProjectPanel'
import { TitleBar } from './navigation/TitleBar'
import { StatusBar } from './navigation/StatusBar'
import { BottomPanel } from './panel/BottomPanel'
import { WelcomeCard } from './ui/WelcomeCard'
import { ShepCodeViewer } from './editor/ShepCodeViewer'
import { BobaRenderer } from './preview/BobaRenderer'
import { ExplainPanel } from './ui/ExplainPanel'
import { CollapsiblePanel } from './ui/CollapsiblePanel'
import { useWorkspaceStore } from './workspace/useWorkspaceStore'
import { useTranspile } from './hooks/useTranspile'
import { useLoadShepThon } from './hooks/useLoadShepThon'
import { SHEP_EXAMPLES, SHEPTHON_EXAMPLES } from './examples/exampleList'
import { 
  GenericErrorFallback, 
  EditorErrorFallback, 
  RendererErrorFallback 
} from './errors/ErrorFallback'

function App() {
  // Auto-transpile when example changes
  useTranspile();
  
  // Auto-load ShepThon when backend example selected
  useLoadShepThon();

  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const transpile = useWorkspaceStore((state) => state.transpile);
  
  // Find active example (ShepLang or ShepThon)
  const activeExample = SHEP_EXAMPLES.find((ex) => ex.id === activeExampleId);
  const activeShepThonExample = SHEPTHON_EXAMPLES.find((ex) => ex.id === activeExampleId);

  // Render left panel (modern project panel)
  const leftPanel = <ProjectPanel />;

  // Render center panel (code viewer)
  const centerPanel = activeExample || activeShepThonExample ? (
    <div className="h-full flex flex-col">
      {/* Example Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {(activeExample || activeShepThonExample)!.name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {(activeExample || activeShepThonExample)!.description}
        </p>
      </div>

      {/* Code Viewer with Error Boundary */}
      <div className="flex-1">
        <ErrorBoundary FallbackComponent={EditorErrorFallback}>
          <ShepCodeViewer source={(activeExample || activeShepThonExample)!.source} />
        </ErrorBoundary>
      </div>
    </div>
  ) : (
    <WelcomeCard />
  );

  // Render right panel (preview & explain)
  const isBackendOnly = activeShepThonExample !== undefined;
  
  const rightPanel = isBackendOnly ? (
    // Backend-only example - show backend panel instead of preview
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-6">⚡</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Backend Logic
        </h3>
        <p className="text-gray-600 mb-6">
          This is a ShepThon backend example. Check the <strong>Backend tab</strong> in the left panel to see:
        </p>
        <div className="text-left bg-white rounded-lg p-4 shadow-sm space-y-2 text-sm">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">📦</span>
            <span><strong>Models:</strong> Database structure</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">🌐</span>
            <span><strong>Endpoints:</strong> API routes</span>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2">⏰</span>
            <span><strong>Jobs:</strong> Scheduled tasks</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 Backend examples don't have a visual preview
        </p>
      </div>
    </div>
  ) : transpile.isTranspiling ? (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Transpiling ShepLang...</p>
      </div>
    </div>
  ) : transpile.error ? (
    <div className="flex items-center justify-center h-full bg-red-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Transpilation Error
        </h3>
        <p className="text-sm text-red-700 bg-white rounded-lg p-4 border border-red-200">
          {transpile.error}
        </p>
      </div>
    </div>
  ) : transpile.bobaApp ? (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Collapsible Live Preview with Error Boundary */}
      <div className="overflow-auto">
        <CollapsiblePanel 
          title="Live Preview" 
          icon="👁️" 
          defaultOpen={true}
        >
          <div className="h-[400px] overflow-auto">
            <ErrorBoundary FallbackComponent={RendererErrorFallback}>
              <BobaRenderer app={transpile.bobaApp} />
            </ErrorBoundary>
          </div>
        </CollapsiblePanel>
      </div>

      {/* Explain Panel */}
      <div className="overflow-auto">
        <ExplainPanel 
          explainData={transpile.explainData} 
          defaultOpen={true}
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-500">No preview available</p>
    </div>
  );

  const shepthonMetadata = useWorkspaceStore((state) => state.shepthon.metadata);
  const [showBottomPanel, setShowBottomPanel] = React.useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = React.useState(250);
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = () => setIsResizing(true);
  
  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY - 24; // 24 = statusbar height
      if (newHeight >= 100 && newHeight <= 600) {
        setBottomPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <ErrorBoundary FallbackComponent={GenericErrorFallback}>
      <div className="h-screen flex flex-col bg-vscode-bg">
        <TitleBar activePath={(activeExample || activeShepThonExample)?.name} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <ResizableLayout
              leftPanel={leftPanel}
              centerPanel={centerPanel}
              rightPanel={rightPanel}
            />
          </div>
          
          {/* Bottom Panel */}
          {showBottomPanel && (
            <>
              {/* Resize Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="h-1 bg-vscode-border hover:bg-vscode-statusBar cursor-ns-resize transition-colors"
              />
              <div style={{ height: bottomPanelHeight }} className="border-t border-vscode-border">
                <BottomPanel onClose={() => setShowBottomPanel(false)} />
              </div>
            </>
          )}
          
          {/* Toggle Button (when collapsed) */}
          {!showBottomPanel && (
            <button
              onClick={() => setShowBottomPanel(true)}
              className="h-6 bg-vscode-activityBar hover:bg-vscode-hover border-t border-vscode-border text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            >
              ▲ Show Panel
            </button>
          )}
        </div>
        
        <StatusBar 
          shepthonReady={!!shepthonMetadata}
          problemCount={0}
          currentExample={(activeExample || activeShepThonExample)?.name}
        />
      </div>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
