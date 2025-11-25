# Faithful Import Specification

**Goal:** Import production React/Next.js apps to ShepLang with **zero logic loss**.

## The Problem

Current importer **simplifies** instead of **translating**:

```jsx
// SOURCE: React
<button onClick={() => {
  if (!title.trim()) {
    setError('Title required');
    return;
  }
  fetch('/api/tasks', { 
    method: 'POST', 
    body: JSON.stringify({ title, priority }) 
  });
  setTitle('');
  refreshTasks();
}}>
  Add Task
</button>
```

```sheplang
// CURRENT OUTPUT (loses all logic)
button "Add Task" -> AddTask
```

```sheplang
// DESIRED OUTPUT (faithful translation)
button "Add Task" -> action AddTask:
  if not title.trim():
    set error to "Title required"
    return
  call POST "/api/tasks" with title, priority
  set title to ""
  call refreshTasks
```

---

## Architecture Changes

### 1. Enhanced EventHandler Interface

```typescript
// OLD
interface EventHandler {
  name: string;      // "onClick"
  event: string;     // "click"
  function: string;  // "handleSubmit" (just name!)
}

// NEW
interface EventHandler {
  name: string;
  event: string;
  functionRef?: string;        // If reference: "handleSubmit"
  functionBody?: ts.Block;     // The actual AST body
  statements: TranslatedStatement[];  // Parsed for translation
}
```

### 2. Statement Translator

Create `extension/src/parsers/codeTranslator.ts`:

```typescript
interface TranslatedStatement {
  kind: 'if' | 'call' | 'load' | 'set' | 'return' | 'add' | 'remove' | 'show' | 'raw';
  // Per-kind fields
}

function translateBlock(block: ts.Block): TranslatedStatement[] {
  // Walk TS AST and convert to ShepLang statements
}
```

### 3. Statement Mapping Rules

| TypeScript/JavaScript | ShepLang |
|----------------------|----------|
| `fetch(url, {method: 'POST', body})` | `call POST "url" with fields` |
| `fetch(url)` | `load GET "url" into response` |
| `setState(value)` | `set state to value` |
| `if (cond) { ... }` | `if cond: ...` |
| `return` | `return` |
| `await api.create(data)` | `call POST "/entity" with data` |
| `router.push('/path')` | `show PathView` |
| `console.log(...)` | (omit or `// debug: ...`) |

### 4. API Call Detection

Detect common patterns:
- `fetch(url, options)`
- `axios.get/post/put/delete(url)`
- `api.entityName.method()`
- `prisma.model.operation()`
- `trpc.route.mutate/query()`

### 5. State Update Detection

Detect patterns:
- `setX(value)` → `set x to value`
- `setState({ ...state, key: value })` → `set key to value`
- `dispatch({ type, payload })` → `dispatch type with payload`

---

## Implementation Plan

### Phase 1: Extract Full Handler Bodies
- Modify `extractEventHandlers()` to capture full function body
- Store as `ts.Block` or raw source

### Phase 2: Create Code Translator
- New file: `codeTranslator.ts`
- Walk TypeScript AST
- Map to `TranslatedStatement[]`

### Phase 3: Enhance View Generator
- Use `TranslatedStatement[]` to generate ShepLang
- Preserve conditional logic, loops, etc.

### Phase 4: Backend Translation
- Same approach for API route handlers
- Translate Next.js API routes → ShepThon

---

## Example: Full Translation

### Input: Next.js Page

```tsx
export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    
    if (res.ok) {
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setTitle('');
      setError('');
    } else {
      setError('Failed to create task');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <main>
      <h1>Tasks</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title}
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Output: ShepLang (Faithful Translation)

```sheplang
app TaskManager

data Task:
  fields:
    id: text
    title: text

view TaskPage:
  state:
    tasks: Task[]
    title: text
    error: text

  text "Tasks"
  
  if error:
    text error with class "error"
  
  form -> SubmitTask:
    input title
    button "Add Task"
  
  list tasks as task:
    text task.title
    button "Delete" -> DeleteTask(task.id)

action SubmitTask():
  if not title.trim():
    set error to "Title is required"
    return
  
  call POST "/api/tasks" with title into response
  
  if response.ok:
    load response.json into newTask
    set tasks to [...tasks, newTask]
    set title to ""
    set error to ""
  else:
    set error to "Failed to create task"

action DeleteTask(id):
  call DELETE "/api/tasks/:id"
  set tasks to tasks.filter(t => t.id != id)
```

---

## Success Criteria

1. **Zero Logic Loss**: Every if/else, loop, API call preserved
2. **Readable Output**: ShepLang should be clearer than source
3. **Round-Trip Possible**: ShepLang → TypeScript should work
4. **Production Ready**: Imported apps should function identically

---

## Why This Matters

ShepLang is NOT a simplifier. It's a **more AI-friendly syntax** for the same code.

- **Same logic, better syntax**
- **Easier for AI to read/modify**
- **Verified by ShepVerify**
- **Deployable to production**

This is what makes AIVP different from CRUD generators.
