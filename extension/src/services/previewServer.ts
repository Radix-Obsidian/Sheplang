/**
 * Live Preview Server
 * 
 * HTTP server for browser-based live preview with hot reload.
 * Uses Express + Socket.IO for real-time AST updates.
 */

import * as http from 'http';
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import * as vscode from 'vscode';
import { getErrorOverlayScript } from '../features/errorOverlay';
import { getChangeHighlightScript } from '../features/changeHighlighting';

export class PreviewServer {
  private app: express.Express;
  private server: http.Server | null = null;
  private io: SocketServer | null = null;
  private port: number;
  private currentAST: any = null;
  
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.setupRoutes();
  }
  
  private setupRoutes() {
    // Serve preview HTML
    this.app.get('/', (req, res) => {
      res.send(this.getPreviewHTML());
    });
    
    // API endpoint for current AST
    this.app.get('/ast', (req, res) => {
      res.json(this.currentAST || {});
    });
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', port: this.port });
    });
  }
  
  /**
   * Start the server
   */
  async start(): Promise<string> {
    if (this.isRunning()) {
      return this.getUrl();
    }
    
    // Try ports until we find one available
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        await this.tryStart(this.port + attempts);
        this.setupWebSocket();
        console.log(`[PreviewServer] Started on port ${this.port + attempts}`);
        return this.getUrl();
      } catch (error: any) {
        if (error.code === 'EADDRINUSE') {
          attempts++;
          continue;
        }
        throw error;
      }
    }
    
    throw new Error(`Could not find available port after ${maxAttempts} attempts`);
  }
  
  private tryStart(port: number): Promise<void> {
    this.port = port;
    this.server = http.createServer(this.app);
    
    return new Promise((resolve, reject) => {
      this.server!.once('error', reject);
      this.server!.listen(port, () => {
        this.server!.removeListener('error', reject);
        resolve();
      });
    });
  }
  
  private setupWebSocket() {
    if (!this.server) return;
    
    this.io = new SocketServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    
    this.io.on('connection', (socket) => {
      console.log('[PreviewServer] Client connected');
      
      // Send current AST to new client
      if (this.currentAST) {
        socket.emit('astUpdate', this.currentAST);
      }
      
      socket.on('disconnect', () => {
        console.log('[PreviewServer] Client disconnected');
      });
    });
  }
  
  /**
   * Update AST and broadcast to all clients
   */
  updateAST(ast: any) {
    this.currentAST = ast;
    if (this.io) {
      this.io.emit('astUpdate', ast);
      console.log('[PreviewServer] Broadcasted AST update to all clients');
    }
  }
  
  /**
   * Stop the server
   */
  async stop() {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    
    if (this.server) {
      return new Promise<void>((resolve) => {
        this.server!.close(() => {
          this.server = null;
          console.log('[PreviewServer] Stopped');
          resolve();
        });
      });
    }
  }
  
  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.server !== null;
  }
  
  /**
   * Get server URL
   */
  getUrl(): string {
    return `http://localhost:${this.port}`;
  }
  
  /**
   * Get HTML for browser preview
   */
  private getPreviewHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShepLang Live Preview</title>
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    
    #status-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 12px 20px;
      background: #007acc;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    #status-bar.connected {
      background: #28a745;
    }
    
    #status-bar.disconnected {
      background: #dc3545;
    }
    
    #status-message {
      flex: 1;
      font-weight: 500;
    }
    
    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: white;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    
    #app {
      margin-top: 60px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .view {
      margin-bottom: 24px;
      padding: 24px;
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .view-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #007acc;
    }
    
    .buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    button {
      background: #007acc;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    button:hover {
      background: #005a9e;
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    .list {
      margin-top: 20px;
    }
    
    .list-item {
      padding: 16px;
      background: #1e1e1e;
      border: 1px solid #3e3e42;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    
    .list-empty {
      color: #6c757d;
      font-style: italic;
      padding: 16px;
      text-align: center;
    }
    
    .loading {
      text-align: center;
      padding: 60px;
      color: #6c757d;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #3e3e42;
      border-top-color: #007acc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="status-bar" class="disconnected">
    <div class="pulse"></div>
    <span id="status-message">Connecting to VS Code...</span>
  </div>
  
  <div id="app">
    <div class="loading">
      <div class="loading-spinner"></div>
      <h2>Loading preview...</h2>
      <p>Waiting for VS Code to send app data...</p>
    </div>
  </div>

  <script>
    const socket = io();
    let currentAST = null;
    
    const statusBar = document.getElementById('status-bar');
    const statusMessage = document.getElementById('status-message');
    
    // Socket connection
    socket.on('connect', () => {
      console.log('✅ Connected to preview server');
      statusBar.className = 'connected';
      statusMessage.textContent = '✓ Live Preview Connected';
      
      // Request current AST
      fetch('/ast')
        .then(r => r.json())
        .then(ast => {
          if (ast && Object.keys(ast).length > 0) {
            renderApp(ast);
          }
        });
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from preview server');
      statusBar.className = 'disconnected';
      statusMessage.textContent = '✗ Disconnected - Preview will reconnect automatically';
    });
    
    // Listen for AST updates
    socket.on('astUpdate', (ast) => {
      console.log('🔄 AST updated:', ast);
      statusBar.className = 'connected';
      statusMessage.textContent = '✓ Live Preview Connected - Auto-updating...';
      renderApp(ast);
      
      // Flash update indicator
      setTimeout(() => {
        statusMessage.textContent = '✓ Live Preview Connected';
      }, 1500);
    });
    
    function renderApp(ast) {
      currentAST = ast;
      const appDiv = document.getElementById('app');
      appDiv.innerHTML = '';
      
      if (!ast || !ast.views || ast.views.length === 0) {
        appDiv.innerHTML = \`
          <div class="view">
            <div class="view-title">No Views Defined</div>
            <p style="color: #6c757d;">Add views to your .shep file to see them here!</p>
          </div>
        \`;
        return;
      }
      
      // Render each view
      ast.views.forEach(view => {
        const viewDiv = document.createElement('div');
        viewDiv.className = 'view';
        viewDiv.setAttribute('data-view', view.name);
        
        // View title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'view-title';
        titleDiv.textContent = view.name;
        viewDiv.appendChild(titleDiv);
        
        // Buttons
        if (view.buttons && view.buttons.length > 0) {
          const buttonsDiv = document.createElement('div');
          buttonsDiv.className = 'buttons';
          
          view.buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.onclick = () => {
              console.log('Button clicked:', btn.label, '-> action:', btn.action);
              alert(\`Action "\${btn.action}" triggered!\\n\\n(Connect a .shepthon backend to make this functional)\`);
            };
            buttonsDiv.appendChild(button);
          });
          
          viewDiv.appendChild(buttonsDiv);
        }
        
        // List
        if (view.list) {
          const listDiv = document.createElement('div');
          listDiv.className = 'list';
          listDiv.innerHTML = '<div class="list-empty">No data yet. Add a .shepthon backend and click actions to populate.</div>';
          viewDiv.appendChild(listDiv);
        }
        
        appDiv.appendChild(viewDiv);
      });
    }
  </script>
  
  ${getErrorOverlayScript()}
  ${getChangeHighlightScript()}
</body>
</html>`;
  }
}
