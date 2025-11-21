# Phase 0: Foundation - Detailed Task Breakdown
**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** TASKS - Ready for Execution

---

## 📋 Overview

This file breaks down Phase 0 into specific, actionable tasks.

**Reference Plan:** `.specify/plans/phase-0-foundation.plan.md`

---

## Week 1: Parser Enhancement

### Task 1.1: Analyze Current Grammar
**Objective:** Understand existing `shep.langium` grammar and identify gaps

**Steps:**
1. Read `sheplang/packages/language/src/shep.langium`
2. Document current entity types supported
3. Document current flow/screen/integration support
4. Identify gaps vs. Phase 0 requirements
5. Create list of grammar additions needed

**Reference:**
- Langium docs: https://langium.org/docs/grammar-language/
- `.specify/specs/aivp-stack-architecture.spec.md` — Entity types
- `.specify/specs/integration-hub.spec.md` — Integration types

**Deliverable:**
- Document: `grammar-analysis.md` (in `.specify/docs/`)
- List of grammar additions needed

**Success Criteria:**
- ✅ All current grammar documented
- ✅ All gaps identified
- ✅ Clear list of additions needed

---

### Task 1.2: Extend Grammar for Entity Types
**Objective:** Add support for all ShepLang entity field types

**Current Support:** (to be determined in Task 1.1)

**New Support Needed:**
- text, number, money, email, image, datetime, enum, ref, array
- Constraints: required, unique, max length, default values
- Relationships: 1:1, 1:N, N:N

**Steps:**
1. Add field type rules to `shep.langium`
2. Add constraint rules
3. Add relationship rules
4. Run `pnpm run build` to regenerate parser
5. Verify grammar compiles without errors
6. Create test cases for each type

**Reference:**
- Langium grammar syntax: https://langium.org/docs/grammar-language/
- `.specify/specs/aivp-stack-architecture.spec.md` — Entity field types

**Files to Modify:**
- `sheplang/packages/language/src/shep.langium`

**Deliverable:**
- Updated grammar with all entity types
- No compilation errors
- Test cases for each type

**Success Criteria:**
- ✅ Grammar compiles
- ✅ All entity types parseable
- ✅ All constraints parseable
- ✅ All relationships parseable

---

### Task 1.3: Extend Grammar for Flows
**Objective:** Add support for ShepLang flow definitions

**New Support Needed:**
- Flow name and trigger
- Steps (action descriptions)
- Integration references
- Business rules
- Notifications

**Steps:**
1. Add flow rules to `shep.langium`
2. Add step rules
3. Add integration reference rules
4. Add rule rules
5. Add notification rules
6. Run `pnpm run build`
7. Create test cases

**Reference:**
- `.specify/specs/shepapi-workflows.spec.md` — Workflow patterns
- `.specify/specs/integration-hub.spec.md` — Integration patterns

**Files to Modify:**
- `sheplang/packages/language/src/shep.langium`

**Deliverable:**
- Updated grammar with flow support
- No compilation errors
- Test cases for flows

**Success Criteria:**
- ✅ Grammar compiles
- ✅ Flows parseable
- ✅ Steps parseable
- ✅ Integrations parseable
- ✅ Rules parseable
- ✅ Notifications parseable

---

### Task 1.4: Extend Grammar for Screens
**Objective:** Add support for ShepLang screen definitions

**New Support Needed:**
- Screen name and kind (feed, detail, wizard, dashboard, inbox, list)
- Layout definitions
- Component references
- Action bindings
- Real-time features

**Steps:**
1. Add screen rules to `shep.langium`
2. Add kind enum (feed, detail, wizard, dashboard, inbox, list)
3. Add layout rules
4. Add component reference rules
5. Add action binding rules
6. Add real-time feature rules
7. Run `pnpm run build`
8. Create test cases

**Reference:**
- `.specify/specs/shepui-screen-kinds.spec.md` — Screen types

**Files to Modify:**
- `sheplang/packages/language/src/shep.langium`

**Deliverable:**
- Updated grammar with screen support
- No compilation errors
- Test cases for screens

**Success Criteria:**
- ✅ Grammar compiles
- ✅ Screens parseable
- ✅ All 6 kinds supported
- ✅ Layouts parseable
- ✅ Actions parseable

---

### Task 1.5: Extend Grammar for Integrations
**Objective:** Add support for ShepLang integration declarations

**New Support Needed:**
- Integration name (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack, Redis)
- Action declarations
- Parameter definitions
- Return types

**Steps:**
1. Add integration rules to `shep.langium`
2. Add action declaration rules
3. Add parameter rules
4. Add return type rules
5. Run `pnpm run build`
6. Create test cases

**Reference:**
- `.specify/specs/integration-hub.spec.md` — Integration patterns

**Files to Modify:**
- `sheplang/packages/language/src/shep.langium`

**Deliverable:**
- Updated grammar with integration support
- No compilation errors
- Test cases for integrations

**Success Criteria:**
- ✅ Grammar compiles
- ✅ Integrations parseable
- ✅ All 7 services supported
- ✅ Actions parseable
- ✅ Parameters parseable

---

### Task 1.6: Test Parser
**Objective:** Verify parser works correctly for all new grammar

**Steps:**
1. Create comprehensive test spec file
2. Parse all entity types
3. Parse all flows
4. Parse all screens
5. Parse all integrations
6. Verify no errors
7. Measure performance (should be < 100ms)

**Reference:**
- Vitest: https://vitest.dev/

**Files to Create:**
- `sheplang/packages/language/tests/parser.test.ts`

**Deliverable:**
- Parser tests (100% coverage of new grammar)
- Performance benchmarks

**Success Criteria:**
- ✅ All tests pass
- ✅ 100% coverage of new grammar
- ✅ Performance < 100ms

---

## Week 2: Intermediate Model & Mapper

### Task 2.1: Define Intermediate Model Types
**Objective:** Create TypeScript types for BobaScript intermediate representation

**New Types Needed:**
- Entity model (with all field types)
- Flow model (with steps, integrations, rules)
- Screen model (with layouts, actions)
- Integration model (with actions, parameters)
- Verification result model

**Steps:**
1. Read existing `types.ts`
2. Extend with new types
3. Ensure all types are complete
4. Add JSDoc comments
5. Verify TypeScript compilation

**Reference:**
- `.specify/specs/aivp-stack-architecture.spec.md` — Component contracts

**Files to Modify:**
- `sheplang/packages/language/src/types.ts`

**Deliverable:**
- Extended type definitions
- JSDoc comments for all types
- No TypeScript errors

**Success Criteria:**
- ✅ All types defined
- ✅ Types are complete
- ✅ No TypeScript errors
- ✅ JSDoc comments present

---

### Task 2.2: Implement Mapper
**Objective:** Map AST to intermediate model

**Steps:**
1. Read existing `mapper.ts`
2. Extend mapper for new AST types
3. Implement entity mapping
4. Implement flow mapping
5. Implement screen mapping
6. Implement integration mapping
7. Test mapper

**Reference:**
- Existing mapper patterns in `mapper.ts`

**Files to Modify:**
- `sheplang/packages/language/src/mapper.ts`

**Deliverable:**
- Extended mapper implementation
- No errors
- Mapper tests pass

**Success Criteria:**
- ✅ All AST types mapped
- ✅ Mapping is correct
- ✅ No errors
- ✅ Tests pass

---

### Task 2.3: Create Integration Registry
**Objective:** Map integration declarations to available services

**Integrations to Support:**
- Stripe (payments)
- Elasticsearch (search)
- AWS S3 (file storage)
- SendGrid (email)
- Twilio (SMS)
- Slack (messaging)
- Redis (caching)

**Steps:**
1. Create `integration-registry.ts`
2. Define registry structure
3. Add all 7 integrations
4. Add action definitions for each
5. Add parameter definitions
6. Add return type definitions
7. Test registry

**Reference:**
- `.specify/specs/integration-hub.spec.md` — Integration patterns

**Files to Create:**
- `sheplang/packages/language/src/integration-registry.ts`

**Deliverable:**
- Integration registry implementation
- All 7 services defined
- No errors

**Success Criteria:**
- ✅ Registry created
- ✅ All 7 services defined
- ✅ Actions defined for each
- ✅ Parameters defined
- ✅ Return types defined

---

### Task 2.4: Test Mapper
**Objective:** Verify mapper works correctly

**Steps:**
1. Create test spec file
2. Parse spec
3. Map to intermediate model
4. Verify mapping is correct
5. Test all entity types
6. Test all flows
7. Test all screens
8. Test all integrations

**Reference:**
- Vitest: https://vitest.dev/

**Files to Create:**
- `sheplang/packages/language/tests/mapper.test.ts`

**Deliverable:**
- Mapper tests (100% coverage)
- All tests pass

**Success Criteria:**
- ✅ All tests pass
- ✅ 100% coverage
- ✅ All types mapped correctly

---

## Week 3: Type System & Inference

### Task 3.1: Create Type Inference Engine
**Objective:** Implement type inference for entities and relationships

**Features Needed:**
- Infer types for all fields
- Resolve relationships (1:1, 1:N, N:N)
- Detect circular references
- Check type compatibility

**Steps:**
1. Create `type-inference.ts`
2. Implement type inference algorithm
3. Implement relationship resolution
4. Implement circular reference detection
5. Implement type compatibility checking
6. Test inference engine

**Reference:**
- TypeScript type system: https://www.typescriptlang.org/docs/handbook/

**Files to Create:**
- `sheplang/packages/language/src/type-inference.ts`

**Deliverable:**
- Type inference engine implementation
- No errors

**Success Criteria:**
- ✅ Engine created
- ✅ All types inferred correctly
- ✅ Relationships resolved
- ✅ Circular references detected
- ✅ Type compatibility checked

---

### Task 3.2: Test Type Inference
**Objective:** Verify type inference works correctly

**Steps:**
1. Create test spec file with complex types
2. Infer types
3. Verify inference is correct
4. Test relationship resolution
5. Test circular reference detection
6. Test type compatibility

**Reference:**
- Vitest: https://vitest.dev/

**Files to Create:**
- `sheplang/packages/language/tests/type-inference.test.ts`

**Deliverable:**
- Type inference tests (100% coverage)
- All tests pass

**Success Criteria:**
- ✅ All tests pass
- ✅ 100% coverage
- ✅ All inferences correct

---

## Week 4: Verification Hooks & Integration Registry

### Task 4.1: Create Verification Engine
**Objective:** Implement compile-time verification

**Checks Needed:**
- Undefined entities
- Undefined flows
- Undefined screens
- Undefined integrations
- Invalid relationships
- Invalid field types
- Invalid integration actions

**Steps:**
1. Create `verification.ts`
2. Implement verification algorithm
3. Implement each check
4. Add helpful error messages
5. Test verification engine

**Reference:**
- Error handling best practices

**Files to Create:**
- `sheplang/packages/language/src/verification.ts`

**Deliverable:**
- Verification engine implementation
- All checks implemented
- Helpful error messages

**Success Criteria:**
- ✅ Engine created
- ✅ All checks implemented
- ✅ Error messages helpful
- ✅ No false positives

---

### Task 4.2: Test Verification Engine
**Objective:** Verify verification engine works correctly

**Steps:**
1. Create test spec file with errors
2. Run verification
3. Verify errors are caught
4. Verify error messages are helpful
5. Test all check types

**Reference:**
- Vitest: https://vitest.dev/

**Files to Create:**
- `sheplang/packages/language/tests/verification.test.ts`

**Deliverable:**
- Verification tests (100% coverage)
- All tests pass

**Success Criteria:**
- ✅ All tests pass
- ✅ 100% coverage
- ✅ All errors caught

---

## Week 5: Test Suite & Documentation

### Task 5.1: Complete Test Coverage
**Objective:** Achieve 100% test coverage for Phase 0

**Steps:**
1. Run test coverage report
2. Identify gaps
3. Add tests for gaps
4. Verify 100% coverage

**Reference:**
- Vitest coverage: https://vitest.dev/guide/coverage.html

**Deliverable:**
- 100% test coverage
- Coverage report

**Success Criteria:**
- ✅ 100% coverage achieved
- ✅ All edge cases tested
- ✅ All error cases tested

---

### Task 5.2: Create Parser Guide
**Objective:** Document parser for developers

**Content:**
- Overview of parser
- Grammar rules
- How to extend grammar
- Common patterns
- Examples

**Files to Create:**
- `.specify/docs/phase-0-parser-guide.md`

**Deliverable:**
- Parser guide documentation

**Success Criteria:**
- ✅ Guide complete
- ✅ Clear and helpful
- ✅ Examples provided

---

### Task 5.3: Create Intermediate Model Spec
**Objective:** Document intermediate model for developers

**Content:**
- Overview of intermediate model
- Type definitions
- Mapper algorithm
- Examples
- API reference

**Files to Create:**
- `.specify/docs/phase-0-intermediate-model.md`

**Deliverable:**
- Intermediate model specification

**Success Criteria:**
- ✅ Spec complete
- ✅ Clear and helpful
- ✅ Examples provided
- ✅ API reference complete

---

### Task 5.4: Create Error Handling Guide
**Objective:** Document error handling for developers

**Content:**
- Overview of verification
- Error types
- Error messages
- How to fix errors
- Examples

**Files to Create:**
- `.specify/docs/phase-0-error-handling.md`

**Deliverable:**
- Error handling guide

**Success Criteria:**
- ✅ Guide complete
- ✅ Clear and helpful
- ✅ Examples provided

---

### Task 5.5: Create API Reference
**Objective:** Document Phase 0 API for Phases 1-4

**Content:**
- Overview of API
- Function signatures
- Type definitions
- Examples
- How to use in Phase 1-4

**Files to Create:**
- `.specify/docs/phase-0-api-reference.md`

**Deliverable:**
- API reference documentation

**Success Criteria:**
- ✅ Reference complete
- ✅ Clear and helpful
- ✅ Examples provided
- ✅ Ready for Phase 1-4

---

## 🎯 Success Criteria (Overall)

### Parser
- ✅ Parse all ShepLang entity types
- ✅ Parse all flow definitions
- ✅ Parse all screen kinds
- ✅ Parse all integration declarations
- ✅ No grammar errors
- ✅ Performance < 100ms

### Intermediate Model
- ✅ Correct BobaScript representation
- ✅ All entities with types
- ✅ All flows with steps
- ✅ All screens with layouts
- ✅ All integrations with actions

### Type System
- ✅ Infer types for all entities
- ✅ Resolve relationships
- ✅ Detect circular references
- ✅ Check type compatibility
- ✅ Performance < 100ms

### Verification
- ✅ Detect undefined entities
- ✅ Detect undefined flows
- ✅ Detect undefined screens
- ✅ Detect undefined integrations
- ✅ Helpful error messages
- ✅ Performance < 100ms

### Testing
- ✅ 100% test coverage
- ✅ All phases tested
- ✅ Edge cases covered
- ✅ Error cases covered

### Documentation
- ✅ Parser guide complete
- ✅ Intermediate model spec complete
- ✅ Error handling guide complete
- ✅ API reference complete

---

## 📂 Files to Create/Modify

### Create
- `.specify/tasks/phase-0-tasks.md` (this file)
- `sheplang/packages/language/src/type-inference.ts`
- `sheplang/packages/language/src/verification.ts`
- `sheplang/packages/language/src/integration-registry.ts`
- `sheplang/packages/language/tests/parser.test.ts`
- `sheplang/packages/language/tests/mapper.test.ts`
- `sheplang/packages/language/tests/type-inference.test.ts`
- `sheplang/packages/language/tests/verification.test.ts`
- `.specify/docs/phase-0-parser-guide.md`
- `.specify/docs/phase-0-intermediate-model.md`
- `.specify/docs/phase-0-error-handling.md`
- `.specify/docs/phase-0-api-reference.md`
- `.specify/docs/grammar-analysis.md`

### Modify
- `sheplang/packages/language/src/shep.langium`
- `sheplang/packages/language/src/types.ts`
- `sheplang/packages/language/src/mapper.ts`
- `sheplang/packages/language/src/index.ts`

---

## 🎬 Execution Order

1. **Week 1:** Tasks 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
2. **Week 2:** Tasks 2.1 → 2.2 → 2.3 → 2.4
3. **Week 3:** Tasks 3.1 → 3.2
4. **Week 4:** Tasks 4.1 → 4.2
5. **Week 5:** Tasks 5.1 → 5.2 → 5.3 → 5.4 → 5.5

---

**Status:** TASKS - Ready for execution  
**Confidence:** High  
**Next Review:** After Week 1 completion
