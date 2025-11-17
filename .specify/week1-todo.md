# Week 1 Spec-Driven Todo List
**Timeline:** Nov 17-23, 2025  
**Goal:** Working E2E Dog Reminders Demo  
**Methodology:** Microsoft Spec-Driven Development

---

## Day 1-2: Preview & Bridge (CRITICAL)

### ✅ SPEC: Preview Command
**What:** VSCode command that opens webview showing running ShepLang app  
**Why:** Founders need to see their code running to validate the value prop  
**Success:** Click preview → see UI → click button → data updates

**Tasks:**
- [x] **T1.1** Implement `showPreviewCommand()` in preview.ts ✅
  - Parse .shep file, create webview, send AST via postMessage
  - **Test:** Command shows error for non-.shep files
  - **Estimate:** 2 hours | **Actual:** 3 hours

- [x] **T1.2** Create webview HTML template ✅
  - HTML with VSCode API, message listener, root div
  - **Test:** Manual - verify message received
  - **Estimate:** 1 hour | **Actual:** 1 hour

- [x] **T1.3** Implement simple renderer ✅
  - Render views, buttons, lists from AST
  - **Test:** Manual - todo.shep UI appears correctly
  - **Estimate:** 3 hours | **Actual:** 4 hours

- [x] **T1.4** Wire button onClick handlers ✅
  - Look up action in AST, execute statements
  - **Test:** Console logs action execution
  - **Estimate:** 2 hours | **Actual:** 2 hours

### ✅ SPEC: Backend Integration
**What:** Auto-load ShepThon runtime when .shepthon file present  
**Why:** Bridge needs runtime to execute API calls  
**Success:** Open .shepthon → backend loads → status bar shows active

**Tasks:**
- [x] **T2.1** Auto-load backend on file open ✅
  - Watch for .shepthon files, call runtimeManager.loadBackend()
  - **Test:** Opening .shepthon file loads backend
  - **Estimate:** 1 hour | **Actual:** 1 hour

- [x] **T2.2** Implement callEndpoint message handler ✅
  - Listen for messages from webview, call bridge service
  - **Test:** Mock message → bridge called
  - **Estimate:** 2 hours | **Actual:** 2 hours

- [x] **T2.3** Implement API client in webview ✅
  - callBackend() function with Promise-based async
  - **Test:** Manual - API call returns result
  - **Estimate:** 2 hours | **Actual:** 2 hours

**Day 1-2 Total:** 13 hours (across 2 days)

---

## Day 3-4: LSP Enhancement

### ✅ SPEC: AI-Optimized Context
**What:** Enhanced LSP providing rich semantic information  
**Why:** AI tools need context to generate accurate code  
**Success:** Cursor generates valid ShepLang 80%+ of time

**Tasks:**
- [x] **T3.1** Context-aware completion provider ✅
  - Detect block type, return relevant completions only
  - **Test:** Inside model → suggests field types
  - **Estimate:** 3 hours | **Actual:** 3 hours

- [x] **T3.2** Enhanced hover provider ✅
  - All keywords have docs + examples in markdown (already existed!)
  - **Test:** Manual - hover shows helpful info
  - **Estimate:** 2 hours | **Actual:** 0 hours (pre-existing)

- [x] **T3.3** Document symbol provider ✅
  - Return outline of models/views/actions/endpoints
  - **Test:** Outline view shows symbols
  - **Estimate:** 2 hours | **Actual:** 1 hour

- [x] **T3.4** Definition provider ✅
  - Jump to model/endpoint definitions
  - **Test:** Click reference → jumps to definition
  - **Estimate:** 2 hours | **Actual:** 1 hour

**Day 3-4 Total:** 9 hours  
**Day 3-4 Actual:** 5 hours (60% faster!) ✅

---

## Day 5-6: Preview Polish

### ✅ STATUS: CORE COMPLETE (60%)

### SPEC: Production UX
**What:** Polished preview with loading states, live reload, error handling  
**Why:** Alpha users need reliable, understandable experience  
**Success:** Preview feels native, errors are clear, updates smooth

**Tasks:**
- [x] **T5.1** Live reload on file changes 
  - File watcher with debouncing, re-parse and update
  - **Test:** Edit file → preview updates <2s
  - **Estimate:** 2 hours | **Actual:** 1 hour

- [x] **T5.2** Loading states 
  - "Starting backend...", "Saving...", progress indicators
  - **Test:** Visual feedback during operations
  - **Estimate:** 1 hour | **Actual:** 1 hour

- [x] **T5.3** Error handling 
  - Friendly messages with actionable suggestions
  - **Test:** Break syntax → see helpful error
  - **Estimate:** 2 hours | **Actual:** 1 hour

- [x] **T5.4** Status bar backend health 
  - Show running/stopped, click to restart
  - **Test:** Backend visible in status bar
  - **Estimate:** 1 hour | **Actual:** 0.5 hours

- [ ] **T5.5** DevTools integration (OPTIONAL - Skipped)
  - Console passthrough, debugging
  - **Reason:** Core features complete, save budget

- [x] **T5.6** 🔥 **Backend Integration (CRITICAL)** 
  - **MAJOR:** Fixed ESM/CommonJS incompatibility
  - Created direct-parser.ts (CommonJS-compatible)
  - Full E2E flow: button click → backend → UI update
  - In-memory database working
  - **Impact:** UNBLOCKED ENTIRE PRODUCT
  - **Estimate:** Unknown | **Actual:** 3 hours (deep debugging)

**Day 5-6 Total:** ~10 hours (including critical backend fix)
**Status:** ✅ **100% COMPLETE** - All core functionality working!

---

## Day 7: Testing & Validation

### ✅ SPEC: 100% Test Coverage
**What:** Automated + manual tests validating all functionality  
**Why:** Cannot ship alpha with critical bugs  
**Success:** All tests pass, E2E demo works flawlessly

**Tasks:**
- [ ] **T7.1** Bridge integration tests
  - Test callEndpoint() with GET/POST, error handling
  - **Test:** All bridge tests pass
  - **Estimate:** 2 hours

- [ ] **T7.2** Preview command tests
  - Test webview creation, file handling
  - **Test:** All preview tests pass
  - **Estimate:** 2 hours

- [ ] **T7.3** Dog Reminders E2E test
  - Full flow: load backend → open preview → click button → verify data
  - **Test:** E2E test passes
  - **Estimate:** 2 hours

- [ ] **T7.4** Manual testing checklist
  - 10-point checklist covering all features
  - **Test:** All manual tests pass
  - **Estimate:** 2 hours

- [ ] **T7.5** Documentation updates
  - Update README, SETUP, status docs
  - **Test:** Docs accurate and helpful
  - **Estimate:** 1 hour

- [ ] **T7.6** Record screencast
  - 3-min demo: open files → preview → add reminder → success
  - **Test:** Video clearly demonstrates value
  - **Estimate:** 1 hour

**Day 7 Total:** 10 hours

---

## Summary

**Total Estimated Hours:** 39 hours  
**Spread Over:** 7 days  
**Average Per Day:** 5.6 hours  
**Buffer:** Built-in for debugging/iteration

### Success Metrics
- [ ] All automated tests pass (bridge, preview, E2E)
- [ ] Manual checklist 10/10 ✅
- [ ] Dog Reminders E2E works perfectly
- [ ] Screencast recorded and approved
- [ ] Documentation updated
- [ ] Ready for Week 2 (templates & docs)

### Risk Mitigation
**Risk:** Webview renderer more complex than expected  
**Mitigation:** Start ultra-simple (just buttons + console logs), iterate

**Risk:** Timing issues with async calls  
**Mitigation:** Request IDs, promise tracking, extensive logging

**Risk:** Backend doesn't auto-load reliably  
**Mitigation:** Manual "Load Backend" command as fallback

---

## Spec-Driven Principles Applied

✅ **Explicit Decisions:** Why webview vs browser, async vs sync  
✅ **Reviewable Artifacts:** Specs, designs, tests all documented  
✅ **Testable Acceptance Criteria:** Every task has clear pass/fail  
✅ **Living Document:** Will update based on learnings  
✅ **AI-Friendly:** Clear context for AI coding assistance  

---

**Next:** Execute tasks Day 1-2, update progress daily
