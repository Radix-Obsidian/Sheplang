# Phase 0: Foundation - Implementation Plan
**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** PLAN - Ready for Execution  
**Duration:** 5 weeks

---

## 🎯 Phase 0 Purpose

**Phase 0 is the foundational layer that enables all subsequent phases (1-4).**

Phase 0 does NOT generate code. Instead, it:
1. **Parses** ShepLang specs into a canonical intermediate model
2. **Validates** that specs are correct and complete
3. **Provides** a clean API for Phases 1-4 to consume

**Without Phase 0, Phases 1-4 have no foundation.**

---

## 📋 Scope

### ✅ In Scope
- Parse all ShepLang entity types (text, number, money, email, image, datetime, enum, ref, array)
- Parse all flow definitions (trigger, steps, integrations, rules, notifications)
- Parse all screen kinds (feed, detail, wizard, dashboard, inbox, list)
- Parse all integration declarations (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack, Redis)
- Generate BobaScript intermediate representation
- Infer types for all entities and relationships
- Verify no undefined entities, flows, screens, integrations
- Provide clean API for Phases 1-4

### ❌ Out of Scope
- Code generation (that's Phases 1-4)
- Runtime execution (that's ShepRuntime)
- UI rendering (that's ShepUI compiler)
- Deployment or infrastructure

---

## 📂 Spec Files to Reference

**Authoritative specs for Phase 0:**
- `.specify/specs/aivp-stack-architecture.spec.md` — Overall vision and component contracts
- `.specify/specs/integration-hub.spec.md` — Integration declarations and patterns
- `.specify/plans/IMPLEMENTATION_ROADMAP.md` — Complete 16-week timeline

**When implementing any feature, cite which spec file authorizes it.**

---

## 🏗️ Architecture

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

## 📅 Timeline

### Week 1: Parser Enhancement
**Goal:** Extend Langium grammar to parse all ShepLang features

**Deliverables:**
- ✅ Entity parser (all field types)
- ✅ Flow parser (trigger, steps, integrations, rules)
- ✅ Screen parser (all 6 kinds)
- ✅ Integration parser (all 7 services)
- ✅ Grammar compiles without errors

**Key Files:**
- `sheplang/packages/language/src/shep.langium` — Grammar file (modify)
- `sheplang/packages/language/src/generated/` — Auto-generated parser (don't modify)

**Reference:**
- Langium docs: https://langium.org/docs/grammar-language/
- Existing grammar patterns in `shep.langium`

---

### Week 2: Intermediate Model & Mapper
**Goal:** Create BobaScript intermediate representation and mapper

**Deliverables:**
- ✅ Intermediate model types (entities, flows, screens, integrations)
- ✅ Mapper from AST to intermediate model
- ✅ Integration registry (map declarations to services)
- ✅ Mapper tests (100% coverage)

**Key Files:**
- `sheplang/packages/language/src/types.ts` — Type definitions (modify)
- `sheplang/packages/language/src/mapper.ts` — Mapper implementation (modify)
- `sheplang/packages/language/src/index.ts` — Main export (modify)
- `sheplang/packages/language/tests/mapper.test.ts` — Tests (create)

**Reference:**
- `.specify/specs/integration-hub.spec.md` — Integration patterns
- `.specify/specs/aivp-stack-architecture.spec.md` — Component contracts

---

### Week 3: Type System & Inference
**Goal:** Implement full type inference for entities and relationships

**Deliverables:**
- ✅ Type inference engine
- ✅ Relationship resolution (1:1, 1:N, N:N)
- ✅ Circular reference detection
- ✅ Type compatibility checking
- ✅ Type inference tests (100% coverage)

**Key Files:**
- `sheplang/packages/language/src/types.ts` — Type system (modify)
- `sheplang/packages/language/src/type-inference.ts` — Inference engine (create)
- `sheplang/packages/language/tests/type-inference.test.ts` — Tests (create)

**Reference:**
- TypeScript type system: https://www.typescriptlang.org/docs/handbook/
- Existing type definitions in `types.ts`

---

### Week 4: Verification Hooks & Integration Registry
**Goal:** Implement compile-time verification and integration registry

**Deliverables:**
- ✅ Verification engine (check for undefined entities, flows, screens, integrations)
- ✅ Integration registry (map declarations to available services)
- ✅ Error reporting with helpful messages
- ✅ Verification tests (100% coverage)

**Key Files:**
- `sheplang/packages/language/src/verification.ts` — Verification engine (create)
- `sheplang/packages/language/src/integration-registry.ts` — Integration registry (create)
- `sheplang/packages/language/tests/verification.test.ts` — Tests (create)

**Reference:**
- `.specify/specs/integration-hub.spec.md` — Integration patterns
- Error handling best practices

---

### Week 5: Test Suite & Documentation
**Goal:** Complete test coverage and documentation

**Deliverables:**
- ✅ 100% test coverage for parser, mapper, types, verification
- ✅ Parser guide documentation
- ✅ Intermediate model specification
- ✅ Error handling guide
- ✅ API reference for Phases 1-4

**Key Files:**
- `sheplang/packages/language/tests/` — Test suite (create/modify)
- `.specify/docs/phase-0-parser-guide.md` — Parser guide (create)
- `.specify/docs/phase-0-intermediate-model.md` — Model spec (create)
- `.specify/docs/phase-0-error-handling.md` — Error guide (create)

**Reference:**
- Vitest testing framework: https://vitest.dev/
- Existing test patterns in `sheplang/packages/language/tests/`

---

## 🎯 Success Criteria

### Parser
- ✅ Parse all ShepLang entity types (text, number, money, email, image, datetime, enum, ref, array)
- ✅ Parse all flow definitions (trigger, steps, integrations, rules, notifications)
- ✅ Parse all screen kinds (feed, detail, wizard, dashboard, inbox, list)
- ✅ Parse all integration declarations (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack, Redis)
- ✅ No grammar errors or ambiguities
- ✅ Performance: < 100ms for typical spec

### Intermediate Model
- ✅ Correct BobaScript representation
- ✅ All entities with types
- ✅ All flows with steps
- ✅ All screens with layouts
- ✅ All integrations with actions

### Type System
- ✅ Infer types for all entities
- ✅ Resolve relationships (1:1, 1:N, N:N)
- ✅ Detect circular references
- ✅ Check type compatibility
- ✅ Performance: < 100ms for typical spec

### Verification
- ✅ Detect undefined entities
- ✅ Detect undefined flows
- ✅ Detect undefined screens
- ✅ Detect undefined integrations
- ✅ Helpful error messages
- ✅ Performance: < 100ms for typical spec

### Testing
- ✅ 100% test coverage
- ✅ All phases tested (parser, mapper, types, verification)
- ✅ Edge cases covered
- ✅ Error cases covered

### Documentation
- ✅ Parser guide complete
- ✅ Intermediate model spec complete
- ✅ Error handling guide complete
- ✅ API reference for Phases 1-4 complete

---

## 🔧 Technical Approach

### Battle-Tested Technologies
- **Langium** (official grammar language) — https://langium.org/docs/grammar-language/
- **TypeScript** (strict mode) — https://www.typescriptlang.org/docs/
- **Vitest** (testing framework) — https://vitest.dev/
- **Official BobaScript spec** (intermediate representation)

### Innovation Areas
- Extend grammar to support new ShepLang features (flows, screens, integrations)
- Create type inference engine for relationships
- Create verification hooks for compile-time validation

### Error Handling
- **Never guess** how Langium/TypeScript work
- **Always check official docs first**
- **Search internet for errors** if stuck (per scope.md)
- **Document solutions** for future reference

---

## 📊 Dependencies

### External Dependencies
- Langium (already in use)
- TypeScript (already in use)
- Vitest (already in use)

### Internal Dependencies
- Existing `shep.langium` grammar
- Existing BobaScript intermediate representation
- Existing test framework setup

### No Dependencies On
- Phases 1-4 (they depend on Phase 0)
- ShepRuntime (that comes later)

---

## 🚀 Phase 0 → Phase 1 Handoff

**Phase 1 (ShepData Compiler) will consume Phase 0 output:**

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

## 📝 Key Files to Create/Modify

### Create
- `.specify/tasks/phase-0-tasks.md` — Detailed task breakdown
- `sheplang/packages/language/src/type-inference.ts` — Type inference engine
- `sheplang/packages/language/src/verification.ts` — Verification engine
- `sheplang/packages/language/src/integration-registry.ts` — Integration registry
- `sheplang/packages/language/tests/mapper.test.ts` — Mapper tests
- `sheplang/packages/language/tests/type-inference.test.ts` — Type inference tests
- `sheplang/packages/language/tests/verification.test.ts` — Verification tests
- `.specify/docs/phase-0-parser-guide.md` — Parser guide
- `.specify/docs/phase-0-intermediate-model.md` — Model spec
- `.specify/docs/phase-0-error-handling.md` — Error guide

### Modify
- `sheplang/packages/language/src/shep.langium` — Grammar (extend)
- `sheplang/packages/language/src/types.ts` — Type definitions (extend)
- `sheplang/packages/language/src/mapper.ts` — Mapper (extend)
- `sheplang/packages/language/src/index.ts` — Exports (update)

### Reference (Don't Modify)
- `sheplang/packages/language/src/generated/` — Auto-generated by Langium

---

## ⚠️ Important Notes

1. **Langium generates code** — Don't manually edit `generated/` folder
2. **Grammar is source of truth** — All changes start in `shep.langium`
3. **Run `pnpm run build`** after grammar changes to regenerate parser
4. **Test frequently** — Run `pnpm run test` after each change
5. **Document as you go** — Update `.specify/docs/` files in parallel

---

## 🎬 Next Steps

1. ✅ Approve Phase 0 plan (this file)
2. Create detailed task breakdown (`.specify/tasks/phase-0-tasks.md`)
3. Begin Week 1: Parser enhancement
4. Commit frequently with clear messages
5. Update memory after each week

---

**Status:** PLAN - Ready for execution  
**Confidence:** High (based on existing Langium infrastructure)  
**Next Review:** After Week 1 completion
