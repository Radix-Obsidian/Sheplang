# FigmaShepSpec Format Specification

## Overview

`FigmaShepSpec` is the canonical spec-code format for importing Figma designs into ShepLang applications. It is a structured JSON format that captures the semantic intent of a UI design and maps it to ShepLang's data-view-action model.

## Schema

The complete JSON Schema is available at: [sheplang/packages/figma-shep-import/src/spec/schema.json](../../sheplang/packages/figma-shep-import/src/spec/schema.json)

TypeScript types are available at: [sheplang/packages/figma-shep-import/src/spec/types.ts](../../sheplang/packages/figma-shep-import/src/spec/types.ts)

## Top-Level Structure

```typescript
interface FigmaShepSpec {
  appName: string;
  screens: FigmaShepScreen[];
  entities: FigmaShepEntity[];
}
```

### Fields

- **`appName`** (required): The name of the application, used as the app name in the generated `.shep` file
- **`screens`** (required): Array of screen/view definitions
- **`entities`** (required): Array of data entity definitions

## Entities

Entities represent data models in your application. They map to ShepLang `data` blocks.

```typescript
interface FigmaShepEntity {
  name: string;
  fields: FigmaShepField[];
}
```

### Entity Example

```json
{
  "name": "Task",
  "fields": [
    { "name": "title", "type": "text", "required": true },
    { "name": "done", "type": "bool", "required": true },
    { "name": "priority", "type": { "enum": ["low", "medium", "high"] }, "required": true }
  ]
}
```

**Maps to ShepLang:**
```shep
data Task:
  fields:
    title: text
    done: yes/no
    priority: "low" | "medium" | "high"
```

## Fields

Each entity has fields with types that map to ShepLang's type system.

```typescript
interface FigmaShepField {
  name: string;
  type: "text" | "email" | "int" | "float" | "bool" | "datetime" | { enum: string[] };
  required: boolean;
}
```

### Type Mapping

| FigmaShepSpec Type | ShepLang Type | Notes |
|-------------------|---------------|-------|
| `"text"` | `text` | General text field |
| `"email"` | `email` | Email with validation |
| `"int"` | `number` | Integer number |
| `"float"` | `number` | Floating-point number |
| `"bool"` | `yes/no` | Boolean field |
| `"datetime"` | `datetime` | Date and time |
| `{ enum: [...] }` | `"val1" \| "val2"` | Enumerated values |

### Field Example

```json
{
  "name": "priority",
  "type": { "enum": ["low", "medium", "high"] },
  "required": true
}
```

## Screens

Screens represent views in your application. They map to ShepLang `view` blocks.

```typescript
interface FigmaShepScreen {
  name: string;
  frameId: string;
  type: "single" | "list" | "form";
  entity?: string;
  widgets: FigmaShepWidget[];
}
```

### Screen Types

- **`single`**: Single item display (e.g., detail view, dashboard)
- **`list`**: List of items (e.g., task list, user directory)
- **`form`**: Input form (e.g., create task, edit profile)

### Screen Example

```json
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
```

**Maps to ShepLang:**
```shep
view TaskList:
  list Task
  button "New Task" -> CreateTask
```

## Widgets

Widgets represent UI components within screens.

```typescript
interface FigmaShepWidget {
  kind: "button" | "input" | "list" | "label";
  label: string;
  actionName?: string;
  bindToField?: string;
  entityName?: string;
}
```

### Widget Types

#### Button

```json
{ "kind": "button", "label": "Save", "actionName": "SaveTask" }
```
→ `button "Save" -> SaveTask`

#### Input

```json
{ "kind": "input", "label": "Task Title", "bindToField": "title" }
```
→ `input title`

#### List

```json
{ "kind": "list", "label": "Tasks", "entityName": "Task" }
```
→ `list Task`

#### Label

```json
{ "kind": "label", "label": "Welcome!" }
```
→ `text "Welcome!"`

## Complete Example

### FigmaShepSpec JSON

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
    },
    {
      "name": "CreateTask",
      "frameId": "figma:123:789",
      "type": "form",
      "entity": "Task",
      "widgets": [
        { "kind": "input", "label": "Task Title", "bindToField": "title" },
        { "kind": "button", "label": "Save", "actionName": "SaveTask" }
      ]
    }
  ]
}
```

### Generated ShepLang Output

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

## How the External Figma Plugin Produces This JSON

The Figma plugin (built separately) uses the **Figma Plugin API** to:

### 1. Access Selected Frames

```typescript
// Figma Plugin code
const selection = figma.currentPage.selection;
const frames = selection.filter(node => node.type === 'FRAME');
```

**Official Documentation:**
- [Figma Plugin API](https://developers.figma.com/docs/plugins/)
- [Plugin Quickstart](https://developers.figma.com/docs/plugins/plugin-quickstart-guide/)
- [Create Plugin for Development](https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development)

### 2. Walk Node Tree

The plugin traverses each frame's children:

```typescript
function processFrame(frame: FrameNode): FigmaShepScreen {
  const widgets: FigmaShepWidget[] = [];
  
  for (const child of frame.children) {
    if (child.type === 'TEXT') {
      widgets.push({ kind: 'label', label: child.characters });
    } else if (child.name.startsWith('Button:')) {
      const actionName = child.name.split(':')[1];
      widgets.push({ 
        kind: 'button', 
        label: findButtonText(child),
        actionName 
      });
    }
    // ... more widget detection logic
  }
  
  return {
    name: frame.name,
    frameId: frame.id,
    type: detectScreenType(frame),
    widgets
  };
}
```

### 3. Extract Entities from Naming Conventions

The plugin uses naming conventions to detect entities:

```typescript
// Frame named "TaskList" → entity "Task"
// Frame named "UserProfile" → entity "User"
function extractEntityFromFrameName(frameName: string): string {
  // Smart parsing logic
  return frameName.replace(/List$|Form$|Detail$/, '');
}
```

### 4. Map UI Elements to Widget Types

```typescript
function detectWidget(node: SceneNode): FigmaShepWidget | null {
  // Detect by:
  // - Layer name (e.g., "Button: SaveTask")
  // - Component instance (e.g., from design system)
  // - Visual properties (e.g., rectangle with text = button)
  
  if (node.type === 'INSTANCE') {
    const componentName = node.mainComponent?.name;
    if (componentName?.includes('Button')) {
      return { kind: 'button', label: extractText(node) };
    }
  }
  
  return null;
}
```

### 5. Export as FigmaShepSpec

```typescript
// Final step in plugin
const spec: FigmaShepSpec = {
  appName: projectName,
  entities: extractedEntities,
  screens: processedScreens
};

// Copy to clipboard or download as JSON
figma.ui.postMessage({ 
  type: 'export', 
  data: JSON.stringify(spec, null, 2) 
});
```

## Validation

Before importing, the spec should be validated against the schema:

```bash
figma-shep validate my-design.json
```

This ensures:
- All required fields are present
- Types are correct
- References are valid (e.g., widget `entityName` matches an existing entity)

## Conversion Logic

The bridge package (`@goldensheepai/figma-shep-import`) converts the spec using these rules:

1. **Entities** → `data` blocks with field mappings
2. **Screens** → `view` blocks with widget mappings
3. **Buttons with actions** → `action` blocks inferred from screen context
4. **Form screens** → Actions with parameters from entity fields
5. **List screens** → Views with `list EntityName` statements

See implementation: [sheplang/packages/figma-shep-import/src/bridge/converter.ts](../../sheplang/packages/figma-shep-import/src/bridge/converter.ts)

## Extensibility

Future versions may support:

- **Conditional widgets**: `if` statements in views
- **Navigation flows**: explicit screen transitions
- **Styling hints**: colors, layouts, themes
- **Backend hints**: API endpoints, authentication
- **Multi-file output**: separate `.shep` files per screen

## Best Practices

### For Plugin Developers

1. **Use consistent naming conventions** for frames and layers
2. **Leverage Figma components** from design systems
3. **Include metadata** in frame descriptions (e.g., entity name)
4. **Validate before export** to catch issues early

### For Bridge Consumers

1. **Validate specs** before importing
2. **Review generated .shep** before deploying
3. **Run `sheplang verify`** to ensure correctness
4. **Iterate on design** if conversion doesn't match intent

## Related Documentation

- [Spec-Code Overview](./spec-code-overview.md)
- [Figma to Shep Flow](./figma-to-shep-flow.md)
- [Package README](../../sheplang/packages/figma-shep-import/README.md)

---

**Part of the ShepLang AIVP (AI-Verified Programming) ecosystem.**
