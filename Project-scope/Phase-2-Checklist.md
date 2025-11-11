# ShepLang Phase 2: Developer Experience & Runtime Preview

## Overview
- **Focus**: Developer Experience (DX) & Runtime Preview
- **Scope**: ShepLang only (@sheplang/* packages)
- **Independence**: No ShepKit code, no conflicts (isolated CLI bin, runtime port)
- **Core Features**: Hot-rebuild, explain-docs, formatter/linter, preview runtime

## Monorepo Layout
```
/packages
  /language    # Phase 1: parseAndMap(...) (already passing)
  /transpiler  # NEW: AST → TS (for preview/runtime)
  /runtime     # NEW: tiny express+ws server for live preview
  /cli         # NEW: sheplang CLI (dev/build/explain/format/stats)
```

## Package Configuration

### Anti-conflict Guardrails
- CLI binary name: `sheplang`
- Runtime default port: 8787 (override via SHEPLANG_RUNTIME_PORT)
- No environment variables or DB dependencies

## Implementation Steps

### 1. Transpiler Package
- [x] Create package.json with proper dependencies
- [x] Set up tsconfig.json with references to language package
- [x] Create transpileToTS function that converts AppModel to TypeScript
- [x] Implement file system operations for output generation

### 2. Runtime Package
- [x] Create package.json with express and ws dependencies
- [x] Set up tsconfig.json
- [x] Implement RuntimeServer type with url, reload, close methods
- [x] Create runRuntimeServer function with dynamic module loading
- [x] Add WebSocket support for hot reload

### 3. CLI Commands
- [x] Create dev command for hot-reload development
- [x] Create build command for one-shot transpilation
- [x] Create explain command for documentation generation
- [x] Create format command for code formatting
- [x] Create stats command for DX metrics

### 4. CLI Integration
- [x] Update CLI package.json with new bin name and dependencies
- [x] Implement main entry point
- [x] Create command router
- [x] Add helpful command line help

## Runbook Commands
```bash
# Build everything
pnpm -w -r build

# Dev loop with live preview (http://localhost:8787)
pnpm --filter @sheplang/cli exec sheplang dev examples/todo.shep

# One-shot build
pnpm --filter @sheplang/cli exec sheplang build examples/todo.shep

# Doc generation
pnpm --filter @sheplang/cli exec sheplang explain examples/todo.shep

# Basic DX stats snapshot
pnpm --filter @sheplang/cli exec sheplang stats
```

## Success Criteria
- [ ] `sheplang dev` serves preview at port 8787 and reloads on save in < 100 ms
- [ ] `sheplang build` writes .shep/out/MyTodos/entry.ts
- [ ] `sheplang explain` writes .shep/docs/MyTodos.md
- [ ] No environment keys required
- [ ] No port collisions with other tools
- [ ] All Phase 1 language tests remain green
