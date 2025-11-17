# ShepLang Call → ShepThon Bridge Wiring Guide

**Status:** Bridge service implemented ✅  
**Remaining:** Wire to preview/renderer

---

## What's Done

### ✅ Bridge Service Implementation

`extension/src/services/bridgeService.ts` now has real implementation:

```typescript
public async callEndpoint(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: any
): Promise<any> {
  if (!this.runtime) {
    throw new Error('ShepThon backend is not loaded...');
  }

  // Calls runtime.callEndpoint() - the real ShepThon runtime
  const result = await this.runtime.callEndpoint(method, path, body);
  return result;
}
```

### ✅ Runtime Manager Integration

`extension/src/services/runtimeManager.ts` loads ShepThon and sets runtime:

```typescript
const runtime = new ShepThonRuntime(parseResult.app);
bridgeService.setRuntime(runtime); // ✅ Bridge connected to runtime
```

---

## What's Needed

### 1. Preview Command Implementation

Currently `extension/src/commands/preview.ts` shows a placeholder.

**Need to:**
1. Create webview panel
2. Load BobaScript renderer into webview
3. Parse current `.shep` file
4. Transpile to BobaScript AST
5. Check for corresponding `.shepthon` file
6. If found, load backend via runtimeManager
7. Send AST to webview via `postMessage`
8. Webview renders using BobaRenderer
9. When buttons clicked, execute actions

### 2. Webview ↔ Extension Communication

**Message Flow:**
```
Extension Host                    Webview (BobaRenderer)
     │                                     │
     ├──postMessage(AST)──────────────────>│
     │                                     │
     │<─────postMessage({action})──────────┤
     │                                     │
     ├──call bridgeService.callEndpoint()─>│
     │                                     │
     │<─────return result───────────────────┤
     │                                     │
     ├──postMessage({result})─────────────>│
     │                                     │
```

### 3. BobaRenderer Integration

The renderer (from shepyard) needs to:
- Receive AST from extension via message listener
- Render UI components
- Attach onClick handlers to buttons
- On click, look up action in AST
- Execute action statements
- For `call` statements, send message to extension
- Extension calls bridge service
- Bridge returns result
- Renderer updates UI

---

## Implementation Steps

### Step 1: Enhance Preview Command

**File:** `extension/src/commands/preview.ts`

```typescript
import * as vscode from 'vscode';
import { parseShep } from '@sheplang/language';
import { bridgeService } from '../services/bridgeService';

export async function showPreviewCommand(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'sheplang') {
    vscode.window.showErrorMessage('Preview is only available for .shep files');
    return;
  }

  // Create webview panel
  const panel = vscode.window.createWebviewPanel(
    'sheplangPreview',
    'ShepLang Preview',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  // Parse ShepLang file
  const source = editor.document.getText();
  const parseResult = await parseShep(source);

  // Load ShepThon backend if present
  await loadBackendIfPresent(editor.document.uri);

  // Set up HTML with BobaRenderer
  panel.webview.html = getWebviewContent(panel.webview, context);

  // Send AST to webview
  panel.webview.postMessage({
    type: 'loadAST',
    ast: parseResult.appModel
  });

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type === 'callEndpoint') {
      try {
        const result = await bridgeService.callEndpoint(
          message.method,
          message.path,
          message.body
        );
        
        panel.webview.postMessage({
          type: 'callResult',
          requestId: message.requestId,
          result
        });
      } catch (error) {
        panel.webview.postMessage({
          type: 'callError',
          requestId: message.requestId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Watch for file changes
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(editor.document.uri, '*.shep')
  );
  
  watcher.onDidChange(async () => {
    const updatedSource = editor.document.getText();
    const updatedResult = await parseShep(updatedSource);
    panel.webview.postMessage({
      type: 'loadAST',
      ast: updatedResult.appModel
    });
  });

  panel.onDidDispose(() => watcher.dispose());
}

async function loadBackendIfPresent(shepUri: vscode.Uri) {
  const shepthonUri = shepUri.with({ path: shepUri.path.replace('.shep', '.shepthon') });
  
  try {
    const doc = await vscode.workspace.openTextDocument(shepthonUri);
    // Runtime manager will auto-load when document opens
  } catch {
    // No backend file, that's OK
  }
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext): string {
  // TODO: Bundle BobaRenderer and load here
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ShepLang Preview</title>
    </head>
    <body>
      <div id="root"></div>
      <script>
        const vscode = acquireVsCodeApi();
        
        window.addEventListener('message', event => {
          const message = event.data;
          
          if (message.type === 'loadAST') {
            // Render BobaScript using AST
            renderApp(message.ast);
          }
          
          if (message.type === 'callResult') {
            // Handle API call result
            handleCallResult(message.requestId, message.result);
          }
          
          if (message.type === 'callError') {
            // Handle API call error
            handleCallError(message.requestId, message.error);
          }
        });
        
        // When renderer needs to call backend
        function callBackend(method, path, body) {
          const requestId = Date.now().toString();
          
          vscode.postMessage({
            type: 'callEndpoint',
            requestId,
            method,
            path,
            body
          });
          
          return new Promise((resolve, reject) => {
            // Store promise handlers for this request
            window.pendingCalls = window.pendingCalls || {};
            window.pendingCalls[requestId] = { resolve, reject };
          });
        }
        
        function handleCallResult(requestId, result) {
          const pending = window.pendingCalls[requestId];
          if (pending) {
            pending.resolve(result);
            delete window.pendingCalls[requestId];
          }
        }
        
        function handleCallError(requestId, error) {
          const pending = window.pendingCalls[requestId];
          if (pending) {
            pending.reject(new Error(error));
            delete window.pendingCalls[requestId];
          }
        }
        
        function renderApp(ast) {
          // TODO: Use BobaRenderer to render AST
          document.getElementById('root').innerHTML = '<h1>Preview Coming Soon</h1>';
        }
      </script>
    </body>
    </html>
  `;
}
```

### Step 2: Auto-Load Backend on .shepthon Open

**File:** `extension/src/extension.ts`

Add to `activate()`:

```typescript
// Auto-load ShepThon backend when .shepthon files open
const runtimeManager = new RuntimeManager(context);
context.subscriptions.push(runtimeManager);

context.subscriptions.push(
  vscode.workspace.onDidOpenTextDocument(async (doc) => {
    if (doc.languageId === 'shepthon') {
      await runtimeManager.loadBackend(doc);
    }
  })
);
```

### Step 3: Bundle BobaRenderer for Webview

This is the more complex part. Options:

**Option A: Reuse shepyard's BobaRenderer**
- Copy `shepyard/src/preview/BobaRenderer.tsx` to extension
- Bundle with webpack/esbuild for webview
- Modify to use `window.callBackend()` instead of direct fetch

**Option B: Simplified Renderer**
- Create minimal renderer just for Dog Reminders
- Prove the concept works
- Expand later

**Option C: Use shepyard as preview (current approach in shepyard)**
- Extension opens shepyard URL in browser
- Shepyard loads via URL params
- Less integrated but faster to implement

---

## Testing the Bridge

### Manual Test

1. Open `examples/dog-reminders.shepthon`
2. Extension should auto-load backend
3. Check Output channel: "ShepThon backend loaded: DogReminders"
4. Open `examples/dog-reminders.shep`
5. Run "ShepLang: Show Preview"
6. Preview should show UI
7. Click "Add Reminder" button
8. Should see in console:
   ```
   [Bridge] Executing POST /reminders with body: {...}
   [Bridge] ✅ POST /reminders succeeded
   ```
9. New reminder appears in list
10. Refresh - data persists

### Automated Test

```typescript
// test/bridge.test.ts
import { bridgeService } from '../src/services/bridgeService';
import { ShepThonRuntime, parseShepThon } from '@sheplang/shepthon';

test('bridge calls ShepThon endpoint', async () => {
  const source = `
    app Test {
      model Item { id: id, name: string }
      endpoint POST "/items" (name: string) -> Item {
        return db.Item.create({ name })
      }
    }
  `;
  
  const parseResult = parseShepThon(source);
  const runtime = new ShepThonRuntime(parseResult.app);
  bridgeService.setRuntime(runtime);
  
  const result = await bridgeService.callEndpoint('POST', '/items', { name: 'Test' });
  
  expect(result.name).toBe('Test');
  expect(result.id).toBeDefined();
});
```

---

## Success Criteria

✅ Bridge service implemented  
⏳ Preview command creates webview  
⏳ Webview receives AST via postMessage  
⏳ Webview renders UI from AST  
⏳ Button clicks execute actions  
⏳ `call` statements invoke bridge  
⏳ Bridge returns results to renderer  
⏳ UI updates with new data  
⏳ Dog Reminders E2E flow works  

---

## Next Steps

1. **Implement preview command** (4 hours)
   - Create webview
   - Set up message passing
   - Wire to bridge service

2. **Bundle BobaRenderer** (6 hours)
   - Extract from shepyard
   - Adapt for webview context
   - Bundle for extension

3. **Test E2E** (2 hours)
   - Load Dog Reminders
   - Verify full flow
   - Record screencast

4. **Documentation** (2 hours)
   - Update README
   - Add troubleshooting
   - Write tutorial

**Total: ~14 hours = 2 days**

---

**Status: Bridge foundation complete. Preview implementation next.**
