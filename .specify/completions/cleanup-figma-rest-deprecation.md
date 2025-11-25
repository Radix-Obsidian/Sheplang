# Cleanup Spec: Deprecate Figma REST Import

**Date:** November 20, 2025  
**Type:** Deprecation & Cleanup  
**Risk Level:** Medium (affects extension commands)  
**Estimated Time:** 2 hours

---

## 🎯 Objective

Safely remove all Figma REST API import code and documentation to:
1. Prevent confusion in alpha release
2. Focus users on Next.js/Webflow imports
3. Clean up codebase for maintainability
4. Archive (not delete) for historical reference

---

## ✅ Pre-Flight Checklist

- [ ] Commit all current work (`git commit -am "Pre-cleanup checkpoint"`)
- [ ] Create cleanup branch (`git checkout -b cleanup/deprecate-figma-rest`)
- [ ] Backup `.specify/` folder (just in case)
- [ ] Verify no active Figma REST imports in flight

---

## 📦 Step 1: Archive Documentation

**What:** Move Figma REST docs to archive folder  
**Why:** Historical reference, not active strategy  
**Risk:** Low (just moving files)

### Actions:

```bash
# Create archive folder
mkdir -p .specify/archive/deprecated-figma-rest

# Move REST API specs
mv .specify/REST_WIZARD_TEST_PLAN.md .specify/archive/deprecated-figma-rest/
mv .specify/FIGMA_BATTLE_TEST_PLAN.md .specify/archive/deprecated-figma-rest/
mv .specify/FIGMA_TO_SHEPLANG_RESEARCH.md .specify/archive/deprecated-figma-rest/
mv .specify/PLAN_EXECUTION_COMPLETE.md .specify/archive/deprecated-figma-rest/
mv .specify/WIZARD_COMPLETE.md .specify/archive/deprecated-figma-rest/
mv .specify/FIGMA_URL_PASTE_FIX.md .specify/archive/deprecated-figma-rest/
mv .specify/BANK_APP_FIX.md .specify/archive/deprecated-figma-rest/

# Move plugin specs
mv .specify/specs/figma-plugin-v1.md .specify/archive/deprecated-figma-rest/
mv .specify/FIGMA_PLUGIN_BUILD_PLAN.md .specify/archive/deprecated-figma-rest/
mv .specify/FIGMA_PLUGIN_VS_REST_API.md .specify/archive/deprecated-figma-rest/

# Create archive README
```

**Create:** `.specify/archive/deprecated-figma-rest/README.md`

```markdown
# Deprecated: Figma REST Import Approach

**Date Deprecated:** November 20, 2025  
**Reason:** Strategic pivot to structured code imports (Figma Make, Lovable, Webflow)

## Why We Moved Away

The Figma REST API approach had fundamental limitations:

1. **No semantic meaning** - API only returns visual structure (frames, text, shapes)
2. **Heuristics don't scale** - Every design pattern needs custom detection
3. **Poor results** - UI kits, component libraries, non-standard designs all failed
4. **Hardcoding required** - Would need to hardcode for every design type

## The Better Path

**Figma Make** exports structured React/TypeScript code, which is perfect for our Next.js importer. No heuristics needed, works for any Figma Make project.

## What's Archived Here

- REST API research and specs
- Wizard implementations (concept reused in Next.js importer)
- Plugin specs (decided against manual tagging)
- Test plans and debug logs

## Historical Context

This approach was valuable research that led us to the right solution. The wizard concept (semantic refinement after import) lives on in the Next.js importer.
```

---

## 🗑️ Step 2: Remove Extension Code

**What:** Delete Figma REST import command and converter  
**Why:** Prevent users from accessing broken/deprecated feature  
**Risk:** Medium (changes extension commands)

### Files to Delete:

1. **Primary import command:**
   - `extension/src/commands/importFromFigma.ts` ❌ DELETE

2. **Figma converter:**
   - `extension/src/figma/converter.ts` ❌ DELETE
   - `extension/src/figma/` (entire folder if empty) ❌ DELETE

3. **Post-import wizard:** (KEEP CONCEPT, DELETE FIGMA-SPECIFIC)
   - `extension/src/commands/postImportWizard.ts` 
     - Extract reusable wizard functions
     - Move to `extension/src/wizard/semanticWizard.ts` (NEW)
     - Then delete old file

### Actions:

**Before deleting, extract reusable wizard code:**

Create: `extension/src/wizard/semanticWizard.ts`

```typescript
/**
 * Semantic Wizard - Reusable across all importers
 * 
 * Helps users provide context after importing structured code:
 * - App type (E-commerce, SaaS, etc.)
 * - Entity names
 * - Action purposes
 * - Field types
 */

import * as vscode from 'vscode';

export interface WizardInput {
  appType?: string;
  entities?: string[];
  customInstructions?: string;
}

export async function showSemanticWizard(
  importedData: {
    appName: string;
    detectedEntities: string[];
    detectedScreens: number;
  }
): Promise<WizardInput | undefined> {
  
  // Summary
  const summary = `
✓ Imported "${importedData.appName}"!

Found:
- ${importedData.detectedScreens} screens
- ${importedData.detectedEntities.length} potential entities

Let's refine the semantics...
  `.trim();
  
  vscode.window.showInformationMessage(summary);
  
  // Ask app type
  const appType = await vscode.window.showQuickPick(
    ['E-commerce', 'SaaS', 'Social', 'Content/Blog', 'Dashboard', 'Other'],
    { 
      placeHolder: 'What type of app is this?',
      ignoreFocusOut: true 
    }
  );
  
  if (!appType) return undefined;
  
  // Ask for entity names
  const entityNames = await vscode.window.showInputBox({
    prompt: 'What entities does your app have? (comma-separated)',
    placeHolder: 'e.g., User, Product, Order, Review',
    value: importedData.detectedEntities.join(', '),
    ignoreFocusOut: true
  });
  
  if (!entityNames) return undefined;
  
  // Optional: custom instructions
  const customInstructions = await vscode.window.showInputBox({
    prompt: 'Any special instructions for code generation? (optional)',
    placeHolder: 'e.g., "Use Stripe for payments", "Add user roles"',
    ignoreFocusOut: true
  });
  
  return {
    appType,
    entities: entityNames.split(',').map(e => e.trim()),
    customInstructions
  };
}

export async function showFeedbackPrompt(): Promise<void> {
  const feedback = await vscode.window.showInformationMessage(
    'Help us improve! Share feedback about this import.',
    'Send Feedback',
    'Not Now'
  );
  
  if (feedback === 'Send Feedback') {
    vscode.env.openExternal(vscode.Uri.parse('https://forms.gle/YOUR_FORM_ID'));
  }
}
```

**Now delete old files:**

```bash
# Delete Figma REST command
rm extension/src/commands/importFromFigma.ts
rm extension/src/commands/postImportWizard.ts

# Delete Figma converter
rm -rf extension/src/figma/

# Verify no orphaned imports
grep -r "importFromFigma" extension/src/
grep -r "figma/converter" extension/src/
```

---

## 🔧 Step 3: Update Extension Registration

**What:** Remove Figma command, prepare for Next.js command  
**Why:** Command won't exist anymore  
**Risk:** Low (clean removal)

### File: `extension/src/extension.ts`

**Find and remove:**

```typescript
// REMOVE THIS BLOCK:
import { importFromFigma, showFigmaSetupInstructions } from './commands/importFromFigma';

context.subscriptions.push(
  vscode.commands.registerCommand('sheplang.importFromFigma', importFromFigma)
);

context.subscriptions.push(
  vscode.commands.registerCommand('sheplang.setupFigmaToken', showFigmaSetupInstructions)
);
```

**Add placeholder for new commands:**

```typescript
// TODO: Add Next.js importer
// import { importFromNextJS } from './commands/importFromNextJS';
// context.subscriptions.push(
//   vscode.commands.registerCommand('sheplang.importFromNextJS', importFromNextJS)
// );

// TODO: Add Webflow importer
// import { importFromWebflow } from './commands/importFromWebflow';
// context.subscriptions.push(
//   vscode.commands.registerCommand('sheplang.importFromWebflow', importFromWebflow)
// );
```

---

## 📝 Step 4: Update package.json Commands

**What:** Remove Figma commands from VS Code command palette  
**Why:** Users shouldn't see deprecated commands  
**Risk:** Low

### File: `extension/package.json`

**Find and remove from `contributes.commands`:**

```json
{
  "command": "sheplang.importFromFigma",
  "title": "ShepLang: Import from Figma"
},
{
  "command": "sheplang.setupFigmaToken",
  "title": "ShepLang: Setup Figma Access Token"
}
```

**Add placeholders for new commands:**

```json
{
  "command": "sheplang.importFromNextJS",
  "title": "ShepLang: Import from Next.js/React Project"
},
{
  "command": "sheplang.importFromWebflow",
  "title": "ShepLang: Import from Webflow Export"
}
```

---

## 📦 Step 5: Remove figma-shep-import Package

**What:** Remove bridge package (if not used elsewhere)  
**Why:** No longer needed without REST import  
**Risk:** Medium (check dependencies first)

### Actions:

**1. Check if package is used anywhere:**

```bash
grep -r "figma-shep-import" sheplang/
grep -r "figma-shep-import" extension/
```

**2. If not used, remove:**

```bash
rm -rf sheplang/packages/figma-shep-import/
```

**3. Update workspace config:**

Edit `pnpm-workspace.yaml` - Remove if present:
```yaml
packages:
  - 'sheplang/packages/figma-shep-import'  # DELETE THIS LINE
```

**4. Clean dependencies:**

```bash
cd sheplang
pnpm install
```

---

## 📚 Step 6: Update Documentation

**What:** Update READMEs, roadmap, marketing docs  
**Why:** Reflect new import strategy  
**Risk:** Low (documentation only)

### File: `README.md` (root)

**Find and replace:**

OLD:
```markdown
### Import from Design Tools

- **Figma**: Paste Figma URL and convert designs to ShepLang
```

NEW:
```markdown
### Import from No-Code/Low-Code Tools

ShepLang is the **graduation layer** for your no-code prototypes:

- **Figma Make**: Export React code, import to ShepLang
- **Lovable**: Convert your Lovable project to ShepLang
- **Webflow**: Export HTML/CSS, convert to ShepLang  
- **v0.dev**: Import Vercel v0 projects
- **Bolt.new**: Import StackBlitz projects
- **Builder.io**: Import Builder.io React exports

**Value:** Own your code, extend beyond platform limits, hire devs to customize.
```

### File: `extension/README.md`

**Update features section:**

OLD:
```markdown
## Features

- Import from Figma designs
```

NEW:
```markdown
## Features

### Import & Convert

- **Next.js/React Importer**: Import any React or Next.js project
- **Figma Make**: Export from Figma Make, import to ShepLang
- **Lovable**: Convert Lovable projects to ShepLang
- **Webflow**: Import Webflow HTML exports (coming soon)

### Why Import?

**Graduation Layer**: Turn your no-code prototype into real, maintainable code you own.
```

### File: `ROADMAP.md`

**Update Q1 2025 section:**

OLD:
```markdown
- [ ] Figma import improvements
- [ ] Figma plugin development
```

NEW:
```markdown
- [ ] Next.js/React importer (Tier 1)
- [ ] Webflow HTML→React converter (Tier 2)
- [ ] Partnership outreach (Figma, Webflow)
- [ ] "Graduation Layer" marketing campaign
```

---

## 🔍 Step 7: Search for Stragglers

**What:** Find any remaining Figma REST references  
**Why:** Ensure complete cleanup  
**Risk:** Low (just search)

### Search commands:

```bash
# Search for Figma REST references
grep -r "Figma REST" .
grep -r "figma.com/v1/files" .
grep -r "FIGMA_TOKEN" .
grep -r "convertFigmaToSpec" .

# Search for old imports
grep -r "from './figma" extension/src/
grep -r "figma-shep-import" .

# Check for orphaned types
grep -r "FigmaShepSpec" .
grep -r "FigmaNode" .
```

**For each result:**
- If in `.specify/archive/` → OK, ignore
- If in active code → Remove or update
- If in comments → Update to reflect new strategy

---

## ✅ Step 8: Compile & Test

**What:** Ensure extension still compiles  
**Why:** Catch any missed imports  
**Risk:** Medium (compilation errors)

### Actions:

```bash
cd extension
npm run compile
```

**Expected:** Clean compilation with no errors

**If errors:**
- Missing imports → Remove them
- Undefined references → Update code
- TypeScript errors → Fix types

---

## 🧪 Step 9: Test Extension

**What:** Load extension and verify no Figma commands  
**Why:** User acceptance testing  
**Risk:** Low

### Actions:

1. Press `F5` to launch extension
2. Open command palette (`Ctrl+Shift+P`)
3. Type "ShepLang"
4. **Verify:**
   - ❌ NO "Import from Figma" command
   - ❌ NO "Setup Figma Token" command
   - ✅ Other commands still work (New ShepLang File, Show Preview)

---

## 📝 Step 10: Create Deprecation Notice

**What:** Document the change for users  
**Why:** Transparency and communication  
**Risk:** Low

### File: `DEPRECATIONS.md` (NEW)

```markdown
# Deprecations

## Figma REST Import (Deprecated November 2025)

**Status:** Removed in v1.0.0-alpha

### What Changed

The Figma REST API import feature has been removed in favor of a better approach.

### Why

The Figma REST API only provides visual structure (frames, shapes, text) without semantic meaning. This meant:
- Heuristics failed on UI kits and component libraries
- Results required extensive manual cleanup
- Couldn't handle diverse design patterns

### Better Alternative: Figma Make

**Use Figma Make instead:**
1. Design your prototype in Figma Make (with AI)
2. Export as React/TypeScript code
3. Import to ShepLang using "Import from Next.js/React"

**Benefits:**
- Structured, semantic code
- No heuristics needed
- Works for any Figma Make project
- Clean ShepLang output

### Migration

If you were using Figma REST import:
1. Recreate your design in Figma Make (or use existing)
2. Export code from Figma Make
3. Use our Next.js importer

### Questions?

Open an issue or join our Discord: [link]
```

---

## 🚀 Step 11: Commit & Push

**What:** Save all cleanup work  
**Why:** Track changes, enable rollback if needed  
**Risk:** Low

### Git workflow:

```bash
# Review changes
git status
git diff

# Stage all changes
git add .

# Commit with clear message
git commit -m "feat: Deprecate Figma REST import, prepare for Next.js importer

BREAKING CHANGE: Removed Figma REST API import feature

- Archived all Figma REST docs to .specify/archive/
- Removed importFromFigma command
- Removed figma/converter and related code
- Extracted reusable semantic wizard
- Updated READMEs and roadmap

Reason: Strategic pivot to structured code imports (Figma Make, Lovable, Webflow)
Next.js importer will handle all Tier 1 sources (React/TypeScript exports)

See .specify/STRATEGIC_PIVOT_IMPORT_FLOW.md for details"

# Push to remote
git push origin cleanup/deprecate-figma-rest
```

---

## ✅ Post-Cleanup Checklist

- [ ] All Figma REST docs archived
- [ ] Extension compiles without errors
- [ ] No Figma commands in command palette
- [ ] Wizard code extracted and reusable
- [ ] READMEs updated
- [ ] ROADMAP.md updated
- [ ] DEPRECATIONS.md created
- [ ] Git committed and pushed
- [ ] Ready to build Next.js importer

---

## 🎯 What's Next

After this cleanup is complete, proceed to:

**Next Spec:** `nextjs-react-importer-v1.md`

This will build:
- Next.js/React project parser
- AST analysis for components/data/actions
- Integration with semantic wizard
- ShepLang code generation

**Timeline:** 2 weeks  
**Dependencies:** None (cleanup complete)

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

```bash
# Revert to pre-cleanup state
git checkout main
git reset --hard HEAD~1

# Or cherry-pick specific changes
git cherry-pick <commit-hash>
```

All archived files are safe in `.specify/archive/deprecated-figma-rest/` and can be restored if needed.

---

**Status:** Ready to execute. Safe, reversible, well-documented. Let's clean this up! 🧹
