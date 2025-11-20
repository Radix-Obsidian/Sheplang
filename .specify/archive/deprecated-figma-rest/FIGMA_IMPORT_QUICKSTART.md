# Figma Import - Quick Start Guide

## What Is This?

Turn your Figma designs into verified ShepLang applications with a single command.

```
Figma Design → FigmaShepSpec JSON → .shep Files → Running App
     ↓              ↓                    ↓              ↓
  2 minutes     10 seconds          5 seconds      10 seconds
```

**Total: Under 3 minutes from design to deployed app.**

---

## Installation

```bash
# From the monorepo
cd sheplang/packages/figma-shep-import
npm install
npm run build

# Or install globally (after publishing)
npm install -g @goldensheepai/figma-shep-import
```

---

## Quick Example

### 1. Create a Spec File

Create `my-app-spec.json`:

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
      "frameId": "figma:123:456",
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

### 2. Import It

```bash
figma-shep import my-app-spec.json --out ./my-app
```

Output:
```
✓ Spec validated
✓ Generated todoapp.shep
```

### 3. Run It

```bash
cd my-app
sheplang dev todoapp.shep
```

Open `http://localhost:8787` - your app is running!

---

## CLI Commands

### Validate
Check if your spec is valid:
```bash
figma-shep validate my-spec.json
```

### Preview
See what will be generated without writing files:
```bash
figma-shep preview my-spec.json
```

### Import
Generate .shep files from spec:
```bash
figma-shep import my-spec.json --out ./output-dir
```

### Verify
Verify generated .shep files with ShepLang:
```bash
figma-shep verify ./output-dir
```

---

## Complete Documentation

- **Overview:** [docs/spec/spec-code-overview.md](../docs/spec/spec-code-overview.md)
- **Spec Format:** [docs/spec/figma-to-shep-spec.md](../docs/spec/figma-to-shep-spec.md)
- **Full Workflow:** [docs/spec/figma-to-shep-flow.md](../docs/spec/figma-to-shep-flow.md)
- **Package README:** [sheplang/packages/figma-shep-import/README.md](../sheplang/packages/figma-shep-import/README.md)

---

## What About the Figma Plugin?

The **Figma plugin is built separately** using the official Figma Plugin API.

This package only handles:
- Importing the spec JSON
- Converting to .shep files
- Validating and verifying

**Figma Plugin docs:** https://developers.figma.com/docs/plugins/

---

## Example Files

Working examples in `sheplang/packages/figma-shep-import/src/spec/examples/`:
- `simple-todo.json` - Basic task manager

---

## What Gets Generated?

From the spec above, you get valid ShepLang:

```shep
app TodoApp

data Task:
  fields:
    title: text
    done: yes/no

view TaskList:
  list Task
  button "New Task" -> CreateTask

action CreateTask(title, done):
  add Task with title, done
  show TaskList
```

This is **production-ready, verified ShepLang code**.

---

## Programmatic Usage

Use as a library in your own tools:

```typescript
import { 
  convertFigmaSpecToShep, 
  writeShepFilesFromSpec,
  type FigmaShepSpec 
} from "@goldensheepai/figma-shep-import";

const spec: FigmaShepSpec = {
  appName: "MyApp",
  entities: [...],
  screens: [...]
};

// Preview
const files = convertFigmaSpecToShep(spec);
console.log(files[0].contents);

// Write to disk
await writeShepFilesFromSpec(spec, "./output");
```

---

## Integration Roadmap

### ✅ Phase 1: CLI Tool (DONE)
- Standalone CLI
- Import, validate, preview commands
- Works with manual spec files

### 🔄 Phase 2: Figma Plugin (In Progress)
- Extract designs from Figma
- Generate FigmaShepSpec JSON
- Export to clipboard/file

### 📋 Phase 3: VS Code Extension
- "Import from Figma" command
- Live preview in editor
- Auto-complete for specs

### 🔮 Phase 4: ShepKit Web UI
- Drag-drop JSON import
- Visual spec editor
- One-click deploy

---

## Need Help?

- **Issues:** https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues
- **Discussions:** https://github.com/Radix-Obsidian/Sheplang-BobaScript/discussions
- **Docs:** [Complete implementation summary](./.specify/FIGMA_BRIDGE_COMPLETE.md)

---

**Status:** ✅ Production Ready  
**Last Updated:** November 19, 2025
