# Step 2: AI Auto-Fix — Vertical Slice TODOs

**Timeline:** Weeks 3-4  
**Methodology:** Golden Sheep AI™ Vertical Slice Delivery  
**Principle:** "Build narrow. Test deep. Ship confidently."

---

## 🎯 Goal

Add AI-powered auto-fix capability to the ShepVerify Dashboard:
- [Fix with AI] buttons on errors
- Claude analyzes error + surrounding code
- Suggests fix with explanation
- User reviews and applies fix
- Dashboard re-verifies automatically

---

## Slice 1: [Fix with AI] Button Foundation
**Estimate:** 1-2 hours  
**Demoable:** Button appears on errors, shows "coming soon" message

### Implementation TODOs

- [ ] **1.1 Add [Fix with AI] action to error items**
  ```typescript
  // extension/src/dashboard/treeViewProvider.ts
  // Add inline action to error TreeItems
  ```

- [ ] **1.2 Register shepverify.fixWithAI command**
  ```typescript
  // extension/src/dashboard/index.ts
  vscode.commands.registerCommand('shepverify.fixWithAI', async (error) => {
    vscode.window.showInformationMessage('AI Auto-Fix coming soon!');
  });
  ```

- [ ] **1.3 Add command to package.json**
  - Register command
  - Add to view/item/context menu for error items

### Verification Checklist
- [ ] [Fix with AI] button visible on each error
- [ ] Button icon correct ($(sparkle) or $(wand))
- [ ] Clicking button shows message
- [ ] Button appears inline with error text

### Demo Script
1. Open file with errors
2. Expand Type Safety phase
3. See [Fix with AI] button on each error
4. Click button → "Coming soon!" message
5. "✅ Slice 1 Complete"

---

## Slice 2: AI Fix Service (Core Logic)
**Estimate:** 2-3 hours  
**Demoable:** AI suggests actual fix for simple errors

### Implementation TODOs

- [ ] **2.1 Create AI Fix Service**
  ```typescript
  // extension/src/dashboard/aiFixService.ts
  export class AIFixService {
    async generateFix(error: VerificationError, code: string): Promise<Fix> {
      // Use Claude to generate fix
    }
  }
  ```

- [ ] **2.2 Implement context gathering**
  - Read file containing error
  - Extract 20 lines before/after error
  - Include full error message
  - Include ShepLang grammar rules (context)

- [ ] **2.3 Create AI prompt template**
  ```
  You are a ShepLang error fix assistant.
  
  Error: {error.message}
  Location: {file}:{line}:{column}
  
  Code:
  ```sheplang
  {surrounding_code}
  ```
  
  Generate a fix that:
  1. Resolves the error
  2. Preserves existing functionality
  3. Follows ShepLang best practices
  
  Respond with:
  {
    "explanation": "Why this error occurred",
    "fix": "The corrected code",
    "confidence": "high|medium|low"
  }
  ```

- [ ] **2.4 Parse Claude response**
  - Extract JSON from response
  - Validate fix format
  - Handle errors gracefully

### Verification Checklist
- [ ] AI generates fix for simple type errors
- [ ] Fix includes explanation
- [ ] Confidence level set correctly
- [ ] Service handles API errors gracefully
- [ ] Context includes enough surrounding code

### Demo Script
1. Create file with simple type error
2. Click [Fix with AI]
3. See loading indicator
4. AI suggests fix with explanation
5. "✅ Slice 2 Complete"

---

## Slice 3: Fix Preview & Apply
**Estimate:** 2-3 hours  
**Demoable:** User can review and apply AI-suggested fixes

### Implementation TODOs

- [ ] **3.1 Create Fix Preview UI**
  - Use VS Code QuickPick or Webview
  - Show before/after diff
  - Display AI explanation
  - Show confidence level

- [ ] **3.2 Implement fix application**
  ```typescript
  // Use vscode.workspace.applyEdit
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, range, fixedCode);
  await vscode.workspace.applyEdit(edit);
  ```

- [ ] **3.3 Add "Accept" and "Reject" actions**
  - Accept → applies fix, closes preview
  - Reject → closes preview, no changes

- [ ] **3.4 Auto re-verify after fix**
  - After applying fix, trigger verification
  - Update dashboard with new results

### Verification Checklist
- [ ] Preview shows clear before/after diff
- [ ] Explanation is readable and helpful
- [ ] Accept button applies fix correctly
- [ ] Reject button cancels safely
- [ ] Dashboard updates after fix applied
- [ ] Undo (Ctrl+Z) works after fix

### Demo Script
1. Click [Fix with AI] on error
2. See preview with diff and explanation
3. Click "Accept"
4. Code updates
5. Dashboard shows verification passed
6. Press Ctrl+Z → code reverts
7. "✅ Slice 3 Complete"

---

## Slice 4: Batch Fix & Advanced Features
**Estimate:** 2-3 hours  
**Demoable:** Fix multiple errors at once, smarter fixes

### Implementation TODOs

- [ ] **4.1 Add [Fix All] button to phase items**
  - Appears on phase with multiple errors
  - Fixes all errors in that phase sequentially

- [ ] **4.2 Implement fix queue**
  - Process fixes one at a time
  - Show progress indicator
  - Allow cancellation

- [ ] **4.3 Add [Explain] button**
  - Shows detailed explanation of error
  - Links to docs/examples
  - Suggests learning resources

- [ ] **4.4 Improve prompt with project context**
  - Include data model definitions
  - Include other files if referenced
  - Add ShepLang grammar rules

### Verification Checklist
- [ ] [Fix All] processes multiple errors
- [ ] Progress shown during batch fix
- [ ] Can cancel batch operation
- [ ] [Explain] shows helpful information
- [ ] AI has access to project context

### Demo Script
1. File with 5 errors
2. Click [Fix All] on Type Safety phase
3. See progress: "Fixing 3 of 5..."
4. All fixes applied successfully
5. Click [Explain] on one error
6. See helpful explanation
7. "✅ Slice 4 Complete"

---

## Slice 5: Error Handling & Edge Cases
**Estimate:** 1-2 hours  
**Demoable:** Graceful handling of AI failures, edge cases

### Implementation TODOs

- [ ] **5.1 Handle AI API errors**
  - Rate limits → show retry option
  - Invalid API key → prompt for key
  - Network errors → retry with backoff

- [ ] **5.2 Handle ambiguous fixes**
  - AI unsure → ask user for clarification
  - Multiple fix options → show all, let user choose

- [ ] **5.3 Add safety checks**
  - Validate fix doesn't break syntax
  - Warn if fix is low confidence
  - Allow user to review all changes

- [ ] **5.4 Add telemetry (opt-in)**
  - Track fix acceptance rate
  - Track which error types are fixed
  - No code/data sent, only metrics

### Verification Checklist
- [ ] Rate limit error shows friendly message
- [ ] Network error offers retry
- [ ] Low confidence fixes show warning
- [ ] Syntax-breaking fixes rejected
- [ ] Telemetry is anonymous and opt-in

### Demo Script
1. Disconnect network
2. Click [Fix with AI]
3. See "Network error" message
4. Reconnect
5. Click "Retry" → fix works
6. "✅ Slice 5 Complete"

---

## 🎯 Phase 2 Complete When

All 5 slices pass:
- ✅ [Fix with AI] button functional
- ✅ AI generates valid fixes
- ✅ Preview/apply workflow smooth
- ✅ Batch fixes work
- ✅ Error handling robust

---

## 📊 Success Metrics

### User Metrics
- **Fix acceptance rate:** >70% of suggested fixes accepted
- **Time to fix:** <30 seconds from error to fixed
- **Re-verification:** >90% pass after AI fix

### Technical Metrics
- **AI response time:** <5 seconds average
- **Fix correctness:** >90% fixes resolve error
- **No regressions:** <5% fixes introduce new errors

---

## 🚀 Next Steps After Phase 2

1. **Phase 3:** Polish & advanced features
   - Multi-file fixes
   - Learning from user feedback
   - Custom fix patterns

2. **Phase 4:** Integration
   - Deploy after verify
   - CI/CD integration
   - Team collaboration features
