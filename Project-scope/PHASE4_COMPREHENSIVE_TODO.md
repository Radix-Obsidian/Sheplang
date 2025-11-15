# 🎯 PHASE 4: PRODUCTION-READY IDE - COMPREHENSIVE TODO

**Status:** IN PROGRESS  
**Target:** Make ShepYard work exactly like VS Code locally  
**Approach:** Complete phase in ONE session (no mini-sprints)

---

## 🔴 **CRITICAL BUGS (FIX FIRST)**

### 1. **Editor Tokenizer Error** ❌ BLOCKING
- **Issue:** Monaco syntax error: `@string$ single` should be `@stringSingle`
- **Impact:** Editor fails to load any file
- **Fix:** Correct typo in `sheplangSyntax.ts`
- **Priority:** P0 - IMMEDIATE
- **Estimate:** 2 minutes

### 2. **Backend Infinite Loading** ❌ BLOCKING
- **Issue:** ShepThon worker hangs, never completes parsing
- **Impact:** Backend panel unusable
- **Fix:** Add timeout + better error handling to worker
- **Priority:** P0 - IMMEDIATE
- **Estimate:** 15 minutes

### 3. **Memory Crashes** ❌ BLOCKING
- **Issue:** "Out of memory" crashes localhost
- **Root Causes:**
  - Monaco editor instances not disposed
  - ShepThon worker infinite loop
  - Large bundle (543kB)
  - Log buffer unlimited growth
- **Fixes:**
  - Dispose Monaco on unmount
  - Add worker timeout (5 seconds max)
  - Limit log buffer to 100 (not 500)
  - Code-split xterm.js (dynamic import)
- **Priority:** P0 - CRITICAL
- **Estimate:** 30 minutes

---

## 🟠 **HIGH PRIORITY (CORE FUNCTIONALITY)**

### 4. **File Click to Open** 🔧 NEEDED
- **Issue:** Clicking files in FileManager doesn't open in editor
- **Missing:**
  - Click handler on file items
  - Load file content from FileSystemHandle
  - Update workspace store with content
  - Switch to center panel editor view
- **Priority:** P1 - HIGH
- **Estimate:** 20 minutes

### 5. **Refresh Files** 🔧 NEEDED
- **Issue:** Refresh button doesn't reload file list
- **Fix:** Call `loadFiles()` on refresh click
- **Priority:** P1 - HIGH
- **Estimate:** 5 minutes

### 6. **File Save on Edit** 🔧 NEEDED
- **Issue:** Editing in Monaco doesn't save to disk
- **Missing:**
  - Track dirty state (unsaved changes)
  - Save button or auto-save
  - Write content back to FileSystemHandle
- **Priority:** P1 - HIGH
- **Estimate:** 25 minutes

---

## 🟡 **MEDIUM PRIORITY (UX IMPROVEMENTS)**

### 7. **Multi-File Tabs** 📑 NICE-TO-HAVE
- **Issue:** Can only view one file at a time
- **Needed:**
  - Tab bar above editor
  - Switch between open files
  - Close tab buttons
  - Active tab indicator
- **Priority:** P2 - MEDIUM
- **Estimate:** 45 minutes

### 8. **File Context Menu** 🖱️ NICE-TO-HAVE
- **Issue:** No right-click menu
- **Needed:**
  - Right-click on files/folders
  - Options: Rename, Delete, Copy Path
  - Context-sensitive menu
- **Priority:** P2 - MEDIUM
- **Estimate:** 30 minutes

### 9. **Problems View Wiring** ⚠️ NICE-TO-HAVE
- **Issue:** Problems view is empty mockup
- **Needed:**
  - Parse transpiler errors
  - Show in Problems panel
  - Click to jump to line
  - Group by severity
- **Priority:** P2 - MEDIUM
- **Estimate:** 40 minutes

---

## 🟢 **LOW PRIORITY (POLISH)**

### 10. **Drag-Drop Files** 🎯 FUTURE
- **Issue:** Can't drag files to reorder
- **Needed:**
  - Drag-drop library integration
  - Move files between folders
  - Visual feedback
- **Priority:** P3 - LOW
- **Estimate:** 60 minutes

### 11. **File Renaming** ✏️ FUTURE
- **Issue:** Can't rename files after creation
- **Needed:**
  - Inline rename input
  - Validation (no duplicates)
  - Update FileSystemHandle
- **Priority:** P3 - LOW
- **Estimate:** 25 minutes

### 12. **Search in Files** 🔍 FUTURE
- **Issue:** No file search capability
- **Needed:**
  - Search input in sidebar
  - Search across all files
  - Show results with preview
- **Priority:** P3 - LOW
- **Estimate:** 90 minutes

---

## 📋 **EXECUTION PLAN (This Session)**

### **Phase 4A: Critical Fixes (1 hour)** ✅
1. ✅ Fix tokenizer syntax error (2 min)
2. ✅ Add worker timeout for backend (15 min)
3. ✅ Implement memory optimization (30 min)
   - Dispose Monaco properly
   - Limit log buffer
   - Add worker timeout
   - Code-split xterm.js
4. ✅ Test: No more crashes, backend loads

### **Phase 4B: Core File Operations (1 hour)** ✅
5. ✅ Wire file click to open (20 min)
6. ✅ Fix refresh button (5 min)
7. ✅ Implement file save (25 min)
8. ✅ Test: Open, edit, save files

### **Phase 4C: UX Enhancements (1.5 hours)** 🔄
9. ⏳ Multi-file tabs (45 min)
10. ⏳ Context menu (30 min)
11. ⏳ Wire Problems view (40 min)
12. ✅ Test: Professional file management

### **Phase 4D: Polish (Optional)** ⏸️
13. ⏸️ Drag-drop (60 min)
14. ⏸️ File renaming (25 min)
15. ⏸️ Search (90 min)

---

## 🎯 **SUCCESS CRITERIA**

### Must Have (MVP):
- ✅ No memory crashes
- ✅ Backend loads successfully
- ✅ Files open in editor when clicked
- ✅ Refresh updates file list
- ✅ Editing saves to disk
- ✅ Monaco editor works without errors

### Should Have (Professional):
- ⏳ Multiple files open in tabs
- ⏳ Right-click context menu
- ⏳ Problems panel shows errors
- ⏳ Dirty indicators for unsaved files

### Nice to Have (Future):
- ⏸️ Drag-drop file operations
- ⏸️ File renaming
- ⏸️ Search in files

---

## 📊 **ESTIMATES**

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| 4A: Critical Fixes | 1-3 | 47 min | ⏳ IN PROGRESS |
| 4B: Core Files | 4-7 | 50 min | ⏸️ PENDING |
| 4C: UX Enhancements | 8-11 | 115 min | ⏸️ PENDING |
| 4D: Polish | 12-14 | 175 min | ⏸️ FUTURE |

**Total MVP:** ~97 minutes (~1.6 hours)  
**Total Professional:** ~212 minutes (~3.5 hours)  
**Total Complete:** ~387 minutes (~6.5 hours)

---

## 🚀 **STRATEGY**

### This Session Goals:
1. **Fix all blockers** (4A) - No memory crashes, backend works
2. **Core file ops** (4B) - Open, edit, save files
3. **Basic UX** (4C) - Tabs, context menu, problems

### Implementation Approach:
- ✅ Work in complete phases, not mini-sprints
- ✅ Test thoroughly before commit
- ✅ One commit per phase (4A, 4B, 4C)
- ✅ Comprehensive commit messages
- ✅ No partial implementations

### Next Session Goals:
- Polish features (4D)
- Advanced IDE features
- Performance optimization
- Production deployment

---

## 📝 **NOTES**

### Memory Optimization Strategy:
1. Dispose Monaco editor instances on unmount
2. Limit log buffer to 100 entries (was 500)
3. Worker timeout of 5 seconds (kill infinite loops)
4. Lazy-load xterm.js (dynamic import)
5. Clear file handles after use

### VS Code Parity Checklist:
- ✅ File explorer with tree
- ✅ Monaco editor with syntax
- ✅ Terminal (xterm.js)
- ⏳ Multi-file tabs
- ⏳ Context menus
- ⏳ Problems panel
- ⏳ File search
- ⏸️ Git integration
- ⏸️ Extensions

### Cost Optimization:
- Work in complete phases (this TODO prevents mini-sprints)
- Test locally before committing
- Batch related changes
- One comprehensive commit per phase

---

**READY TO EXECUTE PHASE 4A!** 🚀
