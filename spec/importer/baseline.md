# Baseline Specification – Importer Fixtures

**Purpose**: define reproducible project structures that the importer can safely analyze without breaking due to framework drift.

---

## Supported Patterns

### Next.js + Prisma (App Router)
- **File layout**:
  ```
  app/
    layout.tsx
    page.tsx
    dashboard/
      page.tsx
      loading.tsx
    api/
      tasks/
        route.ts
  lib/
    prisma.ts
  prisma/
    schema.prisma
  package.json
  next.config.js
  tsconfig.json
  ```
- **Detection keys**:
  - `"next"` in dependencies
  - `"@prisma/client"` or `"prisma"` in dependencies
  - `app/` directory exists
  - `prisma/schema.prisma` exists

### Vite + React
- **File layout**:
  ```
  src/
    main.tsx
    App.tsx
    components/
      Header.tsx
      TaskList.tsx
    hooks/
      useTasks.ts
  package.json
  vite.config.ts
  tsconfig.json
  ```
- **Detection keys**:
  - `"vite"` in devDependencies
  - `"react"` in dependencies
  - `src/` directory exists
  - `vite.config.ts` exists

### Plain React (Create React App style)
- **File layout**:
  ```
  src/
    index.tsx
    App.tsx
    components/
    pages/
  public/
  package.json
  tsconfig.json
  ```
- **Detection keys**:
  - `"react"` in dependencies
  - No `vite` or `next` detected
  - `src/` directory exists

---

## Unsupported Patterns (Explicitly Excluded)

- **Custom monorepos** (Nx, Turborepo, Lerna) – too much variance
- **GraphQL/Apollo** – schema parsing out of scope for Slice 1
- **CSS-in-JS libraries** – not relevant to entity/view extraction
- **Server Components** (RSC) – experimental; defer to later slices
- **Next.js Pages Router** – focus on App Router first

---

## Fixture Locking Rules

1. **Pin exact versions** in `package.json` (no `^` or `~`).
2. **Commit `pnpm-lock.yaml`** with each fixture.
3. **Include minimal working code** (no external assets, no env files).
4. **Document any deviations** in `README.md` inside each fixture.

---

## Success Criteria for Slice 0

- `pnpm test importer:fixtures` runs without errors.
- Each fixture reports correct framework detection.
- No network calls during fixture tests.
- Fixtures remain stable across OSes (Windows/Linux/macOS).
