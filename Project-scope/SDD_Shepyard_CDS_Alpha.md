# Shepyard (CDS Alpha) — Spec-Driven Development (SDD)

Phase: 0 → 1 (Alpha foundation)
Scope: Shepyard Creative Development Sandbox (CDS) only
Monorepo: Sheplang-BobaScript
Non-negotiable: Do not break or rewrite existing ShepLang / BobaScript / CLI behavior.

---

## 1. Intent & Vision

### 1.1 Product Intent (For non-technical founders)

Shepyard (CDS) is a **local, beginner-friendly creative development sandbox** that lets non-technical founders:

- Install and start in under 5 minutes.
- Create a **"workspace"** (project) with one or more `.shep` files.
- See a **live preview** of what their ShepLang code does.
- Get **Explain Mode** in plain English: "What did I just build?"
- Export their project so that future tools (ShepKit, ShepThon, etc.) can turn it into a real deployed app.

Shepyard is **not** a visual design tool or Figma clone. It is a **coding playground with training wheels** for ShepLang + BobaScript.

### 1.2 What this Phase is NOT

- Not building ShepKit (full IDE) yet.
- Not integrating Vercel AI SDK yet.
- Not changing ShepLang grammar.
- Not changing BobaScript VM semantics.
- Not building cloud accounts / auth / multi-tenant stuff.

We only:
- Add **one modern sandbox UI** that runs entirely locally.
- Wire it to **existing ShepLang + BobaScript + CLI**.
- Prove that the full loop works end-to-end.

---

## 2. In-Scope Capabilities (CDS Alpha)

For CDS Alpha, Shepyard must be able to do all of this:

### 2.1 Project & File Lifecycle

- Create a **local Shepyard workspace**:
  - Stored as a folder with:
    - `shepyard.json` — project metadata
    - `/src/*.shep` — ShepLang source files
    - `/out/*.boba` — BobaScript outputs (optional, can be .tmp)
- Open an existing workspace from disk.
- Create a new `.shep` file.
- Rename and delete `.shep` files.
- Switch between files in the UI.

### 2.2 Editing & Explain Mode

- Edit `.shep` code in a code editor view (basic, does **not** have to be Monaco yet).
- On save (or after a small debounce):
  - Call ShepLang parser to produce an AST / AppModel.
  - Show a simple **AST/structure view** for learning:
    - Components
    - Routes
    - State
- Show an Explain panel:

  - "You defined: X components, Y routes, Z state stores."
  - "This screen is your 'Home' page. This route shows the todo list."
  - This is just **deterministic text**, not AI yet.

### 2.3 Live Preview

- For valid `.shep` files, Shepyard:
  - Transpiles ShepLang → BobaScript using existing adapter.
  - Uses a **minimal React renderer** (inside the sandbox app) to render a visual preview.
- We do **not** need a full design system; think:
  - Render components as layout boxes.
  - Show `component <Name>` as a card or `<h1>` in preview.
  - For routes, at least show:
    - Current route path.
    - Which component would render.

### 2.4 CLI Integration

- Shepyard can call the existing CLI behind the scenes where it makes sense (or directly import its libraries):
  - `parse` equivalent: for validating a `.shep` file.
  - `dev` equivalent: optional; at minimum, reuse the same core logic to ensure consistency.
- Constraint: **Do NOT** change CLI behavior. Shepyard is a consumer, not an owner.

### 2.5 Zero-Cloud, Local-Only

- All of CDS Alpha must work **without network access**.
- No signup, login, or online account.
- User flow:
  1. `git clone` + `pnpm install`
  2. `pnpm dev:shepyard` (or similar)
  3. Open `http://localhost:XXXX` and start playing.

---

## 3. Guardrails & Rules (Spec-Driven Development)

These are the rules your AI tools (Windsurf, Cursor, etc.) MUST follow for this project.

### 3.1 Code Ownership Boundaries

- `sheplang/packages/language` — **Locked**
- `sheplang/packages/runtime` — **Locked**
- `sheplang/packages/compiler` — **Locked**
- `sheplang/packages/transpiler` — **Locked**
- `sheplang/packages/cli` — **Locked**
- `adapters/sheplang-to-boba` — **Locked**

> "Locked" means:  
> Only touched if the PRD/SDD explicitly says "Modify X" in a named phase.

The only new code for CDS Alpha goes under:

- `shepyard/` (or `sheplang/shepyard/` depending on final layout)
- Possibly `scripts/` and `Project-scope/` for config and documentation.

### 3.2 No Placeholders by Default

- No empty components just to make TypeScript happy.
- No "TODO" functions unless they're part of a **clearly marked later Phase**.
- If a feature is declared in this SDD for Phase 0, it must be **fully wired**:
  - UI → State → ShepLang parsing → (optional) BobaScript → Preview / Explain.

### 3.3 Test & Verify Requirements

For each sub-phase:

- Add at least **one test**:
  - For Shepyard, that means:
    - Unit tests for the project model (load/save workspace).
    - A "sandbox render" smoke test (e.g. rendering a basic `component App { "Hello" }`).
- `pnpm run verify` must remain **green**.
- No new scripts that bypass Verify.

### 3.4 AI Agent Behavior (Spec-Kit-style)

All AI agents must:

- Read:
  - `PRD_Shepyard_CDS_Alpha.md` (when present)
  - `TTD_Shepyard_Phase_0.md`
  - `SDD_Shepyard_CDS_Alpha.md` (this file)
- Treat these docs as **source of truth**.
- Only modify files explicitly allowed by the current TTD phase.
- Write tests and docs when touching code.
- Stop and report if they think they need to modify locked packages.

---

## 4. Phases Overview (CDS Alpha)

### Phase 0 — Basement: Shepyard Shell + Project Model

Goal: Have a running Shepyard app shell with:

- Basic UI layout: sidebar (files), editor, preview, explain panel.
- In-memory project model (no persistence yet).
- Integration with ShepLang parser (via existing packages).
- One example `.shep` file that renders something simple.

Exit Criteria:

- `pnpm dev:shepyard` runs.
- UI shows:
  - A file tree with at least one `.shep` file.
  - An editor where that `.shep` file can be edited.
  - An "Explain" panel that updates on change.
- `pnpm run verify` is green.

### Phase 1 — Persistence & Multi-File Projects

Goal: Workspaces on disk.

- Implement `shepyard.json` format.
- Load / save workspaces.
- Multiple `.shep` files per workspace.
- Simple "Open last workspace" behavior.

### Phase 2 — Preview Renderer Upgrade

Goal: "Feels real" preview.

- Replace primitive preview with structured layout.
- Show state, routes, and basic interactivity as possible.
- Introduce a clear boundary where future ShepThon backend preview can plug in.

(Details for Phase 1 and Phase 2 go into their own TTD docs later.)

---

## 5. Founder Notes

- CDS Alpha is **about learning and confidence**: "I can see and understand what I built."
- We are not competing with VS Code yet. We're out-Pythoning Python for non-technical founders.
- As long as Shepyard + ShepLang + BobaScript + CLI stay stable and verifiable, ShepKit and ShepThon can layer on top later.
