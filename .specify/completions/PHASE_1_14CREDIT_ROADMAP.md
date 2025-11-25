# Phase 1 — 14-Credit Roadmap (Spec-Driven Priority)

**Budget:** 14 credits remaining  
**Cost Model:** 3 credits/feature, 1 credit/bug fix  
**Strategy:** Maximum impact within budget  
**Date:** November 21, 2025

---

## 🎯 Phase 1 Vision

**Goal:** Generate production-ready full-stack code from BobaScript  
**Scope:** ShepUI (React) + ShepAPI (Express) + ShepData (Prisma)  
**Constraint:** 14 credits = ~4-5 major features  
**Quality:** Zero compromises on code quality

---

## 📊 Credit Allocation

```
Total Budget: 14 credits
├── Testing Phase 0: 0 credits (you do manually)
├── Phase 1 Implementation: 12 credits (4 features × 3 credits)
└── Bug fixes & polish: 2 credits (2 small fixes × 1 credit)
```

---

## 🔴 PRIORITY 1: ShepUI Compiler (3 credits)

**Spec Reference:** `.specify/specs/shepui-screen-kinds.spec.md`

### What It Does
Converts BobaScript screen definitions → React components

### Deliverables
1. **Screen Parser** — Parse 6 screen kinds from BobaScript
   - Feed (list + detail)
   - Detail (single record view)
   - Wizard (multi-step form)
   - Dashboard (overview)
   - Inbox (messages)
   - List (CRUD table)

2. **Component Generator** — Generate React components
   - Functional components with hooks
   - Tailwind CSS styling
   - Form validation
   - State management (Zustand)

3. **Integration** — Wire into transpiler
   - `transpileShepToBoba()` → `generateReactComponents()`
   - Output: `src/components/` folder structure

### Success Criteria
- [ ] All 6 screen kinds parse correctly
- [ ] Generated components are valid React
- [ ] Components have proper TypeScript types
- [ ] Tailwind styling applied
- [ ] Form validation works
- [ ] State management integrated
- [ ] Tests: 100% coverage

### Files to Create/Modify
- `sheplang/packages/compiler/src/shepui-compiler.ts` (NEW)
- `sheplang/packages/compiler/src/generators/react-generator.ts` (NEW)
- `adapters/sheplang-to-boba/src/index.ts` (MODIFY - add UI generation)
- `sheplang/packages/compiler/test/shepui.test.ts` (NEW)

---

## 🟠 PRIORITY 2: ShepAPI Compiler (3 credits)

**Spec Reference:** `.specify/specs/shepapi-workflows.spec.md`

### What It Does
Converts BobaScript flow definitions → Express routes

### Deliverables
1. **Flow Parser** — Parse workflow definitions from BobaScript
   - Triggers (user actions, scheduled, webhooks)
   - Steps (sequential operations)
   - Integrations (Stripe, SendGrid, etc.)
   - Rules (conditional logic)

2. **Route Generator** — Generate Express routes
   - REST endpoints (GET, POST, PUT, DELETE)
   - Request validation (Zod)
   - Error handling
   - Authentication middleware

3. **Integration** — Wire into transpiler
   - `transpileShepToBoba()` → `generateExpressRoutes()`
   - Output: `src/routes/` folder structure

### Success Criteria
- [ ] All flow types parse correctly
- [ ] Generated routes are valid Express
- [ ] Request validation works
- [ ] Error handling implemented
- [ ] Authentication integrated
- [ ] Integrations callable
- [ ] Tests: 100% coverage

### Files to Create/Modify
- `sheplang/packages/compiler/src/shepapi-compiler.ts` (NEW)
- `sheplang/packages/compiler/src/generators/express-generator.ts` (NEW)
- `adapters/sheplang-to-boba/src/index.ts` (MODIFY - add API generation)
- `sheplang/packages/compiler/test/shepapi.test.ts` (NEW)

---

## 🟡 PRIORITY 3: ShepData Compiler (3 credits)

**Spec Reference:** `.specify/specs/shepdata-schema.spec.md`

### What It Does
Converts BobaScript entity definitions → Prisma schema

### Deliverables
1. **Entity Parser** — Parse data model from BobaScript
   - Entity definitions
   - Field types (text, number, datetime, etc.)
   - Constraints (required, unique, max, default)
   - Relationships (1:1, 1:N, N:N)

2. **Schema Generator** — Generate Prisma schema
   - Model definitions
   - Field types with constraints
   - Relationships
   - Indexes and uniqueness

3. **Migration Generator** — Generate database migrations
   - Initial schema
   - Type-safe migrations
   - Seed data

### Success Criteria
- [ ] All entity types parse correctly
- [ ] Generated Prisma schema is valid
- [ ] All constraints applied
- [ ] Relationships defined correctly
- [ ] Migrations generated
- [ ] Seed data works
- [ ] Tests: 100% coverage

### Files to Create/Modify
- `sheplang/packages/compiler/src/shepdata-compiler.ts` (NEW)
- `sheplang/packages/compiler/src/generators/prisma-generator.ts` (NEW)
- `adapters/sheplang-to-boba/src/index.ts` (MODIFY - add data generation)
- `sheplang/packages/compiler/test/shepdata.test.ts` (NEW)

---

## 🟢 PRIORITY 4: Integration Hub (3 credits)

**Spec Reference:** `.specify/specs/integration-hub.spec.md`

### What It Does
Generates code for external service integrations

### Deliverables
1. **Integration Parser** — Parse integration declarations
   - Stripe (payments)
   - SendGrid (email)
   - Elasticsearch (search)
   - S3 (file storage)
   - Twilio (SMS)
   - Slack (messaging)
   - Redis (caching)

2. **SDK Generator** — Generate integration code
   - Client initialization
   - Action implementations
   - Error handling
   - Type definitions

3. **Configuration** — Generate env setup
   - Environment variables
   - Configuration files
   - Documentation

### Success Criteria
- [ ] All 7 integrations supported
- [ ] Generated code is production-ready
- [ ] Type definitions complete
- [ ] Error handling robust
- [ ] Configuration documented
- [ ] Tests: 100% coverage

### Files to Create/Modify
- `sheplang/packages/compiler/src/integration-hub.ts` (NEW)
- `sheplang/packages/compiler/src/generators/integration-generator.ts` (NEW)
- `adapters/sheplang-to-boba/src/index.ts` (MODIFY - add integration generation)
- `sheplang/packages/compiler/test/integrations.test.ts` (NEW)

---

## 🔵 PRIORITY 5: Bug Fixes & Polish (2 credits)

### Critical Bugs (1 credit)
- [ ] Fix any Phase 0 regressions
- [ ] Fix any Phase 1 compilation errors
- [ ] Fix any type safety issues

### Polish (1 credit)
- [ ] Add error messages
- [ ] Improve documentation
- [ ] Add helpful logging
- [ ] Performance optimization

---

## 📈 Implementation Strategy

### Week 1: ShepUI Compiler (3 credits)

**Day 1-2: Design & Spec**
- Review `shepui-screen-kinds.spec.md`
- Design component architecture
- Create test cases

**Day 3-4: Implementation**
- Implement screen parser
- Implement React generator
- Wire into transpiler

**Day 5: Testing & Polish**
- Write tests
- Fix bugs
- Document

### Week 2: ShepAPI Compiler (3 credits)

**Day 1-2: Design & Spec**
- Review `shepapi-workflows.spec.md`
- Design route architecture
- Create test cases

**Day 3-4: Implementation**
- Implement flow parser
- Implement Express generator
- Wire into transpiler

**Day 5: Testing & Polish**
- Write tests
- Fix bugs
- Document

### Week 3: ShepData Compiler (3 credits)

**Day 1-2: Design & Spec**
- Review `shepdata-schema.spec.md`
- Design schema architecture
- Create test cases

**Day 3-4: Implementation**
- Implement entity parser
- Implement Prisma generator
- Wire into transpiler

**Day 5: Testing & Polish**
- Write tests
- Fix bugs
- Document

### Week 4: Integration Hub (3 credits)

**Day 1-2: Design & Spec**
- Review `integration-hub.spec.md`
- Design integration architecture
- Create test cases

**Day 3-4: Implementation**
- Implement integration parser
- Implement SDK generator
- Wire into transpiler

**Day 5: Testing & Polish**
- Write tests
- Fix bugs
- Document

### Week 5: Bug Fixes & Polish (2 credits)

**Day 1-3: Bug Fixes**
- Fix any regressions
- Fix compilation errors
- Fix type issues

**Day 4-5: Polish**
- Add error messages
- Improve docs
- Optimize performance

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ ShepUI generates valid React components
- ✅ ShepAPI generates valid Express routes
- ✅ ShepData generates valid Prisma schema
- ✅ Integration Hub generates integration code
- ✅ All 4 compilers integrated into transpiler
- ✅ 100% test coverage
- ✅ Zero bugs
- ✅ Production-ready code

### Demo Story:
> "Phase 0 parses specs into BobaScript. Phase 1 generates full-stack code from that BobaScript. A founder writes a spec, AI generates the code, and it's ready to deploy."

---

## 📊 Credit Tracking

```
Budget: 14 credits
├── Phase 1 Features: 12 credits
│   ├── ShepUI Compiler: 3 credits
│   ├── ShepAPI Compiler: 3 credits
│   ├── ShepData Compiler: 3 credits
│   └── Integration Hub: 3 credits
└── Bug Fixes & Polish: 2 credits
    ├── Critical Bugs: 1 credit
    └── Polish: 1 credit

Total: 14 credits ✅
```

---

## 🚀 Next Steps

1. **Immediate:** Test Phase 0 (use provided testing guide)
2. **Week 1:** Implement ShepUI Compiler (3 credits)
3. **Week 2:** Implement ShepAPI Compiler (3 credits)
4. **Week 3:** Implement ShepData Compiler (3 credits)
5. **Week 4:** Implement Integration Hub (3 credits)
6. **Week 5:** Bug fixes & polish (2 credits)

---

## 📝 Notes

- **Spec-Driven:** Every feature backed by official spec
- **Battle-Tested:** Each feature tested incrementally
- **Quality First:** No compromises on code quality
- **Budget Conscious:** Every credit maximizes impact
- **Production Ready:** All code is production-ready
- **Zero Hallucination:** All decisions backed by specs

---

**Status:** ✅ READY TO EXECUTE  
**Budget:** 14 credits  
**Timeline:** 5 weeks  
**Quality:** Production-ready

**Let's build Phase 1! 🚀**
