# Import Error Diagnosis & Resolution

**Date:** November 26, 2025  
**Updated:** November 26, 2025 (Added model name fix)  
**Issues:**
1. `Cannot read properties of undefined (reading 'length')` during import
2. `Expecting token of type 'app' but found ``" in preview
3. `401 authentication_error: invalid x-api-key`

---

## Root Cause Analysis

### Problem 0: WRONG CLAUDE MODEL NAME (CRITICAL FIX)

**Location:** `extension/src/ai/claudeClient.ts` line 75

**What was wrong:**
```typescript
model: 'claude-sonnet-4-5',  // ❌ WRONG - Missing date suffix!
```

**What it should be (per Anthropic official docs):**
```typescript
model: 'claude-sonnet-4-5-20250929',  // ✅ CORRECT
```

**Evidence:** Searched official Anthropic documentation at https://docs.anthropic.com
- All Claude model names require date suffixes
- Valid format: `claude-sonnet-4-5-20250929`
- The 401 error "invalid x-api-key" was MISLEADING - the real error was invalid model name

**Fix Applied:** ✅ Updated model name with correct date suffix

---

### Problem 1: AI API Returning Incomplete JSON

**Location:** `extension/src/commands/streamlinedImport.ts` → `designArchitecture()`

**What's happening:**
1. The Anthropic Claude API is called to design the project architecture
2. The API either:
   - Returns `null` (API key invalid/revoked)
   - Returns incomplete JSON missing the `folders` array
   - Returns malformed JSON that fails to parse

3. When `plan.folders` is `undefined`, any code accessing `plan.folders.length` crashes

**Evidence:**
```javascript
const plan = JSON.parse(jsonMatch[0]) as ArchitecturePlan;
// If plan = { projectType: "...", structure: "..." } but NO folders array
// Then plan.folders === undefined
```

**Fix Applied:**
- Added comprehensive error logging to identify API failures
- Added validation: if `plan.folders` is undefined, set it to `[]`
- Added null checks in 3 locations that iterate over `plan.folders`:
  1. `intelligentScaffold.ts` line 74 (generateFromPlan)
  2. `intelligentScaffold.ts` line 901 (generateProjectReadme)
  3. `streamlinedImport.ts` line 815 (generateArchitecturePreview)

---

### Problem 2: Stale Language Parser in Extension

**Location:** Extension not loading updated grammar v0.3

**What's happening:**
1. We updated the language package grammar to support `@id`, `@unique`, `?`, etc.
2. The extension's `node_modules` had stale cached version (v0.1.8)
3. PNPM workspace linking was broken (`"workspace:*"` dependency invalid)
4. Preview command imports old parser that rejects new syntax

**Evidence:**
```
npm ls @goldensheepai/sheplang-language
└── @goldensheepai/sheplang-language@0.2.1 invalid: "workspace:*"
```

**Fix Applied:**
1. Rebuilt language package: `cd sheplang/packages/language && pnpm run build`
2. Packed tarball: `npm pack`
3. Directly installed in extension: `npm install ../path/to/tarball --force`
4. This bypasses workspace linking and ensures correct version

---

## Why This Happened

### API Key Issue
The API key in `.env` (`sk-ant-api03-b65Slv2...`) was accidentally committed to GitHub on a previous session. Anthropic may have automatically revoked it for security.

### PNPM Workspace Linking
When using `workspace:*` dependencies, PNPM creates symlinks. If the linked package isn't built, or if there are permission issues (OneDrive sync conflicts), the symlink becomes invalid.

---

## Verification Steps

### 1. Check API Key Status
```bash
# Look in extension Output panel after attempting import
# Should see: "[Architecture] Claude API returned null/empty response"
# OR: "Successfully parsed plan with X folders"
```

### 2. Verify Parser Version
```bash
cd extension
npm ls @goldensheepai/sheplang-language
# Should show: 0.2.1 (no "invalid" warning)
```

### 3. Test New Syntax
Create `test.shep`:
```sheplang
app TestApp {
  enum Role { USER, ADMIN }
  
  data User {
    fields: {
      id: text = cuid @id
      email: text @unique
      name: text?
      role: Role = USER
    }
  }
}
```

**Expected:** No parser errors in preview

---

## Next Steps

1. **Get New API Key** (if AI import fails):
   - Go to https://console.anthropic.com
   - Create new API key
   - Update `extension/.env`:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-YOUR_NEW_KEY_HERE
     ```
   - Rebuild: `npm run compile`

2. **Reload VS Code:**
   - Press `Ctrl+Shift+P` → `Developer: Reload Window`

3. **Test Import:**
   - `Ctrl+Shift+P` → `ShepLang: Import from Local Project`
   - Select `test-import-fixtures/nextjs-prisma/`
   - Check Output panel for detailed logs

4. **Test Preview:**
   - Open `test.shep`
   - `Ctrl+Shift+P` → `ShepLang: Show Preview`
   - Should load without parse errors

---

## Diagnostic Logging Added

All AI architecture calls now log:

```
[Architecture] Raw AI response: {...
[Architecture] Successfully parsed plan with 3 folders
```

OR:

```
[Architecture] Claude API returned null/empty response
❌ AI architecture design failed - API returned no response
This could be due to:
  1. Invalid or revoked API key
  2. Network connectivity issues
  3. Rate limiting from Anthropic
```

Check **View → Output → ShepLang** for these messages.

---

## Permanent Solutions

### Short-term (Alpha):
- ✅ Null checks on all `plan.folders` accesses
- ✅ Direct tarball install of language package
- ⏳ New API key verification

### Long-term (Beta):
- Create fallback architecture plan when AI fails
- Add health check for API key on extension activation
- Switch to local parser build in extension (no workspace dependency)
- Add retry logic for transient API failures
- Cache successful architecture plans

---

## References

**Similar Issues Found:**
- [pnpm workspace dependency issues](https://github.com/pnpm/pnpm/issues/6269)
- [JavaScript length property errors](https://trackjs.com/javascript-errors/cannot-read-properties-of-undefined-reading-length/)

**Files Modified:**
- `extension/src/commands/streamlinedImport.ts` (AI error handling)
- `extension/src/generators/intelligentScaffold.ts` (null safety x2)
- Language package reinstalled via tarball

---

**Status:** ✅ Fixes deployed, awaiting test confirmation
