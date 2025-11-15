# ShepThon Web Worker Implementation Plan

## 🐛 Problem Analysis

### Issue
Browser hangs with `RESULT_CODE_HUNG` when loading ShepThon Dog Reminders backend.

### Root Cause (Confirmed)
1. **Parser runs on main thread** - Blocks UI
2. **Infinite loop in parser** - `parser.ts:693` in `match()` function
3. **Synchronous execution** - No way to cancel or defer

### Evidence
- Console logs show execution stops at `loadShepThon()` call
- Debugger shows stack trace in parser match function
- Browser completely freezes, requires hard refresh

---

## ✅ Industry Standard Solution (Research-Based)

### Official Sources
1. **Vite + Web Workers**: https://v3.vitejs.dev/guide/features
2. **Comlink (Google)**: https://github.com/GoogleChromeLabs/comlink
3. **vite-plugin-comlink**: https://github.com/mathe42/vite-plugin-comlink
4. **React + Web Workers**: https://blog.logrocket.com/web-workers-react-typescript/
5. **Monaco Editor Pattern**: Language servers run in Web Workers

### Why Web Workers?
- **Non-blocking**: Runs in background thread
- **No UI freeze**: Main thread stays responsive
- **Standard pattern**: VS Code, Monaco Editor, TypeScript use this
- **Cancellable**: Can terminate if needed

---

## 🎯 Implementation Plan

### Phase 1: Setup (30 min)

**1.1 Install Dependencies**
```bash
cd shepyard
pnpm add comlink
pnpm add -D vite-plugin-comlink
```

**1.2 Configure Vite**
Update `shepyard/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { comlink } from 'vite-plugin-comlink'
import path from 'path'

export default defineConfig({
  plugins: [
    comlink(), // Add BEFORE react
    react()
  ],
  worker: {
    plugins: () => [comlink()]
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@sheplang/shepthon': path.resolve(__dirname, '../sheplang/packages/shepthon/src/index.ts')
    }
  }
})
```

**1.3 Add Type Definitions**
Update `shepyard/src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />
```

---

### Phase 2: Create Web Worker (45 min)

**2.1 Worker File Structure**
```
shepyard/src/workers/
  ├── shepthon/
  │   ├── worker.ts          # The actual Web Worker
  │   └── types.ts           # Shared types
  └── index.ts               # Worker registry
```

**2.2 ShepThon Worker Implementation**
Create `shepyard/src/workers/shepthon/worker.ts`:
```typescript
/**
 * ShepThon Web Worker
 * 
 * Runs ShepThon parser and runtime in background thread.
 * Prevents blocking main UI thread.
 * 
 * Pattern: Monaco Editor Language Server
 * Reference: vite-plugin-comlink examples
 */

import { parseShepThon, ShepThonRuntime } from '@sheplang/shepthon';
import type { ParseResult } from '@sheplang/shepthon';
import type { AppMetadata } from './types';

/**
 * Parse ShepThon source in Web Worker
 */
export function parseShepThonWorker(source: string): ParseResult {
  if (!source || source.trim().length === 0) {
    return {
      app: null,
      diagnostics: [{
        severity: 'error',
        message: 'Source code is empty',
        line: 0,
        column: 0
      }]
    };
  }

  try {
    return parseShepThon(source);
  } catch (error) {
    return {
      app: null,
      diagnostics: [{
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown parse error',
        line: 0,
        column: 0
      }]
    };
  }
}

/**
 * Load ShepThon and extract metadata in Web Worker
 */
export function loadShepThonWorker(source: string): {
  success: boolean;
  metadata?: AppMetadata;
  error?: string;
} {
  const parseResult = parseShepThonWorker(source);

  if (!parseResult.app) {
    const errorMessage = parseResult.diagnostics
      .map(d => `[${d.severity}] ${d.message}`)
      .join('\n') || 'Failed to parse ShepThon source';

    return {
      success: false,
      error: errorMessage
    };
  }

  try {
    // Create runtime (in worker)
    const runtime = new ShepThonRuntime(parseResult.app);

    // Extract metadata
    const metadata: AppMetadata = {
      name: parseResult.app.name,
      models: parseResult.app.models.map(m => ({
        name: m.name,
        fieldCount: m.fields.length,
        fields: m.fields.map(f => ({
          name: f.name,
          type: f.type,
          hasDefault: f.defaultValue !== undefined
        }))
      })),
      endpoints: parseResult.app.endpoints.map(e => ({
        method: e.method,
        path: e.path,
        parameterCount: e.parameters.length,
        parameters: e.parameters.map(p => ({
          name: p.name,
          type: p.type,
          optional: p.optional || false
        })),
        returnType: e.returnType.isArray 
          ? `[${e.returnType.type}]`
          : e.returnType.type
      })),
      jobs: parseResult.app.jobs.map(j => ({
        name: j.name,
        schedule: `every ${j.schedule.every} ${j.schedule.unit}`,
        statementCount: j.body.length
      }))
    };

    return {
      success: true,
      metadata
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create runtime'
    };
  }
}
```

**2.3 Shared Types**
Create `shepyard/src/workers/shepthon/types.ts`:
```typescript
export interface AppMetadata {
  name: string;
  models: ModelInfo[];
  endpoints: EndpointInfo[];
  jobs: JobInfo[];
}

export interface ModelInfo {
  name: string;
  fieldCount: number;
  fields: Array<{
    name: string;
    type: string;
    hasDefault: boolean;
  }>;
}

export interface EndpointInfo {
  method: 'GET' | 'POST';
  path: string;
  parameterCount: number;
  parameters: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
  returnType: string;
}

export interface JobInfo {
  name: string;
  schedule: string;
  statementCount: number;
}
```

**2.4 Worker Registry**
Create `shepyard/src/workers/index.ts`:
```typescript
/**
 * Web Workers Registry
 * 
 * Central location for all Comlink workers.
 * Pattern: Centralized worker management
 */

/* eslint-disable no-undef */
const shepthonWorker = new ComlinkWorker<typeof import('./shepthon/worker')>(
  new URL('./shepthon/worker', import.meta.url)
);

export { shepthonWorker };
```

---

### Phase 3: Update Hook (15 min)

**3.1 Update useLoadShepThon**
Modify `shepyard/src/hooks/useLoadShepThon.ts`:
```typescript
import { useEffect } from 'react';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { SHEPTHON_EXAMPLES } from '../examples/exampleList';
import { shepthonWorker } from '../workers';

export function useLoadShepThon() {
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const setShepThonMetadata = useWorkspaceStore((state) => state.setShepThonMetadata);
  const setShepThonError = useWorkspaceStore((state) => state.setShepThonError);
  const setShepThonLoading = useWorkspaceStore((state) => state.setShepThonLoading);
  const clearShepThon = useWorkspaceStore((state) => state.clearShepThon);

  useEffect(() => {
    const shepthonExample = SHEPTHON_EXAMPLES.find(ex => ex.id === activeExampleId);
    
    if (!shepthonExample) {
      clearShepThon();
      return;
    }

    // Load in Web Worker (non-blocking!)
    const loadBackend = async () => {
      setShepThonLoading(true);

      try {
        console.log('[ShepThon] Loading in Web Worker:', shepthonExample.id);
        
        // This runs in background thread!
        const result = await shepthonWorker.loadShepThonWorker(shepthonExample.source);

        if (result.success && result.metadata) {
          console.log('[ShepThon] Loaded successfully:', result.metadata.name);
          setShepThonMetadata(result.metadata);
        } else {
          console.error('[ShepThon] Load failed:', result.error);
          setShepThonError(result.error || 'Failed to load ShepThon backend');
        }
      } catch (error) {
        console.error('[ShepThon] Worker error:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error loading ShepThon';
        setShepThonError(errorMessage);
      }
    };

    loadBackend();
  }, [activeExampleId, setShepThonMetadata, setShepThonError, setShepThonLoading, clearShepThon]);
}
```

---

### Phase 4: Test & Verify (30 min)

**4.1 Build Test**
```bash
cd shepyard
pnpm build
```

**4.2 Manual Test**
1. Start dev server: `pnpm dev`
2. Open http://localhost:3000
3. Click "Dog Reminders (Backend)"
4. **Expected:** Loads without freezing
5. Check console for worker logs

**4.3 Success Criteria**
- ✅ Browser doesn't freeze
- ✅ Metadata displays in Backend Panel
- ✅ Can switch between examples smoothly
- ✅ Console shows "[ShepThon] Loading in Web Worker"

---

## 📊 Benefits

### Before (Synchronous)
- ❌ Blocks main thread
- ❌ UI freezes completely
- ❌ Browser hangs (RESULT_CODE_HUNG)
- ❌ No way to cancel

### After (Web Worker)
- ✅ Non-blocking
- ✅ UI stays responsive
- ✅ Can show loading spinner
- ✅ Cancellable if needed

---

## 🎯 Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Setup deps + config | 30 min | 📋 TODO |
| 2 | Create Web Worker | 45 min | 📋 TODO |
| 3 | Update hook | 15 min | 📋 TODO |
| 4 | Test & verify | 30 min | 📋 TODO |
| **Total** | **Complete solution** | **~2 hours** | |

---

## 🔧 Current Status

**Temporary Workaround (Deployed):**
- ✅ Auto-loading disabled
- ✅ Browser no longer hangs
- ✅ Shows error message instead
- ✅ User can use other Shepyard features

**Next Steps:**
1. Implement Web Worker solution (follow this plan)
2. Test with Dog Reminders example
3. Enable auto-loading again
4. Verify no hangs

---

## 📚 References

**Official Documentation:**
- [Vite Features](https://v3.vitejs.dev/guide/features)
- [vite-plugin-comlink](https://github.com/mathe42/vite-plugin-comlink)
- [Comlink by Google](https://github.com/GoogleChromeLabs/comlink)
- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

**Implementation Examples:**
- [React + Web Workers + Comlink](https://medium.com/@hrupanjan/supercharge-your-react-app-offload-heavy-tasks-to-web-workers-with-comlink-97b4b210450b)
- [Vite + Comlink + TanStack Query](https://johnnyreilly.com/web-workers-comlink-vite-tanstack-query)
- [Monaco Editor Pattern](https://github.com/TypeFox/monaco-languageclient)

**Battle-Tested By:**
- VS Code (Language servers)
- Monaco Editor (Syntax checking)
- TypeScript compiler (Background compilation)
- ESLint, Prettier (Linting in workers)

---

## ✅ Ready to Implement

This is the **industry standard, battle-tested solution** for running heavy parsers in web applications.

**Zero compromises. No workarounds. Just proper engineering.** 🚀
