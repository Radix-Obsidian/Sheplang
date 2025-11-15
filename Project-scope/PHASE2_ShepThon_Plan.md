# Phase 2: ShepThon Runtime & In-Memory Database

**Date:** November 15, 2025  
**Phase:** 2 - Runtime Implementation  
**Status:** 🎯 PLANNING

---

## 🎯 Phase 2 Goal

Build a **minimal but real runtime** that executes ShepThon code using the Phase 1 parser. Implement in-memory database, endpoint execution, and job scheduling to make the Dog Reminders example work end-to-end.

---

## 📋 Success Criteria (from TTD)

1. ✅ ShepThon can describe at least one non-trivial app (Dog Reminders)
2. ✅ Runtime can execute endpoint handlers (GET/POST)
3. ✅ In-memory database supports CRUD operations
4. ✅ Jobs can be scheduled with `every N minutes/hours/days`
5. ✅ Dog Reminders E2E test passes (parse → execute → test)
6. ✅ `pnpm run verify` GREEN

---

## 🏗️ Architecture

### Components to Build:

```
┌─────────────────────────────────────────────────┐
│              ShepThon Runtime                    │
├─────────────────────────────────────────────────┤
│  1. InMemoryDatabase                             │
│     - tables: Record<string, Record<string, any>>│
│     - create, findAll, find, update, delete     │
│                                                   │
│  2. EndpointRouter                               │
│     - routes: Map<method:path, handler>         │
│     - execute(method, path, body)               │
│                                                   │
│  3. JobScheduler                                 │
│     - jobs: Map<name, { schedule, handler }>    │
│     - start(), stop(), enable/disable           │
│                                                   │
│  4. StatementExecutor (Interpreter)             │
│     - execute statements from AST               │
│     - context injection (db, log, now)          │
│                                                   │
│  5. ExpressionEvaluator                         │
│     - evaluate expressions to values            │
│     - member access, function calls             │
└─────────────────────────────────────────────────┘
```

---

## 📚 Implementation Plan (Based on Research)

### Step 1: In-Memory Database (Simple Store Pattern)

**Pattern:** Key-Value Store with Table Namespacing  
**Reference:** https://www.webdevtutor.net/blog/typescript-in-memory-database

**Implementation:**
```typescript
class InMemoryDatabase {
  private tables: Record<string, Record<string, any>> = {};
  
  // Model methods (injected as db.ModelName.method())
  create(modelName: string, data: any): any
  findAll(modelName: string): any[]
  find(modelName: string, predicate: (item: any) => boolean): any[]
  update(modelName: string, id: string, data: any): any
  delete(modelName: string, id: string): boolean
  deleteWhere(modelName: string, predicate: (item: any) => boolean): number
}
```

**Best Practices:**
- Use `Record<string, any>` for flexible schema
- Auto-generate IDs (UUID or incremental)
- Return copies, not references (immutability)
- Simple error handling

**Tests:**
- CRUD operations on a test model
- findAll returns all records
- find with predicates
- update/delete by ID

---

### Step 2: Endpoint Router (Registry Pattern)

**Pattern:** Method:Path → Handler Registry  
**Reference:** Standard HTTP router patterns

**Implementation:**
```typescript
class EndpointRouter {
  private routes: Map<string, EndpointHandler> = new Map();
  
  register(method: HttpMethod, path: string, handler: EndpointHandler): void
  execute(method: HttpMethod, path: string, body?: any): Promise<any>
}

type EndpointHandler = (params: any, body: any, context: RuntimeContext) => Promise<any>;
```

**Context Injection:**
```typescript
interface RuntimeContext {
  db: InMemoryDatabase;
  log: (...args: any[]) => void;
  now: () => Date;
}
```

**Tests:**
- Register and execute GET endpoint
- Register and execute POST endpoint with body
- Context injection (db, log, now available)
- Error handling for missing routes

---

### Step 3: Job Scheduler (setInterval Pattern)

**Pattern:** Named Jobs with Interval Management  
**Reference:** https://www.webdevtutor.net/blog/typescript-setinterval-run-immediately

**Implementation:**
```typescript
class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private enabled: boolean = true;
  
  register(name: string, schedule: ScheduleExpression, handler: JobHandler): void
  start(name: string): void
  stop(name: string): void
  stopAll(): void
  enable(): void
  disable(): void  // For tests
}

type JobHandler = (context: RuntimeContext) => Promise<void>;
```

**Schedule Parsing:**
```typescript
// "every 5 minutes" → 5 * 60 * 1000 ms
// "every 1 hour" → 60 * 60 * 1000 ms
// "every 2 days" → 2 * 24 * 60 * 60 * 1000 ms
```

**Tests:**
- Parse schedule expressions
- Job executes on interval
- Enable/disable for tests
- Stop individual jobs

---

### Step 4: Statement Executor (Interpreter Pattern)

**Pattern:** Visitor Pattern for AST Interpretation  
**Reference:** https://www.kirillvasiltsov.com/writing/visitor-pattern-typescript/  
**Reference:** https://medium.com/design-patterns-in-typescript/interpreter-pattern-in-typescript-edafce5eae92

**Implementation:**
```typescript
class StatementExecutor {
  private context: RuntimeContext;
  
  execute(statement: Statement): Promise<any> {
    switch (statement.type) {
      case 'let':
        return this.executeLet(statement as LetStatement);
      case 'return':
        return this.executeReturn(statement as ReturnStatement);
      case 'for':
        return this.executeFor(statement as ForStatement);
      case 'if':
        return this.executeIf(statement as IfStatement);
    }
  }
  
  private async executeLet(stmt: LetStatement): Promise<void>
  private async executeReturn(stmt: ReturnStatement): Promise<any>
  private async executeFor(stmt: ForStatement): Promise<void>
  private async executeIf(stmt: IfStatement): Promise<void>
}
```

**Key Pattern:**
- Each statement type has its own handler
- Statements can be async (for DB calls)
- Return statement throws `ReturnValue` exception (early return)
- Variables stored in execution scope

**Tests:**
- Execute let statement (variable assignment)
- Execute return statement
- Execute for loop
- Execute if/else

---

### Step 5: Expression Evaluator

**Pattern:** Recursive Evaluation  
**Reference:** AST interpretation patterns

**Implementation:**
```typescript
class ExpressionEvaluator {
  private context: RuntimeContext;
  private scope: Map<string, any>;
  
  async evaluate(expr: Expression): Promise<any> {
    switch (expr.type) {
      case 'call':
        return this.evaluateCall(expr as CallExpression);
      case 'member':
        return this.evaluateMember(expr as MemberExpression);
      case 'identifier':
        return this.evaluateIdentifier(expr as Identifier);
      case 'literal':
        return (expr as Literal).value;
      case 'binary':
        return this.evaluateBinary(expr as BinaryExpression);
    }
  }
  
  private async evaluateCall(expr: CallExpression): Promise<any>
  private async evaluateMember(expr: MemberExpression): Promise<any>
  private evaluateIdentifier(expr: Identifier): any
  private async evaluateBinary(expr: BinaryExpression): Promise<any>
}
```

**Special Handling:**
```typescript
// db.Reminder.findAll() → context.db.findAll('Reminder')
// db.Reminder.create() → context.db.create('Reminder', data)
// now() → context.now()
// log(message) → context.log(message)
```

**Tests:**
- Evaluate literal expressions
- Evaluate identifiers from scope
- Evaluate member access (db.Model)
- Evaluate function calls
- Evaluate binary expressions (<=, >=, ==)

---

### Step 6: Runtime Bootstrapper

**Implementation:**
```typescript
export class ShepThonRuntime {
  private db: InMemoryDatabase;
  private router: EndpointRouter;
  private scheduler: JobScheduler;
  private executor: StatementExecutor;
  
  constructor(ast: ShepThonApp) {
    this.db = new InMemoryDatabase();
    this.router = new EndpointRouter();
    this.scheduler = new JobScheduler();
    
    // Initialize models (create tables)
    this.initializeModels(ast.models);
    
    // Register endpoints
    this.registerEndpoints(ast.endpoints);
    
    // Register jobs
    this.registerJobs(ast.jobs);
  }
  
  async callEndpoint(method: HttpMethod, path: string, body?: any): Promise<any>
  startJobs(): void
  stopJobs(): void
  getDatabase(): InMemoryDatabase
}
```

**Usage:**
```typescript
const source = `
app DogReminders {
  model Reminder { ... }
  endpoint GET "/reminders" -> [Reminder] { ... }
  endpoint POST "/reminders" (text: string) -> Reminder { ... }
}
`;

const parsed = parseShepThon(source);
const runtime = new ShepThonRuntime(parsed.app);

// Execute endpoint
const reminders = await runtime.callEndpoint('GET', '/reminders');

// Add reminder
const newReminder = await runtime.callEndpoint('POST', '/reminders', {
  text: "Walk the dog",
  time: "2025-11-15T10:00:00Z"
});
```

---

## 🧪 Testing Strategy

### Unit Tests (per component):
1. **InMemoryDatabase.test.ts**
   - CRUD operations
   - Predicates (find with conditions)
   - ID generation

2. **EndpointRouter.test.ts**
   - Register endpoints
   - Execute with context
   - Error handling

3. **JobScheduler.test.ts**
   - Schedule parsing
   - Job execution
   - Enable/disable

4. **StatementExecutor.test.ts**
   - Each statement type
   - Variable scope
   - Return handling

5. **ExpressionEvaluator.test.ts**
   - Each expression type
   - Member access
   - Function calls

### Integration Tests:
1. **runtime.integration.test.ts**
   - Dog Reminders E2E
   - Parse → Execute → Verify
   - GET /reminders returns array
   - POST /reminders creates record
   - Job marks reminders as done

---

## 📁 File Structure

```
sheplang/packages/shepthon/
├── src/
│   ├── lexer.ts                 ✅ (Phase 1)
│   ├── parser.ts                ✅ (Phase 1)
│   ├── types.ts                 ✅ (Phase 1)
│   ├── runtime/
│   │   ├── database.ts          🆕 InMemoryDatabase
│   │   ├── router.ts            🆕 EndpointRouter
│   │   ├── scheduler.ts         🆕 JobScheduler
│   │   ├── executor.ts          🆕 StatementExecutor
│   │   ├── evaluator.ts         🆕 ExpressionEvaluator
│   │   └── runtime.ts           🆕 ShepThonRuntime
│   └── index.ts                 ✅ Update exports
├── test/
│   ├── lexer.test.ts            ✅ (Phase 1)
│   ├── parser.test.ts           ✅ (Phase 1)
│   ├── smoke.test.ts            ✅ (Phase 1)
│   ├── runtime/
│   │   ├── database.test.ts     🆕
│   │   ├── router.test.ts       🆕
│   │   ├── scheduler.test.ts    🆕
│   │   ├── executor.test.ts     🆕
│   │   └── evaluator.test.ts    🆕
│   └── integration/
│       └── dog-reminders.test.ts 🆕 E2E test
└── examples/
    └── dog-reminders.shepthon   🆕 Example file
```

---

## 🎯 Implementation Order

1. **InMemoryDatabase** (simple CRUD)
2. **ExpressionEvaluator** (needed by executor)
3. **StatementExecutor** (uses evaluator)
4. **EndpointRouter** (uses executor)
5. **JobScheduler** (uses executor)
6. **ShepThonRuntime** (orchestrator)
7. **Integration Tests** (Dog Reminders E2E)

---

## 🚫 Out of Scope (Phase 2)

- ❌ Semantic checker (deferred to Phase 2.5)
- ❌ Type validation at runtime
- ❌ Persistent storage (in-memory only)
- ❌ Real HTTP server (dev mode only)
- ❌ Authentication/authorization
- ❌ Shipyard UI integration (Phase 3)
- ❌ Error recovery in runtime
- ❌ Debugging tools
- ❌ Performance optimization

---

## 📊 Estimated Complexity

**Components:**
- InMemoryDatabase: ~150 lines (simple)
- EndpointRouter: ~100 lines (simple)
- JobScheduler: ~150 lines (moderate)
- StatementExecutor: ~300 lines (complex)
- ExpressionEvaluator: ~250 lines (complex)
- ShepThonRuntime: ~200 lines (moderate)
- **Total:** ~1,150 lines

**Tests:**
- Unit tests: ~800 lines
- Integration tests: ~200 lines
- **Total:** ~1,000 lines

**Overall:** ~2,150 lines of production code

---

## ✅ Phase 2 Completion Criteria

1. ✅ All runtime components implemented
2. ✅ All unit tests passing (100%)
3. ✅ Dog Reminders E2E test passing
4. ✅ `pnpm run verify` GREEN
5. ✅ Zero breaking changes to Phase 1
6. ✅ Runtime can execute:
   - GET /reminders → returns array
   - POST /reminders → creates record
   - Job marks overdue reminders as done
7. ✅ Documentation updated

---

## 🐑 Founder Takeaway

**Phase 2 will prove:**
- ShepThon is a **real language**, not a toy
- Founders can write **backend logic**
- The runtime **actually executes** their code
- Dog Reminders works **end-to-end**
- In-memory DB means **no setup required**

**After Phase 2:**
- "I write models" → **data is stored**
- "I write endpoints" → **they respond to calls**
- "I write jobs" → **they run on schedule**
- "It all works in dev mode" → **no infra**

This is the **"full-stack for founders"** moment! 🚀

---

**Phase 2 Duration:** ~4-6 hours  
**Files to Create:** 12 new files  
**Lines to Add:** ~2,150 lines  
**Target:** 100% test coverage
