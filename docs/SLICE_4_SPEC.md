# Slice 4 Specification – View & Action Mapping

**Goal**: Convert JSX + handlers to ShepLang `view`/`action` blocks.

---

## Overview

Transform React component structure into ShepLang semantic constructs:
- **Views**: Pages and components become ShepLang `view` blocks
- **Widgets**: JSX elements map to ShepLang UI primitives (button, form, list)
- **Actions**: Event handlers become ShepLang `action` blocks

---

## Input

From Slice 2 (`ReactComponent`):
```typescript
interface ReactComponent {
  name: string;
  filePath: string;
  type: 'page' | 'component';
  exports: 'default' | 'named';
  props: PropDefinition[];
  state: StateVariable[];
  elements: JSXElement[];
  handlers: EventHandler[];
  apiCalls: APICall[];
}
```

From Slice 3 (`Entity[]`):
```typescript
interface Entity {
  name: string;
  fields: EntityField[];
  relations: EntityRelation[];
}
```

---

## Output

### ShepLangView
```typescript
interface ShepLangView {
  name: string;
  kind: 'page' | 'component';
  widgets: ShepLangWidget[];
  bindings: ViewBinding[];
}
```

### ShepLangWidget
```typescript
interface ShepLangWidget {
  type: 'button' | 'form' | 'list' | 'input' | 'text' | 'container';
  label?: string;
  action?: string;           // Reference to action name
  entity?: string;           // For list widgets
  fields?: string[];         // For form inputs
  children?: ShepLangWidget[];
}
```

### ShepLangAction
```typescript
interface ShepLangAction {
  name: string;
  params: ActionParam[];
  operations: ActionOperation[];
}

interface ActionOperation {
  kind: 'add' | 'update' | 'remove' | 'call' | 'load' | 'show';
  entity?: string;
  endpoint?: string;
  method?: string;
  view?: string;
}
```

---

## Mapping Rules

### 1. Views

| React Pattern | ShepLang Output |
|---------------|-----------------|
| `app/page.tsx` | `view Home:` (page) |
| `app/dashboard/page.tsx` | `view Dashboard:` (page) |
| `components/TaskList.tsx` | `view TaskList:` (component) |

### 2. Widgets

| JSX Element | ShepLang Widget |
|-------------|-----------------|
| `<button onClick={...}>Label</button>` | `button "Label" -> ActionName` |
| `<form onSubmit={...}>` | `form Entity` with field inputs |
| `<ul>{items.map(...)}</ul>` | `list Entity` |
| `<input name="title" />` | Field binding for forms |
| `<h1>Title</h1>` | `text "Title"` |

### 3. Actions

| Handler Pattern | ShepLang Action |
|-----------------|-----------------|
| `fetch('/api/todos', { method: 'POST' })` | `call POST "/api/todos"` |
| `fetch('/api/todos')` | `load GET "/api/todos" into todos` |
| `setTodos([...])` | State update (inferred) |
| `router.push('/dashboard')` | `show Dashboard` |

---

## Implementation Steps

1. **ViewMapper**: Convert ReactComponent → ShepLangView
2. **WidgetMapper**: Convert JSXElement[] → ShepLangWidget[]
3. **ActionMapper**: Convert EventHandler[] + APICall[] → ShepLangAction[]
4. **CodeGenerator**: Generate ShepLang text output

---

## Test Cases

1. **Page with button** → view + action mapping
2. **Component with list** → list widget with entity reference
3. **Form submission** → form widget + action with parameters
4. **API call in handler** → call/load operation
5. **Navigation handler** → show operation
6. **Multiple widgets** → nested widget structure
7. **No handlers** → view only, no actions

---

## Success Criteria

- [ ] Pages converted to ShepLang views
- [ ] Buttons mapped to actions
- [ ] Lists mapped with entity references
- [ ] Forms mapped with field inputs
- [ ] API calls converted to call/load operations
- [ ] Generated ShepLang compiles successfully
- [ ] All tests passing

---

*Slice 4 follows Golden Sheep AI Methodology™ – Vertical Slice Delivery*
