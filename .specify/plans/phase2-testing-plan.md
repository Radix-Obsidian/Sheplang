# Phase 2 Testing Plan: Next.js Importer Polish

**Date:** November 20, 2025  
**Status:** In Progress 🧪  
**Goal:** Test and iterate on Next.js importer with real Figma Make projects

---

## Test Projects

### Test 1: Minimalist Side Component (CURRENT)
- **Source:** User's Figma Make project
- **Type:** Simple component
- **Expected Complexity:** Low
- **Purpose:** Validate basic parsing and generation

### Test 2: Multi-Page App (TBD)
- **Source:** Figma Make template or user project
- **Type:** Multiple pages/routes
- **Expected Complexity:** Medium
- **Purpose:** Test view extraction and navigation

### Test 3: CRUD Application (TBD)
- **Source:** Food delivery, task manager, or e-commerce
- **Type:** Full CRUD with API routes
- **Expected Complexity:** High
- **Purpose:** Test action extraction and API mapping

---

## Test Workflow

### Phase 2.1: First Import (30 min)
- [ ] Export minimalist component from Figma Make
- [ ] Unzip to test folder
- [ ] Run ShepLang import command
- [ ] Observe any errors or issues
- [ ] Review generated .shep file
- [ ] Document findings

### Phase 2.2: Fix Issues (1-2 hours)
- [ ] Fix any parsing errors
- [ ] Improve entity inference
- [ ] Better error messages
- [ ] Handle edge cases
- [ ] Re-test

### Phase 2.3: Iterate (1-2 hours)
- [ ] Test with different project structures
- [ ] Add more heuristics
- [ ] Improve TODO generation
- [ ] Better wizard UX
- [ ] Final polish

---

## Success Criteria

### Must Have ✅
- [ ] Import completes without errors
- [ ] Generated .shep file is valid ShepLang
- [ ] File compiles with ShepLang compiler
- [ ] Entities are correctly extracted
- [ ] At least one view is generated
- [ ] Import report is helpful

### Nice to Have 🎯
- [ ] Actions are correctly inferred
- [ ] API calls are mapped
- [ ] Wizard provides useful refinements
- [ ] Generated code is readable
- [ ] TODOs are clear and actionable

### Stretch Goals 🚀
- [ ] Zero manual fixes needed
- [ ] 90%+ semantic accuracy
- [ ] Works with any Figma Make export
- [ ] Demo-ready quality

---

## Known Limitations

### Current Implementation
1. **No tRPC detection yet** - Will show generic API paths
2. **Basic relationship handling** - Foreign keys become TODOs
3. **Simple heuristics** - Complex patterns may need manual review
4. **No Zustand/Redux** - State management not extracted

### Planned Improvements
- Add tRPC/React Query pattern detection
- Improve relationship modeling
- LLM-powered semantic enhancement (future)
- Better state management extraction

---

## Testing Checklist

### Pre-Test Setup
- [x] Extension compiled successfully
- [x] Command registered in VS Code
- [x] Parsers created (React, Prisma, AST)
- [x] Generator created
- [x] Wizard integrated
- [ ] Test project downloaded from Figma Make

### During Test
- [ ] Command appears in palette
- [ ] Folder selection works
- [ ] Stack detection succeeds
- [ ] Progress indicators shown
- [ ] No console errors
- [ ] Files generated successfully
- [ ] Files open in editor

### Post-Test
- [ ] Review generated code
- [ ] Check import report
- [ ] Identify issues
- [ ] Document improvements needed
- [ ] Plan iteration

---

## Issue Tracking

### Bugs Found
*None yet - first test pending*

### Edge Cases
*To be discovered during testing*

### User Feedback
*To be collected after first test*

---

## Next Steps After Testing

1. **Document findings** in test report
2. **Fix critical bugs** (if any)
3. **Iterate on improvements**
4. **Test with second project** (multi-page app)
5. **Create demo video**
6. **Write usage documentation**

---

## Timeline

- **Phase 2.1 (First Import):** 30 min ⏱️ **STARTING NOW**
- **Phase 2.2 (Fix Issues):** 1-2 hours
- **Phase 2.3 (Iterate):** 1-2 hours
- **Phase 2.4 (Second Test):** 1 hour
- **Phase 2.5 (Demo):** 1 hour

**Total Estimated:** 4-6 hours  
**Goal:** Complete by end of session

---

**Let's test it! 🚀**
