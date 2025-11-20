# Figma Plugin Build Plan - Official Docs Only

**Date:** November 19, 2025  
**Goal:** Build Figma plugin that exports FigmaShepSpec JSON  
**Policy:** Zero hallucinations - official documentation only  

---

## Phase 1: User Setup (You Do This)

### Step 1: Figma Developer Account Setup

**Official Guide:** https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development

#### What You Need To Do:

1. **Open Figma Desktop App** (you already have this ✅)

2. **Create a Plugin Folder**
   - Go to: Figma Menu → Plugins → Development → New Plugin...
   - Choose template: **"With custom UI"** (we need UI for export options)
   - Name: `ShepFig`
   - Save location: Recommend `C:\Users\autre\Desktop\figma-shep-plugin`

3. **Figma Will Generate:**
   ```
   figma-shep-plugin/
   ├── manifest.json      ← Plugin configuration
   ├── code.ts           ← Main plugin logic (runs in sandbox)
   ├── ui.html           ← Plugin UI (HTML/CSS/JS)
   └── tsconfig.json     ← TypeScript config
   ```

4. **No API Key Needed for Plugin Development**
   - Plugins run inside Figma Desktop
   - Have direct access to Figma's internal API
   - No authentication required for development

5. **Install Node.js Dependencies** (in plugin folder)
   ```bash
   cd C:\Users\autre\Desktop\figma-shep-plugin
   npm init -y
   npm install --save-dev @figma/plugin-typings typescript
   ```

### Step 2: Get a Test Figma File

**Recommended Templates:**

1. **Simple Todo List** (matches our example)
   - Go to Figma Community
   - Search: "todo list app template"
   - Duplicate to your drafts
   - OR create your own with:
     - Frame named "TaskList" with:
       - Text: "My Tasks"
       - Rectangle component: "Task Card"
       - Button: "Add Task"
     - Frame named "CreateTask" with:
       - Text: "New Task"
       - Input field
       - Button: "Save"

2. **Contact List** (another good test)
   - Frame: "ContactList"
   - Components: Contact cards
   - Button: "Add Contact"

**What We Need in Your Test File:**
- At least 2 frames (representing screens)
- Some text elements
- Some button-like components (rectangles with text)
- Simple, not complex

### Step 3: Plugin Development Mode

1. Open your test Figma file
2. Go to: Figma Menu → Plugins → Development → ShepLang Export
3. Plugin will open in right sidebar
4. We'll build the UI and logic next

---

## Phase 2: Build Plugin (We Do This)

### Architecture

```
Figma Plugin (separate from monorepo)
├── code.ts           ← Reads Figma nodes, generates FigmaShepSpec
├── ui.html           ← Shows preview, export buttons
└── manifest.json     ← Plugin metadata

Connects to:
↓
sheplang/packages/figma-shep-import (already built)
└── Uses FigmaShepSpec types we created
```

### Official Documentation Sources

**Primary Docs:**
1. **Plugin API Reference:** https://www.figma.com/plugin-docs/api/api-reference/
2. **Plugin Guide:** https://www.figma.com/plugin-docs/
3. **TypeScript Types:** https://www.figma.com/plugin-docs/typescript/

**Key APIs We'll Use:**
- `figma.currentPage.selection` - Get selected frames
- `figma.getNodeById()` - Access specific nodes
- Node types: `FRAME`, `TEXT`, `RECTANGLE`, `COMPONENT`, `INSTANCE`
- `node.children` - Walk node tree
- `node.name` - Get layer names
- `figma.ui.postMessage()` - Send data to UI

**No guessing - every API call will reference official docs.**

---

## Phase 3: Implementation Steps

### Step 3.1: Setup Plugin Structure

**Location:** `C:\Users\autre\Desktop\figma-shep-plugin` (separate from monorepo)

**Files to create:**
1. `manifest.json` - Plugin config (Figma generates this)
2. `code.ts` - Main logic
3. `ui.html` - UI with export options
4. `types.ts` - Import FigmaShepSpec types from our package

### Step 3.2: Core Logic (code.ts)

**Functions to implement:**

1. **`extractEntities(frames: FrameNode[])`**
   - Walk frame children
   - Identify patterns → entities
   - Infer field types from components
   - Official doc: https://www.figma.com/plugin-docs/api/nodes/

2. **`extractScreens(frames: FrameNode[])`**
   - Map frame → screen
   - Classify screen type (list/form/detail)
   - Extract widgets
   - Official doc: https://www.figma.com/plugin-docs/api/FrameNode/

3. **`extractWidgets(nodes: SceneNode[])`**
   - Detect buttons (rectangles with text)
   - Detect inputs (frames with text + rectangle)
   - Detect lists (repeating components)
   - Official doc: https://www.figma.com/plugin-docs/api/SceneNode/

4. **`generateSpec()`**
   - Combine entities + screens
   - Create FigmaShepSpec object
   - Validate against our types

### Step 3.3: UI (ui.html)

**Features:**
1. "Select Frames" button
2. Preview of generated spec (JSON)
3. "Export to Clipboard" button
4. "Download .json" button
5. Error messages if invalid selection

### Step 3.4: Integration with Bridge

**Test Flow:**
```
1. User selects frames in Figma
2. Plugin generates FigmaShepSpec JSON
3. User clicks "Download JSON"
4. Saves as: test-app-spec.json
5. In terminal: 
   cd sheplang/packages/figma-shep-import
   node dist/cli/index.js import ../../figma-plugin/test-app-spec.json --out ./test-output
6. Generated: test-output/app.shep
7. Run: sheplang dev test-output/app.shep
8. App works! ✅
```

---

## Phase 4: Testing Strategy

### Test Level 1: Plugin Generation
- [ ] Plugin correctly reads selected frames
- [ ] Plugin identifies entities
- [ ] Plugin identifies screens
- [ ] Plugin identifies widgets
- [ ] Generated JSON matches FigmaShepSpec schema
- [ ] No errors in Figma console

### Test Level 2: Bridge Import
- [ ] JSON validates with `figma-shep validate`
- [ ] JSON previews with `figma-shep preview`
- [ ] JSON imports with `figma-shep import`
- [ ] Generated .shep is valid ShepLang syntax
- [ ] No errors during conversion

### Test Level 3: ShepLang Compilation
- [ ] `sheplang build` compiles without errors
- [ ] Generated BobaScript is valid
- [ ] Type checking passes
- [ ] No null reference errors

### Test Level 4: End-to-End
- [ ] `sheplang dev` starts server
- [ ] App renders in browser
- [ ] All views display correctly
- [ ] Actions work (buttons trigger actions)
- [ ] Data flows correctly

**100% Pass Criteria:**
- All 4 test levels pass
- No console errors
- Generated app is functional
- Can repeat with different Figma files

---

## Phase 5: VS Code Integration (After Plugin Works)

### Step 5.1: Add Command to Extension

**Location:** `extension/src/commands/importFigmaSpec.ts`

**Official VS Code Docs:**
- Extension API: https://code.visualstudio.com/api
- Commands: https://code.visualstudio.com/api/references/vscode-api#commands
- File System: https://code.visualstudio.com/api/references/vscode-api#workspace.fs

**Implementation:**
```typescript
import * as vscode from 'vscode';
import { 
  writeShepFilesFromSpec, 
  type FigmaShepSpec 
} from '@goldensheepai/figma-shep-import';

export async function importFigmaSpec() {
  // 1. Show file picker
  const files = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { 'Figma Spec': ['json'] },
    title: 'Select Figma Spec File'
  });
  
  if (!files || files.length === 0) return;
  
  // 2. Read JSON
  const content = await vscode.workspace.fs.readFile(files[0]);
  const spec = JSON.parse(content.toString()) as FigmaShepSpec;
  
  // 3. Ask where to save
  const folder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select Output Folder'
  });
  
  if (!folder || folder.length === 0) return;
  
  // 4. Generate .shep files
  await writeShepFilesFromSpec(spec, folder[0].fsPath);
  
  // 5. Open generated file
  const shepFile = vscode.Uri.joinPath(
    folder[0], 
    `${spec.appName.toLowerCase()}.shep`
  );
  await vscode.window.showTextDocument(shepFile);
}
```

### Step 5.2: Register Command

**In:** `extension/src/extension.ts`

```typescript
import { importFigmaSpec } from './commands/importFigmaSpec';

export function activate(context: vscode.ExtensionContext) {
  // ... existing commands
  
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'sheplang.importFigmaSpec',
      importFigmaSpec
    )
  );
}
```

### Step 5.3: Add to package.json

**In:** `extension/package.json`

```json
{
  "contributes": {
    "commands": [
      {
        "command": "sheplang.importFigmaSpec",
        "title": "ShepLang: Import from Figma Spec",
        "category": "ShepLang"
      }
    ]
  }
}
```

---

## File Structure (Final)

```
ShepLang Monorepo/
├── sheplang/
│   └── packages/
│       └── figma-shep-import/        ← ✅ Already built (bridge)
│           ├── src/
│           │   ├── spec/types.ts     ← FigmaShepSpec definition
│           │   └── ...
│           └── ...
├── extension/
│   └── src/
│       ├── commands/
│       │   └── importFigmaSpec.ts    ← 🎯 Need to add
│       └── extension.ts              ← 🎯 Need to update
└── ...

Separate Folder (Outside Monorepo)/
└── figma-shep-plugin/                ← 🎯 Need to create
    ├── manifest.json                 ← Figma generates
    ├── code.ts                       ← 🎯 We'll build
    ├── ui.html                       ← 🎯 We'll build
    ├── types.ts                      ← Import from our package
    └── package.json
```

---

## Timeline Estimate

### Week 1 (Plugin)
- **Day 1:** Setup + Basic plugin structure
- **Day 2:** Implement entity extraction
- **Day 3:** Implement screen extraction
- **Day 4:** Implement widget extraction
- **Day 5:** Test with simple Figma file

### Week 2 (Testing + Integration)
- **Day 1:** Test with complex Figma files
- **Day 2:** Bug fixes and edge cases
- **Day 3:** VS Code extension integration
- **Day 4:** End-to-end testing
- **Day 5:** Documentation and commit

**Total: 2 weeks to production-ready**

---

## Success Criteria

Before committing:

- [ ] Figma plugin works with your test file
- [ ] Exports valid FigmaShepSpec JSON
- [ ] Bridge validates and imports successfully
- [ ] Generated .shep compiles without errors
- [ ] Generated app runs with `sheplang dev`
- [ ] VS Code command works end-to-end
- [ ] All 4 test levels pass (100%)
- [ ] Documentation is complete
- [ ] Zero console errors
- [ ] Tested with 3+ different Figma templates

**No commits until all boxes checked ✅**

---

## Next Steps

1. **YOU:** Setup Figma plugin folder and test file
2. **US:** Build plugin code.ts
3. **YOU:** Test in Figma with your file
4. **US:** Iterate until JSON exports correctly
5. **US:** Build VS Code integration
6. **YOU:** Test full workflow
7. **US:** Add unit tests
8. **YOU:** Final approval
9. **US:** Commit to monorepo

---

## Official Documentation Quick Links

### Figma Plugin
- Plugin Quickstart: https://www.figma.com/plugin-docs/setup/
- API Reference: https://www.figma.com/plugin-docs/api/api-reference/
- Node Types: https://www.figma.com/plugin-docs/api/nodes/
- Plugin UI: https://www.figma.com/plugin-docs/creating-ui/

### VS Code Extension
- Extension API: https://code.visualstudio.com/api
- Commands: https://code.visualstudio.com/api/references/commands
- File System: https://code.visualstudio.com/api/references/vscode-api#workspace

### TypeScript
- Official Docs: https://www.typescriptlang.org/docs/
- ES Modules: https://www.typescriptlang.org/docs/handbook/modules.html

**Every line of code will cite these sources. Zero hallucinations.**

---

**Status:** PLAN READY  
**Waiting for:** Your Figma setup confirmation
