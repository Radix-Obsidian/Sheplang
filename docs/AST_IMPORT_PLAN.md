# AST Importer – Spec-Driven Vertical Slice Plan

*Purpose*: turn the stubbed “Import from Next.js/React/GitHub” flow into a real AST analyzer that can read supported projects and emit ShepLang + ShepThon artifacts without breaking our AI-Verified Programming (AIVP) guarantees.

We follow the **Spec → Build → Verify → Document** loop for every slice, referencing official framework docs (Next.js App Router guide, React Compiler docs, Prisma schema reference) before writing code. Each slice must compile, generate ShepLang, and pass existing verification phases.

---

## Slice 0 – Baseline Spec & Fixtures

**Goal**: lock a reproducible fixture set + detection spec.

1. **Reference docs**
   - Next.js App Router structure (`app/`, `pages/`, route conventions)
   - React component conventions (function components, hooks, event handlers)
   - Prisma schema format (for entity extraction)
2. **Artifacts**
   - `spec/importer/baseline.md` describing files, patterns, and unsupported cases.
   - Fixture repos copied under `test-import-fixtures/` (one Next.js+Prisma, one Vite+React, one plain React).
3. **Acceptance**
   - `pnpm test importer:fixtures` confirms detection works and fixtures stay in sync.

---

## Slice 1 – Project Detection + Manifest Generation

**Goal**: upgrade `detectStack` to emit a structured manifest consumed by analyzers.

1. Parse `package.json`, `tsconfig`, `next.config`, `prisma/schema.prisma`.
2. Output `ImportManifest` (JSON) with:
   - framework, router type, TypeScript status
   - source directories (pages/app/src)
   - prisma schema path if present
3. Persist manifest at `.shep/import-manifest.json`.
4. Verification: unit tests comparing manifest output against fixture expectations.

---

## Slice 2 – AST Parsing for Components (Read Only)

**Goal**: walk TS/JSX using official TypeScript Compiler API.

1. For each React file, collect:
   - Component name/export type
   - Props signature (type alias or inline interface)
   - JSX tree (element type, children, bindings)
   - Event handlers + invoked functions
2. Store results in `ComponentAnalysis` objects.
3. Tests: snapshot parsed output vs. fixture files. Use actual TypeScript AST nodes.

---

## Slice 3 – Entity Extraction (Prisma + Heuristics)

**Goal**: build ShepLang `data` models.

1. Primary path: parse Prisma schema via official Prisma SDK to collect models, relations, enums.
2. Fallback path: infer entities from component state (e.g., `const [todos, setTodos]`).
3. Map types to ShepLang primitives (string → text, boolean → yes/no, etc.).
4. Tests: ensure generated `data` definitions match fixture expectations.

---

## Slice 4 – View & Action Mapping

**Goal**: convert JSX + handlers to `view`/`action` blocks.

1. Views: identify pages/components rendered under `pages/` or `app/route.tsx`.
2. Widgets:
   - `button` → `button "label" -> Action`
   - `form` submissions → `action` with parameters from inputs
   - `list` constructs → `list Entity`
3. Actions: map handler bodies (API calls, state updates) into ShepLang actions referencing entities and `call` statements.
4. Tests: compile generated ShepLang, ensure preview matches fixture behavior (smoke test only, not pixel-perfect).

---

## Slice 5 – API & Backend Correlation

**Goal**: convert fetch/Axios/Prisma calls to ShepLang `call`/`load` + ShepThon stubs.

1. Scan AST for fetch/Axios usage; capture method/path/body.
2. Align with Prisma operations (create/update/delete) for `add/update/remove` translations.
3. Emit ShepThon backend handlers mirroring detected routes.
4. Tests: `pnpm sheplang verify` must pass on generated project; ensure Phase 3 API validation succeeds when endpoints match fixture definitions.

---

## Slice 6 – Wizard + UX Integration

**Goal**: feed analyzer output into the semantic wizard so users can confirm/override before generation.

1. Wizard shows detected entities, views, actions with confidence scores.
2. Allow rename/disable per item; persisted choices flow into codegen.
3. Tests: integration test launching command against fixture workspace and confirming generated `.shep` respects overrides.

---

## Slice 7 – Docs & Telemetry

1. Update `docs/ALPHA_CAPABILITIES.md` and marketing materials to describe importer scope.
2. Add optional telemetry (feature flag) to record import success/failure for future refinement.

---

### Communication Cadence
- Each slice ends with:
  - Spec doc update
  - Tests + demo snippet
  - Marketing blurb (if user-facing impact)
- Roll forward only after verification passes; regressions reopen earlier slices.

This plan keeps us honest with spec-driven, vertical slice development and ensures every importer improvement lands fully verified before we advertise it.
