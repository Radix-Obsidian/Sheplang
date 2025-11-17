# Smart Error Recovery - Test Cases & Verification

## Overview

Test cases to verify the Smart Error Recovery system detects errors correctly and provides helpful suggestions.

---

## Test Case 1: Typo Detection (endpoint)

### Input Code
```sheplang
component App {
  "Hello"
  endpoit GET "/test"  // <- Typo: 'endpoit' instead of 'endpoint'
}
```

### Expected Output

**Before Smart Recovery:**
```
Error: Unexpected token 'endpoit' at line 3
```

**After Smart Recovery:**
```
┌─────────────────────────────────────────────┐
│ ❌ Unknown keyword 'endpoit'                │
│ Line 3, Column 3      ⚡ 95% sure           │
│                                             │
│ 💡 Did you mean:                           │
│ [endpoint] [end]                           │
│                                             │
│ ⚡ Replace with 'endpoint'                 │
│   Change 'endpoit' to 'endpoint'           │
│                                             │
│ 💡 Show example ▼                          │
│ └─ GET endpoint                            │
│    Fetch data from your backend            │
│    endpoint GET "/items" -> [Item] {       │
│      return db.Item.findAll()              │
│    }                                       │
│                                             │
│ 📚 Learn more about this →                │
│ Jump to line 3 →                           │
└─────────────────────────────────────────────┘
```

### Verification Steps
1. Copy test code into ShepYard editor
2. Wait for transpilation error
3. Verify error panel shows:
   - ✅ Error message mentions "endpoit"
   - ✅ Suggests "endpoint" in did-you-mean
   - ✅ Auto-fix button present
   - ✅ Code example visible when expanded
4. Click "Replace with 'endpoint'" button
5. Verify:
   - ✅ Code changes to "endpoint GET"
   - ✅ Error clears
   - ✅ StatusBar shows "✅ 0 Problems"

---

## Test Case 2: Missing Token Detection

### Input Code
```sheplang
component App {
  "Hello"
// <- Missing "end" keyword
```

### Expected Output

```
┌─────────────────────────────────────────────┐
│ ❌ Missing 'end' keyword                    │
│ Line 3, Column 1      ⚡ 90% sure           │
│                                             │
│ ⚡ Add 'end' keyword                        │
│   Blocks must be closed with "end"         │
│                                             │
│ 💡 Show example ▼                          │
│ └─ Complete block                          │
│    Always close blocks with "end"          │
│    component App {                         │
│      "Content"                             │
│    end  // <- Don't forget this!           │
│    }                                       │
└─────────────────────────────────────────────┘
```

### Verification Steps
1. Copy test code into editor
2. Verify error shows missing 'end'
3. Click auto-fix button
4. Verify "end" is added at correct position
5. Verify error clears

---

## Test Case 3: Unknown Keyword (component)

### Input Code
```sheplang
componet App {  // <- Typo: 'componet' instead of 'component'
  "Hello"
end
```

### Expected Output

```
┌─────────────────────────────────────────────┐
│ ❌ Unknown keyword 'componet'               │
│ Line 1, Column 1      ⚡ 95% sure           │
│                                             │
│ 💡 Did you mean:                           │
│ [component]                                │
│                                             │
│ ⚡ Replace with 'component'                │
│   Change 'componet' to 'component'         │
│                                             │
│ 💡 Show example ▼                          │
│ └─ Basic Component                         │
│    A simple ShepLang component             │
│    component App {                         │
│      "Hello, World!"                       │
│    end                                     │
└─────────────────────────────────────────────┘
```

### Verification Steps
1. Copy test code
2. Verify "component" suggested
3. Click fix button
4. Verify corrected to "component App"
5. Verify code works

---

## Test Case 4: ShepThon Model Typo

### Input Code
```shepthon
app MyApp {
  modle User {  // <- Typo: 'modle' instead of 'model'
    id: id
  }
}
```

### Expected Output

```
┌─────────────────────────────────────────────┐
│ ❌ Unknown keyword 'modle'                  │
│ Line 2, Column 3      ⚡ 95% sure           │
│                                             │
│ 💡 Did you mean:                           │
│ [model]                                    │
│                                             │
│ ⚡ Replace with 'model'                    │
│   Change 'modle' to 'model'                │
│                                             │
│ 💡 Show example ▼                          │
│ └─ Model Definition                        │
│    Define your data structure              │
│    model User {                            │
│      id: id                                │
│      name: string                          │
│      email: string                         │
│    }                                       │
└─────────────────────────────────────────────┘
```

### Verification Steps
1. Copy ShepThon test code
2. Verify "model" suggested
3. Click fix button
4. Verify corrected to "model User"
5. Verify ShepThon runtime loads correctly

---

## Test Case 5: Multiple Errors

### Input Code
```sheplang
componet App {
  "Hello"
  endpoit GET "/test"
  // Missing end
```

### Expected Output

```
┌─────────────────────────────────────────────┐
│ ⚠️ Problems                     3 errors    │
├─────────────────────────────────────────────┤
│                                             │
│ ❌ Unknown keyword 'componet'               │
│ Line 1, Column 1      ⚡ 95% sure           │
│ 💡 Did you mean: component                 │
│ ⚡ Replace with 'component' [Button]       │
│                                             │
│ ─────────────────────────────────────────  │
│                                             │
│ ❌ Unknown keyword 'endpoit'                │
│ Line 3, Column 3      ⚡ 95% sure           │
│ 💡 Did you mean: endpoint                  │
│ ⚡ Replace with 'endpoint' [Button]        │
│                                             │
│ ─────────────────────────────────────────  │
│                                             │
│ ❌ Missing 'end' keyword                    │
│ Line 4, Column 1      ⚡ 90% sure           │
│ ⚡ Add 'end' keyword [Button]              │
└─────────────────────────────────────────────┘
```

### Verification Steps
1. Copy code with multiple errors
2. Verify all 3 errors displayed
3. StatusBar shows "⚠️ 3 Problems"
4. Fix errors one by one
5. Verify count decrements
6. All fixes applied successfully

---

## Test Case 6: No Errors (Success State)

### Input Code
```sheplang
component App {
  "Hello, World!"
end
```

### Expected Output

```
┌─────────────────────────────────────────────┐
│ ✅ No problems detected                     │
│                                             │
│          ✅                                 │
│    No problems detected                     │
└─────────────────────────────────────────────┘
```

**StatusBar:**
```
✅ 0 Problems (green)
```

### Verification Steps
1. Copy valid code
2. Verify no errors shown
3. Problems panel shows success state
4. StatusBar shows green checkmark
5. Preview renders correctly

---

## Test Case 7: Confidence Scoring

### Input Code
```sheplang
component App {
  retrn "test"  // <- Very similar to "return"
end
```

### Expected Output

Should show **high confidence** (>90%) since "retrn" is very close to "return"

```
⚡ 95% sure
💡 Did you mean: return
```

### Input Code
```sheplang
component App {
  xyz "test"  // <- No similar keywords
end
```

### Expected Output

Should show **low confidence** (<70%) since "xyz" has no close matches

```
❌ Unknown token 'xyz'
(No did-you-mean suggestions)
```

### Verification Steps
1. Test with close typos (1-2 char difference)
2. Verify high confidence (>90%)
3. Test with unrelated keywords
4. Verify low confidence or no suggestions

---

## Integration Testing

### Test with StatusBar
1. Start with valid code → StatusBar shows "✅ 0 Problems"
2. Introduce typo → StatusBar updates to "⚠️ 1 Problem" (red)
3. Click problems indicator → Bottom panel opens
4. Fix error → StatusBar updates to "✅ 0 Problems" (green)

### Test with Bottom Panel
1. Open bottom panel manually
2. Switch to "Problems" tab
3. Introduce errors
4. Verify problems appear immediately
5. Fix errors
6. Verify problems disappear

### Test Auto-Fix
1. Introduce typo
2. Click auto-fix button
3. Verify:
   - ✅ Editor updates immediately
   - ✅ Cursor stays in reasonable position
   - ✅ Undo works (Ctrl+Z)
   - ✅ Error clears
   - ✅ Re-transpilation starts automatically

### Test Jump-to-Line
1. Introduce error
2. Click "Jump to line X"
3. Verify:
   - ✅ Editor scrolls to line
   - ✅ Line is highlighted
   - ✅ Editor has focus

---

## Manual Testing Checklist

### Setup
- [ ] Start dev server: `pnpm run dev`
- [ ] Navigate to ShepYard
- [ ] Select or create an example

### Error Detection
- [ ] Test Case 1: Typo detection works
- [ ] Test Case 2: Missing token detection works
- [ ] Test Case 3: Unknown keyword detection works
- [ ] Test Case 4: ShepThon errors work
- [ ] Test Case 5: Multiple errors shown
- [ ] Test Case 6: Success state shown when no errors

### UI Components
- [ ] ErrorPanel displays correctly
- [ ] Did-you-mean buttons are clickable
- [ ] Auto-fix buttons are visible
- [ ] Code examples expand/collapse
- [ ] Copy buttons work
- [ ] Confidence indicators show

### StatusBar
- [ ] Shows correct error count
- [ ] Green (✅) when no errors
- [ ] Red (⚠️) when errors present
- [ ] Clickable (if using collapsible layout)
- [ ] Updates in real-time

### ProblemsPanel
- [ ] Displays in correct location
- [ ] Header shows error count
- [ ] Success state when no errors
- [ ] Scrollable when many errors
- [ ] Close button works (if present)

### Auto-Fix
- [ ] Fixes apply correctly
- [ ] Editor updates immediately
- [ ] Error clears after fix
- [ ] Re-transpilation triggers
- [ ] Undo works

### Jump-to-Line
- [ ] Scrolls to correct line
- [ ] Highlights line
- [ ] Focuses editor

---

## Automated Testing

### Unit Tests

```typescript
// In shepyard/test/SmartErrorRecovery.test.tsx

describe('Smart Error Recovery', () => {
  test('detects typo: endpoit → endpoint', () => {
    const result = analyzeError(
      "Unknown token 'endpoit'",
      "endpoit GET /test",
      false
    );
    
    expect(result.didYouMean).toContain('endpoint');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
  
  test('detects typo: componet → component', () => {
    const result = analyzeError(
      "Unknown token 'componet'",
      "componet App",
      false
    );
    
    expect(result.didYouMean).toContain('component');
  });
  
  test('detects typo: modle → model (ShepThon)', () => {
    const result = analyzeError(
      "Unknown token 'modle'",
      "modle User",
      true // isShepThon
    );
    
    expect(result.didYouMean).toContain('model');
  });
});
```

Run tests:
```bash
cd shepyard
pnpm test
```

---

## Performance Testing

Test with **large error sets** to ensure UI remains responsive:

```typescript
// Generate 100 errors
const manyErrors = Array.from({ length: 100 }, (_, i) => ({
  severity: 'error' as const,
  message: `Error ${i}`,
  line: i + 1,
  column: 1,
  errorType: 'test',
  confidence: 0.5
}));

// Render ErrorPanel
<ErrorPanel suggestions={manyErrors} />
```

**Expected:**
- ✅ Panel scrolls smoothly
- ✅ No lag when clicking buttons
- ✅ Renders in <100ms

---

## Regression Testing

After making changes, verify:

1. **All test cases still pass**
2. **StatusBar still updates**
3. **Auto-fix still works**
4. **No TypeScript errors**
5. **Build still passes**

```bash
# Full verification
cd shepyard
pnpm run build  # Must pass
pnpm test       # Must pass
```

---

## Known Limitations

### Parser Limitations
- Only detects errors at parse time (not runtime)
- ShepLang parser is locked (can't add recovery yet)
- Multi-line errors may show single line number

### UI Limitations
- Monaco markers require editor instance (won't work on read-only examples)
- Auto-fix requires editable code
- Jump-to-line requires Monaco editor

### Service Limitations
- Levenshtein distance limited to 2 chars difference
- Only suggests from predefined keyword list
- No semantic error detection yet

---

## Troubleshooting

### Errors Not Showing
**Problem:** Errors detected but not displayed  
**Check:**
- [ ] `transpile.error` is set in useWorkspaceStore
- [ ] `transpile.errorDetails` contains source
- [ ] ProblemsPanel is rendered
- [ ] No console errors

### Auto-Fix Not Working
**Problem:** Click button but nothing happens  
**Check:**
- [ ] Editor instance is registered
- [ ] `applyAutoFix` method exists in useWorkspaceStore
- [ ] Editor is not read-only
- [ ] Auto-fix has valid changes

### StatusBar Not Updating
**Problem:** Error count doesn't change  
**Check:**
- [ ] StatusBar imports from workspace store
- [ ] useMemo dependencies correct
- [ ] analyzeTranspilerErrors is called
- [ ] Re-render triggered

---

## Success Criteria

All test cases should:
- ✅ Detect errors correctly
- ✅ Provide helpful suggestions
- ✅ Show confidence scores
- ✅ Apply fixes automatically
- ✅ Clear errors after fix
- ✅ Update UI in real-time
- ✅ Maintain good performance

---

## Next Steps After Testing

1. **Collect feedback** - What error messages are unclear?
2. **Add keywords** - Common mistakes not yet covered
3. **Improve confidence** - Better scoring algorithm
4. **Add examples** - More code examples for each error
5. **Semantic analysis** - Detect logic errors, not just syntax

---

**Testing Checklist Status:**
- [ ] All 7 test cases verified
- [ ] Integration testing complete
- [ ] Auto-fix verified
- [ ] Jump-to-line verified
- [ ] Performance acceptable
- [ ] No regressions

**Ready for:** User Acceptance Testing, Alpha Release, Demo
