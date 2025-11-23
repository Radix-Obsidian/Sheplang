# Phase 0: Foundation - READY FOR EXECUTION
**Date:** November 21, 2025  
**Status:** ✅ COMPLETE & APPROVED - Ready to Begin

---

## 🎯 What is Phase 0?

**Phase 0 is the essential foundation that enables all subsequent phases (1-4).**

Phase 0 does NOT generate code. Instead, it:
1. **Parses** ShepLang specs into a canonical intermediate model (BobaScript)
2. **Validates** that specs are correct and complete
3. **Provides** a clean API for Phases 1-4 to consume

**Without Phase 0, Phases 1-4 have no foundation to build on.**

---

## 📋 Phase 0 Scope

### ✅ IN SCOPE (What Phase 0 Does)
- Parse all ShepLang entity types (text, number, money, email, image, datetime, enum, ref, array)
- Parse all flow definitions (trigger, steps, integrations, rules, notifications)
- Parse all screen kinds (feed, detail, wizard, dashboard, inbox, list)
- Parse all integration declarations (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack, Redis)
- Generate BobaScript intermediate representation
- Infer types for all entities and relationships
- Verify no undefined entities, flows, screens, integrations
- Provide clean API for Phases 1-4

### ❌ OUT OF SCOPE (What Phase 0 Does NOT Do)
- Code generation (that's Phases 1-4)
- Runtime execution (that's ShepRuntime)
- UI rendering (that's ShepUI compiler)
- Deployment or infrastructure

---

## 📂 Files You Need to Know About

### 📋 Plans (Strategic Direction)
- **`.specify/plans/phase-0-foundation.plan.md`** — Phase 0 implementation plan (5 weeks)
- **`.specify/plans/IMPLEMENTATION_ROADMAP.md`** — Overall 16-week roadmap (Phases 0-4)

### ✅ Tasks (Detailed Breakdown)
- **`.specify/tasks/phase-0-tasks.md`** — Week-by-week task breakdown (Tasks 1.1-5.5)

### 📖 Specs (Reference & Requirements)
- **`.specify/specs/aivp-stack-architecture.spec.md`** — Overall vision and component contracts
- **`.specify/specs/integration-hub.spec.md`** — Integration patterns (Stripe, Elasticsearch, etc.)
- **`.specify/specs/shepapi-workflows.spec.md`** — Workflow patterns
- **`.specify/specs/shepui-screen-kinds.spec.md`** — Screen types (feed, detail, wizard, etc.)

### 🔧 Code Files (What You'll Modify/Create)

**Modify:**
- `sheplang/packages/language/src/shep.langium` — Extend grammar
- `sheplang/packages/language/src/types.ts` — Extend type definitions
- `sheplang/packages/language/src/mapper.ts` — Extend mapper
- `sheplang/packages/language/src/index.ts` — Update exports

**Create:**
- `sheplang/packages/language/src/type-inference.ts` — Type inference engine
- `sheplang/packages/language/src/verification.ts` — Verification engine
- `sheplang/packages/language/src/integration-registry.ts` — Integration registry
- `sheplang/packages/language/tests/parser.test.ts` — Parser tests
- `sheplang/packages/language/tests/mapper.test.ts` — Mapper tests
- `sheplang/packages/language/tests/type-inference.test.ts` — Type inference tests
- `sheplang/packages/language/tests/verification.test.ts` — Verification tests
- `.specify/docs/phase-0-parser-guide.md` — Parser documentation
- `.specify/docs/phase-0-intermediate-model.md` — Model specification
- `.specify/docs/phase-0-error-handling.md` — Error handling guide
- `.specify/docs/phase-0-api-reference.md` — API reference for Phases 1-4

---

## 🗓️ Phase 0 Timeline: 5 Weeks

| Week | Focus | Tasks | Deliverables |
|------|-------|-------|--------------|
| **1** | Parser Enhancement | 1.1-1.6 | Extended grammar for entities, flows, screens, integrations |
| **2** | Intermediate Model & Mapper | 2.1-2.4 | Type definitions, mapper, integration registry |
| **3** | Type System & Inference | 3.1-3.2 | Type inference engine, relationship resolution |
| **4** | Verification Hooks | 4.1-4.2 | Verification engine, error reporting |
| **5** | Tests & Documentation | 5.1-5.5 | 100% test coverage, complete documentation |

---

## 🎯 Phase 0 Success Criteria

### Parser ✅
- Parse all ShepLang entity types
- Parse all flow definitions
- Parse all screen kinds
- Parse all integration declarations
- No grammar errors or ambiguities
- Performance: < 100ms for typical spec

### Intermediate Model ✅
- Correct BobaScript representation
- All entities with types
- All flows with steps
- All screens with layouts
- All integrations with actions

### Type System ✅
- Infer types for all entities
- Resolve relationships (1:1, 1:N, N:N)
- Detect circular references
- Check type compatibility
- Performance: < 100ms for typical spec

### Verification ✅
- Detect undefined entities
- Detect undefined flows
- Detect undefined screens
- Detect undefined integrations
- Helpful error messages
- Performance: < 100ms for typical spec

### Testing ✅
- 100% test coverage
- All phases tested (parser, mapper, types, verification)
- Edge cases covered
- Error cases covered

### Documentation ✅
- Parser guide complete
- Intermediate model spec complete
- Error handling guide complete
- API reference for Phases 1-4 complete

---

## 🏗️ Phase 0 Architecture

```
ShepLang Spec (.shep, .shepthon files)
    ↓
Langium Parser (shep.langium grammar)
    ↓
Abstract Syntax Tree (AST)
    ↓
Mapper (mapper.ts)
    ↓
Intermediate Model (BobaScript)
    ├─→ Entities with types
    ├─→ Flows with steps
    ├─→ Screens with layouts
    ├─→ Integrations with actions
    └─→ Verification results
    ↓
Phase 1-4 Compilers consume this
```

---

## 🔧 Battle-Tested Technologies (Use Official Docs)

**Never guess—always check official documentation:**

- **Langium** (grammar language) — https://langium.org/docs/grammar-language/
- **TypeScript** (type system) — https://www.typescriptlang.org/docs/
- **Vitest** (testing framework) — https://vitest.dev/
- **BobaScript** (intermediate representation) — Existing spec

---

## 💡 Innovation Areas

**Where Phase 0 innovates (beyond battle-tested tech):**

1. **Extend grammar** to support new ShepLang features (flows, screens, integrations)
2. **Create type inference engine** for relationships
3. **Create verification hooks** for compile-time validation

**Principle:** Use battle-tested tech for foundation, innovate at the edges.

---

## ⚠️ Critical Protocol for Implementation

**BEFORE EVERY IMPLEMENTATION:**
1. ✅ Check `.specify/specs/` for feature specifications
2. ✅ Check `.specify/plans/phase-0-foundation.plan.md` for phase plan
3. ✅ Check `.specify/tasks/phase-0-tasks.md` for detailed task breakdown
4. ✅ Reference the authorizing spec/plan/task file in every response
5. ✅ Stay within Phase 0 scope (don't implement Phase 1-4 features)

**WHEN STUCK ON ERROR:**
- 🔍 Search internet for official docs + error message (per scope.md)
- ❌ Never guess how Langium/TypeScript work
- 📝 Document solutions for future reference

**AFTER EACH WEEK:**
- 📊 Update memory with completed deliverables
- 📋 Document spec files used
- 🎯 List key decisions made
- ⚠️ Note any blockers or issues

---

## 🚀 How Phase 0 Enables Phase 1-4

### Phase 1 (ShepData Compiler) will consume Phase 0 output:
```typescript
// Phase 0 provides this API:
const spec = parseShepLang(specFile);
const model = mapToIntermediateModel(spec);
const types = inferTypes(model);
const verification = verify(model);

// Phase 1 uses it like this:
const entities = model.entities;
for (const entity of entities) {
  const mongooseSchema = generateMongooseSchema(entity, types);
  const tsTypes = generateTypeScriptTypes(entity, types);
  // ... etc
}
```

**Phase 0 must provide a clean, well-documented API for this.**

---

## 📊 Phase 0 → Phase 1 Handoff

**Phase 1 (ShepData Compiler) begins after Phase 0 is complete.**

**Phase 0 deliverables become Phase 1 inputs:**
- ✅ Parsed entities with all field types
- ✅ Inferred types for all relationships
- ✅ Verified spec (no undefined references)
- ✅ Clean API for consuming intermediate model

---

## 🎬 Next Steps

1. ✅ **Understand Phase 0** (read this file)
2. ✅ **Review Phase 0 plan** (`.specify/plans/phase-0-foundation.plan.md`)
3. ✅ **Review Phase 0 tasks** (`.specify/tasks/phase-0-tasks.md`)
4. **Begin Week 1: Parser Enhancement**
   - Start with Task 1.1: Analyze Current Grammar
   - Reference `.specify/specs/aivp-stack-architecture.spec.md` for entity types
   - Reference Langium docs: https://langium.org/docs/grammar-language/
5. **Commit frequently** with clear messages
6. **Update memory** after each week

---

## 📞 Questions?

**Refer to:**
- **Phase 0 plan:** `.specify/plans/phase-0-foundation.plan.md`
- **Phase 0 tasks:** `.specify/tasks/phase-0-tasks.md`
- **Entity types:** `.specify/specs/aivp-stack-architecture.spec.md`
- **Integration patterns:** `.specify/specs/integration-hub.spec.md`
- **Overall roadmap:** `.specify/plans/IMPLEMENTATION_ROADMAP.md`

---

## 🎓 Key Insight

**Phase 0 is the bridge between specification and implementation.**

It transforms human-readable ShepLang specs into a machine-readable intermediate model that all subsequent compilers can consume.

**Without Phase 0, there's no foundation. With Phase 0, everything else becomes possible.**

---

**Status:** ✅ READY FOR EXECUTION  
**Confidence:** High  
**Timeline:** 5 weeks  
**Next Review:** After Week 1 completion

🚀 **Let's build Phase 0.**
