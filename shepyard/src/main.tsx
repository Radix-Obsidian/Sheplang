import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from 'react-error-boundary'
import { ResizableLayout } from './layout/ResizableLayout'
import { ProjectPanel } from './project-panel/ProjectPanel'
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
  const rightPanel = transpile.isTranspiling ? (
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

  return (
    <ErrorBoundary FallbackComponent={GenericErrorFallback}>
      <div className="h-screen">
        <ResizableLayout
          leftPanel={leftPanel}
          centerPanel={centerPanel}
          rightPanel={rightPanel}
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
