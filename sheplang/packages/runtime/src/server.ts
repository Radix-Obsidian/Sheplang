import http from 'node:http';
import path from 'node:path';
import express from 'express';
import { WebSocketServer } from 'ws';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

export interface RuntimeServerOptions {
  hmr?: boolean;
  port?: number;
  open?: boolean;
  liveReload?: boolean;
  serveStatic?: boolean;
}

export interface RuntimeServer { 
  url: string; 
  reload: () => Promise<void>; 
  close: () => Promise<void>; 
  getMetrics: () => RuntimeMetrics;
}

export interface RuntimeMetrics {
  startTime: number;
  lastReloadTime: number;
  reloadCount: number;
  avgReloadTimeMs: number;
  clients: number;
}

/**
 * Run a development server for ShepLang applications
 */
export async function runRuntimeServer(
  entryPath: string, 
  options: RuntimeServerOptions = {}
): Promise<RuntimeServer> {
  const port = options.port ?? Number(process.env.SHEPLANG_RUNTIME_PORT || 8787);
  const hmr = options.hmr ?? true;
  const metrics: RuntimeMetrics = {
    startTime: Date.now(),
    lastReloadTime: 0,
    reloadCount: 0,
    avgReloadTimeMs: 0,
    clients: 0
  };
  
  const app = express();
  
  // Serve static files from the output directory if enabled
  if (options.serveStatic) {
    const staticDir = path.dirname(entryPath);
    app.use(express.static(staticDir));
  }
  
  // Main HTML endpoint that loads the app
  app.get('/', async (_req, res) => {
    try {
      // Dynamically import the compiled module with cache busting
      const modUrl = pathToFileURL(entryPath).href + `?v=${Date.now()}`;
      const mod = await import(modUrl);
      
      // Extract app metadata
      const name = mod.__appName ?? 'ShepLang App';
      const views = mod.__views ?? [];
      const datas = mod.__datas ?? [];
      const first = views[0]?.name ?? 'Dashboard';
      
      // Generate a more sophisticated HTML with CSS and app structure
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name}</title>
  <style>
    :root { 
      --primary: #4f46e5; 
      --primary-dark: #4338ca; 
      --text: #1f2937; 
      --bg: #f9fafb;
      --card: #ffffff;
      --border: #e5e7eb;
    }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 0; padding: 0; 
      color: var(--text);
      background: var(--bg);
    }
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    header { 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      padding: 1rem;
      background: var(--card);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { margin: 0; font-size: 1.5rem; }
    .view {
      background: var(--card);
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .list {
      border: 1px solid var(--border);
      border-radius: 4px;
      margin: 1rem 0;
    }
    button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    button:hover { background: var(--primary-dark); }
    .dev-info {
      position: fixed;
      bottom: 0;
      right: 0;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 0.5rem;
      font-size: 0.75rem;
      border-top-left-radius: 4px;
    }
    .hmr-connected { color: #10b981; }
    .hmr-disconnected { color: #ef4444; }
  </style>
</head>
<body>
  <header>
    <h1>${name}</h1>
    <div class="dev-status">
      <span class="hmr-status hmr-connected">● HMR Ready</span>
    </div>
  </header>
  
  <div class="app-container" id="app">
    <div class="view ${first.toLowerCase()}">
      <h2>${first}</h2>
      ${views[0]?.list ? `<div class="list" data-list="${views[0].list}"></div>` : ''}
      ${(views[0]?.buttons || []).map((b: { action: string; label: string }) => 
        `<button data-action="${b.action}">${b.label}</button>`
      ).join('\n      ')}
    </div>
  </div>
  
  <div class="dev-info">
    <div>ShepLang Dev Server</div>
    <div id="hmr-status">Connected</div>
  </div>

  <script>
    // HMR and development tools
    (function() {
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 10;
      const reconnectDelay = 1000;
      
      function setupWebSocket() {
        const hmrStatus = document.getElementById('hmr-status');
        const hmrIndicator = document.querySelector('.hmr-status');
        
        const ws = new WebSocket('ws://' + location.host + '/ws');
        
        ws.onopen = () => {
          console.log('HMR connected');
          hmrStatus.textContent = 'Connected';
          hmrIndicator.classList.replace('hmr-disconnected', 'hmr-connected');
          reconnectAttempts = 0;
        };
        
        ws.onclose = () => {
          hmrStatus.textContent = 'Disconnected (reconnecting...)';
          hmrIndicator.classList.replace('hmr-connected', 'hmr-disconnected');
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(setupWebSocket, reconnectDelay);
          }
        };
        
        ws.onmessage = (event) => {
          if (event.data === 'reload') {
            console.log('HMR reload triggered');
            // Soft reload without refreshing the page
            if (${JSON.stringify(hmr)}) {
              // Here we'd implement proper module reloading
              // For now, just do a full page reload
              location.reload();
            } else {
              location.reload();
            }
          }
        };
      }
      
      setupWebSocket();
    })();
  </script>
</body>
</html>`;
      
      res.set('Content-Type', 'text/html').send(html);
    } catch (error) {
      console.error('Error serving app:', error);
      res.status(500).send(`
        <html>
          <body style="font-family: system-ui, sans-serif; padding: 2rem;">
            <h1 style="color: #ef4444;">Error Loading App</h1>
            <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow: auto;">${
              error instanceof Error ? error.message : String(error)
            }</pre>
            <p>Check the console for more details.</p>
          </body>
        </html>
      `);
    }
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: Date.now() - metrics.startTime });
  });
  
  // Metrics endpoint
  app.get('/metrics', (_req, res) => {
    res.json(metrics);
  });

  // Create HTTP server
  const server = http.createServer(app);
  
  // Create WebSocket server for HMR
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Track connected clients
  wss.on('connection', () => {
    metrics.clients = wss.clients.size;
  });
  
  wss.on('close', () => {
    metrics.clients = wss.clients.size;
  });
  
  // Broadcast message to all clients
  const broadcast = (msg: string) => {
    wss.clients.forEach(client => { 
      try { 
        client.send(msg); 
      } catch (e) { 
        // Ignore errors
      } 
    });
  };

  // Start server
  await new Promise<void>(resolve => server.listen(port, resolve));
  const url = `http://localhost:${port}`;
  console.log(`Server running at ${url}`);
  
  // Create reload times array for average calculation
  const reloadTimes: number[] = [];

  return {
    url,
    // Enhanced reload with timing
    async reload() { 
      const start = performance.now();
      broadcast('reload');
      const elapsed = performance.now() - start;
      
      // Update metrics
      metrics.lastReloadTime = Date.now();
      metrics.reloadCount++;
      
      // Calculate rolling average of reload times
      reloadTimes.push(elapsed);
      if (reloadTimes.length > 10) reloadTimes.shift();
      metrics.avgReloadTimeMs = reloadTimes.reduce((a, b) => a + b, 0) / reloadTimes.length;
      
      return;
    },
    // Clean shutdown
    async close() { 
      return new Promise<void>((resolve) => {
        wss.close();
        server.close(() => resolve());
      });
    },
    // Return runtime metrics
    getMetrics() {
      return { ...metrics };
    }
  };
}
