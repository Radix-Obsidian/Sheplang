# ShepThon Alpha - Final Completion Checklist

**Status:** EXECUTING  
**Date:** November 15, 2025

---

## Remaining Items from PRD + TTD

### ✅ Already Complete:
- Parser & AST (59/59 tests)
- Runtime (256/257 tests)
- InMemoryDatabase, Router, Scheduler
- Backend panel UI
- Bridge service foundation
- Dog Reminders .shepthon file
- Build GREEN

### ⏳ TO COMPLETE NOW:

#### 1. C1.3: Semantic Checker Module
**From TTD:** "Validate model names, endpoint paths/methods uniqueness, job schedules, types. Return diagnostics list."

**Tasks:**
- [ ] Create `src/checker.ts` with semantic validation
- [ ] Validate model name uniqueness
- [ ] Validate endpoint path+method uniqueness  
- [ ] Validate job schedule format
- [ ] Validate types (string, bool, datetime, id)
- [ ] Return structured diagnostics
- [ ] Add tests (20+ cases)
- [ ] Export from index.ts

#### 2. C3.2: ShepLang `call` and `load` Integration
**From TTD:** "ShepLang actions can call ShepThon endpoints via `call POST '/reminders'`"

**Tasks:**
- [ ] Add `call` statement to ShepLang grammar (.langium)
- [ ] Add `load` statement to ShepLang grammar
- [ ] Wire to bridge service in transpiler/runtime
- [ ] Test `call` statement parsing
- [ ] Test `load` statement parsing
- [ ] Integration test with actual endpoint

#### 3. C4.2: Dog Reminders ShepLang Frontend
**From TTD:** "Add dog-reminders.shep that lists reminders using GET, has form for POST"

**Tasks:**
- [ ] Create `examples/dog-reminders.shep`
- [ ] List view showing reminders
- [ ] Form for adding new reminder
- [ ] Wire `call` actions to ShepThon endpoints
- [ ] Test file parses correctly

#### 4. C4.3: E2E Manual Test
**From TTD:** "Run Shipyard, open Dog Reminders, add reminder, it hits backend, UI updates"

**Tasks:**
- [ ] Load dog-reminders.shepthon in ShepYard
- [ ] Load dog-reminders.shep in ShepYard
- [ ] Manual test: Add reminder via UI
- [ ] Verify backend receives request
- [ ] Verify data persists in memory
- [ ] Verify UI updates with new reminder
- [ ] Document E2E test steps

#### 5. PRD 7.3: Explain Feature
**From PRD:** "Clickable UI that summarizes ShepThon backend in plain English"

**Tasks:**
- [ ] Add "Explain" button to backend panel
- [ ] Generate plain English summary
- [ ] Show: "Your app has X models, Y endpoints, Z jobs"
- [ ] Describe each model's purpose
- [ ] Describe each endpoint's action
- [ ] Describe each job's schedule

---

## Execution Plan

### Phase 1: Semantic Checker (30 min)
- Implement checker.ts
- Add validation logic
- Write tests
- Integrate with parser

### Phase 2: ShepLang Integration (45 min)
- Update .langium grammar
- Add `call` and `load` statements
- Wire to bridge
- Test parsing + execution

### Phase 3: Dog Reminders Frontend (30 min)
- Create dog-reminders.shep
- Implement list view
- Implement form
- Wire actions

### Phase 4: E2E Testing (30 min)
- Manual test in ShepYard
- Document steps
- Verify full flow works

### Phase 5: Explain Feature (30 min)
- Add UI component
- Generate summaries
- Display in panel

**Total Estimated Time: 2.5-3 hours**

---

## Success Criteria (All Must Pass)

- [ ] Semantic checker validates all error cases
- [ ] ShepLang `call` statement works end-to-end
- [ ] ShepLang `load` statement works end-to-end
- [ ] dog-reminders.shep file exists and parses
- [ ] E2E test documented and passing manually
- [ ] Explain feature shows in UI
- [ ] `pnpm run verify` still GREEN
- [ ] All new tests passing (estimate 30+ new tests)

---

**Starting execution NOW. Will not stop until all items checked off.**
