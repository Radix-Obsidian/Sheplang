# ShepThon: Production Deployment & Advanced Features

**Date:** January 15, 2025  
**Status:** 📋 FUTURE (Post-Alpha)  
**Source:** Hybrid Backend DSL Research Document

---

## ⚠️ Important Notice

**This document archives features for FUTURE phases (Phase 3+).**

**Alpha (Phase 2) is dev-only, in-memory runtime.**

Everything below is **out of scope** for alpha but represents the roadmap for making ShepThon production-ready.

---

## 🎯 Post-Alpha Vision

After alpha proves the dev experience, we'll build:
1. **Production deployment** (HTTP/REST endpoints)
2. **Multiple deployment targets** (Vercel, Netlify, AWS)
3. **Advanced bundling** (optimized, tree-shaken)
4. **Zero-API patterns** (Blitz.js style)
5. **Advanced type safety** (Zod validation)
6. **Serverless** (Lambda, Cloudflare Workers)

---

## 1. Compiler Strategies: Dev vs Production

### Current (Alpha): In-Memory Only
```typescript
// Dev mode:
ShepThon source → Parse AST → Execute in memory
```

### Future (Production): Dual Compilation Targets

**Pattern:** RedwoodJS, Next.js, Astro multi-target builds

**Dev Target (In-Memory):**
```typescript
// Fast compilation for development:
ShepThon source → TypeScript AST → In-memory module → Direct execution
```

**Production Target (Disk/HTTP):**
```typescript
// Optimized build for deployment:
ShepThon source → TypeScript code → Bundled JS files → HTTP handlers
```

### Implementation Strategy:

**Single Source, Dual Output:**
```typescript
// One ShepThon function:
endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
  return db.Reminder.create({ text, time, done: false });
}

// Compiles to TWO forms:

// 1. Dev (in-memory module):
export async function createReminder(
  body: { text: string; time: Date },
  context: RuntimeContext
): Promise<Reminder> {
  return context.db.Reminder.create({ text: body.text, time: body.time, done: false });
}

// 2. Production (HTTP handler):
export default async function handler(req: Request, res: Response) {
  const body = req.body as { text: string; time: Date };
  const context = createContext(req);
  const result = await createReminder(body, context);
  res.json(result);
}
```

### Bundling for Production:

**Tools:**
- esbuild (fast bundling)
- SWC (TypeScript compilation)
- Webpack (if needed for complex cases)

**Strategy:**
```
1. Generate one JS file per endpoint
2. Include all dependencies (tree-shaken)
3. Exclude dev-only utilities
4. Minify for production
5. Output to /dist or /.netlify/functions
```

**Example Output Structure:**
```
dist/
├── api/
│   ├── get-reminders.js        # GET /reminders handler
│   ├── post-reminders.js       # POST /reminders handler
│   └── shared/
│       ├── database.js         # Shared DB logic
│       └── context.js          # Context creation
└── server.js                   # Express server (if not serverless)
```

**References:**
- RedwoodJS's webpack bundling for Netlify Functions
- Next.js API route compilation
- Astro's server output mode

---

## 2. Avoiding Client Leakage (Security)

### The Problem:
**Backend code must NEVER ship to browser bundles.**

**Bad Example:**
```typescript
// Frontend accidentally includes:
import { getUserPassword } from '../api/auth';  // ❌ LEAKED!

// Now getUserPassword logic is in client bundle (security risk!)
```

### Solution: Blitz.js "Zero-API" Pattern

**Pattern:** Build-time transform replaces imports with network calls

**How It Works:**
```typescript
// Developer writes (looks like direct import):
import { getUser } from 'app/queries/getUser';

const user = await getUser(123);

// ✅ Dev mode: Direct function call (in-memory)
// ✅ Production: Transformed to:
const user = await fetch('/api/rpc/getUser', { 
  method: 'POST', 
  body: JSON.stringify({ args: [123] }) 
}).then(r => r.json());
```

**Implementation:**
```typescript
// Babel/SWC plugin:
function transformShepThonImports(ast) {
  ast.program.body.forEach(node => {
    if (node.type === 'ImportDeclaration' && 
        node.source.value.startsWith('shepthon:')) {
      // Replace with RPC client stub:
      return t.importDeclaration(
        node.specifiers,
        t.stringLiteral('__shepthon_client__')
      );
    }
  });
}
```

**Build-Time Checks:**
```typescript
// Ensure backend code never in client bundle:
class ShepThonWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('ShepThonPlugin', (compilation) => {
      compilation.hooks.seal.tap('ShepThonPlugin', () => {
        // Check for accidental backend imports:
        for (const module of compilation.modules) {
          if (module.resource && module.resource.includes('.shepthon')) {
            if (isClientBundle(module)) {
              throw new Error('ShepThon file leaked to client bundle!');
            }
          }
        }
      });
    });
  }
}
```

**References:**
- Blitz.js Babel plugin (transforms imports)
- Next.js Server Components (server-only code)
- RedwoodJS GraphQL (schema not in client)

---

## 3. Production Runtime Orchestration

### Dev Mode (Current Alpha):
```
ShepLang → Direct Call → ShepThon Runtime (in-memory)
```

### Production Mode (Future):
```
ShepLang (browser) → HTTP/RPC → ShepThon API (cloud server)
```

### Implementation: Dual Runtime Strategy

**Frontend Client (Browser):**
```typescript
// Auto-generated API client:
export class ShepThonClient {
  private baseUrl: string;
  
  constructor(baseUrl = process.env.SHEPTHON_API_URL) {
    this.baseUrl = baseUrl;
  }
  
  async callEndpoint<T>(
    method: HttpMethod, 
    path: string, 
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new ShepThonError(await response.json());
    }
    
    return response.json();
  }
}

// Usage in ShepLang:
const client = new ShepThonClient('https://api.myapp.com');
const reminders = await client.callEndpoint('GET', '/reminders');
```

**Backend Server (Node/Serverless):**
```typescript
// Express server (traditional deployment):
import express from 'express';
import { createShepThonHandler } from '@sheplang/shepthon/server';

const app = express();
app.use(express.json());

// Auto-generated from ShepThon AST:
const handler = createShepThonHandler(shepthonApp);

app.all('/api/*', async (req, res) => {
  const path = req.path.replace('/api', '');
  const result = await handler(req.method, path, req.body);
  res.json(result);
});

app.listen(3000);
```

**Serverless Function (Vercel/Netlify):**
```typescript
// /api/reminders.ts (Vercel Edge Function):
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createShepThonHandler } from '@sheplang/shepthon/server';

const handler = createShepThonHandler(shepthonApp);

export default async function(req: VercelRequest, res: VercelResponse) {
  const result = await handler(req.method!, '/reminders', req.body);
  return res.json(result);
}
```

### Seamless Switching (Dev ↔ Prod):

**Environment-Based:**
```typescript
// ShepLang runtime automatically switches:
const runtime = process.env.NODE_ENV === 'production'
  ? new ShepThonClient(process.env.API_URL)
  : shepthonInMemoryRuntime;

// Same API, different implementation:
const reminders = await runtime.callEndpoint('GET', '/reminders');
```

**Build-Time Flag:**
```typescript
// Webpack DefinePlugin:
new webpack.DefinePlugin({
  'process.env.SHEPTHON_MODE': JSON.stringify(
    process.env.NODE_ENV === 'production' ? 'remote' : 'local'
  )
});

// Code uses flag:
if (process.env.SHEPTHON_MODE === 'remote') {
  // Use HTTP client
} else {
  // Use in-memory runtime
}
```

**References:**
- Redwood's dual dev/prod GraphQL endpoint
- Next.js environment variables
- Blitz.js RPC client/server split

---

## 4. Advanced Type Safety

### Current (Alpha): Basic TypeScript Types
```typescript
// ShepThon defines:
model User { id: id, email: string }

// TS types generated:
interface User { id: string; email: string; }
```

### Future: Runtime Validation with Zod

**Pattern:** tRPC + Zod for dual static/runtime safety

**Example:**
```typescript
import { z } from 'zod';

// ShepThon compiler generates Zod schemas:
const UserInputSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

const UserOutputSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number(),
  createdAt: z.date()
});

// Endpoint with validation:
endpoint POST "/users" (input: UserInput) -> User {
  // ✅ Input validated at runtime:
  const validated = UserInputSchema.parse(input);
  
  // ✅ TypeScript knows types statically:
  return db.User.create(validated);
}
```

**Benefits:**
- Static types (TypeScript) + runtime checks (Zod)
- Prevent invalid data from reaching business logic
- Auto-generate error messages
- Client-side validation (same schema)

**Auto-Generation:**
```typescript
// From ShepThon AST to Zod:
function generateZodSchema(model: ModelDefinition): string {
  const fields = model.fields.map(field => {
    const zodType = fieldTypeToZod(field.type);
    return `${field.name}: ${zodType}`;
  });
  
  return `z.object({ ${fields.join(', ')} })`;
}
```

**References:**
- tRPC's Zod integration
- Blitz.js input validation
- ts-to-zod library

---

## 5. Deployment Targets

### Target 1: Vercel Edge Functions

**Output:**
```typescript
// /api/[...shepthon].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { router } from './__generated__/shepthon-router';

export default async function(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.shepthon as string[]).join('/');
  const result = await router.handle(req.method!, `/${path}`, req.body);
  res.json(result);
}

export const config = {
  runtime: 'edge',
  regions: ['iad1'],  // Auto-configured
};
```

**Deployment:**
```bash
$ shep deploy vercel
✅ Building ShepThon API...
✅ Deploying to Vercel...
🚀 Live at: https://myapp.vercel.app/api/
```

### Target 2: Netlify Functions

**Output:**
```typescript
// /.netlify/functions/get-reminders.ts
import type { Handler } from '@netlify/functions';
import { handleGetReminders } from './__generated__/handlers';

export const handler: Handler = async (event, context) => {
  const result = await handleGetReminders(
    JSON.parse(event.body || '{}'),
    { db, log, now }
  );
  
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

**Deployment:**
```bash
$ shep deploy netlify
✅ Building functions...
✅ Uploading to Netlify...
🚀 Live at: https://myapp.netlify.app/.netlify/functions/
```

### Target 3: AWS Lambda

**Output:**
```typescript
// /dist/lambda/reminders.js
exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  const result = await router.handle(httpMethod, path, JSON.parse(body));
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};
```

**Deployment:**
```bash
$ shep deploy aws --region us-east-1
✅ Building Lambda functions...
✅ Creating CloudFormation stack...
✅ Deploying to AWS Lambda...
🚀 API Gateway URL: https://abc123.execute-api.us-east-1.amazonaws.com/
```

### Target 4: Traditional Server (Docker)

**Output:**
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dist/ .
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]
```

**Deployment:**
```bash
$ shep build docker
$ docker build -t myapp-api .
$ docker run -p 3000:3000 myapp-api
```

**References:**
- Vercel serverless functions
- Netlify Functions
- AWS Lambda Node.js runtime
- Docker best practices

---

## 6. Zero-API Pattern (Blitz.js Style)

### Developer Experience Goal:
```typescript
// Developer writes (in ShepLang UI):
import { getReminders } from 'shepthon:queries/getReminders';

const reminders = await getReminders();
```

**Looks like a direct import, works like an API call.**

### How It Works:

**Step 1: Developer writes ShepThon query:**
```typescript
// shepthon/queries/getReminders.shepthon
export query getReminders() -> [Reminder] {
  return db.Reminder.findAll();
}
```

**Step 2: Compiler generates client stub:**
```typescript
// __generated__/shepthon-client.ts
export async function getReminders(): Promise<Reminder[]> {
  if (__DEV__) {
    // Dev: Direct call
    return shepthonRuntime.executeQuery('getReminders');
  } else {
    // Prod: RPC call
    return fetch('/api/rpc/getReminders', { method: 'POST' })
      .then(r => r.json());
  }
}
```

**Step 3: Frontend uses it seamlessly:**
```typescript
// ShepLang component:
const reminders = await getReminders();  // Just works!
```

### Implementation Details:

**Babel Plugin (Prod Build):**
```typescript
module.exports = function() {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value.startsWith('shepthon:')) {
          // Replace with generated client:
          path.node.source.value = '__shepthon_client__';
        }
      }
    }
  };
};
```

**Type Safety:**
```typescript
// Same types in dev and prod:
type getReminders = () => Promise<Reminder[]>;

// TypeScript ensures usage is correct:
const reminders: Reminder[] = await getReminders();
// ✅ Type-safe!
```

**References:**
- Blitz.js RPC specification
- Next.js Server Actions
- tRPC's inferQueryOutput

---

## 7. Advanced Caching Strategies

### Client-Side Caching:

**React Query Integration:**
```typescript
import { useQuery } from '@tanstack/react-query';

function RemindersScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => backend.getReminders()
  });
  
  // ✅ Automatic caching, deduplication, refetching
}
```

**Apollo Client Pattern (GraphQL-style):**
```typescript
// ShepThon generates cache config:
const cache = new InMemoryCache({
  typePolicies: {
    Reminder: {
      keyFields: ['id'],
      fields: {
        reminders: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          }
        }
      }
    }
  }
});
```

### Server-Side Caching:

**In-Memory Cache:**
```typescript
// ShepThon annotation:
@cache(ttl: 60)  // Cache for 60 seconds
endpoint GET "/reminders" -> [Reminder] {
  // Expensive query only runs once per minute
  return db.Reminder.findAll();
}

// Implementation:
const cache = new Map<string, { value: any; expiresAt: number }>();

function withCache(key: string, ttl: number, fn: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  
  const value = await fn();
  cache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  return value;
}
```

**Redis Integration:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

@cache(backend: 'redis', ttl: 3600)
endpoint GET "/users/:id" (id: string) -> User {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.User.find(id);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

**References:**
- React Query documentation
- Redwood's Apollo Client caching
- tRPC + React Query

---

## 8. Monorepo & Build Tooling

### Project Structure:

```
myapp/
├── packages/
│   ├── frontend/           # ShepLang UI
│   │   ├── src/
│   │   └── package.json
│   ├── backend/            # ShepThon API
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── endpoints/
│   │   │   └── jobs/
│   │   └── package.json
│   └── shared/             # Common types
│       ├── types.ts
│       └── package.json
├── pnpm-workspace.yaml
├── turbo.json              # TurboRepo config
└── package.json
```

### Shared Types:

```typescript
// packages/shared/types.ts
export interface Reminder {
  id: string;
  text: string;
  time: Date;
  done: boolean;
}

// Frontend uses:
import type { Reminder } from '@myapp/shared';

// Backend uses:
import type { Reminder } from '@myapp/shared';
```

### Build Orchestration (TurboRepo):

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**Commands:**
```bash
$ turbo build   # Builds all packages in order
$ turbo dev     # Runs all dev servers
$ turbo test    # Runs all tests
```

**References:**
- RedwoodJS monorepo structure
- TurboRepo documentation
- pnpm workspaces

---

## 9. Database Integration (Future)

### Current (Alpha): In-Memory Only
```typescript
class InMemoryDatabase {
  private tables: Record<string, Record<string, any>> = {};
  // Data lost on restart
}
```

### Future: Real Database with Prisma

**Prisma Schema Generation:**
```prisma
// Generated from ShepThon models:
model Reminder {
  id        String   @id @default(uuid())
  text      String
  time      DateTime
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Type-Safe Queries:**
```typescript
// ShepThon compiles to:
endpoint GET "/reminders" -> [Reminder] {
  return await prisma.reminder.findMany({
    where: { done: false },
    orderBy: { time: 'asc' }
  });
}
```

**Migration Generation:**
```bash
$ shep db migrate create "add_reminders"
✅ Created migration: 001_add_reminders.sql

$ shep db migrate deploy
✅ Applied 1 migration
```

**Supported Databases:**
- PostgreSQL (recommended)
- MySQL
- SQLite (dev only)
- MongoDB (via Prisma)

**References:**
- Prisma documentation
- Redwood's Prisma integration
- Blitz.js database setup

---

## 10. Monitoring & Error Tracking (Future)

### Automatic Error Reporting:

**Sentry Integration:**
```typescript
// Auto-injected in production:
import * as Sentry from '@sentry/node';

endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
  try {
    return db.Reminder.create({ text, time });
  } catch (error) {
    Sentry.captureException(error);  // Auto-reported
    throw error;
  }
}
```

### Performance Monitoring:

**Datadog/New Relic:**
```typescript
// Auto-instrumented:
import { tracer } from 'dd-trace';

endpoint GET "/reminders" -> [Reminder] {
  const span = tracer.startSpan('shepthon.getReminders');
  const result = await db.Reminder.findAll();
  span.finish();
  return result;
}
```

### Logging:

**Structured Logging:**
```typescript
// ShepThon's `log` becomes:
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// Usage:
log("Creating reminder", { text, time });  
// → { "level": "info", "msg": "Creating reminder", "text": "...", "time": "..." }
```

**References:**
- Sentry Node.js SDK
- Datadog APM
- Pino structured logging

---

## 11. Authentication & Authorization (Future)

### Auth Context:

```typescript
// ShepThon with auth:
endpoint GET "/my-reminders" -> [Reminder] {
  // ✅ `user` injected by auth middleware:
  if (!user) {
    throw new UnauthorizedError();
  }
  
  return db.Reminder.find(r => r.userId == user.id);
}
```

### JWT Integration:

```typescript
// Context creation:
function createContext(req: Request): RuntimeContext {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = token ? verifyJWT(token) : null;
  
  return { db, log, now, user };
}
```

### Role-Based Access Control:

```typescript
// ShepThon annotation:
@requireRole('admin')
endpoint DELETE "/reminders/:id" (id: string) -> void {
  db.Reminder.delete(id);
}
```

**References:**
- Redwood's auth setup
- Next.js middleware for auth
- tRPC context with auth

---

## 🗺️ Roadmap: Alpha → Production

| Phase | Focus | Features |
|-------|-------|----------|
| **Phase 2 (Alpha)** | Dev experience | In-memory, direct calls, hot reload |
| **Phase 3** | Production basics | HTTP endpoints, Express server, basic deploy |
| **Phase 4** | Serverless | Vercel/Netlify/AWS Lambda support |
| **Phase 5** | Type safety | Zod validation, advanced error handling |
| **Phase 6** | Database | Prisma integration, migrations |
| **Phase 7** | Auth & monitoring | JWT, RBAC, Sentry, logging |
| **Phase 8** | Zero-API | Blitz-style imports, automatic RPC |

---

## 🔗 References & Inspirations

**Frameworks:**
- [RedwoodJS](https://redwoodjs.com/) - Full-stack GraphQL framework
- [Blitz.js](https://blitzjs.com/) - Zero-API layer on Next.js
- [tRPC](https://trpc.io/) - Type-safe RPC
- [Next.js](https://nextjs.org/) - React framework with API routes
- [Astro](https://astro.build/) - Multi-target builds (SSG/SSR)

**Tools:**
- [Vite](https://vitejs.dev/) - Fast dev server
- [esbuild](https://esbuild.github.io/) - Fast bundler
- [Zod](https://zod.dev/) - TypeScript schema validation
- [Prisma](https://www.prisma.io/) - Type-safe database ORM
- [TurboRepo](https://turbo.build/) - Monorepo build system

**Patterns:**
- Compiler strategies for dev/prod
- Type inference across frontend/backend
- Code splitting to prevent client leakage
- Deployment adapters for multiple targets
- Context injection for clean APIs

---

**Last Updated:** January 15, 2025  
**Status:** 📋 ARCHIVED for Future Phases  
**See:** `PHASE2_Hybrid_Runtime_Alpha_Scope.md` for current implementation plan
