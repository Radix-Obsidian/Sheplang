# Phase 2: Hybrid Runtime - ALPHA SCOPE

**Date:** January 15, 2025  
**Status:** 🎯 PLANNING  
**Extracted From:** Hybrid Backend DSL Research Document

---

## 🎯 What We're Building in Alpha

**Alpha Goal:** Dev-only, in-memory runtime that makes ShepThon work seamlessly with ShepLang/BobaScript in the Shipyard sandbox.

**NOT in Alpha:** Production deployment, HTTP endpoints, serverless, advanced bundling.

---

## ✅ Alpha Scope: In-Memory Dev Mode Only

### 1. **In-Memory TypeScript Modules (Dev Only)**

**Pattern:** RedwoodJS/Vite in-memory compilation  
**For Alpha:**
```
ShepThon code → TypeScript AST → Compiled in memory → Executed directly
```

**What This Means:**
- ShepThon code is **never written to disk** during dev
- Compiled modules live in memory (like Vite's dev server)
- Fast hot-reload on every edit
- No build step needed for development

**Implementation (Alpha):**
```typescript
// In Shipyard dev server:
import { parseShepThon } from '@sheplang/shepthon';
import { ShepThonRuntime } from '@sheplang/shepthon/runtime';

// Parse ShepThon file
const source = fs.readFileSync('dog-reminders.shepthon', 'utf-8');
const parsed = parseShepThon(source);

// Boot runtime in memory
const runtime = new ShepThonRuntime(parsed.app);

// Now ShepLang can call it directly:
const reminders = await runtime.callEndpoint('GET', '/reminders');
```

**Key Benefits:**
- Zero latency (no HTTP in dev)
- Instant feedback loop
- Simpler mental model for non-technical founders
- Type-safe function calls

**References:**
- Vite's in-memory compilation
- RedwoodJS dev server approach
- Next.js dev mode (before production)

---

### 2. **Direct Function Calls in Dev (No HTTP)**

**Pattern:** Blitz.js "Zero-API" dev mode, Next.js Server Actions  
**For Alpha:**
```typescript
// ShepLang (frontend) calls ShepThon (backend) directly:
action AddReminder(text, time) {
  call POST "/reminders"(text, time)
}

// Under the hood in dev:
// ❌ NOT: fetch('http://localhost:8910/api/reminders')
// ✅ YES: runtime.callEndpoint('POST', '/reminders', { text, time })
```

**What This Means:**
- ShepLang → ShepThon calls are **in-process** (same Node.js runtime)
- No network latency
- No HTTP server needed for dev
- Perfect for Shipyard sandbox (everything runs locally)

**Implementation (Alpha):**
```typescript
// Shipyard's ShepLang evaluator:
async function evaluateCallAction(action: CallAction) {
  const { method, path, body } = action;
  
  // Direct call to ShepThon runtime (no HTTP):
  return await shepthonRuntime.callEndpoint(method, path, body);
}
```

**Key Benefits:**
- Feels like "one codebase" to the founder
- Instant execution (microseconds, not milliseconds)
- Easier debugging (all in one process)
- No CORS, no network errors

**References:**
- Blitz.js Zero-API (dev mode direct calls)
- Next.js Server Actions (in-process during SSR)
- tRPC server-side calls

---

### 3. **Type Safety via Shared TypeScript Types**

**Pattern:** tRPC's type inference, Redwood's generated types  
**For Alpha:**
```typescript
// ShepThon defines the contract:
model Reminder {
  id: id
  text: string
  time: datetime
  done: bool = false
}

endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
  return db.Reminder.create({ text, time, done: false })
}

// ShepLang knows the types automatically:
// ✅ TypeScript knows `result` is a Reminder with { id, text, time, done }
const result = await backend.callEndpoint('POST', '/reminders', { 
  text: "Walk dog", 
  time: new Date() 
});
```

**What This Means:**
- ShepThon's AST provides type information
- ShepLang/BobaScript can access these types
- Type errors caught in IDE, not at runtime
- Autocomplete works across frontend/backend

**Implementation (Alpha):**
```typescript
// Generate TypeScript types from ShepThon AST:
export interface Reminder {
  id: string;
  text: string;
  time: Date;
  done: boolean;
}

export interface ShepThonAPI {
  'GET /reminders': () => Promise<Reminder[]>;
  'POST /reminders': (body: { text: string; time: Date }) => Promise<Reminder>;
}

// ShepLang uses these types:
import type { ShepThonAPI } from './generated/shepthon-types';
```

**Key Benefits:**
- No "stringly typed" API calls
- IDE autocomplete for endpoints
- Refactoring is safe (rename a field, IDE shows all usages)
- Prevents common data shape mistakes

**References:**
- tRPC's end-to-end type inference
- Redwood's `types/graphql.d.ts` generation
- GraphQL Code Generator approach

---

### 4. **Fast Dev Iteration (Hot Reload)**

**Pattern:** Vite HMR, Next.js Fast Refresh  
**For Alpha:**
```
Edit ShepThon file → Recompile AST → Reload runtime → UI updates (no full refresh)
```

**What This Means:**
- Change a ShepThon endpoint, see results in <1 second
- No need to restart Shipyard dev server
- State is preserved where possible
- Immediate feedback loop

**Implementation (Alpha):**
```typescript
// File watcher in Shipyard:
chokidar.watch('**/*.shepthon').on('change', async (filePath) => {
  // Reparse and reload:
  const source = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseShepThon(source);
  
  // Hot-swap runtime:
  shepthonRuntime = new ShepThonRuntime(parsed.app);
  
  console.log('✅ ShepThon reloaded');
});
```

**Key Benefits:**
- Founder sees changes instantly
- No "save → rebuild → restart → test" cycle
- Encourages experimentation
- Matches modern web dev expectations

**References:**
- Vite's 50ms rebuild times
- Next.js Fast Refresh
- Redwood's API hot reload

---

### 5. **Context Injection (db, log, now)**

**Pattern:** tRPC context, Redwood's GraphQL context  
**For Alpha:**
```typescript
// ShepThon code can use injected context:
endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
  log("Creating reminder:", text);  // ✅ Context.log
  
  return db.Reminder.create({       // ✅ Context.db
    text, 
    time, 
    done: false
  });
}

job "mark-due-as-done" every 5 minutes {
  let overdue = db.Reminder.find(r => r.time <= now() && !r.done);  // ✅ Context.now
  
  for reminder in overdue {
    db.Reminder.update(reminder.id, { done: true });
  }
}
```

**What This Means:**
- `db`, `log`, `now` are available in all ShepThon code
- No imports needed (feels magical)
- Runtime injects these automatically
- Consistent across endpoints and jobs

**Implementation (Alpha):**
```typescript
interface RuntimeContext {
  db: InMemoryDatabase;
  log: (...args: any[]) => void;
  now: () => Date;
}

// Injected when executing statements:
class StatementExecutor {
  constructor(private context: RuntimeContext) {}
  
  async execute(statement: Statement): Promise<any> {
    // `db`, `log`, `now` available via this.context
  }
}
```

**Key Benefits:**
- Clean, simple API for founders
- No boilerplate imports
- Testable (can inject mock context)
- Extensible (add more context later)

**References:**
- tRPC's `createContext`
- Redwood's GraphQL context
- Express middleware pattern

---

### 6. **Runtime Orchestration (Dev Mode Only)**

**Pattern:** Single unified dev process  
**For Alpha:**
```
┌─────────────────────────────────────────┐
│     Shipyard Dev Server (Node.js)       │
├─────────────────────────────────────────┤
│  ShepLang Evaluator (Frontend Logic)    │
│           ↓ Direct Call                  │
│  ShepThon Runtime (Backend Logic)       │
│           ↓                              │
│  InMemoryDatabase (Data Storage)        │
└─────────────────────────────────────────┘
```

**What This Means:**
- Everything runs in **one Node.js process**
- No separate API server needed
- Frontend and backend share memory (for dev only)
- Simpler to debug and understand

**Implementation (Alpha):**
```typescript
// Shipyard starts one server:
const app = express();

// Parse ShepLang (frontend):
const sheplangApp = parseShepLang(sheplangSource);

// Parse ShepThon (backend):
const shepthonApp = parseShepThon(shepthonSource);
const shepthonRuntime = new ShepThonRuntime(shepthonApp);

// Serve frontend:
app.get('/', (req, res) => {
  // Render ShepLang UI
  const html = renderShepLang(sheplangApp, shepthonRuntime);
  res.send(html);
});

// No API routes needed - direct calls only!
```

**Key Benefits:**
- Simpler architecture for alpha
- No CORS configuration needed
- Easier to understand for founders
- Faster than HTTP calls

**References:**
- Blitz.js unified dev process
- Next.js with SSR (frontend + backend in one runtime)

---

## 🚫 Explicitly OUT of Alpha Scope

These are important but **deferred to future phases**:

### ❌ Production Deployment
- HTTP/REST endpoints
- Serverless functions (AWS Lambda, Netlify)
- Cloudflare Workers
- Multiple deployment targets
- **Reason:** Alpha is dev-only. Production comes after proven dev experience.

### ❌ Build-Time Compilation
- Disk-based output (generated files)
- Bundling with esbuild/webpack
- Tree-shaking and optimization
- Code splitting
- **Reason:** In-memory is simpler for alpha. Build tooling adds complexity.

### ❌ Network-Based RPC
- HTTP fetch calls
- JSON-RPC protocol
- WebSocket channels
- tRPC integration
- **Reason:** Direct calls are faster and simpler for dev-only alpha.

### ❌ Advanced Type Safety
- Zod schema validation
- Runtime type checking
- Input sanitization
- Error boundary patterns
- **Reason:** Basic TypeScript types are sufficient for alpha. Runtime validation is nice-to-have.

### ❌ Bundling & Caching
- Webpack/esbuild integration
- TypeScript incremental compilation
- Disk-based module caching
- Build artifact management
- **Reason:** In-memory dev server handles this. No build artifacts in alpha.

### ❌ Multi-Target Output
- Client vs server code splitting
- Preventing backend leakage to frontend bundles
- Separate builds for dev/prod
- **Reason:** Single dev mode only in alpha. No client bundle concerns yet.

---

## 🎨 How This Improves Alpha Experience

### For Non-Technical Founders:

**Before (without hybrid runtime):**
```
1. Write frontend in ShepLang
2. Write backend... where? how?
3. Figure out how to connect them
4. Deploy both separately
5. Hope it works in production
```

**After (with Alpha hybrid runtime):**
```
1. Write frontend in ShepLang
2. Write backend in ShepThon (same project!)
3. Call backend from frontend (feels like one app)
4. See it work instantly in Shipyard
5. Production deployment? (Future phase)
```

### For Developer Experience:

**Immediate Benefits:**
- ✅ **Zero configuration** - No API setup needed
- ✅ **Instant feedback** - Direct calls, no latency
- ✅ **Type safety** - IDE autocomplete works
- ✅ **Hot reload** - Edit → see changes in <1s
- ✅ **Simple mental model** - One codebase, one process
- ✅ **Easy debugging** - All logs in one console
- ✅ **No deployment complexity** - Dev mode "just works"

### For ShepLang/BobaScript Integration:

**Seamless Coexistence:**
```sheplang
// ShepLang screen:
screen DogReminders {
  data reminders = load GET "/reminders"
  
  action addReminder(text, time) {
    call POST "/reminders"(text, time)
    reload reminders
  }
  
  list {
    for reminder in reminders {
      text { reminder.text }
    }
  }
}
```

**Behind the Scenes:**
```typescript
// `load GET "/reminders"` becomes:
const reminders = await shepthonRuntime.callEndpoint('GET', '/reminders');

// `call POST "/reminders"(text, time)` becomes:
await shepthonRuntime.callEndpoint('POST', '/reminders', { text, time });
```

**Founder Never Sees:**
- HTTP configuration
- CORS setup
- API route definitions
- Network error handling (in dev)
- Serialization/deserialization

---

## 📊 Alpha Scope vs Future Phases

| Feature | Alpha (Phase 2) | Future (Phase 3+) |
|---------|-----------------|-------------------|
| **Runtime Mode** | Dev only (in-memory) | Dev + Production |
| **Communication** | Direct function calls | HTTP/RPC endpoints |
| **Type Safety** | TypeScript inference | + Zod validation |
| **Hot Reload** | ✅ Yes | ✅ Yes |
| **Context Injection** | ✅ Yes (db, log, now) | + auth, request, etc. |
| **Deployment** | ❌ N/A | Vercel/Netlify/AWS |
| **Bundling** | ❌ N/A | esbuild/webpack |
| **Code Splitting** | ❌ N/A | Client vs Server |
| **Serverless** | ❌ N/A | Lambda/Functions |
| **Error Recovery** | Basic | Advanced + monitoring |

---

## 🛠️ Implementation Priority (Alpha)

**What We Build Now:**
1. ✅ In-memory runtime orchestration
2. ✅ Direct function call mechanism
3. ✅ Context injection (db, log, now)
4. ✅ Basic type generation from AST
5. ✅ Hot reload integration

**What We Document (but don't build yet):**
1. 📋 Production HTTP endpoints
2. 📋 Build-time compilation strategy
3. 📋 Deployment targets
4. 📋 Advanced validation
5. 📋 Zero-API patterns

---

## 🐑 Founder Takeaway

**Alpha Runtime = "Magic" Dev Experience:**

"I write frontend (ShepLang) and backend (ShepThon) in the same project. I call backend functions from frontend as if they're just... functions. No APIs, no servers, no deployment - it just works in Shipyard. When I edit ShepThon, the changes appear instantly. It feels like one unified app."

**Technical Reality (Hidden from Founder):**
- In-memory TypeScript compilation
- Direct function invocation (no network)
- Context injection for clean APIs
- Hot module replacement
- Shared type system

**What This Unlocks:**
- Dog Reminders works end-to-end in Shipyard
- Founders can build real apps without deployment complexity
- Future: One-click deploy when ready for production

---

## 📚 References (Alpha-Relevant Only)

**Dev Mode In-Memory Compilation:**
- Vite dev server architecture
- Next.js dev mode (before production build)
- RedwoodJS in-memory API transpilation

**Direct Function Calls:**
- Blitz.js Zero-API (dev mode)
- Next.js Server Actions (SSR context)
- tRPC server-side calls

**Type Safety:**
- tRPC's TypeScript inference
- Redwood's generated GraphQL types
- TypeScript project references

**Context Injection:**
- tRPC's `createContext`
- Express middleware patterns
- Redwood's GraphQL context

**Hot Reload:**
- Vite HMR
- Next.js Fast Refresh
- Chokidar file watching

---

**Last Updated:** January 15, 2025  
**Next Steps:** Implement Phase 2 runtime components (InMemoryDatabase, EndpointRouter, etc.)
