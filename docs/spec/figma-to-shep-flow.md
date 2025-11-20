# Figma → ShepLang End-to-End Flow

This document describes the complete workflow from Figma design to running ShepLang application.

## Overview

```
┌─────────────────┐
│  Figma Design   │
│   (Designer)    │
└────────┬────────┘
         │
         │ 1. Designer selects frames
         ▼
┌─────────────────┐
│  Figma Plugin   │  ← Built separately using Figma Plugin API
│   (External)    │     https://developers.figma.com/docs/plugins/
└────────┬────────┘
         │
         │ 2. Plugin exports FigmaShepSpec JSON
         ▼
┌─────────────────┐
│ spec-code JSON  │  ← FigmaShepSpec format
│   (file.json)   │     See: docs/spec/figma-to-shep-spec.md
└────────┬────────┘
         │
         │ 3. Developer imports with CLI
         │    $ figma-shep import spec.json --out ./my-app
         ▼
┌─────────────────┐
│ Bridge Package  │  ← @goldensheepai/figma-shep-import
│  (This Repo)    │     packages/figma-shep-import/
└────────┬────────┘
         │
         │ 4. Generates .shep files
         ▼
┌─────────────────┐
│  .shep files    │  ← ShepLang source code
│   (my-app/)     │
└────────┬────────┘
         │
         │ 5. Developer runs verification
         │    $ sheplang verify my-app/
         ▼
┌─────────────────┐
│  ShepVerify     │  ← 4-phase verification engine
│  (Validates)    │
└────────┬────────┘
         │
         │ 6. Developer runs dev server
         │    $ sheplang dev my-app/app.shep
         ▼
┌─────────────────┐
│  Running App    │  ← TypeScript/React application
│  (localhost)    │
└─────────────────┘
```

## Detailed Steps

### Step 1: Designer Creates Frames in Figma

**Actor**: Designer  
**Tool**: Figma  
**Output**: Figma frames/artboards representing app screens

**Designer Actions:**
1. Create frames for each screen (e.g., "TaskList", "CreateTask")
2. Add UI components (buttons, inputs, lists)
3. Use naming conventions:
   - Frames: `{EntityName}List`, `{EntityName}Form`, `{EntityName}Detail`
   - Buttons: Label with action intent (e.g., "New Task", "Save", "Delete")
   - Inputs: Label with field name
4. Select frames to export

**Example Figma Structure:**
```
📄 TaskList (Frame)
  ├─ 📝 "My Tasks" (Text)
  ├─ 📋 Task items (Auto Layout)
  └─ 🔘 "New Task" (Button)

📄 CreateTask (Frame)
  ├─ 📝 "Create New Task" (Text)
  ├─ 📝 "Task Title" (Input label)
  ├─ ⬜ Title input field
  └─ 🔘 "Save" (Button)
```

---

### Step 2: Figma Plugin Exports FigmaShepSpec

**Actor**: Designer (using plugin)  
**Tool**: External Figma Plugin (built separately)  
**Output**: `FigmaShepSpec` JSON file

**Plugin Implementation (External):**

The plugin is built using official **Figma Plugin API**:
- **API Docs**: https://developers.figma.com/docs/plugins/
- **Quickstart**: https://developers.figma.com/docs/plugins/plugin-quickstart-guide/
- **Create Plugin**: https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development

**Plugin Code Structure:**

```
figma-shep-plugin/
  manifest.json       ← Figma plugin manifest
  code.ts            ← Main plugin logic
  ui.html            ← Plugin UI
  package.json
  README.md
```

**Key Plugin Functions:**

```typescript
// code.ts - Main plugin logic
figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-spec') {
    const selection = figma.currentPage.selection;
    const frames = selection.filter(node => node.type === 'FRAME');
    
    const spec: FigmaShepSpec = {
      appName: figma.currentPage.name,
      entities: extractEntities(frames),
      screens: extractScreens(frames)
    };
    
    figma.ui.postMessage({
      type: 'spec-ready',
      data: JSON.stringify(spec, null, 2)
    });
  }
};

function extractScreens(frames: FrameNode[]): FigmaShepScreen[] {
  return frames.map(frame => ({
    name: frame.name,
    frameId: frame.id,
    type: detectScreenType(frame),
    entity: extractEntityName(frame.name),
    widgets: extractWidgets(frame.children)
  }));
}

function extractWidgets(nodes: SceneNode[]): FigmaShepWidget[] {
  const widgets: FigmaShepWidget[] = [];
  
  for (const node of nodes) {
    if (node.type === 'TEXT') {
      // Detect inputs, labels
      if (isInputField(node)) {
        widgets.push({
          kind: 'input',
          label: node.characters,
          bindToField: inferFieldName(node.characters)
        });
      } else {
        widgets.push({
          kind: 'label',
          label: node.characters
        });
      }
    } else if (isButton(node)) {
      widgets.push({
        kind: 'button',
        label: extractButtonText(node),
        actionName: inferActionName(node)
      });
    }
  }
  
  return widgets;
}
```

**Plugin Output:**

```json
{
  "appName": "TodoApp",
  "entities": [
    {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "text", "required": true },
        { "name": "done", "type": "bool", "required": true }
      ]
    }
  ],
  "screens": [
    {
      "name": "TaskList",
      "frameId": "123:456",
      "type": "list",
      "entity": "Task",
      "widgets": [
        { "kind": "list", "label": "Tasks", "entityName": "Task" },
        { "kind": "button", "label": "New Task", "actionName": "CreateTask" }
      ]
    }
  ]
}
```

Designer saves this JSON file (e.g., `todo-app-spec.json`).

---

### Step 3: Developer Imports with CLI

**Actor**: Developer  
**Tool**: `@goldensheepai/figma-shep-import` CLI  
**Input**: `todo-app-spec.json`  
**Output**: `.shep` files in target directory

**Commands:**

```bash
# 1. Validate the spec first
figma-shep validate todo-app-spec.json

# Output:
# ✓ Valid FigmaShepSpec
#   App: TodoApp
#   Entities: 1
#   Screens: 2

# 2. Preview what will be generated (optional)
figma-shep preview todo-app-spec.json

# Output:
# === todoapp.shep ===
# app TodoApp
# 
# data Task:
#   fields:
#     title: text
# ...

# 3. Import and generate .shep files
figma-shep import todo-app-spec.json --out ./todo-app

# Output:
# ✓ Spec validated
# ✓ Generated todoapp.shep
# 
# Next steps:
#   1. Review the generated .shep file
#   2. Run: figma-shep verify ./todo-app
#   3. Or use: sheplang dev ./todo-app/todoapp.shep
```

**Generated File Structure:**

```
todo-app/
  todoapp.shep       ← Generated ShepLang source
```

---

### Step 4: Bridge Converts to .shep

**Actor**: Bridge package (automatic)  
**Package**: `@goldensheepai/figma-shep-import`  
**Location**: `sheplang/packages/figma-shep-import/`

**Conversion Logic:**

See implementation: [packages/figma-shep-import/src/bridge/converter.ts](../../sheplang/packages/figma-shep-import/src/bridge/converter.ts)

**Generated ShepLang:**

```shep
app TodoApp

data Task:
  fields:
    title: text
    done: yes/no

view TaskList:
  list Task
  button "New Task" -> CreateTask

view CreateTask:
  input title
  button "Save" -> SaveTask

action CreateTask(title, done):
  add Task with title, done
  show TaskList

action SaveTask(title, done):
  add Task with title, done
  show TaskList
```

---

### Step 5: Developer Runs Verification

**Actor**: Developer  
**Tool**: ShepVerify (via `sheplang` CLI or `figma-shep verify`)  
**Input**: `.shep` files  
**Output**: Verification report

**Commands:**

```bash
# Using figma-shep
figma-shep verify ./todo-app

# Or using sheplang directly
sheplang build ./todo-app/todoapp.shep
```

**Verification Phases:**

ShepVerify runs 4 phases:
1. **Type Safety** - All variables have valid types
2. **Null Safety** - No null reference errors
3. **Exhaustiveness** - All cases handled
4. **Endpoint Validation** - API calls are valid (if backend defined)

**Output:**

```
✓ Verification passed
✓ Type safety: OK
✓ Null safety: OK
✓ Exhaustiveness: OK
✓ Endpoint validation: SKIPPED (no backend)
```

---

### Step 6: Developer Runs Dev Server

**Actor**: Developer  
**Tool**: `sheplang dev`  
**Input**: `.shep` files  
**Output**: Running application at `localhost:8787`

**Commands:**

```bash
cd todo-app
sheplang dev todoapp.shep --port 8787
```

**Output:**

```
ShepLang Dev Server
✓ Compiled todoapp.shep → BobaScript
✓ Transpiled BobaScript → TypeScript
✓ Built TypeScript → JavaScript
✓ Server running at http://localhost:8787

Watching for changes...
```

**Developer Actions:**
1. Open browser to `http://localhost:8787`
2. Test the application
3. Make changes to `.shep` file
4. See changes hot-reload automatically

---

## Integration with VS Code Extension

**Future Enhancement:**

The ShepLang VS Code extension will provide:

### Import Command

```
Command Palette > ShepLang: Import from Figma
```

**Implementation:**

The extension will use the VS Code Extension API:
- **API Docs**: https://code.visualstudio.com/api
- **Your First Extension**: https://code.visualstudio.com/api/get-started/your-first-extension
- **Extension Guides**: https://code.visualstudio.com/api/extension-guides/overview

**Extension Code:**

```typescript
// extension/src/commands/importFigma.ts
import * as vscode from 'vscode';
import { writeShepFilesFromSpec } from '@goldensheepai/figma-shep-import';

export async function importFigmaCommand() {
  // 1. Prompt for spec file
  const specFiles = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { 'FigmaShepSpec': ['json'] }
  });
  
  if (!specFiles || specFiles.length === 0) return;
  
  // 2. Prompt for output directory
  const outputFolder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectMany: false
  });
  
  if (!outputFolder || outputFolder.length === 0) return;
  
  // 3. Read and validate spec
  const specContent = await vscode.workspace.fs.readFile(specFiles[0]);
  const spec = JSON.parse(specContent.toString());
  
  // 4. Generate .shep files
  await writeShepFilesFromSpec(spec, outputFolder[0].fsPath);
  
  // 5. Show success message
  vscode.window.showInformationMessage(
    `Successfully imported ${spec.appName}!`
  );
  
  // 6. Open generated file
  const shepFile = vscode.Uri.joinPath(
    outputFolder[0],
    `${spec.appName.toLowerCase()}.shep`
  );
  await vscode.window.showTextDocument(shepFile);
}
```

### Live Preview

```
Command Palette > ShepLang: Preview Generated Code
```

Shows a diff view of:
- Left: FigmaShepSpec JSON
- Right: Generated .shep code

---

## Error Handling

### Common Issues

#### Invalid Spec

```bash
$ figma-shep validate bad-spec.json
✗ Invalid FigmaShepSpec
  /entities/0/fields/0 should have required property 'required'
  /screens/0 should have required property 'frameId'
```

**Solution:** Fix the JSON to match the schema.

#### Missing Entity References

```bash
$ figma-shep import spec.json --out ./app
✗ Validation failed
  Screen "TaskList" references unknown entity "Task"
```

**Solution:** Ensure all `entity` and `entityName` references exist in the `entities` array.

#### ShepLang Compilation Errors

```bash
$ sheplang build app/app.shep
✗ Type error: Field 'title' not found on entity 'Task'
```

**Solution:** Review generated .shep file and manually fix, or update the original spec.

---

## Iteration Workflow

### Design Changes

When the designer updates Figma:

1. Designer re-exports spec from Figma plugin
2. Developer re-imports: `figma-shep import updated-spec.json --out ./app`
3. Bridge overwrites `.shep` files
4. Developer reviews diff in Git
5. Developer merges or reverts as needed

### Manual Refinements

After importing:

1. Developer can manually edit `.shep` files
2. Add custom logic, validation, backend integration
3. Original spec becomes starting point, not source of truth
4. Future re-imports require manual merging

**Best Practice:** Keep spec and manual changes separate, or version them together.

---

## Future Enhancements

### Bidirectional Sync

- Changes in `.shep` files update Figma design
- Requires Figma plugin to read `.shep` → update frames

### Real-Time Collaboration

- Designer and developer see live updates
- WebSocket connection between Figma and dev server

### Backend Integration

- Figma plugin includes API endpoint hints
- Bridge generates `call` and `load` statements
- Full-stack apps from design

### Multi-File Output

- Large apps split into multiple `.shep` files
- Organized by feature/module

---

## Related Documentation

- [Spec-Code Overview](./spec-code-overview.md)
- [FigmaShepSpec Format](./figma-to-shep-spec.md)
- [Package README](../../sheplang/packages/figma-shep-import/README.md)
- [ShepLang Documentation](../../sheplang/docs/QUICKSTART.md)

## Official External Documentation

### Figma Plugin API
- [Figma Plugin API](https://developers.figma.com/docs/plugins/)
- [Plugin Quickstart Guide](https://developers.figma.com/docs/plugins/plugin-quickstart-guide/)
- [Create Plugin for Development](https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development)

### VS Code Extension API
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)

---

**Part of the ShepLang AIVP (AI-Verified Programming) ecosystem.**
