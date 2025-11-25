# AST Importer Status Report – Slices 0-4 Complete

**Date:** November 24, 2025  
**Status:** ✅ **PRODUCTION READY** – All 44 tests passing  
**Next:** Slice 5 – API & Backend Correlation

---

## Executive Summary

The AST Importer foundation is complete. Slices 0-4 implement the core infrastructure for converting React/Next.js projects to ShepLang, following the Golden Sheep AI Methodology™ of vertical slice delivery.

| Slice | Goal | Status | Tests |
|-------|------|--------|-------|
| **0** | Baseline Spec & Fixtures | ✅ Complete | 9/9 |
| **1** | Project Detection + Manifest | ✅ Complete | Included in fixtures |
| **2** | React AST Parsing | ✅ Complete | 10/10 |
| **3** | Entity Extraction (Prisma + Heuristics) | ✅ Complete | 9/9 |
| **4** | View & Action Mapping | ✅ Complete | 12/12 |
| **Integration** | End-to-End Pipeline | ✅ Complete | 4/4 |

**Total: 44/44 tests passing (100%)**

---

## Slice 0 – Baseline Spec & Fixtures ✅

### Deliverables
- **Test fixtures**: Three project templates for validation
  - `nextjs-prisma/` – Next.js 14 App Router + TypeScript + Prisma
  - `vite-react/` – Vite + React + TypeScript
  - `plain-react/` – Minimal React setup

### Verification
```bash
✓ test/importer/fixtures.test.ts (9 tests)
```

---

## Slice 1 – Project Detection + Manifest Generation ✅

### Implementation
**File:** `extension/src/services/manifestGenerator.ts`

### Features
- ✅ Framework detection (Next.js, Vite, React, Express)
- ✅ TypeScript detection via tsconfig.json
- ✅ Prisma detection via schema.prisma
- ✅ Source path detection (app/, pages/, src/, components/)
- ✅ API path detection (Next.js API routes)
- ✅ Confidence scoring for wizard decisions
- ✅ Unsupported feature detection (monorepo, GraphQL, RSC)
- ✅ Manifest persistence to `.shep/import-manifest.json`

### ImportManifest Schema
```typescript
interface ImportManifest {
  projectName: string;
  projectRoot: string;
  framework: FrameworkDetection;
  typescript: { enabled: boolean; configPath?: string };
  prisma: { enabled: boolean; schemaPath?: string; clientVersion?: string };
  sourcePaths: { app?: string; pages?: string; src?: string; components?: string };
  apiPaths: { nextjs?: string; express?: string };
  confidence: { framework: number; typescript: number; prisma: number; overall: number };
  unsupported: string[];
  detectedAt: string;
  shepLangVersion: string;
}
```

---

## Slice 2 – React AST Parsing ✅

### Implementation
**File:** `extension/src/parsers/reactParser.ts`

### Features
- ✅ Component export detection (default, named, arrow functions)
- ✅ Props extraction (including object destructuring)
- ✅ JSX element extraction (semantic elements only)
- ✅ Event handler detection (onClick, onSubmit, etc.)
- ✅ State variable extraction (useState hooks)
- ✅ API call detection (fetch calls)
- ✅ Page vs component classification
- ✅ Cross-platform path handling (Windows/Unix)

### ReactComponent Schema
```typescript
interface ReactComponent {
  name: string;
  filePath: string;
  type: 'page' | 'component';
  exports: 'default' | 'named';
  props: PropDefinition[];
  state: StateVariable[];
  elements: JSXElement[];
  handlers: EventHandler[];
  apiCalls: APICall[];
}
```

### Known Limitations
1. **Destructured prop types**: Return "unknown" (needs TypeChecker)
2. **Separate function + export default**: Not detected (needs two-pass traversal)
3. **Complex export patterns**: May miss nested patterns

See `docs/SLICE_2_LIMITATIONS.md` for full details.

### Verification
```bash
✓ test/importer/reactParser.test.ts (10 tests)
```

---

## Slice 3 – Entity Extraction ✅

### Implementation
**File:** `extension/src/parsers/entityExtractor.ts`

### Features
- ✅ **Primary Path**: Prisma schema parsing via @prisma/internals v6.x
- ✅ **Fallback Path**: Component state heuristics from React AST
- ✅ Type mapping: Prisma → ShepLang primitives
- ✅ Relation detection (hasOne, hasMany, belongsTo)
- ✅ ShepLang data definition generation
- ✅ Confidence scoring based on source

### Type Mapping
| Prisma Type | ShepLang Type |
|-------------|---------------|
| String | text |
| Boolean | yes/no |
| Int, BigInt, Float, Decimal | number |
| DateTime, Timestamp | date |
| Json, Bytes | object |

### Entity Schema
```typescript
interface Entity {
  name: string;
  fields: EntityField[];
  relations: EntityRelation[];
  enums: string[];
}

interface EntityExtractionResult {
  entities: Entity[];
  source: 'prisma' | 'heuristics' | 'combined';
  confidence: number;
  errors?: string[];
}
```

### Generated ShepLang Example
```sheplang
data Task:
  fields:
    id: number
    title: text
    completed: yes/no
    priority: text
    createdAt: date
    updatedAt: date

data User:
  fields:
    id: number
    email: text
    name?: text
    createdAt: date
    updatedAt: date
```

### Verification
```bash
✓ test/importer/entityExtractor.test.ts (9 tests)
```

---

## Slice 4 – View & Action Mapping ✅

### Implementation
**File:** `extension/src/parsers/viewMapper.ts`

### Features
- ✅ Convert React pages → ShepLang views with routes
- ✅ Convert React components → ShepLang component views
- ✅ Map JSX elements → ShepLang widgets (button, form, list, input, text, link)
- ✅ Map event handlers → ShepLang actions
- ✅ Map API calls → call/load operations
- ✅ Extract state bindings to entities
- ✅ Generate complete ShepLang view code

### Widget Mapping
| JSX Element | ShepLang Widget |
|-------------|-----------------|
| `<button onClick={...}>` | `button "Label" -> Action` |
| `<form onSubmit={...}>` | `form Entity -> Action` |
| `<ul>` / `<ol>` | `list Entity` |
| `<input>` | `input "placeholder"` |
| `<h1>` - `<h6>` | `text "content"` |
| `<a href="...">` | `link "Label" -> "/path"` |

### Action Mapping
| Handler Pattern | ShepLang Action |
|-----------------|-----------------|
| `handleAddTask()` | `action AddTask(): add Task` |
| `handleDelete()` | `action Delete(): remove Entity` |
| `fetch('/api/tasks', POST)` | `call POST "/api/tasks"` |
| `fetch('/api/tasks')` | `load GET "/api/tasks" into tasks` |

### Generated ShepLang Example
```sheplang
view TaskList:
  list Task
  button "Add Task" -> AddTask
  button "Delete" -> DeleteTask

action AddTask(title):
  call POST "/api/tasks" with title
  load GET "/api/tasks" into tasks
  show TaskList

action DeleteTask(id):
  call DELETE "/api/tasks/:id"
  show TaskList
```

### Verification
```bash
✓ test/importer/viewMapper.test.ts (12 tests)
```

---

## Integration Testing ✅

### End-to-End Pipeline
```typescript
// 1. Generate manifest (Slice 1)
const manifest = await generateManifest(projectRoot);

// 2. Parse components (Slice 2)
const component = parseReactFile(componentPath);

// 3. Extract entities (Slice 3)
const entityResult = await extractEntities(projectRoot, [component]);

// 4. Generate ShepLang data (Slice 3)
const shepLangData = generateShepLangData(entityResult.entities);

// 5. Map views and actions (Slice 4)
const projectMapping = mapProjectToShepLang([component], entityResult.entities);

// 6. Generate ShepLang views (Slice 4)
const shepLangViews = generateShepLangViewCode(projectMapping);
```

### Test Coverage
- ✅ Next.js + Prisma → Full ShepLang generation
- ✅ Vite + React → Heuristic fallback
- ✅ Plain React → Graceful empty handling
- ✅ Backward compatibility across all projects

### Verification
```bash
✓ test/importer/integration.test.ts (4 tests)
```

---

## Technical Dependencies

### Core
- TypeScript Compiler API (`typescript`)
- Node.js fs/path modules
- Vitest for testing

### Prisma Integration
- `@prisma/internals` v6.x (getDMMF for schema parsing)
- Note: v7.0 incompatible due to datasource validation changes

---

## File Structure

```
extension/src/
├── parsers/
│   ├── reactParser.ts      # Slice 2: React AST parsing
│   ├── entityExtractor.ts  # Slice 3: Entity extraction
│   └── viewMapper.ts       # Slice 4: View & Action mapping
├── services/
│   └── manifestGenerator.ts # Slice 1: Project detection
└── types/
    ├── ImportManifest.ts   # Slice 1: Manifest schema
    ├── Entity.ts           # Slice 3: Entity schema
    └── ViewAction.ts       # Slice 4: View & Action types

test/importer/
├── fixtures.test.ts        # Slice 0: Fixture validation
├── reactParser.test.ts     # Slice 2: Parser tests
├── entityExtractor.test.ts # Slice 3: Entity tests
├── viewMapper.test.ts      # Slice 4: View & Action tests
└── integration.test.ts     # Integration tests (Slices 0-4)

docs/
├── AST_IMPORT_PLAN.md      # Original plan
├── SLICE_2_LIMITATIONS.md  # Known limitations
├── SLICE_3_SPEC.md         # Entity extraction spec
├── PRISMA_7_MIGRATION.md   # Prisma compatibility notes
└── SLICE_0_3_STATUS.md     # This document

test-import-fixtures/
├── nextjs-prisma/          # Next.js + Prisma fixture
├── vite-react/             # Vite + React fixture
└── plain-react/            # Plain React fixture
```

---

## Ready for Slice 5

### Prerequisites Met
- ✅ All 44 tests passing
- ✅ Clean TypeScript compilation
- ✅ Documentation updated
- ✅ Integration tested across all fixture types
- ✅ View & Action mapping complete

### Slice 5 Goals (from AST_IMPORT_PLAN.md)
> **API & Backend Correlation**: Convert fetch/Axios/Prisma calls to ShepLang `call`/`load` + ShepThon stubs.
> 
> 1. Scan AST for fetch/Axios usage; capture method/path/body
> 2. Align with Prisma operations (create/update/delete) for `add/update/remove` translations
> 3. Emit ShepThon backend handlers mirroring detected routes
> 4. Tests: `pnpm sheplang verify` must pass on generated project

### Future Enhancements
Per Slice 2 limitations, consider implementing TypeChecker enhancement to resolve:
- Destructured prop types
- Interface definitions
- Complex type inference

---

## Run Commands

```bash
# Run all importer tests
pnpm test:importer

# Run specific slice tests
pnpm exec vitest run test/importer/fixtures.test.ts
pnpm exec vitest run test/importer/reactParser.test.ts
pnpm exec vitest run test/importer/entityExtractor.test.ts
pnpm exec vitest run test/importer/viewMapper.test.ts
pnpm exec vitest run test/importer/integration.test.ts
```

---

**Status: READY FOR SLICE 5 🚀**

*Built following Golden Sheep AI Methodology™ – Vertical Slice Delivery*
