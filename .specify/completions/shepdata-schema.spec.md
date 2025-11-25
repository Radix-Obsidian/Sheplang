# ShepData Schema Specification (ShepLang V1.1)

> Internal engineering spec for the ShepData layer: how entity definitions in ShepLang map to database schemas, types, and migrations.

## 1. Goals

- **Single source of truth** for data: ShepLang spec drives all schemas.
- **Deterministic compilation** from entities → DB schema + TS types.
- **Backend/Frontend alignment**: no drift between DB, API, and UI.
- **Extensible**: safe to add new field types and storage backends later.

## 2. Input Shape (Conceptual ShepLang)

```sheplang
spec TodoApp:
  entities:
    Task:
      fields:
        - "title: text, required"
        - "dueDate: date, optional"
        - "done: bool, default=false"
        - "userId: ref[User], required"

    User:
      fields:
        - "name: text, required"
        - "email: text, required, unique"
```

For V1.1, assume ShepLang has a normalized internal representation (AST/AppModel) for:

- `entities[]`
- `fields[]` with:
  - `name: string`
  - `type: 'text' | 'number' | 'bool' | 'date' | 'datetime' | 'ref' | 'json' | ...`
  - `required?: boolean`
  - `defaultValue?: string | number | boolean | null`
  - `constraints?: string[]` (e.g. `"unique"`, `"indexed"`)
  - `refTarget?: string` (for `ref[User]`)

## 3. Output Artifacts (Targets)

For ShepLang V1.1, ShepData must be able to generate at least:

1. **Database Schema Definition** (adapter-specific):
   - Mongo (JSON schema or Mongoose-like model description) **or**
   - SQL (Prisma-like DSL) depending on active adapter.
2. **TypeScript Types** for runtime and frontend:
   - `Task`, `User`, etc. as strict TS interfaces/types.
3. **Migration Plan** (structural diff):
   - For now: describe **what would change**, not a full migration engine.

## 4. Canonical Intermediate Model

Define a canonical `ShepDataModel` that all adapters consume:

```ts
interface ShepDataField {
  name: string;
  kind: 'scalar' | 'relation';
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json';
  required: boolean;
  isList: boolean;
  defaultValue?: unknown;
  constraints: string[]; // e.g. ['unique', 'indexed']
  relation?: {
    targetEntity: string;
    cardinality: 'one' | 'many';
  };
}

interface ShepDataEntity {
  name: string;
  fields: ShepDataField[];
}

interface ShepDataModel {
  appName: string;
  entities: ShepDataEntity[];
}
```

The language/compiler side is responsible for mapping from ShepLang AST → `ShepDataModel`.

## 5. Mapping Rules

### 5.1 Scalar Types

| ShepLang field type | Canonical type | Notes |
|---------------------|----------------|-------|
| `text`              | `string`       | UTF-8 text |
| `number`            | `number`       | double/float for now |
| `bool` / `boolean`  | `boolean`      | stored as native bool |
| `date`              | `date`         | date-only (no time) |
| `datetime`          | `datetime`     | ISO-8601 timestamp |
| `json`              | `json`         | arbitrary object |

### 5.2 Relations (ref[])

Input syntax:

```sheplang
"userId: ref[User], required"
"tasks: list[Task]"
```

Mapping:

- `ref[User]` → `kind: 'relation'`, `relation.targetEntity = 'User'`, `cardinality = 'one'`.
- `list[Task]` → `kind: 'relation'`, `relation.targetEntity = 'Task'`, `cardinality = 'many'`, `isList = true`.

### 5.3 Required / Optional / Default

- `required` → `required: true`.
- `optional` (or absence of `required`) → `required: false`.
- `default=value` → `defaultValue` parsed into appropriate JS type.

## 6. Adapter Responsibilities (High-Level)

### 6.1 Mongo / Mongoose-style Adapter

Given a `ShepDataModel`, adapter must produce:

- Collection name per entity (`tasks`, `users`, lowercased plural).
- Field mappings (`string`, `Number`, `Boolean`, `Date`, `Mixed` for json).
- Index definitions for `unique` / `indexed` constraints.

### 6.2 TypeScript Types

For each entity:

```ts
export interface Task {
  id: string;          // injected
  title: string;       // required text
  dueDate?: Date;      // optional date
  done: boolean;       // default=false
  userId: string;      // ref[User] stored as id
}
```

Relations should also emit **helper types** (`TaskWithUser`) but that can be V1.2.

## 7. Validation + ShepVerify Hooks

ShepData must expose enough metadata for ShepVerify to check:

- Non-null invariants (`required` fields present).
- Type correctness of values at runtime.
- Uniqueness violations where marked `unique`.

At minimum, emit a `validationSchema` per entity that ShepAPI can plug into:

```ts
interface EntityValidationSchema {
  [fieldName: string]: {
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json';
    constraints: string[];
  };
}
```

## 8. Open Questions (For V1.1 Design Review)

- How many storage backends do we commit to in V1.1 (Mongo-only vs adapter interface)?
- Do we treat `id` as reserved field or allow custom primary keys?
- How do we encode complex constraints (e.g. `"title must be unique per user"`)?
- How far do we go with automatic migrations vs. just emitting a migration plan?

---

**Status:** Draft V1.1 – For internal engineering review
