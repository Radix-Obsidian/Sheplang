# Live Preview in Browser - Specification

## Goal
Allow users to preview ShepLang apps in a localhost browser (like `localhost:3000`) instead of just VS Code webview panel.

## User Experience

### Current (VS Code Webview)
1. User opens `.shep` file
2. Runs "ShepLang: Show Preview"
3. Preview opens **inside VS Code** (split panel)
4. Auto-updates on file save (500ms debounce)

### Requested (Browser + Live Server)
1. User opens `.shep` file
2. Runs "ShepLang: Show Preview in Browser"
3. Preview opens in **default browser** at `localhost:3000`
4. Auto-updates **on every keystroke** (optional) or on save (default)
5. Multiple devices can view same preview (phone, tablet)

---

## Technical Implementation

### Architecture

```
┌─────────────────┐
│  VS Code Editor │
│   (.shep file)  │
└────────┬────────┘
         │ File change detected
         ▼
┌─────────────────┐
│  File Watcher   │
│  (debounced)    │
└────────┬────────┘
         │ Re-parse AST
         ▼
┌─────────────────┐
│  HTTP Server    │
│  localhost:3000 │
└────────┬────────┘
         │ Server-Sent Events (SSE)
         ▼
┌─────────────────┐
│   Browser Tab   │
│  (auto-reload)  │
└─────────────────┘
```

### Components Needed

#### 1. **Express Server** (new file: `src/services/previewServer.ts`)
```typescript
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import * as http from 'http';

export class PreviewServer {
  private app: express.Express;
  private server: http.Server;
  private io: SocketServer;
  private port: number;
  
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketServer(this.server);
    
    this.setupRoutes();
  }
  
  private setupRoutes() {
    // Serve preview HTML
    this.app.get('/', (req, res) => {
      res.send(this.getPreviewHTML());
    });
    
    // Endpoint for AST updates
    this.app.get('/ast', (req, res) => {
      res.json(this.currentAST);
    });
  }
  
  async start(): Promise<string> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        const url = `http://localhost:${this.port}`;
        resolve(url);
      });
    });
  }
  
  // Send AST update to all connected clients
  updateAST(ast: any) {
    this.currentAST = ast;
    this.io.emit('astUpdate', ast);
  }
  
  async stop() {
    this.io.close();
    this.server.close();
  }
}
```

#### 2. **Browser HTML Template** (with WebSocket for live updates)
```html
<!DOCTYPE html>
<html>
<head>
  <title>ShepLang Live Preview</title>
  <script src="/socket.io/socket.io.js"></script>
  <style>
    /* Same styles as webview */
  </style>
</head>
<body>
  <div id="app"></div>
  
  <script>
    const socket = io();
    
    // Listen for AST updates
    socket.on('astUpdate', (ast) => {
      console.log('🔄 AST updated, re-rendering...');
      renderApp(ast);
    });
    
    // Initial load
    fetch('/ast')
      .then(r => r.json())
      .then(ast => renderApp(ast));
    
    function renderApp(ast) {
      // Same rendering logic as webview
    }
  </script>
</body>
</html>
```

#### 3. **New VS Code Command**
```typescript
// src/commands/previewInBrowser.ts
export async function showPreviewInBrowser(
  context: vscode.ExtensionContext,
  previewServer: PreviewServer
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'sheplang') {
    vscode.window.showErrorMessage('Open a .shep file first');
    return;
  }
  
  // Parse ShepLang file
  const source = editor.document.getText();
  const parseResult = await parseShep(source, editor.document.uri.fsPath);
  
  // Start server if not running
  if (!previewServer.isRunning()) {
    const url = await previewServer.start();
    vscode.window.showInformationMessage(`Preview server started at ${url}`);
  }
  
  // Send initial AST
  previewServer.updateAST(parseResult.appModel);
  
  // Watch for file changes
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(editor.document.uri, '*.shep')
  );
  
  watcher.onDidChange(async () => {
    const updatedSource = editor.document.getText();
    const updatedResult = await parseShep(updatedSource, editor.document.uri.fsPath);
    previewServer.updateAST(updatedResult.appModel);
  });
  
  // Open in browser
  const url = previewServer.getUrl();
  vscode.env.openExternal(vscode.Uri.parse(url));
}
```

---

## Configuration Options

Add to `package.json`:
```json
{
  "contributes": {
    "configuration": {
      "properties": {
        "sheplang.preview.port": {
          "type": "number",
          "default": 3000,
          "description": "Port for browser-based live preview server"
        },
        "sheplang.preview.autoReloadDelay": {
          "type": "number",
          "default": 500,
          "description": "Delay (ms) before auto-reloading preview after file change"
        },
        "sheplang.preview.liveMode": {
          "type": "boolean",
          "default": false,
          "description": "Update preview on every keystroke (experimental, may be laggy)"
        }
      }
    },
    "commands": [
      {
        "command": "sheplang.showPreviewInBrowser",
        "title": "ShepLang: Show Preview in Browser",
        "icon": "$(globe)"
      }
    ]
  }
}
```

---

## Benefits

### Browser Preview
- ✅ Test on mobile devices (same WiFi network)
- ✅ Use browser DevTools
- ✅ Shareable preview URL
- ✅ Multiple people can view same preview
- ✅ Faster for large apps (native browser rendering)

### VS Code Webview Preview
- ✅ Stays inside IDE
- ✅ No port conflicts
- ✅ Automatic cleanup when closed
- ✅ Integrates with VS Code theme

---

## Implementation Plan

### Phase 1: Basic HTTP Server
- [ ] Create `PreviewServer` class
- [ ] Add Express + Socket.IO dependencies
- [ ] Serve static HTML
- [ ] WebSocket for AST updates

### Phase 2: Live Reload
- [ ] File watcher integration
- [ ] Debounced updates
- [ ] Error handling for parse failures

### Phase 3: Advanced Features
- [ ] Hot Module Replacement (HMR)
- [ ] Multi-device sync
- [ ] QR code for mobile access
- [ ] Auto-open browser on first run

### Phase 4: Polish
- [ ] Port conflict detection
- [ ] Graceful server shutdown
- [ ] Status bar widget showing server status
- [ ] Stop server command

---

## Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17"
  }
}
```

---

## Testing

### Manual Test
1. Open `Todo.shep`
2. Run "ShepLang: Show Preview in Browser"
3. Browser opens at `localhost:3000`
4. Edit `.shep` file and save
5. Browser auto-refreshes with changes

### Edge Cases
- Port 3000 already in use → try 3001, 3002, etc.
- Multiple `.shep` files open → one server, switch AST on active file
- Server crash → auto-restart with exponential backoff
- No internet → still works (localhost)

---

## Future Enhancements

- **Live collaboration:** Multiple users editing same file
- **Time-travel debugging:** Replay AST changes
- **Performance profiling:** Track render times
- **Screenshot tool:** Capture preview for docs
- **Responsive preview:** Test different screen sizes
