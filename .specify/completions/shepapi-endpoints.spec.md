# ShepAPI Endpoint Generation Specification (ShepLang V1.1)

> Internal engineering spec for ShepAPI: how flows + rules in ShepLang drive REST endpoint generation, validation, and wiring.

## 1. Goals

- Derive **backend API** from spec-level "flows" and entity definitions.
- Guarantee **correctness & safety** via ShepVerify + validation hooks.
- Eliminate manual CRUD boilerplate while allowing custom actions.

## 2. Conceptual Input (Spec-Level)

Example (from TodoApp):

```sheplang
spec TodoApp:
  entities:
    Task:
      fields:
        - "title: text, required"
        - "dueDate: date, optional"
        - "done: bool, default=false"

  flows:
    CreateTask:
      from: Dashboard
      to: TaskForm
      action: SaveTask
      entity: Task

  rules:
    - scope: "action"
      rule: "title is required for every Task"
    - scope: "action"
      rule: "dueDate, if set, cannot be in the past"
```

Compiler/mapper produces an internal **AppModel** with:

- `entities[]` (see ShepData spec)
- `flows[]` with:
  - `name`
  - `entityName`
  - `actionName`
  - `kind` ("create" | "update" | "delete" | "custom")
- `rules[]` with structured predicates (V1.1 can treat them as strings but we plan to structure them).

## 3. Default CRUD Endpoints

For each `Entity` in ShepDataModel, ShepAPI MUST generate a standard CRUD surface:

```text
GET    /api/{entityPlural}          // List with filtering & pagination
GET    /api/{entityPlural}/:id      // Read one
POST   /api/{entityPlural}          // Create
PATCH  /api/{entityPlural}/:id      // Partial update
DELETE /api/{entityPlural}/:id      // Delete
```

Naming:

- `Task` → `tasks`
- `UserProfile` → `user-profiles`

The adapter is responsible for formatting these into Express (or ShepThon) handlers.

## 4. Custom Action Endpoints (Flows)

Flows that describe **behaviour beyond CRUD** should map to **custom endpoints**.

### 4.1 Example: Complete Task

```sheplang
flows:
  CompleteTask:
    entity: Task
    from: Dashboard
    to: Dashboard
    action: MarkTaskDone
```

Default mapping:

```text
POST /api/tasks/:id/complete
```

Backend handler skeleton (conceptual TypeScript):

```ts
router.post('/api/tasks/:id/complete', requireAuth, async (req, res) => {
  const id = req.params.id;
  // ShepVerify: ensure Task exists, user has rights
  const task = await TaskModel.findById(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.done = true;
  await task.save();

  return res.json(task);
});
```

V1.1 engine responsibility: generate the **endpoint signature + wiring** and inject calls into ShepRuntime/BobaScript, not necessarily all inner logic.

## 5. Validation Rules Integration

Rules with `scope: "action"` and `scope: "entity"` feed into validation middleware.

### 5.1 Rule Examples

```sheplang
rules:
  - scope: "entity:Task"
    rule: "title is required for every Task"
  - scope: "action:SaveTask"
    rule: "dueDate, if set, cannot be in the past"
```

Mapping:

- Translate high-level rules → validation functions attached to endpoints.
- For V1.1 we can treat them as **annotations** that become comments or stub validators, with a path to full parsing later.

Conceptual validator signature:

```ts
type ValidationResult = { ok: true } | { ok: false; message: string };

type Validator = (input: any, context: { user?: any }) => ValidationResult | Promise<ValidationResult>;
```

ShepAPI should produce a `validators` map keyed by entity/action:

```ts
interface ShepApiValidators {
  entities: {
    [entityName: string]: Validator[];
  };
  actions: {
    [actionName: string]: Validator[];
  };
}
```

## 6. Auth & Access Control (Hook Points)

V1.1: define **hook points**, not a full auth system.

For each endpoint, ShepAPI must expose:

```ts
interface EndpointMeta {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;          // e.g. "/api/tasks/:id/complete"
  entity?: string;       // e.g. "Task"
  action?: string;       // e.g. "CompleteTask"
  requiresAuth: boolean; // default true for write operations
  roles?: string[];      // optional future extension
}
```

ShepRuntime (or the chosen server adapter) uses `requiresAuth` + `roles` to plug in concrete auth middleware.

Defaults:

- `GET /api/tasks` and `GET /api/tasks/:id` → `requiresAuth: false` (configurable later).
- All `POST/PATCH/DELETE` → `requiresAuth: true` by default.

## 7. Error Handling Conventions

ShepAPI must consistently use HTTP status codes and error shapes:

- `400` – validation errors
- `401` – unauthenticated
- `403` – unauthorized
- `404` – not found
- `409` – conflict (e.g. uniqueness violation)
- `500` – internal error

Error payload shape:

```ts
interface ApiError {
  code: string;          // "VALIDATION_ERROR", "NOT_FOUND", ...
  message: string;
  details?: any;
}
```

Adapters should expose a utility:

```ts
function sendError(res: Response, status: number, error: ApiError): void;
```

## 8. ShepThon / BobaScript Integration

If the backend is generated in ShepThon (like your current ShepThon models + endpoints), ShepAPI spec maps to:

```shepthon
model Task {
  title: String
  dueDate: DateTime?
  done: Boolean
}

GET /tasks -> db.all("tasks")
GET /tasks/:id -> db.find("tasks", params.id)
POST /tasks -> db.add("tasks", body)
PATCH /tasks/:id -> db.update("tasks", params.id, body)
DELETE /tasks/:id -> db.remove("tasks", params.id)

POST /tasks/:id/complete -> actions.completeTask(params.id)
```

V1.1 ShepAPI responsibilities:

- Generate model blocks from `ShepDataModel` (aligned with ShepData spec).
- Generate CRUD + custom endpoints with correct HTTP verbs and paths.
- Generate **stubs** for custom actions that ShepRuntime/BobaScript will implement.

## 9. ShepVerify Integration

For each endpoint, ShepAPI must emit enough metadata for ShepVerify to check:

- **Endpoint coverage**: every referenced flow/action has a concrete endpoint.
- **Contract alignment**: ShepLang `call` / `load` statements match actual endpoints.
- **Method/path correctness**: e.g. `call POST "/tasks"` must match one generated POST.

Metadata example:

```ts
interface ShepApiDescription {
  endpoints: EndpointMeta[];     // full list of generated endpoints
  validators: ShepApiValidators; // attached validators
}
```

ShepVerify Phase 3 can then:

- Diff `call`/`load` usages in ShepLang against `endpoints[]`.
- Report missing/mismatched endpoints.

## 10. Open Questions (For V1.1 Design Review)

- How much rule parsing do we implement now vs. defer (string rules vs structured predicates)?
- Do we generate business logic bodies, or only endpoints + stubs for V1.1?
- How do we configure auth defaults (global vs per-entity vs per-flow)?
- How do we surface ShepVerify errors back into VS Code (existing diagnostics pipeline vs new channel)?

---

**Status:** Draft V1.1 – For internal engineering review
