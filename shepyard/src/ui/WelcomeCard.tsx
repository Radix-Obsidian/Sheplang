/**
 * WelcomeCard Component
 * 
 * VS Code-style welcome screen
 * Professional, founder-friendly introduction
 */

export function WelcomeCard() {
  return (
    <div className="h-full flex items-center justify-center bg-vscode-bg">
      <div className="text-center max-w-2xl px-8">
        <div className="text-8xl mb-6">🐑</div>
        <h1 className="text-5xl font-bold text-vscode-fg mb-4">
          ShepYard Alpha
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Full-Stack Development for Non-Technical Founders
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-6 text-left hover:border-vscode-statusBar transition-colors">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-vscode-fg mb-2">ShepLang Screens</h3>
            <p className="text-sm text-gray-400">
              Build mobile UIs with simple, declarative syntax
            </p>
          </div>
          
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-6 text-left hover:border-vscode-statusBar transition-colors">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-vscode-fg mb-2">ShepThon Backend</h3>
            <p className="text-sm text-gray-400">
              Create APIs, databases, and jobs in one file
            </p>
          </div>
        </div>

        <div className="bg-vscode-activityBar border border-vscode-border rounded-lg p-6">
          <h3 className="text-base font-semibold text-vscode-fg mb-3">Get Started</h3>
          <div className="space-y-2 text-sm text-gray-400 text-left">
            <div className="flex items-center">
              <span className="mr-3">📁</span>
              <span>Click <strong className="text-vscode-info">Explorer</strong> to browse screen examples</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">⚡</span>
              <span>Click <strong className="text-vscode-info">Backend</strong> to see ShepThon APIs</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">✏️</span>
              <span>Click any example to view and <strong className="text-vscode-success">edit</strong> code</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-8">
          Built with ❤️ for founders who want to create without limits
        </p>
      </div>
    </div>
  );
}
