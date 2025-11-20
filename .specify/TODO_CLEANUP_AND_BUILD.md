# TODO: Cleanup & Build Checklist

**Date:** November 20, 2025  
**Goal:** Remove Figma REST, build Next.js importer, dominate as graduation layer  
**Status:** 🔥 LET'S GO

---

## 📋 Phase 1: Cleanup (2 hours)

**Spec:** `.specify/specs/cleanup-figma-rest-deprecation.md`

### Checklist:

- [ ] **1.1** Create cleanup branch: `git checkout -b cleanup/deprecate-figma-rest`
- [ ] **1.2** Archive docs to `.specify/archive/deprecated-figma-rest/`
  - REST_WIZARD_TEST_PLAN.md
  - FIGMA_BATTLE_TEST_PLAN.md
  - FIGMA_TO_SHEPLANG_RESEARCH.md
  - PLAN_EXECUTION_COMPLETE.md
  - WIZARD_COMPLETE.md
  - FIGMA_URL_PASTE_FIX.md
  - BANK_APP_FIX.md
  - figma-plugin-v1.md
  - FIGMA_PLUGIN_BUILD_PLAN.md
  - FIGMA_PLUGIN_VS_REST_API.md
- [ ] **1.3** Extract wizard to `extension/src/wizard/semanticWizard.ts`
- [ ] **1.4** Delete Figma REST code:
  - `extension/src/commands/importFromFigma.ts`
  - `extension/src/commands/postImportWizard.ts`
  - `extension/src/figma/` (entire folder)
  - `sheplang/packages/figma-shep-import/` (entire package)
- [ ] **1.5** Update `extension/src/extension.ts` (remove Figma commands)
- [ ] **1.6** Update `extension/package.json` (remove Figma commands)
- [ ] **1.7** Update `pnpm-workspace.yaml` (remove figma-shep-import)
- [ ] **1.8** Update `README.md` (add Tier 1/2 import sources)
- [ ] **1.9** Update `extension/README.md` (Graduation Layer pitch)
- [ ] **1.10** Update `ROADMAP.md` (Next.js importer, partnerships)
- [ ] **1.11** Create `DEPRECATIONS.md` (explain Figma REST removal)
- [ ] **1.12** Search for stragglers: `grep -r "figma" --exclude-dir=archive`
- [ ] **1.13** Compile extension: `cd extension && npm run compile`
- [ ] **1.14** Test extension (F5, verify no Figma commands)
- [ ] **1.15** Commit: `git commit -m "feat: Deprecate Figma REST, prep Next.js importer"`
- [ ] **1.16** Push: `git push origin cleanup/deprecate-figma-rest`
- [ ] **1.17** Merge to main

**Deliverable:** Clean codebase, ready for Next.js importer

---

## 📦 Phase 2: Next.js Importer (2 weeks)

**Spec:** `.specify/specs/nextjs-to-sheplang-importer-v1.md` (already exists!)

### Week 1: Core Parser

- [ ] **2.1** Create `extension/src/parsers/reactParser.ts`
  - Parse React/Next.js files (TSX/JSX)
  - Extract components, props, state
  - Identify data patterns (useState, props, API calls)
- [ ] **2.2** Create `extension/src/parsers/astAnalyzer.ts`
  - Analyze component tree
  - Detect entities (data models)
  - Detect views (page components)
  - Detect actions (functions, handlers)
- [ ] **2.3** Create `extension/src/commands/importFromNextJS.ts`
  - Command to select Next.js project folder
  - Run parsers on all files
  - Build ShepLang spec
- [ ] **2.4** Write unit tests for parsers
- [ ] **2.5** Test with 3 real projects (Figma Make, Lovable, v0.dev)

### Week 2: Wizard & Generator

- [ ] **2.6** Integrate semantic wizard (from Phase 1 cleanup)
- [ ] **2.7** Create `extension/src/generators/shepGenerator.ts`
  - Generate `data` blocks from entities
  - Generate `view` blocks from components
  - Generate `action` blocks from handlers
  - Add TODOs for complex logic
- [ ] **2.8** Test wizard flow end-to-end
- [ ] **2.9** Polish UX (progress bars, error handling)
- [ ] **2.10** Test with 5 more real projects
- [ ] **2.11** Update extension README with examples
- [ ] **2.12** Record demo video

**Deliverable:** Working Next.js importer, supports all Tier 1 sources

---

## 🌐 Phase 3: Webflow Support (1 week)

**Spec:** `.specify/specs/webflow-to-sheplang-importer.md` (CREATE THIS)

### Actions:

- [ ] **3.1** Research `html-react-parser` or `htmltojsx`
- [ ] **3.2** Create `extension/src/converters/htmlToReact.ts`
  - Parse Webflow HTML export
  - Convert to React components
  - Extract Webflow classes/IDs
  - Map to semantic components
- [ ] **3.3** Create `extension/src/commands/importFromWebflow.ts`
  - Command to select Webflow .zip export
  - Unzip and parse HTML/CSS
  - Convert HTML→React
  - Feed into Next.js importer
- [ ] **3.4** Test with 3 real Webflow exports
- [ ] **3.5** Document Webflow-specific tips

**Deliverable:** Webflow support (Tier 2), full HTML→React→ShepLang pipeline

---

## 📢 Phase 4: Marketing & Partnerships (1 week)

### Documentation:

- [ ] **4.1** Update all READMEs (done in Phase 1)
- [ ] **4.2** Create import guides:
  - "Import from Figma Make"
  - "Import from Lovable"
  - "Import from Webflow"
  - "Import from v0.dev"
- [ ] **4.3** Create comparison chart (ShepLang vs staying in no-code)
- [ ] **4.4** Write "Graduation Layer" manifesto

### Videos:

- [ ] **4.5** Record: "Figma Make → ShepLang in 5 minutes"
- [ ] **4.6** Record: "Lovable → ShepLang in 5 minutes"
- [ ] **4.7** Record: "Webflow → ShepLang in 5 minutes"

### Partnerships:

- [ ] **4.8** Draft Figma partnership email
- [ ] **4.9** Draft Webflow partnership email
- [ ] **4.10** Reach out to Figma partnerships team
- [ ] **4.11** Reach out to Webflow partnerships team
- [ ] **4.12** Post on X/LinkedIn about "Graduation Layer" concept

**Deliverable:** Marketing campaign live, partnership outreach sent

---

## 🎯 Success Criteria

### Phase 1 (Cleanup)
- ✅ Extension compiles without errors
- ✅ No Figma REST commands visible
- ✅ All docs archived (not deleted)

### Phase 2 (Next.js Importer)
- ✅ Successfully import 5 real Figma Make projects
- ✅ Successfully import 5 real Lovable projects
- ✅ Generated ShepLang code compiles
- ✅ <10% manual TODOs needed

### Phase 3 (Webflow)
- ✅ Successfully import 3 real Webflow sites
- ✅ HTML→React conversion >90% accurate
- ✅ Generated ShepLang code compiles

### Phase 4 (Marketing)
- ✅ 3 demo videos published
- ✅ Partnership emails sent
- ✅ "Graduation Layer" content published

---

## 📊 Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Cleanup | 2 hours | Day 1 | Day 1 |
| Phase 2: Next.js Importer | 2 weeks | Day 1 | Day 14 |
| Phase 3: Webflow Support | 1 week | Day 15 | Day 21 |
| Phase 4: Marketing | 1 week | Day 22 | Day 28 |

**Total:** 4 weeks (1 month to complete pivot)

---

## 🔥 The Pitch (When We Launch)

### For Users:

> **ShepLang: Where Your No-Code Prototype Graduates to Real Code**
> 
> Built something in Figma Make, Lovable, or Webflow?  
> Import it to ShepLang in 5 minutes.  
> Own your code. Extend it. Hire devs. No lock-in.

### For Tool Makers (Figma, Webflow):

> **Partner with ShepLang: The Graduation Path**
> 
> We're not your competitor. We're the next step.  
> When users outgrow your platform, they come to us.  
> Win-win: You keep beginners, we get power users.  
> Let's make "graduate, don't churn" the new normal.

---

## 🚀 Ready to Execute?

**This is your checklist.** Follow it step-by-step.

**Questions?** Refer to:
- `.specify/STRATEGIC_PIVOT_IMPORT_FLOW.md` (strategy)
- `.specify/specs/cleanup-figma-rest-deprecation.md` (cleanup details)
- `.specify/specs/nextjs-to-sheplang-importer-v1.md` (importer spec)

**Let's build the world's best companion AI-native programming language!** 🔥

---

**Status:** Ready. Set. GO! 🚀
