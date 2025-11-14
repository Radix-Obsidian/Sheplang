# 🚀 WINDSURF — BUILD THIS EXACTLY
## ShepKit Alpha (Founder OS)

You are the Build Engineer AI for Golden Sheep AI.

---

# 🐑 ShepYard (CDS) — Spec-Driven Development Mythology PRD
Creative Development Sandbox | Alpha Release | Branch from commit 0c23638

## PART I — MYTHOLOGY
(The "universe narrative" your AI agents must maintain across every phase)

### 1. The Problem Universe
Non-technical founders want to build apps, not learn React, not configure databases, not handle "npm install failed," and definitely not debug Next.js.

They want:
- A place to think in product form
- A place to prototype in minutes
- A place to learn while they're building
- A place that feels as smooth as Windsurf / Cursor — without needing coding literacy

But no tool today gives them:
- a founder-first language + an IDE + a live MVP previewer
- that works locally, offline, and predictably.

### 2. The Shep Mythology
ShepLang → A humane language for describing "what I want my app to do."  
BobaScript → A runtime-ready IR (intermediate representation) that executes the founder's intent.  
ShepYard (CDS) → A creative development space — not a playground, not a terminal IDE — where founders shepherd their ideas from 0 → 1.

The "Yard" is safe.  
The "Yard" is local.  
The "Yard" teaches as you build.  
The "Yard" renders your ideas into real UI + actions + fake backend flows.

### 3. The Mythic Rule
ShepLang is the "thinking language."  
BobaScript is the "doing language."  
ShepYard is the "seeing & learning environment."  

These three pillars must never be decoupled or built inconsistently.

---

## PART II — PRODUCT SPEC (Spec-Kit Format)

### 1. Product Goal — ONE Sentence Spec
Deliver a local-only, self-contained Creative Development Sandbox (CDS) that allows non-technical founders to create projects, write ShepLang, auto-transpile to BobaScript, and see a live rendered MVP preview — all built from commit 0c23638 with full CLI compatibility.

### 2. High-Level Feature Specs

#### F1 — Project Workspace System
A project is:
```
/projects/<project-name>/
   app.shep
   app.boba (generated)
   meta.json
```

**Requirements:**
- Create new projects
- Switch projects
- Load/save without errors
- Store everything locally, JSON-based
- CLI must still function with these files
- No backend servers required

#### F2 — ShepLang Editor
**Requirements:**
- Monaco or textarea (Phase 1 may use textarea)
- Live debounce (300–600ms)
- Autosave
- File validation via existing ShepLang parser
- On error → show human-readable error panel (no stack traces shown to beginners)

#### F3 — BobaScript Transpiler Integration
**Hard requirement:**
- Use the existing transpiler exactly as-is from commit 0c23638.
- Transpiling must:
  - Never block UI
  - Produce .boba output
  - Allow ShepYard to read BobaScript safely
  - Fail gracefully with human-friendly messages

#### F4 — Live Preview Renderer
**Core requirement:**
- Minimal React renderer that interprets BobaScript DSL into actual UI:
  - `<screen>` → full-page view
  - `<text>` → `<p>` or `<h1>` depending on level
  - `<button>` → clickable that triggers mock "actions"
  - `<list>` → map UI
  - Navigation between screens ("routes")
- **Important:** Backend logic is mocked in Alpha. Real backend comes with ShepThon.

#### F5 — Explain Panel
A non-AI descriptive component that explains:
- What app this is (title)
- What screens exist
- What actions the app supports
- What navigation exists
- What data is referenced

Later (Phase 3) this becomes AI-powered, but Alpha is rule-based only.

#### F6 — CLI Integration
**Non-negotiable:**
- The existing CLI must continue working on the project files ShepYard generates.
- Requirements:
  - `sheplang build` works on project folder
  - CLI must see .shep file and produce identical BobaScript as ShepYard
  - No changes to core CLI code unless ABSOLUTELY required
  - CLI test suite must stay green

### 3. Non-Functional Specs

#### N1 — Local-first
- No online dependencies (no Vercel, no Supabase)
- No login required
- No external APIs
- Fast startup

#### N2 — 5-Minute Rule
From clone → running in < 5 minutes:
```
git clone ...
pnpm install
pnpm dev:yard
```

#### N3 — Stability
Every phase must be testable:
- Manual scenario tests
- Automatic `pnpm verify` tests

#### N4 — No Stubs / Placeholders Unless Required
**Spec-Kit Rule:**
- Every line of code must be "real" and testable.
- Stubs allowed only when clearly documented with "Temporary Stub / Remove in Phase X".

---

## PART III — ARCHITECTURE RULES

### 1. Repo Structure (Branch from commit 0c23638)
/sheplang/
  packages/
    language/        ← ShepLang core
    runtime/         ← Boba runtime
    cli/             ← existing CLI
    compiler/
    transpiler/
  yard/              ← NEW (ShepYard)
    src/
      editor/
      preview/
      workspace/
      explain/
      ui/
    package.json
  Project-scope/
    PRD_ShepYard_Alpha.md
    TTD_ShepYard_Phase1.md
    TTD_ShepYard_Phase2.md
    TTD_ShepYard_Phase3.md

### 2. ShepLang → BobaScript → Preview Pipeline
**Pipeline Requirements:**
- Editor emits ShepLang text
- Parser → AST (existing code)
- Transpiler → BobaScript (existing code)
- Renderer → React preview
- Renderer is new; 1–3 must NOT change.

### 3. AI Tooling Rules (Windsurf / Cursor)
**R1 — NEVER modify ShepLang, BobaScript, or CLI without explicit permission**  
This prevents regressions.

**R2 — All new code must be real**  
No placeholder files.  
No "TODO: implement later" methods.  
If AI is unsure → stop and ask.

**R3 — Always run the verify pipeline**  
Before accepting code.

**R4 — Scope must remain inside /yard ONLY**  
Unless PRD explicitly opens a package for modification.

---

## PART IV — PHASE ROADMAP (Spec-Kit)

### PHASE 0 — Branch & Environment Setup
**Goals:**
- Branch from commit 0c23638
- Add yard/ folder
- Add local-only dev server
- Set up test harness

**Outputs:**
- yard/package.json
- `pnpm dev:yard` script
- yard/src/main.tsx with "Hello from ShepYard"

**Acceptance Tests:**
- Repo installs
- `pnpm dev:yard` runs local dev server
- No breakage in CLI

### PHASE 1 — Workspace + Editor + Transpiler
**Goals:**
- Text editor for ShepLang
- Project workspace system
- Autosave
- Integration with ShepLang parser + BobaScript transpiler

**Acceptance Tests:**
- Create/Load/Switch projects
- Editor updates state
- BobaScript generated correctly
- CLI produces identical output

### PHASE 2 — Live Preview Renderer
**Goals:**
- Build the UI engine for rendering BobaScript
- Support text, buttons, navigation, simple lists

**Acceptance Tests:**
- Changing a ShepLang file updates preview within 1s
- Basic actions fire mock handlers
- Route navigation works

### PHASE 3 — Explain Panel
**Goals:**
- Non-AI teaching panel
- Static analysis only

**Acceptance Tests:**
- For any .shep file, output a human-readable summary
- Accurate count of screens/actions
- Updates when file changes

### PHASE 4 — Stability Hardening
**Goals:**
- Test coverage
- Error panels
- Fallback rendering modes
- Remove any temp stubs

**Acceptance Tests:**
- All tests pass
- No console errors
- No uncaught exceptions

### PHASE 5 — Alpha Release
**Goals:**
- Build zipped distributable
- Local-first startup guide
- Simple docs

**Acceptance Tests:**
- 5-minute install rule
- Create project → edit → preview works
- CLI still builds same apps

---

## PART V — "DO / DO NOT" RULES FOR AI AGENTS

### DO
- Follow PRD phases exactly
- Build real, testable code
- Keep ShepLang + BobaScript untouched
- Keep CLI working
- Ask when unclear

### DO NOT
- Introduce new features outside PRD
- Modify transpiler/parser behavior
- Use external APIs
- Add auth, Vercel, cloud, DB
- Add stubs that aren't documented

---

## PART VI — VERIFICATION CHECKLIST

### Pre-Build Checklist
- [ ] Branch created from 0c23638
- [ ] No changes to packages/language, packages/cli, etc.
- [ ] yard/ folder ready for development
- [ ] pnpm install works
- [ ] pnpm dev:yard script configured

### Phase Completion Criteria
- [ ] All acceptance tests pass
- [ ] No console errors
- [ ] CLI compatibility maintained
- [ ] Local-first requirement met
- [ ] 5-minute setup rule verified
