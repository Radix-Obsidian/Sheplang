# Critical Bugs - Root Cause Analysis & Fixes

**Date:** November 20, 2025  
**Severity:** 🔴 CRITICAL - Blocking all imports

## Three Critical Bugs Identified

### Bug 1: "Architecture plan rejected by user" ❌
**Symptom:** User clicks "✅ Looks Good - Generate Files!" but system logs "Architecture plan rejected"

**Root Cause:** Webview panel closes BEFORE the message is sent to the extension
- User clicks button → JavaScript sends message → Panel disposes → Message never received
- The `onDidDispose` handler fires and resolves `false` before `onDidReceiveMessage` can fire

**Fix:** Add delay before panel disposal to ensure message is sent first

---

### Bug 2: "action.operations is not iterable" ❌
**Symptom:** Crash when generating ShepLang from natural language prompt

**Root Cause:** Claude AI returns `operations` as a STRING instead of ARRAY
```json
// AI returns this (WRONG):
{
  "operations": "add Task with title, show Dashboard"
}

// We expect this (CORRECT):
{
  "operations": ["add Task with title", "show Dashboard"]
}
```

**Why:** Our AI prompt doesn't explicitly say "return operations as an array"

**Fix:** 
1. Make AI prompt more explicit about array format
2. Add defensive code to handle both string and array
3. Validate AI response before using it

---

### Bug 3: "Detected: NEXTJS" for CLI project ❌
**Symptom:** Extension detects wrong framework type for projects

**Root Cause:** Framework detection ONLY checks `package.json` dependencies
- CLI tools often don't have "next" or "vite" as dependencies
- They might have "commander", "inquirer", "chalk" etc.
- Current logic: No "next"/"vite"/"react" = "unknown" = invalid project

**Why It's Broken:**
```typescript
// Current code:
if ('next' in allDeps) framework = 'nextjs';
else if ('vite' in allDeps) framework = 'vite';
else if ('react' in allDeps) framework = 'react';
// CLI projects fall through to 'unknown'
```

**Fix:** Expand detection to recognize:
- CLI tools (commander, yargs, inquirer)
- Node.js libraries (express, fastify)
- TypeScript projects without frameworks
- Any valid JavaScript/TypeScript project

---

## Implementation Plan

### Fix 1: Button Message Race Condition

**Before:**
```typescript
panel.webview.onDidReceiveMessage(message => {
  if (message.command === 'confirm') {
    panel.dispose(); // ← Disposes immediately
    resolve(true);
  }
});

panel.onDidDispose(() => {
  resolve(false); // ← This fires first!
});
```

**After:**
```typescript
panel.webview.onDidReceiveMessage(message => {
  if (message.command === 'confirm') {
    resolve(true);
    setTimeout(() => panel.dispose(), 100); // ← Delay disposal
  }
});
```

---

### Fix 2: AI Response Validation

**Add to AI prompt:**
```
CRITICAL: Return operations as an ARRAY of strings, not a single string.

CORRECT:
"operations": ["add Task with title", "show Dashboard"]

WRONG:
"operations": "add Task with title, show Dashboard"
```

**Add defensive code:**
```typescript
// Normalize operations to always be an array
for (const action of analysis.actions) {
  // Handle case where AI returns string instead of array
  if (typeof action.operations === 'string') {
    action.operations = [action.operations];
  }
  
  // Ensure it's an array
  if (!Array.isArray(action.operations)) {
    action.operations = [];
  }
}
```

---

### Fix 3: Smarter Framework Detection

**Expand detection logic:**
```typescript
async function detectStack(projectRoot: string) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  // Web frameworks
  if ('next' in allDeps) return { framework: 'nextjs', isValid: true };
  if ('vite' in allDeps) return { framework: 'vite', isValid: true };
  if ('react' in allDeps) return { framework: 'react', isValid: true };
  
  // CLI tools
  if ('commander' in allDeps || 'yargs' in allDeps || 'inquirer' in allDeps) {
    return { framework: 'cli', isValid: true };
  }
  
  // Backend frameworks
  if ('express' in allDeps || 'fastify' in allDeps || 'koa' in allDeps) {
    return { framework: 'node', isValid: true };
  }
  
  // TypeScript/JavaScript projects
  if ('typescript' in allDeps || packageJson.type === 'module') {
    return { framework: 'typescript', isValid: true };
  }
  
  // Any Node.js project with package.json is valid
  return { framework: 'node', isValid: true };
}
```

---

## Why These Bugs Happened

### 1. **Race Condition (Button Bug)**
- Async event handling without proper sequencing
- Webview disposal happens synchronously
- Message passing is asynchronous
- Classic timing bug

### 2. **AI Response Format (operations Bug)**
- AI is non-deterministic
- Our prompt wasn't explicit enough
- No validation of AI output
- Assumed AI would always return correct format

### 3. **Narrow Detection Logic (Framework Bug)**
- Only checked for web frameworks
- Ignored CLI tools, backend frameworks, TypeScript projects
- Too restrictive validation
- Didn't account for diverse JavaScript ecosystem

---

## Testing Checklist

- [ ] Test "Looks Good" button with architecture plan
- [ ] Test prompt-to-ShepLang with various descriptions
- [ ] Test import with Next.js project
- [ ] Test import with Vite project
- [ ] Test import with CLI tool (toknxr)
- [ ] Test import with Express backend
- [ ] Test import with TypeScript library
- [ ] Verify no "operations is not iterable" errors
- [ ] Verify correct framework detection in logs

---

## References

**Builder.io VS Code Extension:**
- Uses AST parsing (not just package.json)
- Analyzes actual code structure
- Supports any framework
- Fallback to generic detection

**Best Practice:**
- Always validate AI responses
- Add defensive code for type safety
- Use broad detection heuristics
- Test with diverse project types

---

**Status:** Ready to implement fixes
