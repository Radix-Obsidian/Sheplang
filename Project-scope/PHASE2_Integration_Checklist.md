# Phase 2: Integration Checklist

**Date:** January 15, 2025  
**Purpose:** Ensure all Phase 2 components work seamlessly together  
**Status:** 🔍 PRE-IMPLEMENTATION REVIEW

---

## ✅ Components Completed

### 1. InMemoryDatabase (✅ Complete)
**Status:** 46/46 tests passing

**Interface:**
```typescript
class InMemoryDatabase {
  create(modelName: string, data: any): any
  findAll(modelName: string): any[]
  find(modelName: string, predicate: (item: any) => boolean): any[]
  update(modelName: string, id: string, updates: any): any | null
  delete(modelName: string, id: string): boolean
  deleteWhere(modelName: string, predicate: (item: any) => boolean): number
  // ... other methods
}
```

**Integration Points:**
- ✅ Injected into RuntimeContext as `context.db`
- ✅ Accessed via ExpressionEvaluator through `db` identifier
- ✅ Model proxy methods (`db.Reminder.create()`) work correctly

---

### 2. ExpressionEvaluator (✅ Complete)
**Status:** 46/46 tests passing

**Interface:**
```typescript
interface RuntimeContext {
  db: InMemoryDatabase;
  log: (...args: any[]) => void;
  now: () => Date;
}

class ExpressionEvaluator {
  constructor(context: RuntimeContext, scope: Scope)
  
  async evaluate(expr: Expression): Promise<any>
  withScope(newScope: Scope): ExpressionEvaluator
  createChildScope(): Scope
}
```

**Integration Points:**
- ✅ Takes RuntimeContext with db, log, now
- ✅ Takes Scope for variable lookup
- ✅ Evaluates all expression types from AST
- ✅ Returns values that StatementExecutor can use
- ✅ Supports creating child scopes for nested blocks

---

## 🔜 Components Pending

### 3. StatementExecutor (Next)
**Purpose:** Execute statement nodes from AST

**Required Interface:**
```typescript
class StatementExecutor {
  constructor(context: RuntimeContext)
  
  async execute(statement: Statement, scope: Scope): Promise<any>
  async executeBlock(statements: Statement[], scope: Scope): Promise<any>
}
```

**Must Handle:**
- ✅ `let` statements → Add to scope
- ✅ `return` statements → Throw ReturnValue exception
- ✅ `for` statements → Loop over collection
- ✅ `if/else` statements → Conditional execution
- ✅ Expression statements → Evaluate and discard result

**Integration Requirements:**
- Must use ExpressionEvaluator for all expression evaluation
- Must manage scope correctly (child scopes for blocks)
- Must handle early returns (throw special exception)
- Must work with EndpointRouter and JobScheduler

---

### 4. EndpointRouter (Pending)
**Purpose:** Map HTTP method+path to handlers

**Required Interface:**
```typescript
type EndpointHandler = (
  params: any,
  body: any,
  context: RuntimeContext
) => Promise<any>;

class EndpointRouter {
  register(method: HttpMethod, path: string, endpoint: EndpointDefinition): void
  execute(method: HttpMethod, path: string, body?: any): Promise<any>
}
```

**Integration Requirements:**
- Must create StatementExecutor for each request
- Must inject RuntimeContext (db, log, now)
- Must handle parameters from path and body
- Must return JSON-serializable results

---

### 5. JobScheduler (Pending)
**Purpose:** Run jobs on schedule with setInterval

**Required Interface:**
```typescript
type JobHandler = (context: RuntimeContext) => Promise<void>;

class JobScheduler {
  register(name: string, schedule: ScheduleExpression, job: JobDefinition): void
  start(name: string): void
  stop(name: string): void
  stopAll(): void
  enable(): void
  disable(): void  // For tests
}
```

**Integration Requirements:**
- Must create StatementExecutor for each job run
- Must inject RuntimeContext (db, log, now)
- Must handle schedule parsing (every N minutes/hours/days)
- Must allow enable/disable for tests
- Must not crash if job throws error

---

### 6. ShepThonRuntime (Pending)
**Purpose:** Orchestrate all components

**Required Interface:**
```typescript
class ShepThonRuntime {
  constructor(ast: ShepThonApp)
  
  async callEndpoint(method: HttpMethod, path: string, body?: any): Promise<any>
  startJobs(): void
  stopJobs(): void
  getDatabase(): InMemoryDatabase
}
```

**Integration Requirements:**
- Must initialize InMemoryDatabase
- Must register all endpoints with EndpointRouter
- Must register all jobs with JobScheduler
- Must provide single entry point for execution

---

## 🔍 Integration Concerns

### 1. Scope Management
**Issue:** Variables need to be properly scoped

**Current Status:**
- ✅ ExpressionEvaluator has `createChildScope()` method
- ✅ ExpressionEvaluator has `withScope()` method
- ⏳ StatementExecutor needs to use these correctly

**Solution:**
- Each `for` loop creates child scope
- Each `if` block creates child scope
- Variables from parent scope are inherited
- Variables in child scope don't leak to parent

**Example:**
```typescript
// Parent scope
let x = 10;

for item in items {
  // Child scope (inherits x)
  let y = item;  // y only exists in loop
}

// y is not accessible here
```

---

### 2. Return Handling
**Issue:** `return` statements need to exit function early

**Current Status:**
- ⏳ Need special exception for early return

**Solution:**
- Throw `ReturnValue` exception with value
- StatementExecutor catches it in `executeBlock()`
- EndpointRouter catches it and returns value
- JobScheduler catches it (jobs shouldn't return, but handle gracefully)

**Implementation:**
```typescript
class ReturnValue extends Error {
  constructor(public value: any) {
    super('Return value');
  }
}

// In StatementExecutor:
async executeReturn(stmt: ReturnStatement, scope: Scope): Promise<never> {
  const value = await this.evaluator.evaluate(stmt.value);
  throw new ReturnValue(value);
}

// In EndpointRouter:
try {
  await executor.executeBlock(endpoint.body, scope);
  return null;  // No explicit return
} catch (e) {
  if (e instanceof ReturnValue) {
    return e.value;
  }
  throw e;
}
```

---

### 3. For Loop Iteration
**Issue:** Need to iterate over collections correctly

**Current Status:**
- ✅ ExpressionEvaluator can evaluate collection expressions
- ⏳ StatementExecutor needs to handle iteration

**Solution:**
```typescript
async executeFor(stmt: ForStatement, scope: Scope): Promise<void> {
  // Evaluate collection
  const collection = await this.evaluator.evaluate(stmt.collection);
  
  // Ensure it's iterable
  if (!Array.isArray(collection)) {
    throw new Error('For loop collection must be an array');
  }
  
  // Iterate
  for (const item of collection) {
    // Create child scope
    const childScope = this.evaluator.createChildScope();
    childScope.set(stmt.item, item);
    
    // Execute body
    const childEvaluator = this.evaluator.withScope(childScope);
    await this.executeBlock(stmt.body, childScope, childEvaluator);
  }
}
```

---

### 4. Context Injection
**Issue:** db, log, now must be available everywhere

**Current Status:**
- ✅ RuntimeContext interface defined
- ✅ ExpressionEvaluator receives context in constructor
- ⏳ StatementExecutor needs to pass context to ExpressionEvaluator

**Solution:**
- StatementExecutor creates ExpressionEvaluator with context
- Context is immutable (same db, log, now throughout execution)
- Each statement execution uses same context

**Verification:**
```typescript
// In endpoint:
return db.Reminder.findAll()  // ✅ db available

// In job:
let overdue = db.Reminder.find(...)  // ✅ db available
log("Found", overdue.length)         // ✅ log available
```

---

### 5. Error Propagation
**Issue:** Errors should be clear and helpful

**Current Status:**
- ✅ ExpressionEvaluator throws clear errors
- ⏳ StatementExecutor should add statement context
- ⏳ EndpointRouter should add endpoint context
- ⏳ JobScheduler should log errors, not crash

**Solution:**
```typescript
// StatementExecutor wraps errors:
try {
  await this.evaluator.evaluate(expr);
} catch (e) {
  throw new Error(`Error in statement: ${e.message}`);
}

// EndpointRouter adds endpoint info:
try {
  await executor.executeBlock(endpoint.body, scope);
} catch (e) {
  throw new Error(`Error in ${method} ${path}: ${e.message}`);
}

// JobScheduler logs but continues:
try {
  await executor.executeBlock(job.body, scope);
} catch (e) {
  console.error(`Error in job "${job.name}":`, e);
  // Don't crash scheduler
}
```

---

## 📝 Dog Reminders Integration Test

### Simplified Version (Alpha)
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
    let reminder = db.Reminder.create({ text, time })
    return reminder
  }

  job "mark-due-as-done" every 5 minutes {
    let due = db.Reminder.find()
    for r in due {
      db.Reminder.update(r.id, { done: true })
    }
  }
}
```

**Note:** For Alpha, we simplified:
- ❌ No object literal predicates: `{ time <= now() }`
- ✅ Use `find()` without predicate (returns all)
- ✅ Filter in for loop body if needed

### Integration Flow:

**1. GET /reminders**
```typescript
// Parse → AST
const ast = parseShepThon(source);

// Bootstrap Runtime
const runtime = new ShepThonRuntime(ast.app);

// Call endpoint
const result = await runtime.callEndpoint('GET', '/reminders');
// → EndpointRouter.execute()
//   → StatementExecutor.executeBlock([return db.Reminder.findAll()])
//     → ExpressionEvaluator.evaluate(return expression)
//       → ExpressionEvaluator.evaluateCall(db.Reminder.findAll)
//         → InMemoryDatabase.findAll('Reminder')
//   → Catch ReturnValue(result)
// → Return result
```

**2. POST /reminders**
```typescript
const body = { text: "Walk dog", time: new Date() };
const result = await runtime.callEndpoint('POST', '/reminders', body);
// → EndpointRouter.execute()
//   → StatementExecutor.executeBlock([let, return])
//     → Execute let: reminder = db.Reminder.create(...)
//       → Adds 'reminder' to scope
//     → Execute return: return reminder
//       → Look up 'reminder' from scope
//       → Throw ReturnValue(reminder)
//   → Catch ReturnValue
// → Return result
```

**3. Job "mark-due-as-done"**
```typescript
runtime.startJobs();
// → JobScheduler.start("mark-due-as-done")
//   → setInterval(() => {
//       StatementExecutor.executeBlock([let, for])
//         → Execute let: due = db.Reminder.find()
//         → Execute for: for r in due
//           → Create child scope with 'r'
//           → Execute body: db.Reminder.update(r.id, { done: true })
//     }, 5 * 60 * 1000)
```

---

## ✅ Pre-Implementation Checklist

Before implementing StatementExecutor:

- ✅ **InMemoryDatabase** working and tested
- ✅ **ExpressionEvaluator** working and tested
- ✅ **Scope management** strategy defined
- ✅ **Return handling** strategy defined (ReturnValue exception)
- ✅ **For loop** iteration strategy defined
- ✅ **Context injection** pattern verified
- ✅ **Error propagation** strategy defined
- ✅ **Dog Reminders** simplified example verified
- ✅ **Integration flow** documented

---

## 🎯 Next Steps

### Immediate: StatementExecutor
1. Implement `ReturnValue` exception class
2. Implement `StatementExecutor` with all statement types
3. Write comprehensive tests (40+ tests)
4. Verify integration with ExpressionEvaluator

### Then: EndpointRouter
1. Implement endpoint registration
2. Implement execution with context injection
3. Handle ReturnValue exceptions
4. Test with Dog Reminders GET/POST endpoints

### Then: JobScheduler
1. Implement schedule parsing
2. Implement setInterval-based execution
3. Implement enable/disable for tests
4. Test with Dog Reminders job

### Finally: ShepThonRuntime
1. Orchestrate all components
2. Initialize database tables from models
3. Register endpoints and jobs
4. Write E2E test with full Dog Reminders example

---

## 🔒 Critical Integration Points

**Must Get Right:**
1. ✅ Scope inheritance (child scopes)
2. ✅ Return value handling (exceptions)
3. ✅ Context injection (db, log, now)
4. ✅ Error messages (clear and helpful)
5. ✅ For loop iteration (child scopes)

**Nice to Have (Future):**
- 📋 Object literal predicates: `{ time <= now() }`
- 📋 Arrow functions: `r => r.done`
- 📋 More complex expressions
- 📋 Type checking at runtime

---

**Status:** ✅ READY TO IMPLEMENT StatementExecutor  
**Confidence:** HIGH (all integration points documented)  
**Next Action:** Implement StatementExecutor with ReturnValue exception
