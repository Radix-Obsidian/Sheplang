# Scope Protocol: How to Stay On Track
**Version:** 1.0  
**Date:** November 21, 2025  
**Audience:** Cascade AI (and future developers)

---

## 🎯 The Problem We're Solving

**Without a clear scope protocol, it's easy to:**
- ❌ Implement features from future phases
- ❌ Go outside the current phase boundaries
- ❌ Make up solutions instead of using official docs
- ❌ Lose track of which spec file authorizes each decision

**This protocol prevents all of that.**

---

## ✅ The Scope Protocol

### Step 1: Before EVERY Implementation

**Check the `.specify/` folder:**

1. **Check `.specify/specs/`** for feature specifications
   - What are we building?
   - What are the requirements?
   - What patterns should we follow?

2. **Check `.specify/plans/`** for phase plans
   - What phase are we in?
   - What's the timeline?
   - What are the success criteria?

3. **Check `.specify/tasks/`** for detailed task breakdown
   - What specific tasks are in scope?
   - What tasks are out of scope?
   - What's the execution order?

4. **Reference the authorizing file** in every response
   - Which spec file authorizes this feature?
   - Which plan file defines the timeline?
   - Which task file breaks down the work?

5. **Stay within current phase scope**
   - Don't implement Phase 1-4 features while in Phase 0
   - Don't implement ShepUI features while building ShepData
   - Don't implement runtime features while building parsers

---

### Step 2: When Stuck on Error

**Never guess. Always research.**

1. **Search internet for official documentation**
   - Langium: https://langium.org/docs/
   - TypeScript: https://www.typescriptlang.org/docs/
   - Vitest: https://vitest.dev/
   - Other tools: search for official docs

2. **Search for the specific error message**
   - "Langium grammar compilation error X"
   - "TypeScript type error Y"
   - "Vitest assertion error Z"

3. **Document the solution**
   - Save the solution for future reference
   - Update memory with the fix
   - Add comment in code explaining why

4. **Never make up solutions**
   - Don't guess how Langium works
   - Don't assume TypeScript behavior
   - Don't invent testing patterns

---

### Step 3: When Implementing Innovation

**Verify it's within phase scope.**

1. **Check `.specify/plans/IMPLEMENTATION_ROADMAP.md`**
   - Is this innovation within Phase 0 scope?
   - Or does it belong in a future phase?

2. **Check `.specify/plans/phase-0-foundation.plan.md`**
   - Is this innovation listed in "Innovation Areas"?
   - Or is it outside the current phase?

3. **If it's within scope:**
   - Proceed with implementation
   - Document why it's innovative
   - Reference the authorizing spec/plan file

4. **If it's outside scope:**
   - Note it for future phases
   - Don't implement it now
   - Stay focused on current phase

---

### Step 4: After Each Week

**Update memory and documentation.**

1. **Update memory with:**
   - Completed deliverables
   - Spec files used
   - Key decisions made
   - Any blockers or issues

2. **Update `.specify/` files with:**
   - Progress notes
   - Completed tasks
   - Any scope changes
   - Lessons learned

3. **Commit code with:**
   - Clear commit messages
   - Reference to task numbers
   - Reference to spec files

---

## 📂 The `.specify/` Folder Structure

```
.specify/
├── specs/                          # Feature specifications
│   ├── aivp-stack-architecture.spec.md
│   ├── shepui-screen-kinds.spec.md
│   ├── shepapi-workflows.spec.md
│   ├── integration-hub.spec.md
│   └── sheplang-advanced-syntax.spec.md
│
├── plans/                          # Phase plans
│   ├── IMPLEMENTATION_ROADMAP.md   # Overall 16-week roadmap
│   ├── phase-0-foundation.plan.md  # Phase 0 plan (5 weeks)
│   ├── shepdata-compiler.plan.md   # Phase 1 plan (4 weeks)
│   ├── shepapi-compiler.plan.md    # Phase 2 plan (5 weeks)
│   └── shepui-compiler.plan.md     # Phase 3 plan (6 weeks)
│
├── tasks/                          # Detailed task breakdowns
│   ├── phase-0-tasks.md            # Phase 0 tasks (1.1-5.5)
│   ├── phase-1-tasks.md            # Phase 1 tasks (TBD)
│   └── ...
│
├── docs/                           # Documentation
│   ├── phase-0-parser-guide.md     # Parser documentation
│   ├── phase-0-intermediate-model.md
│   ├── phase-0-error-handling.md
│   ├── phase-0-api-reference.md
│   └── ...
│
├── PHASE_0_READY.md                # Phase 0 overview
├── AIVP_STACK_COMPLETE.md          # Overall AIVP vision
└── SCOPE_PROTOCOL.md               # This file
```

---

## 🔍 How to Check Scope

### Question: "Should I implement feature X?"

**Answer: Check the scope protocol.**

1. **What phase are we in?**
   - Check `.specify/plans/IMPLEMENTATION_ROADMAP.md`
   - Find current phase

2. **Is feature X in the current phase?**
   - Check `.specify/plans/phase-0-foundation.plan.md` (or current phase plan)
   - Look for feature X in scope

3. **Is feature X in the current week?**
   - Check `.specify/tasks/phase-0-tasks.md` (or current phase tasks)
   - Find the task number for feature X
   - Check if it's in the current week

4. **If yes to all:** Proceed with implementation
5. **If no to any:** Don't implement it now, note for future

---

## 📋 Current Phase: Phase 0

**Phase 0 Scope (Weeks 1-5):**

### ✅ IN SCOPE
- Parse all ShepLang entity types
- Parse all flow definitions
- Parse all screen kinds
- Parse all integration declarations
- Generate BobaScript intermediate representation
- Infer types for all entities and relationships
- Verify no undefined references
- Provide clean API for Phases 1-4

### ❌ OUT OF SCOPE
- Code generation (that's Phase 1-4)
- Runtime execution (that's ShepRuntime)
- UI rendering (that's ShepUI compiler)
- Any Phase 1-4 features

---

## 🎯 Key Files to Reference

### For Phase 0
- **Plan:** `.specify/plans/phase-0-foundation.plan.md`
- **Tasks:** `.specify/tasks/phase-0-tasks.md`
- **Specs:** `.specify/specs/aivp-stack-architecture.spec.md`, `.specify/specs/integration-hub.spec.md`

### For Overall Context
- **Roadmap:** `.specify/plans/IMPLEMENTATION_ROADMAP.md`
- **Vision:** `.specify/AIVP_STACK_COMPLETE.md`
- **Phase 0 Overview:** `.specify/PHASE_0_READY.md`

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Implementing Phase 1 features during Phase 0
**Fix:** Check `.specify/tasks/phase-0-tasks.md` to verify feature is in Phase 0 scope

### ❌ Mistake 2: Guessing how Langium/TypeScript work
**Fix:** Search internet for official docs + error message

### ❌ Mistake 3: Not referencing spec files
**Fix:** Always cite which spec/plan/task file authorizes each decision

### ❌ Mistake 4: Implementing features not in current week
**Fix:** Check `.specify/tasks/phase-0-tasks.md` to verify task is in current week

### ❌ Mistake 5: Forgetting to update memory
**Fix:** Update memory after each week with completed deliverables

---

## ✅ Good Practices

### ✅ Practice 1: Always check `.specify/` first
Before implementing anything, check the specs, plans, and tasks.

### ✅ Practice 2: Reference spec files in every response
"Per `.specify/specs/aivp-stack-architecture.spec.md`, entity types include..."

### ✅ Practice 3: Search for official docs when stuck
"Per Langium docs (https://langium.org/docs/), grammar rules are defined as..."

### ✅ Practice 4: Document decisions
"Decision: Using Langium official grammar syntax per `.specify/plans/phase-0-foundation.plan.md`"

### ✅ Practice 5: Update memory weekly
"Completed Week 1 tasks 1.1-1.6. Updated memory with deliverables."

---

## 🎬 How to Use This Protocol

### When starting a new task:
1. Read this file
2. Check `.specify/tasks/phase-0-tasks.md` for task details
3. Check `.specify/specs/` for requirements
4. Reference the spec file in your implementation
5. Document your decisions

### When stuck on error:
1. Search internet for official docs
2. Search for the specific error message
3. Document the solution
4. Update memory with the fix

### When finishing a week:
1. Update memory with completed deliverables
2. Document spec files used
3. List key decisions made
4. Note any blockers or issues

---

## 📞 Questions?

**Refer to:**
- **Phase 0 plan:** `.specify/plans/phase-0-foundation.plan.md`
- **Phase 0 tasks:** `.specify/tasks/phase-0-tasks.md`
- **Phase 0 overview:** `.specify/PHASE_0_READY.md`
- **Scope protocol:** This file (`.specify/SCOPE_PROTOCOL.md`)

---

**Status:** ✅ PROTOCOL ESTABLISHED  
**Effective:** Immediately  
**Applies to:** All Phase 0 implementation

🚀 **Follow this protocol to stay on track.**
