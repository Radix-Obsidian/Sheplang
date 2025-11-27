# Step 1: Build Dashboard MVP — Vertical Slice TODOs

**Timeline:** Weeks 1-2  
**Methodology:** Golden Sheep AI™ Vertical Slice Delivery  
**Principle:** "Build narrow. Test deep. Ship confidently."

---

## ✅ STATUS: COMPLETE (November 26, 2025)

**All 7 slices implemented and working!**

| Slice | Description | Status |
|-------|-------------|--------|
| 1 | Dashboard Shell & Tree View Registration | ✅ |
| 2 | Summary Banner Section | ✅ |
| 3 | Verification Score Display | ✅ |
| 4 | Phase Breakdown (Type Safety & Null Safety) | ✅ |
| 5 | Phase Breakdown (API Contracts & Exhaustiveness) | ✅ |
| 6 | History Section (with persistence) | ✅ |
| 7 | Real-Time Updates | ✅ |

### 🔄 Phase 2 Strategic Pivot

**Discovery:** IDE AI (Copilot/Claude/Cursor) already understands ShepLang!

**Decision:** 
- ❌ ~~[Fix with AI] button~~ - REMOVED (IDE AI handles fixes)
- ✅ Focus 100% on verification (our moat)
- ✅ Keep Wizard's Anthropic integration (Command Palette)

See `.specify/STRATEGIC_PLAN_V2.md` for full details.

---

## 🎯 Original Goal

Create the ShepVerify Dashboard as a VS Code sidebar panel that displays:
- Verification status (pass/fail/warning) ✅
- Verification score (0-100) ✅
- Phase-by-phase breakdown ✅
- Clickable errors that open files ✅
- ~~[Fix with AI] placeholder~~ REMOVED - IDE AI handles this

---

## 📋 Vertical Slices

Each slice is **complete end-to-end** before moving to the next.
No slice depends on unfinished work.
Each slice is **demoable** when done.

---

## Slice 1: Dashboard Shell & Tree View Registration
**Estimate:** 2-3 hours  
**Demoable:** Empty panel appears in VS Code sidebar

### What This Slice Delivers
A new "ShepVerify" icon in the VS Code Activity Bar that opens an empty tree view panel.

### Implementation TODOs

- [ ] **1.1 Create dashboard module structure**
  ```
  extension/src/dashboard/
    index.ts                    # Module entry, exports provider
    treeViewProvider.ts         # VS Code TreeDataProvider implementation
  ```

- [ ] **1.2 Implement basic TreeDataProvider**
  - Create `ShepVerifyTreeProvider` class implementing `vscode.TreeDataProvider`
  - Return empty array for `getChildren()` initially
  - Return placeholder item for `getTreeItem()`

- [ ] **1.3 Register tree view in extension.ts**
  - Import dashboard module
  - Register `vscode.window.createTreeView('shepverify', { treeDataProvider })`
  - Add to `contributes.views` in package.json

- [ ] **1.4 Add view container to package.json**
  ```json
  "viewsContainers": {
    "activitybar": [{
      "id": "shepverify",
      "title": "ShepVerify",
      "icon": "resources/shepverify-icon.svg"
    }]
  },
  "views": {
    "shepverify": [{
      "id": "shepverify-dashboard",
      "name": "Verification Dashboard"
    }]
  }
  ```

- [ ] **1.5 Create ShepVerify icon**
  - Create `extension/resources/shepverify-icon.svg` (checkmark + shield design)

### Verification Checklist
- [ ] Extension compiles without errors
- [ ] ShepVerify icon appears in Activity Bar
- [ ] Clicking icon opens empty panel
- [ ] Panel title shows "Verification Dashboard"
- [ ] No console errors

### Demo Script
1. Open VS Code with extension
2. See new ShepVerify icon in left sidebar
3. Click icon → empty panel opens
4. "✅ Slice 1 Complete"

---

## Slice 2: Summary Banner Section
**Estimate:** 2-3 hours  
**Demoable:** Dashboard shows status banner with "No file open" or verification status

### What This Slice Delivers
The top section of the dashboard showing:
- Status: ✅ Verified / ⚠️ Issues / ❌ Failed
- Last Run: timestamp
- [Re-run] button

### Implementation TODOs

- [ ] **2.1 Create VerificationReport type**
  ```typescript
  // extension/src/dashboard/types.ts
  interface VerificationReport {
    status: 'passed' | 'warning' | 'failed' | 'none';
    timestamp: Date | null;
    score: number;
    // ... rest added in later slices
  }
  ```

- [ ] **2.2 Create SummaryItem tree node**
  - Implement `SummaryTreeItem extends vscode.TreeItem`
  - Display status icon + text
  - Display "Last run: X minutes ago"
  - No children (leaf node)

- [ ] **2.3 Hook to active document changes**
  - Listen to `vscode.window.onDidChangeActiveTextEditor`
  - When `.shep` file is active, trigger verification
  - Update tree view with results

- [ ] **2.4 Connect to existing ShepVerify engine**
  - Import `parseShep` from language package
  - Parse active document
  - Extract diagnostics → create initial VerificationReport

- [ ] **2.5 Add "Re-run Verification" command**
  - Register command `shepverify.rerun`
  - Add button to summary item via `TreeItem.command`

### Verification Checklist
- [ ] Banner shows "No file open" when no .shep file active
- [ ] Banner shows status when .shep file is open
- [ ] Status icon correct (✅/⚠️/❌)
- [ ] Timestamp displays correctly
- [ ] Re-run button triggers verification
- [ ] Clicking [Re-run] updates the display

### Demo Script
1. Open a `.shep` file with no errors
2. Dashboard shows "✅ Verified" with timestamp
3. Open a `.shep` file with errors
4. Dashboard shows "❌ Failed"
5. Click [Re-run] → status updates
6. "✅ Slice 2 Complete"

---

## Slice 3: Verification Score Display
**Estimate:** 2-3 hours  
**Demoable:** Lighthouse-style score appears in dashboard

### What This Slice Delivers
Score section showing:
- Overall: 78% (with color indicator)
- Frontend: 90%
- Backend: 78%
- Schema: 70%
- Flow: 95%

### Implementation TODOs

- [ ] **3.1 Define score calculation logic**
  ```typescript
  // extension/src/dashboard/scoreCalculator.ts
  function calculateScores(diagnostics: Diagnostic[]): ScoreReport {
    // Calculate pass rate per category
    // Weight and combine for overall score
  }
  ```

- [ ] **3.2 Categorize existing diagnostics**
  - Map ShepVerify phases to score categories:
    - Type Safety → Frontend score
    - Null Safety → Frontend score  
    - API Contracts → Backend score
    - Schema validation → Schema score
    - Flow integrity → Flow score

- [ ] **3.3 Create ScoreTreeItem nodes**
  - Overall score with progress indicator (●●●●◎)
  - Sub-scores as children
  - Color-coded: Green (90+), Yellow (60-89), Red (<60)

- [ ] **3.4 Update VerificationReport with scores**
  - Add scores object to type
  - Populate from diagnostics

- [ ] **3.5 Display score section in tree**
  - Add as top-level collapsible node
  - Show scores as children

### Verification Checklist
- [ ] Score displays correctly (0-100)
- [ ] Color coding works (green/yellow/red)
- [ ] Sub-scores calculate independently
- [ ] Score updates when file changes
- [ ] Score section is collapsible

### Demo Script
1. Open `.shep` file with errors
2. See "Overall: 78%" in yellow
3. Expand to see sub-scores
4. Fix an error in the file
5. Score increases
6. "✅ Slice 3 Complete"

---

## Slice 4: Phase Breakdown (Type Safety & Null Safety)
**Estimate:** 3-4 hours  
**Demoable:** Phase 1 & 2 errors appear as clickable tree items

### What This Slice Delivers
Phase breakdown showing:
- ▼ Type Safety (2 errors)
    - ✖ Error message → click to open file

### Implementation TODOs

- [ ] **4.1 Create PhaseTreeItem nodes**
  - Collapsible parent showing phase name + error count
  - Children are individual errors/warnings
  - Icon: ✅ (passed), ⚠️ (warnings only), ❌ (errors)

- [ ] **4.2 Create ErrorTreeItem nodes**
  - Display error message
  - Store file path + line/column
  - On click → open file at location

- [ ] **4.3 Implement "Open File" command**
  - Register `shepverify.openError`
  - Use `vscode.window.showTextDocument` with selection
  - Highlight the error line

- [ ] **4.4 Map diagnostics to Phase 1 (Type Safety)**
  - Filter diagnostics with type-related messages
  - Create error items for each

- [ ] **4.5 Map diagnostics to Phase 2 (Null Safety)**
  - Filter diagnostics with null/undefined messages
  - Create error items for each

- [ ] **4.6 Add to tree view**
  - Phases section as collapsible group
  - Each phase as collapsible child
  - Errors as leaf nodes

### Verification Checklist
- [ ] Phase 1 shows correct error count
- [ ] Phase 2 shows correct error count
- [ ] Clicking error opens correct file
- [ ] Cursor positioned at error location
- [ ] Error line highlighted
- [ ] Phases collapse/expand correctly

### Demo Script
1. Open `.shep` file with type error
2. Expand "Type Safety" in dashboard
3. Click on error item
4. File opens at correct line
5. Error is highlighted
6. "✅ Slice 4 Complete"

---

## Slice 5: Phase Breakdown (API Contracts & Exhaustiveness)
**Estimate:** 2-3 hours  
**Demoable:** All 4 phases display in dashboard

### What This Slice Delivers
Complete phase breakdown:
- ▼ Type Safety
- ▼ Null Safety  
- ▼ API Contracts ← NEW
- ▼ Exhaustiveness ← NEW

### Implementation TODOs

- [ ] **5.1 Map diagnostics to Phase 3 (API Contracts)**
  - Filter diagnostics related to `call` and `load` statements
  - Filter endpoint mismatch errors
  - Create error items

- [ ] **5.2 Map diagnostics to Phase 4 (Exhaustiveness)**
  - Filter diagnostics related to unhandled cases
  - Filter missing action handlers
  - Create error items

- [ ] **5.3 Add [Fix with AI] button placeholder**
  - Add button to ErrorTreeItem
  - Register placeholder command `shepverify.fixWithAI`
  - Show message "Coming in Step 2!" for now

- [ ] **5.4 Add [Explain] button placeholder**
  - Add button to ErrorTreeItem
  - Register placeholder command `shepverify.explain`
  - Show message "Coming in Step 2!" for now

### Verification Checklist
- [ ] All 4 phases appear in dashboard
- [ ] Each phase shows correct error count
- [ ] Clicking errors opens files for all phases
- [ ] [Fix with AI] button visible (placeholder)
- [ ] [Explain] button visible (placeholder)
- [ ] Empty phases show "✅ All checks passed"

### Demo Script
1. Open `.shep` file with API contract error
2. See "API Contracts (1 error)" in dashboard
3. Click error → file opens
4. Click [Fix with AI] → "Coming in Step 2!" message
5. "✅ Slice 5 Complete"

---

## Slice 6: History Section
**Estimate:** 2-3 hours  
**Demoable:** Past verification runs displayed

### What This Slice Delivers
History section showing:
- ✔ 1:22 PM – Passed
- ✖ 12:47 PM – 3 Issues
- ✔ 12:10 PM – Passed

### Implementation TODOs

- [ ] **6.1 Create HistoryEntry type**
  ```typescript
  interface HistoryEntry {
    timestamp: Date;
    status: 'passed' | 'warning' | 'failed';
    errorCount: number;
    warningCount: number;
    projectPath: string;
  }
  ```

- [ ] **6.2 Implement history storage**
  - Use `context.globalState` for persistence
  - Store last 10 entries per project
  - Rotate old entries out

- [ ] **6.3 Create HistoryTreeItem nodes**
  - Display status icon + time + issue count
  - Format time as "2:30 PM" or "Yesterday"

- [ ] **6.4 Record verification runs**
  - After each verification, save to history
  - Include timestamp, status, counts

- [ ] **6.5 Display history section**
  - Collapsible section at bottom of tree
  - Show most recent 5 entries
  - Option to clear history

### Verification Checklist
- [ ] History persists across VS Code restarts
- [ ] New entries appear at top
- [ ] Old entries rotate out (max 10)
- [ ] Timestamps format correctly
- [ ] Status icons correct
- [ ] History section collapsible

### Demo Script
1. Verify a file → entry appears in history
2. Make changes, verify again → new entry
3. Close and reopen VS Code
4. History still there
5. "✅ Slice 6 Complete"

---

## Slice 7: Real-Time Updates & Status Bar
**Estimate:** 2-3 hours  
**Demoable:** Dashboard updates live as you type

### What This Slice Delivers
- Auto-verify on file save
- Status bar item showing quick status
- Debounced verification on type

### Implementation TODOs

- [ ] **7.1 Implement debounced verification**
  - Listen to `onDidChangeTextDocument`
  - Debounce 500ms before re-verifying
  - Show "Verifying..." state

- [ ] **7.2 Add status bar item**
  - Create status bar item: "ShepVerify: ✅ 94%"
  - Click → opens dashboard
  - Update on verification complete

- [ ] **7.3 Add verification-in-progress state**
  - Show spinner icon while verifying
  - Disable re-run button while in progress
  - Show "Verifying..." in summary

- [ ] **7.4 Trigger on file save**
  - Hook `onDidSaveTextDocument`
  - Run verification immediately on save

- [ ] **7.5 Optimize for performance**
  - Only verify .shep files
  - Cancel pending verification on new change
  - Cache unchanged results

### Verification Checklist
- [ ] Dashboard updates when typing (debounced)
- [ ] Status bar shows current score
- [ ] Status bar click opens dashboard
- [ ] Spinner shows during verification
- [ ] No lag or freezing during typing
- [ ] Only .shep files trigger verification

### Demo Script
1. Open `.shep` file
2. Status bar shows "ShepVerify: ✅ 100%"
3. Introduce an error
4. Dashboard updates after typing stops
5. Status bar shows "ShepVerify: ⚠️ 85%"
6. "✅ Slice 7 Complete"

---

## 📦 Slice Completion Summary

| Slice | Description | Status | Demo Ready |
|-------|-------------|--------|------------|
| 1 | Dashboard Shell | ⬜ Pending | ⬜ |
| 2 | Summary Banner | ⬜ Pending | ⬜ |
| 3 | Verification Score | ⬜ Pending | ⬜ |
| 4 | Phase 1 & 2 | ⬜ Pending | ⬜ |
| 5 | Phase 3 & 4 | ⬜ Pending | ⬜ |
| 6 | History | ⬜ Pending | ⬜ |
| 7 | Real-Time Updates | ⬜ Pending | ⬜ |

---

## ✅ Step 1 Completion Criteria

When all 7 slices are complete:

- [ ] Dashboard appears in VS Code sidebar
- [ ] Summary shows status + timestamp
- [ ] Score displays with color coding
- [ ] All 4 phases display with error counts
- [ ] Clicking errors opens files at correct location
- [ ] History persists across sessions
- [ ] Real-time updates on file changes
- [ ] Status bar shows quick verification status
- [ ] No console errors
- [ ] Extension builds and packages cleanly

**When these are green → Move to Step 2: AI Auto-Fix**

---

## 🔧 Technical Notes

### VS Code Tree View API Reference
- Official docs: https://code.visualstudio.com/api/extension-guides/tree-view
- TreeDataProvider: https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
- TreeItem: https://code.visualstudio.com/api/references/vscode-api#TreeItem

### Icon Guidelines
- Use VS Code Codicons: https://microsoft.github.io/vscode-codicons/dist/codicon.html
- Or custom SVG 24x24px

### Storage API
- globalState: https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalState

---

## 🟡 Golden Sheep Checklist (Per Slice)

- [ ] No placeholder logic (ZPP™)
- [ ] Real functionality only
- [ ] Tested end-to-end (FSRT™)
- [ ] Demoable to a user (VSD™)
- [ ] Official docs referenced (EDD™)
- [ ] AI can verify the code (ACV™)
- [ ] Ships when complete (GFL™)

---

*Created: November 26, 2025*  
*Methodology: Golden Sheep AI™*
