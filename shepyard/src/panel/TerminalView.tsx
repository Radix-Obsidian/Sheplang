/**
 * TerminalView Component
 * Mock terminal for development
 */

export function TerminalView() {
  return (
    <div className="h-full bg-vscode-panel p-4 font-mono text-sm">
      <div className="space-y-1 text-gray-300">
        <div className="text-vscode-success">$ pnpm dev</div>
        <div className="text-gray-400">
          <div>VITE v5.4.21  ready in 599 ms</div>
          <div className="mt-2">
            <span className="text-vscode-info">➜</span>  Local:   
            <span className="text-vscode-statusBar"> http://localhost:3000/</span>
          </div>
          <div>
            <span className="text-vscode-info">➜</span>  Network: 
            <span className="text-gray-500"> use --host to expose</span>
          </div>
        </div>
        <div className="mt-4 text-gray-500">
          <div>// Terminal ready for commands</div>
          <div>// (Mock terminal - real integration coming soon)</div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-vscode-success">$</span>
          <span className="ml-2 animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
