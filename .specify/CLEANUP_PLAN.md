# Cleanup Plan: Resolve Playground vs Sandbox Conflict

**Issue:** Created new `/sandbox/` folder when we should have enhanced existing `/playground/`  
**Decision:** Remove sandbox, use playground for Sandbox Alpha  
**Date:** 2025-01-13

---

## Problem Statement

**Current State:**
- `/sheplang/playground/` - Vite-based, has ShepLang integration
- `/sheplang/sandbox/` - Next.js 16, empty, just added in Task 1
- `/sheplang/shepkit/` - Next.js 14, full IDE, for Phase 2

**Original Spec Said:**
> "Option A: Enhance existing playground → Sandbox Alpha"

**What We Did Wrong:**
- Created NEW `/sandbox/` instead of enhancing `/playground/`
- Now have 3 folders when we need 2
- Violates original decision

---

## Resolution: Use Playground for Sandbox Alpha

### Why Playground is Better Choice:

1. ✅ **Already integrated** - Has ShepLang + adapter imports
2. ✅ **Has examples** - Already has example ShepLang code
3. ✅ **Vite is simpler** - Lighter than Next.js for a sandbox
4. ✅ **Matches original spec** - "Option A" was to enhance playground
5. ✅ **Less work** - Build on existing foundation

### Why NOT to Use Sandbox:

1. ❌ Empty folder (no code yet)
2. ❌ Next.js overhead unnecessary for simple sandbox
3. ❌ Wasn't the original plan
4. ❌ Creates confusion with 3 folders

---

## Cleanup Steps

### Step 1: Revert Workspace Changes
**File:** `pnpm-workspace.yaml`

Remove:
```yaml
- sheplang/sandbox
```

Keep:
```yaml
packages:
  - sheplang/packages/*
  - adapters/*
  - sheplang/shepkit      # Phase 2 (archived)
  - sheplang/playground   # Phase 1 (Sandbox Alpha)
  - sheplang/examples
  - sheplang/e2e
```

### Step 2: Delete Sandbox Folder
```bash
cd sheplang
rm -rf sandbox
```

### Step 3: Update All Specs

**Files to update:**
- `.specify/specs/sandbox-alpha.spec.md`
- `.specify/plans/sandbox-alpha.plan.md`
- `.specify/tasks/sandbox-alpha.tasks.md`

**Changes:**
- `/sandbox/` → `/playground/`
- "Next.js 14" → "Vite"
- Remove Next.js specific features

### Step 4: Revise Task 1

**New Task 1:** "Verify Playground Setup"
- Check playground has language integration ✓
- Check playground has examples ✓
- Add to workspace (already there) ✓

### Step 5: Revise Task 2

**New Task 2:** "Add AI SDK to Playground"

Update `playground/package.json`:
```json
{
  "dependencies": {
    "@sheplang/language": "workspace:*",
    "@adapters/sheplang-to-boba": "workspace:*",
    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.66",
    "zod": "^3.23.0",
    "monaco-editor": "^0.45.0",
    "lz-string": "^1.5.0"
  }
}
```

Note: No React needed for Vite - can use Vanilla JS/TS

---

## Revised Architecture

### What Playground Will Become:

**Tech Stack:**
- Vite (existing)
- Monaco Editor (add)
- Vanilla TypeScript (no React needed)
- Existing ShepLang integration
- AI SDK for backend calls

**Structure:**
```
playground/
  src/
    main.ts           # Entry point (already exists)
    examples.ts       # Examples (already exists)
    editor.ts         # NEW: Monaco wrapper
    preview.ts        # NEW: Preview panel
    ai-client.ts      # NEW: AI API calls
  api/                # NEW: AI backend (Express or similar)
    ai-handler.ts     # AI route
  index.html          # Already exists
```

**Benefits:**
- Simpler than Next.js
- Faster dev experience
- Build on existing work
- Clean separation from ShepKit

---

## What About ShepKit?

**Status:** Phase 2 - Archived for now

**Location:** `/sheplang/shepkit/`

**Action:** Keep as-is, don't delete

**Why:**
- ShepKit is Phase 2
- Sandbox Alpha (playground) is Phase 1
- ShepKit has full IDE features we'll need later
- Just ignore it for now

---

## Final Folder Structure

```
/sheplang/
  packages/           # Core language (Phase 0) ✅ DONE
  adapters/           # Transpiler (Phase 0) ✅ DONE
  playground/         # Sandbox Alpha (Phase 1) 🎯 CURRENT
  shepkit/            # Full IDE (Phase 2) 📦 ARCHIVED
  examples/           # Test examples
  e2e/                # End-to-end tests
```

**Clean. Simple. Aligned with original plan.**

---

## Git Commit Strategy

### Commit 1: Revert workspace change
```bash
git revert HEAD~1  # Revert Task 1 commit
```

### Commit 2: Remove sandbox folder
```bash
rm -rf sheplang/sandbox
git add -A
git commit -m "chore: Remove unused sandbox folder"
```

### Commit 3: Update specs
```bash
git add .specify/
git commit -m "docs: Update specs to use playground instead of sandbox"
```

### Commit 4: Clean slate
```bash
git push origin main
```

---

## Validation

After cleanup, verify:
- [ ] No `/sandbox/` folder exists
- [ ] Playground still works: `cd playground && pnpm dev`
- [ ] Workspace only has playground (not sandbox)
- [ ] All specs reference playground (not sandbox)
- [ ] Core packages still build: `pnpm -w -r build`

---

## Next Steps After Cleanup

1. ✅ Cleanup complete
2. ⏭️ Execute revised Task 2 (Add AI SDK to playground)
3. ⏭️ Continue with remaining tasks (adapted for Vite)

---

## Decision

**Status:** Awaiting founder approval

**Recommended:** ✅ Proceed with cleanup

**Why:** Aligns with original spec, simpler tech stack, builds on existing work

---

**Last Updated:** 2025-01-13  
**Approved By:** [Pending]
