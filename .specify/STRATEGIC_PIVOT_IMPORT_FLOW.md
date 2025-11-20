# Strategic Pivot: Import Flow for AI-Native Apps ✅

**Date:** November 20, 2025  
**Status:** ACTIVE STRATEGY  
**Decision:** Focus on structured code imports, not visual heuristics

---

## 🎯 The Vision

**ShepLang = The Graduation Layer for No-Code/Low-Code Tools**

> "You built a prototype with [Figma Make/Lovable/Webflow]. Now graduate it to ShepLang to own your code, extend it, and scale beyond no-code limits."

---

## ✅ Supported Import Sources (Priority Order)

### Tier 1: Full Support (React/Next.js/TypeScript)

| Source | Export Format | Status | Priority |
|--------|---------------|--------|----------|
| **Figma Make** | React + TypeScript (.zip) | ✅ Ready | P0 |
| **Lovable** | Next.js + TypeScript | ✅ Ready | P0 |
| **v0.dev** | Next.js + TypeScript | ✅ Ready | P0 |
| **Bolt.new** | React/Next.js | ✅ Ready | P0 |
| **Builder.io** | React/Next.js | ✅ Ready | P1 |
| **Framer** | React | ✅ Ready | P1 |

**Implementation:** Next.js importer (already handles all React/TypeScript)

### Tier 2: Partial Support (HTML/CSS/JS → React → ShepLang)

| Source | Export Format | Status | Priority |
|--------|---------------|--------|----------|
| **Webflow** | HTML + CSS + JS | 🔨 Needs HTML→React converter | P1 |

**Implementation:** 
1. HTML→React converter (use existing tools like `html-react-parser`)
2. Feed into Next.js importer
3. Wizard for semantic refinement

### Tier 3: Not Supported (Visual-Only, No Code Export)

| Source | Why Not | Alternative |
|--------|---------|-------------|
| **Figma REST API** | No semantics, heuristics don't scale | Use Figma Make instead |
| **Figma Plugin** | Manual tagging = friction | Use Figma Make instead |
| **Sketch** | No native code export | Manual conversion |
| **Adobe XD** | Deprecated | N/A |

---

## 🏗️ Architecture

### Import Pipeline

```
┌─────────────────────────────────────────────────┐
│          Import Source Selection                │
│  (Figma Make / Lovable / Webflow / v0.dev)     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Format-Specific Parser                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ React/Next.js│  │ HTML/CSS/JS  │            │
│  │   Parser     │  │  → React     │            │
│  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                     │
│         └──────────┬───────┘                     │
│                    ▼                             │
│         ┌──────────────────┐                    │
│         │  AST Analysis    │                    │
│         │  (Components,    │                    │
│         │   Actions, Data) │                    │
│         └──────────┬───────┘                    │
└────────────────────┼────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Semantic Wizard (User Input)            │
│  • What type of app? (E-commerce, SaaS, etc.)  │
│  • What are your entities? (User, Product)     │
│  • What actions do buttons trigger?            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         ShepLang Code Generator                 │
│  • Generate data blocks                         │
│  • Generate views                               │
│  • Generate actions                             │
│  • Add TODOs for complex logic                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         .shep Files Created ✅                  │
│  • Clean, maintainable ShepLang code            │
│  • User owns the code (no lock-in)             │
│  • Can extend/modify in VS Code                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap

### Phase 1: Next.js Importer (Handles Tier 1) - 2 weeks

**What it does:**
- Import React/Next.js projects (any structure)
- Parse components to find: data, views, actions
- Wizard for semantic refinement
- Generate `.shep` files

**Supported sources:**
- ✅ Figma Make
- ✅ Lovable
- ✅ v0.dev
- ✅ Bolt.new
- ✅ Builder.io (React exports)
- ✅ Framer

**Files to create:**
- `extension/src/commands/importFromNextJS.ts` (NEW)
- `extension/src/parsers/reactParser.ts` (NEW)
- `extension/src/parsers/astAnalyzer.ts` (NEW)
- `extension/src/wizard/semanticWizard.ts` (REUSE from Figma)

### Phase 2: Webflow Support - 1 week

**What it does:**
- Import Webflow HTML/CSS/JS exports
- Convert HTML → React components
- Feed into Next.js importer pipeline
- Same wizard experience

**Implementation:**
- Use `html-react-parser` or similar
- Map Webflow classes to React components
- Extract data from HTML structure
- Generate ShepLang code

**Files to create:**
- `extension/src/converters/htmlToReact.ts` (NEW)
- `extension/src/commands/importFromWebflow.ts` (NEW)

### Phase 3: Polish & Marketing - 1 week

**What it does:**
- Update all docs/READMEs
- Create demo videos
- Reach out to Figma/Webflow for partnerships
- Launch "Graduation Layer" marketing

---

## 🗑️ What to Delete (Cleanup Plan)

### Files to Archive

Move to `.specify/archive/deprecated-figma-rest/`:

1. **Figma REST Importer:**
   - `extension/src/commands/importFromFigma.ts` (DELETE)
   - `extension/src/figma/converter.ts` (DELETE)
   - `extension/src/figma/*.ts` (entire folder)
   - `sheplang/packages/figma-shep-import/` (entire package)

2. **Plugin Specs:**
   - `.specify/specs/figma-plugin-v1.md` (ARCHIVE)
   - `.specify/FIGMA_PLUGIN_BUILD_PLAN.md` (ARCHIVE)
   - `.specify/FIGMA_PLUGIN_VS_REST_API.md` (ARCHIVE)

3. **REST API Docs:**
   - `.specify/REST_WIZARD_TEST_PLAN.md` (ARCHIVE)
   - `.specify/FIGMA_BATTLE_TEST_PLAN.md` (ARCHIVE)
   - `.specify/FIGMA_TO_SHEPLANG_RESEARCH.md` (ARCHIVE)
   - `.specify/WIZARD_COMPLETE.md` (ARCHIVE wizard, keep concept)
   - `.specify/PLAN_EXECUTION_COMPLETE.md` (ARCHIVE)

4. **Test Files:**
   - Any tests for Figma REST converter
   - Any Figma REST examples

### Files to Update

1. **README.md** (root)
   - Remove Figma REST references
   - Add "Import from Figma Make, Lovable, Webflow" section
   - Update value proposition

2. **extension/README.md**
   - Update feature list
   - Remove "Import from Figma (REST API)"
   - Add "Import from Next.js/React projects"

3. **extension/package.json**
   - Update commands
   - Remove `sheplang.importFromFigma`
   - Add `sheplang.importFromNextJS`
   - Add `sheplang.importFromWebflow`

4. **extension/src/extension.ts**
   - Unregister old Figma command
   - Register new import commands

5. **ROADMAP.md**
   - Update import sources
   - Add partnership goals (Figma, Webflow)

### Dependencies to Remove

- Any Figma API client libraries
- Figma-specific type definitions

---

## 🤔 Does ShepLang Language Need Changes?

**SHORT ANSWER: NO** ✅

**LONG ANSWER:**

ShepLang is already perfect for this pivot because:

1. **Domain-agnostic syntax** - Works for any app type
2. **Simple primitives** - `data`, `view`, `action` map to any framework
3. **Type system** - Already handles common field types
4. **Action model** - Already supports CRUD operations

**What we DON'T need to change:**
- ❌ Grammar (no new keywords needed)
- ❌ Type system (covers 95% of use cases)
- ❌ Syntax (already AI-friendly)

**What we might ADD later (not blocking):**
- ✅ More field types (file uploads, rich text, etc.)
- ✅ More UI widgets (tabs, modals, etc.)
- ✅ API integration syntax (already have `call`, `load`)

**Verdict:** Language is ready. Focus on import tooling.

---

## 🎯 Value Proposition

### For Users

**Before ShepLang:**
- ❌ Locked into no-code platform
- ❌ Can't extend beyond platform limits
- ❌ Can't hire devs to customize
- ❌ No version control, no real ownership

**After ShepLang:**
- ✅ Own your code (no lock-in)
- ✅ Extend with custom logic
- ✅ Hire devs to build on it
- ✅ Git, VS Code, real development workflow
- ✅ AI copilots understand ShepLang natively

### For Tool Makers (Figma, Webflow, etc.)

**Partnership pitch:**
> "We're the graduation path for your users. When they outgrow your platform, they come to us. Win-win: you keep beginners, we get power users."

**Mutual benefits:**
- They get: Longer user lifecycle, "graduate don't churn" narrative
- We get: Direct pipeline of users who already have built something

---

## 📊 Success Metrics

### Phase 1 (Next.js Importer)
- [ ] Successfully import 5 real Figma Make projects
- [ ] Successfully import 5 real Lovable projects
- [ ] Generated ShepLang code compiles without errors
- [ ] <10% manual TODOs needed

### Phase 2 (Webflow)
- [ ] Successfully import 3 real Webflow sites
- [ ] HTML→React conversion >90% accurate
- [ ] Generated ShepLang code compiles without errors

### Phase 3 (Partnerships)
- [ ] Reach out to Figma partnerships team
- [ ] Reach out to Webflow partnerships team
- [ ] Create demo videos for each import source
- [ ] Launch "Graduation Layer" marketing campaign

---

## 🔥 The Moat

**Why competitors can't copy this easily:**

1. **ShepLang is AI-native** - AI copilots understand it better than React
2. **Verification system** - ShepVerify catches bugs competitors don't
3. **Educational layer** - We teach, they just convert
4. **Multi-source imports** - We support 6+ tools, not just one
5. **First mover** - We're defining the "graduation layer" category

**Network effects:**
- More imports → Better parsers → Better conversions → More users
- More users → More tool partnerships → More credibility → More imports

---

## 🚢 Next Steps

1. **Create cleanup spec** (this doc triggers it)
2. **Archive deprecated code** (safe, reversible)
3. **Build Next.js importer** (2 weeks)
4. **Test with real projects** (Figma Make, Lovable)
5. **Add Webflow support** (1 week)
6. **Update all docs/marketing** (1 week)
7. **Reach out to partners** (Figma, Webflow)

---

**Status:** Ready to execute. Let's build the world's best companion AI-native programming language! 🔥

**Tagline:** "ShepLang: Where your no-code prototype graduates to real code."
