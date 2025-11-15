# Phase 2 Scope Decision Summary

**Date:** January 15, 2025  
**Decision:** Split Hybrid Runtime research into Alpha vs Future scope  
**Status:** ✅ DECISION MADE

---

## 📄 What You Provided

A comprehensive **Hybrid Backend DSL** research document covering:
- In-memory vs disk compilation strategies
- Dev vs production runtime orchestration
- Type safety patterns (tRPC, Zod)
- Deployment targets (Vercel, Netlify, AWS)
- Zero-API patterns (Blitz.js style)
- Bundling & code splitting
- Client leakage prevention
- Advanced features (auth, caching, monitoring)

**Total concepts:** ~20+ major features from modern full-stack frameworks

---

## ✅ ALPHA SCOPE: What We're Building Now

**Document:** `PHASE2_Hybrid_Runtime_Alpha_Scope.md`

### Core Alpha Features (6 Components):

#### 1. **In-Memory TypeScript Modules**
**Pattern:** Vite dev server, RedwoodJS in-memory compilation  
**Why:** Zero disk I/O = faster dev experience  
**Status:** Implementing in Phase 2

#### 2. **Direct Function Calls (No HTTP in Dev)**
**Pattern:** Blitz.js Zero-API dev mode  
**Why:** No network latency, simpler mental model  
**Status:** Implementing in Phase 2

#### 3. **Type Safety via Shared TypeScript Types**
**Pattern:** tRPC type inference  
**Why:** IDE autocomplete, catch errors before runtime  
**Status:** Implementing in Phase 2

#### 4. **Fast Dev Iteration with Hot Reload**
**Pattern:** Vite HMR, Next.js Fast Refresh  
**Why:** Edit → see changes in <1s  
**Status:** Implementing in Phase 2

#### 5. **Context Injection (db, log, now)**
**Pattern:** tRPC context, Express middleware  
**Why:** Clean API for non-technical founders  
**Status:** Implementing in Phase 2

#### 6. **Runtime Orchestration (Dev Mode Only)**
**Pattern:** Single unified dev process  
**Why:** Everything in one Node.js process = easier debugging  
**Status:** Implementing in Phase 2

---

## 📋 FUTURE SCOPE: What We Archived

**Document:** `Future_ShepThon_Production_Deployment.md`

### Deferred Features (14+ Components):

#### Production Deployment
- ❌ HTTP/REST endpoint generation
- ❌ Build-time compilation to disk
- ❌ Bundling with esbuild/webpack
- ❌ Tree-shaking and code splitting
- **Reason:** Alpha is dev-only; production after validation

#### Multiple Deployment Targets
- ❌ Vercel Edge Functions
- ❌ Netlify Functions
- ❌ AWS Lambda
- ❌ Docker containers
- **Reason:** One target at a time; alpha doesn't deploy

#### Network-Based Communication
- ❌ JSON-RPC protocol
- ❌ tRPC integration
- ❌ WebSocket channels
- ❌ HTTP client generation
- **Reason:** Direct calls are simpler for dev-only alpha

#### Advanced Type Safety
- ❌ Zod schema validation
- ❌ Runtime type checking
- ❌ Input sanitization
- ❌ Custom error boundaries
- **Reason:** Basic TypeScript types sufficient for alpha

#### Zero-API Patterns
- ❌ Blitz.js style imports
- ❌ Build-time transform (Babel/SWC)
- ❌ Automatic RPC generation
- ❌ Client leakage prevention
- **Reason:** Complex; only needed when shipping to production

#### Database Integration
- ❌ Prisma ORM
- ❌ Real database connections
- ❌ Migration generation
- ❌ Type-safe queries
- **Reason:** In-memory DB sufficient for alpha validation

#### Authentication & Authorization
- ❌ JWT integration
- ❌ Role-based access control
- ❌ User context injection
- ❌ OAuth providers
- **Reason:** Not needed for basic Dog Reminders demo

#### Monitoring & Error Tracking
- ❌ Sentry integration
- ❌ Performance monitoring
- ❌ Structured logging
- ❌ APM tools
- **Reason:** Dev-only alpha doesn't need production monitoring

#### Caching Strategies
- ❌ React Query integration
- ❌ Redis caching
- ❌ In-memory cache decorators
- ❌ Cache invalidation
- **Reason:** Optimization; not critical for alpha validation

#### Monorepo Tooling
- ❌ TurboRepo setup
- ❌ pnpm workspace optimization
- ❌ Shared packages structure
- ❌ Build orchestration
- **Reason:** Single package sufficient for alpha

---

## 🎯 Decision Rationale

### Why Split Alpha vs Future?

**Alpha Goal:**
> Prove that ShepThon + ShepLang/BobaScript can work together seamlessly in Shipyard sandbox.

**What Alpha Needs:**
1. ✅ Parse ShepThon code (Phase 1 - Done)
2. ✅ Execute ShepThon logic (Phase 2 - Now)
3. ✅ Call ShepThon from ShepLang (Phase 2 - Now)
4. ✅ See it work in Shipyard (Phase 2 - Now)

**What Alpha Does NOT Need:**
- ❌ Production deployment (no users yet)
- ❌ HTTP/network layer (dev-only)
- ❌ Advanced validation (basic types OK)
- ❌ Real database (in-memory OK)
- ❌ Auth/monitoring (not relevant yet)

**Principle:**
> Build the minimum to validate the concept, then add production features once proven.

---

## 📊 Alpha vs Future Comparison

| Feature | Alpha (Phase 2) | Future (Phase 3+) |
|---------|-----------------|-------------------|
| **Compilation** | In-memory only | + Disk output |
| **Runtime** | Dev mode only | + Production mode |
| **Communication** | Direct calls | + HTTP/RPC |
| **Type Safety** | TypeScript types | + Zod validation |
| **Deployment** | N/A (local only) | Vercel/Netlify/AWS |
| **Database** | In-memory | + Prisma + Real DB |
| **Auth** | N/A | + JWT + RBAC |
| **Monitoring** | Console logs | + Sentry + APM |
| **Caching** | N/A | + React Query + Redis |
| **Bundling** | N/A | + esbuild + optimization |
| **Zero-API** | N/A | + Blitz.js patterns |

---

## 🚀 What This Means for Development

### Immediate Impact (Phase 2):

**Simplified Architecture:**
```
Shipyard Dev Server (one Node.js process)
  ↓
ShepLang Evaluator (frontend)
  ↓ Direct function call (in-memory)
ShepThon Runtime (backend)
  ↓
InMemoryDatabase (data)
```

**No Need For:**
- ❌ HTTP server setup
- ❌ API route definitions
- ❌ CORS configuration
- ❌ Network error handling
- ❌ Build tooling
- ❌ Deployment scripts

**Developer Workflow:**
```bash
# 1. Edit ShepThon file:
$ vim dog-reminders.shepthon

# 2. Save (auto hot-reload)
# ✅ Changes reflected instantly

# 3. Test in Shipyard
# ✅ Works immediately (no build step)
```

### Future Impact (Phase 3+):

**Production-Ready Architecture:**
```
ShepLang App (browser)
  ↓ HTTP fetch
API Gateway (Vercel/Netlify)
  ↓
ShepThon Endpoints (serverless)
  ↓
Database (PostgreSQL + Prisma)
  ↓
Monitoring (Sentry + Datadog)
```

**Additional Steps:**
```bash
# 1. Build for production:
$ shep build --target vercel

# 2. Deploy:
$ shep deploy vercel

# 3. Monitor:
$ shep logs --tail
```

---

## 🎓 Learning from Modern Frameworks

### Patterns We're Using (Alpha):

**From Vite:**
- ✅ In-memory compilation
- ✅ Fast HMR (hot module replacement)
- ✅ Plugin system for custom transforms

**From Blitz.js:**
- ✅ Direct function calls in dev
- ✅ Unified dev server (one process)
- ✅ Type-safe frontend ↔ backend

**From tRPC:**
- ✅ End-to-end type inference
- ✅ Context injection pattern
- ✅ No manual API definitions

**From Next.js:**
- ✅ Fast refresh on edit
- ✅ TypeScript-first approach
- ✅ Convention over configuration

### Patterns We're Deferring (Future):

**From RedwoodJS:**
- 📋 GraphQL API layer (too complex)
- 📋 Serverless deployment (not needed yet)
- 📋 Prisma integration (nice-to-have)

**From Blitz.js:**
- 📋 Zero-API import transforms (production only)
- 📋 Build-time code splitting (optimization)
- 📋 Automatic RPC generation (later)

**From tRPC:**
- 📋 Zod schema validation (runtime safety)
- 📋 React Query integration (caching)
- 📋 WebSocket support (realtime)

---

## ✅ Alpha Success Criteria (Unchanged)

From TTD_ShepThon_Core.md:

1. ✅ ShepThon can describe Dog Reminders app
2. ✅ Runtime can execute endpoints (GET/POST)
3. ✅ In-memory database supports CRUD
4. ✅ Jobs can be scheduled (`every N minutes`)
5. ✅ Dog Reminders E2E test passes
6. ✅ `pnpm run verify` GREEN

**Plus Hybrid Runtime (Alpha Scope):**
7. ✅ Direct calls from ShepLang to ShepThon
8. ✅ Type-safe function invocation
9. ✅ Hot reload on ShepThon file edit
10. ✅ Context injection works (db, log, now)
11. ✅ Single dev process (no HTTP server)

---

## 📈 Post-Alpha Roadmap

### Phase 3: Basic Production
- HTTP endpoint generation
- Express server deployment
- Basic environment variables
- Simple error handling

### Phase 4: Serverless
- Vercel/Netlify adapters
- Lambda function output
- Multi-region deployment
- Cold start optimization

### Phase 5: Type Safety++
- Zod validation integration
- Runtime type checking
- Input sanitization
- Custom validation rules

### Phase 6: Database
- Prisma ORM integration
- Migration generation
- Real database connections
- Type-safe queries

### Phase 7: Auth & Monitoring
- JWT/OAuth integration
- RBAC implementation
- Sentry error tracking
- Performance monitoring

### Phase 8: Zero-API
- Blitz.js style imports
- Automatic RPC generation
- Build-time transforms
- Client leakage prevention

---

## 🐑 Founder Perspective

### What Founders Will Experience (Alpha):

**Writing Backend:**
```shepthon
app DogReminders {
  model Reminder {
    id: id
    text: string
    time: datetime
    done: bool = false
  }
  
  endpoint GET "/reminders" -> [Reminder] {
    return db.Reminder.findAll()
  }
  
  endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
    return db.Reminder.create({ text, time, done: false })
  }
}
```

**Calling from Frontend:**
```sheplang
screen DogReminders {
  data reminders = load GET "/reminders"
  
  action addReminder(text, time) {
    call POST "/reminders"(text, time)
    reload reminders
  }
}
```

**Experience:**
- ✅ Feels like "one app"
- ✅ Changes appear instantly
- ✅ No configuration needed
- ✅ No deployment complexity
- ✅ Just works in Shipyard

### What Founders Won't See (Complexity Hidden):

**Behind the Scenes:**
- In-memory TypeScript compilation
- Direct function invocation
- Context injection magic
- Hot module replacement
- Type inference system

**Doesn't Exist Yet (Future):**
- Production deployment
- HTTP server setup
- Build configuration
- Database migrations
- Monitoring dashboards

---

## 📚 Documentation Created

### Alpha Scope (Active):
1. ✅ `PHASE2_ShepThon_Plan.md` - Original Phase 2 plan
2. ✅ `PHASE2_Hybrid_Runtime_Alpha_Scope.md` - Alpha hybrid features
3. ✅ `PHASE2_Scope_Decision_Summary.md` - This document

### Future Scope (Archived):
1. ✅ `Future_ShepThon_Production_Deployment.md` - Production roadmap

### Implementation Guides:
- InMemoryDatabase (~150 lines)
- ExpressionEvaluator (~250 lines)
- StatementExecutor (~300 lines)
- EndpointRouter (~100 lines)
- JobScheduler (~150 lines)
- ShepThonRuntime (~200 lines)

**Total:** ~1,150 lines of runtime code + ~1,000 lines of tests

---

## ✨ Summary

**What We Decided:**

✅ **Alpha Scope (Phase 2):**
- In-memory dev-only runtime
- Direct function calls (no HTTP)
- Type-safe ShepLang ↔ ShepThon integration
- Hot reload, context injection
- Single dev process

📋 **Future Scope (Phase 3+):**
- Production deployment (HTTP endpoints)
- Multiple targets (Vercel/Netlify/AWS)
- Advanced validation (Zod)
- Real database (Prisma)
- Auth, monitoring, caching
- Zero-API patterns

**Why This Split:**
- Alpha validates the concept with minimal complexity
- Founders experience seamless dev workflow
- Production features come after proven validation
- Clear roadmap for future enhancements

**Next Step:**
Implement Phase 2 runtime components starting with `InMemoryDatabase`.

---

**Decision Made By:** AI (Cascade) + User approval  
**Date:** January 15, 2025  
**Status:** ✅ APPROVED - Ready to implement
