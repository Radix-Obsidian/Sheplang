/**
 * WelcomeCard Component
 * 
 * Displayed when no example is selected.
 * Provides a friendly introduction to ShepYard.
 */

export function WelcomeCard() {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-lg px-6">
        <div className="text-6xl mb-4">🐑</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to ShepYard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Creative Development Sandbox
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-700 mb-4">
            Your local creative space for building with ShepLang and BobaScript.
          </p>
          <div className="text-left space-y-2 text-sm text-gray-600">
            <div>✓ Phase 0: Environment Setup</div>
            <div className="font-semibold text-indigo-600">
              → Phase 1: Examples + Read-only Viewer
            </div>
          </div>
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-900">
              👈 Select an example from the sidebar to view its ShepLang source code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
