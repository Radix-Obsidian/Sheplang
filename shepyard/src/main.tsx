import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐑</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to ShepYard</h1>
        <p className="text-xl text-gray-600 mb-8">Creative Development Sandbox</p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <p className="text-gray-700">
            Your local creative space for building with ShepLang and BobaScript.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Phase 0: Environment Setup ✓
          </div>
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
