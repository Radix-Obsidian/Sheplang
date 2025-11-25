# Slice 5 Spec – API & Backend Correlation

**Date:** November 24, 2025  
**Status:** ✅ Complete (90/90 tests passing)  
**Goal:** Convert fetch/Axios/Prisma calls to ShepLang `call`/`load` + ShepThon stubs

---

## Reference Documentation

- [Next.js App Router Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- ShepLang `call`/`load` syntax from `FULL_STACK_AIVP_COMPLETE.md`

---

## Goals

### Primary
1. **Scan AST for fetch/Axios usage** – Capture HTTP method, path, and body from frontend
2. **Parse Next.js API Route Handlers** – Extract routes from `app/api/.../route.ts` files
3. **Align with Prisma operations** – Map `create/update/delete` to ShepLang `add/update/remove`
4. **Emit ShepThon backend handlers** – Generate stubs mirroring detected routes

### Acceptance Criteria
- `pnpm test:importer` passes with new API correlation tests
- Generated ShepLang validates with ShepVerify Phase 3 (endpoint matching)
- ShepThon stubs are syntactically correct and match frontend calls

---

## Implementation Plan

### 1. Update Test Fixtures

Add Next.js API routes to `test-import-fixtures/nextjs-prisma/`:

```
app/
├── api/
│   └── tasks/
│       ├── route.ts       # GET all, POST create
│       └── [id]/
│           └── route.ts   # GET one, PUT update, DELETE
```

### 2. New Types (`extension/src/types/APIRoute.ts`)

```typescript
interface APIRoute {
  path: string;               // e.g., "/api/tasks"
  method: HTTPMethod;         // GET | POST | PUT | PATCH | DELETE
  handler: string;            // Function name
  params: RouteParam[];       // Dynamic route params
  prismaOperation?: PrismaOp; // findMany | create | update | delete
  bodyFields?: string[];      // Expected request body fields
}

interface ShepThonEndpoint {
  method: HTTPMethod;
  path: string;
  operation: string;          // db.all | db.add | db.update | db.remove
  model: string;              // Prisma model name
}

interface APICorrelation {
  frontendCalls: APICall[];   // From reactParser
  backendRoutes: APIRoute[];  // From apiRouteParser
  matches: EndpointMatch[];   // Correlated pairs
  unmatched: string[];        // Frontend calls without backend
}
```

### 3. API Route Parser (`extension/src/parsers/apiRouteParser.ts`)

Parse Next.js App Router route handlers:

```typescript
// Input: app/api/tasks/route.ts
export async function GET() {
  return Response.json(await prisma.task.findMany())
}

export async function POST(request: Request) {
  const data = await request.json()
  return Response.json(await prisma.task.create({ data }))
}

// Output: APIRoute[]
[
  { path: "/api/tasks", method: "GET", prismaOperation: "findMany" },
  { path: "/api/tasks", method: "POST", prismaOperation: "create", bodyFields: ["title", "priority"] }
]
```

### 4. Backend Correlator (`extension/src/parsers/backendCorrelator.ts`)

Match frontend API calls to backend routes:

```typescript
// Input: Frontend fetch calls + Backend routes
// Output: Matched pairs with confidence scores

interface EndpointMatch {
  frontendCall: APICall;
  backendRoute: APIRoute;
  confidence: number;
  warnings: string[];
}
```

### 5. ShepThon Generator (`extension/src/generators/shepthonGenerator.ts`)

Generate ShepThon backend stubs:

```typescript
// Input: APIRoute[]
// Output: .shepthon file content

model Task {
  title: string
  completed: boolean
  priority: string
}

GET /api/tasks -> db.all("tasks")
POST /api/tasks -> db.add("tasks", body)
PUT /api/tasks/:id -> db.update("tasks", id, body)
DELETE /api/tasks/:id -> db.remove("tasks", id)
```

---

## Test Cases

### apiRouteParser.test.ts
1. Parse GET handler with Prisma findMany
2. Parse POST handler with Prisma create
3. Parse PUT handler with Prisma update
4. Parse DELETE handler with Prisma delete
5. Parse dynamic route segment `[id]`
6. Handle multiple methods in same route file
7. Handle nested route paths
8. Extract request body field names

### backendCorrelator.test.ts
1. Match `fetch('/api/tasks')` to `GET /api/tasks`
2. Match `fetch('/api/tasks', { method: 'POST' })` to `POST /api/tasks`
3. Detect unmatched frontend calls (warnings)
4. Handle path parameter variations (`/api/tasks/1` matches `/api/tasks/:id`)
5. Calculate correlation confidence score

### shepthonGenerator.test.ts
1. Generate model from Prisma schema
2. Generate GET endpoint
3. Generate POST endpoint with body
4. Generate PUT endpoint with id parameter
5. Generate DELETE endpoint
6. Generate complete .shepthon file

### integration.test.ts (updated)
1. Full pipeline: fixture → parsed routes → correlated → ShepThon
2. ShepVerify Phase 3 passes on generated output
3. No regressions on existing integration tests

---

## File Structure (New)

```
extension/src/
├── parsers/
│   ├── apiRouteParser.ts     # NEW: Parse Next.js route handlers
│   └── backendCorrelator.ts  # NEW: Match frontend/backend calls
├── generators/
│   └── shepthonGenerator.ts  # NEW: Generate ShepThon stubs
└── types/
    └── APIRoute.ts           # NEW: API route types

test/importer/
├── apiRouteParser.test.ts    # NEW: Route parser tests
├── backendCorrelator.test.ts # NEW: Correlation tests
└── shepthonGenerator.test.ts # NEW: Generator tests
```

---

## Prisma Operation Mapping

| Prisma Method | ShepThon Op | ShepLang Op |
|---------------|-------------|-------------|
| `findMany()` | `db.all()` | `load GET` |
| `findUnique()` | `db.get()` | `load GET` |
| `create()` | `db.add()` | `call POST` |
| `update()` | `db.update()` | `call PUT/PATCH` |
| `delete()` | `db.remove()` | `call DELETE` |

---

## Risk Mitigation

### Complex Patterns
- **Arrow functions**: Handle `const GET = async () => ...`
- **Destructured imports**: Track `prisma` from various import paths
- **Middleware wrappers**: Detect wrapped handlers

### Edge Cases
- Route files without Prisma (manual responses)
- Mixed API patterns (some Prisma, some external)
- Server Actions (not Route Handlers)

---

## Success Metrics

1. ✅ All existing 44 tests continue to pass
2. ✅ New API correlation tests pass (target: 15-20 tests)
3. ✅ Generated ShepThon compiles with ShepVerify
4. ✅ Documentation updated with API import capabilities

---

*Built following Golden Sheep AI Methodology™ – Vertical Slice Delivery*
