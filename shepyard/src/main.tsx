import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ExamplesSidebar } from './ui/ExamplesSidebar'
import { WelcomeCard } from './ui/WelcomeCard'
import { ShepCodeViewer } from './editor/ShepCodeViewer'
import { BobaRenderer } from './preview/BobaRenderer'
import { useWorkspaceStore } from './workspace/useWorkspaceStore'
import { useTranspile } from './hooks/useTranspile'
import { SHEP_EXAMPLES } from './examples/exampleList'

function App() {
  // Auto-transpile when example changes
  useTranspile();

  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const transpile = useWorkspaceStore((state) => state.transpile);
  const activeExample = SHEP_EXAMPLES.find((ex) => ex.id === activeExampleId);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center shadow-sm">
        <div className="text-2xl mr-2">🐑</div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">ShepYard</h1>
          <p className="text-xs text-gray-500">Creative Development Sandbox</p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Examples Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ExamplesSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {activeExample ? (
            <>
              {/* Code Viewer - Left Half */}
              <div className="flex-1 flex flex-col border-r border-gray-300">
                {/* Example Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {activeExample.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeExample.description}
                  </p>
                </div>

                {/* Code Viewer */}
                <div className="flex-1">
                  <ShepCodeViewer source={activeExample.source} />
                </div>
              </div>

              {/* Live Preview - Right Half */}
              <div className="flex-1 flex flex-col">
                {transpile.isTranspiling ? (
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
                  <BobaRenderer app={transpile.bobaApp} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <p className="text-gray-500">No preview available</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <WelcomeCard />
          )}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
