# 🤖 AI Best Practices for ShepLang

How to work with Cursor, GitHub Copilot, and other AI coding assistants to generate ShepLang code.

---

## Table of Contents

- [Why ShepLang Works Great with AI](#why-sheplang-works-great-with-ai)
- [Setting Up AI Tools](#setting-up-ai-tools)
- [Effective Prompting](#effective-prompting)
- [Common Patterns](#common-patterns)
- [Iterating with AI](#iterating-with-ai)
- [Troubleshooting AI-Generated Code](#troubleshooting-ai-generated-code)

---

## Why ShepLang Works Great with AI

ShepLang was **designed from the ground up** to be AI-native:

### ✅ **Human-Readable**
- AI can explain what generated code does
- You can actually understand and modify it
- No framework boilerplate to decipher

### ✅ **Declarative**
- Describe **what** you want, not **how** to build it
- AI focuses on business logic, not implementation details
- Less room for AI to generate buggy code

### ✅ **Minimal Syntax**
- Fewer ways to get syntax wrong
- AI learns the patterns quickly
- Consistent structure reduces errors

### ✅ **Full-Stack**
- Frontend (.shep) and backend (.shepthon) in one language family
- AI can generate both in a single conversation
- No context switching between frameworks

---

## Setting Up AI Tools

### Cursor Setup

1. **Install Cursor:**
   - Download from [cursor.sh](https://cursor.sh)
   - Open your ShepLang project

2. **Configure ShepLang Support:**
   - Cursor will automatically detect `.shep` and `.shepthon` files
   - IntelliSense and completion work out of the box

3. **Best Settings:**
   ```json
   {
     "cursor.codebase.enabled": true,
     "cursor.chat.model": "gpt-4",
     "cursor.autoSuggest": true
   }
   ```

### GitHub Copilot Setup

1. **Install Extension:**
   - VS Code Extensions → "GitHub Copilot"
   - Sign in with GitHub account

2. **Enable for ShepLang:**
   - Copilot works automatically with `.shep` files
   - Uses extension's language configuration

3. **Best Settings:**
   ```json
   {
     "github.copilot.enable": {
       "*": true,
       "sheplang": true,
       "shepthon": true
     }
   }
   ```

---

## Effective Prompting

### The Golden Rule

**Be specific about what you want, not how to build it.**

### ❌ Bad Prompts

```
"Create a todo app"
"Add a button"
"Make it work"
```

**Why bad:**
- Too vague
- AI doesn't know your requirements
- Results in generic, incorrect code

### ✅ Good Prompts

```
"Create a ShepLang todo app with:
- Todo data model (title: text, done: yes/no, priority: number)
- Dashboard view showing list of todos
- Add Task button that prompts for title
- Backend with GET and POST endpoints"
```

**Why good:**
- Specific requirements
- Mentions ShepLang explicitly
- Lists exact fields and features
- Clear structure

---

## Common Patterns

### Pattern 1: Generate Full-Stack Feature

**Prompt:**
```
Add a priority field to todos. Frontend should show priority as stars (1-5). 
Backend should validate priority is between 1 and 5.
```

**Expected AI Output:**

**Frontend (app.shep):**
```sheplang
data Todo:
  fields:
    title: text
    done: yes/no
    priority: number = 1  # ← AI added
  rules:
    - "priority must be between 1 and 5"  # ← AI added
```

**Backend (app.shepthon):**
```shepthon
model Todo {
  id: id
  title: text
  done: bool = false
  priority: int = 1  # ← AI added
}

endpoint POST "/todos" (title: string, priority: int) -> Todo {
  # ← AI added priority parameter
  if (priority < 1 || priority > 5) {
    throw "Priority must be between 1 and 5"
  }
  let todo = db.Todo.create({ title, done: false, priority })
  return todo
}
```

---

### Pattern 2: Add CRUD Operations

**Prompt:**
```
Add full CRUD for todos: Create, Read, Update, Delete. 
Backend needs all REST endpoints. Frontend needs buttons for each action.
```

**Expected AI Output:**

**Frontend:**
```sheplang
view Dashboard:
  list Todo
  button "Add" -> CreateTodo
  button "Edit" -> EditTodo
  button "Delete" -> DeleteTodo

action CreateTodo(title):
  call POST "/todos"(title)
  show Dashboard

action EditTodo(id, title):
  call PUT "/todos/:id"(title)
  show Dashboard

action DeleteTodo(id):
  call DELETE "/todos/:id"
  show Dashboard
```

**Backend:**
```shepthon
# CREATE
endpoint POST "/todos" (title: string) -> Todo {
  return db.Todo.create({ title, done: false })
}

# READ
endpoint GET "/todos" -> [Todo] {
  return db.Todo.findAll()
}

# UPDATE
endpoint PUT "/todos/:id" (title: string, done: bool) -> Todo {
  return db.Todo.update(:id, { title, done })
}

# DELETE
endpoint DELETE "/todos/:id" {
  db.Todo.delete(:id)
  return { success: true }
}
```

---

### Pattern 3: Add Background Jobs

**Prompt:**
```
Add a background job that runs every day at midnight to delete todos 
that have been completed for more than 7 days.
```

**Expected AI Output:**

```shepthon
job "cleanup-old-todos" every 1 day {
  let sevenDaysAgo = now() - 7 days
  let old = db.Todo.find({ 
    done: true,
    updatedAt < sevenDaysAgo
  })
  for todo in old {
    db.Todo.delete(todo.id)
  }
}
```

---

### Pattern 4: Add Validation Rules

**Prompt:**
```
Add validation rules:
- Title must be at least 3 characters
- Title cannot contain special characters
- Priority must be 1-5
```

**Expected AI Output:**

**Frontend:**
```sheplang
data Todo:
  fields:
    title: text
    priority: number = 1
  rules:
    - "title must be at least 3 characters"
    - "title cannot contain special characters"
    - "priority must be between 1 and 5"
```

**Backend:**
```shepthon
endpoint POST "/todos" (title: string, priority: int) -> Todo {
  # Validation
  if (title.length < 3) {
    throw "Title must be at least 3 characters"
  }
  if (title.match(/[^a-zA-Z0-9 ]/)) {
    throw "Title cannot contain special characters"
  }
  if (priority < 1 || priority > 5) {
    throw "Priority must be between 1 and 5"
  }
  
  let todo = db.Todo.create({ title, done: false, priority })
  return todo
}
```

---

## Iterating with AI

### Step 1: Generate Base Structure

**First Prompt:**
```
Create a basic todo app in ShepLang with:
- Todo model (title, done)
- Dashboard view with list
- Add button
- Backend with GET and POST endpoints
```

### Step 2: Add Features Incrementally

**Second Prompt:**
```
Add a priority field (1-5) to todos. Show as stars in the UI.
```

**Third Prompt:**
```
Add an edit button to change todo titles.
```

**Fourth Prompt:**
```
Add a background job to auto-complete todos older than 30 days.
```

### Step 3: Refine with Specific Fixes

**Prompt:**
```
The edit button isn't working. The endpoint should use PUT not POST.
Fix the action to call PUT /todos/:id with the new title.
```

---

## Prompting Tips

### DO: Be Explicit

✅ **"Add a ShepLang action that calls POST /todos with title parameter"**

❌ "Add an action"

### DO: Reference Existing Code

✅ **"Modify the CreateTodo action to also send priority to the backend"**

❌ "Make it send priority"

### DO: Specify Data Types

✅ **"Add a priority field of type number with default value 1"**

❌ "Add priority"

### DO: Request Tests

✅ **"Generate example API calls to test all CRUD endpoints"**

### DO: Ask for Explanations

✅ **"Explain how the background job cleanup logic works"**

### DON'T: Assume Framework Knowledge

❌ "Use React hooks"  
✅ "Use ShepLang actions"

❌ "Add Express middleware"  
✅ "Add ShepThon endpoint validation"

### DON'T: Mix Frameworks

❌ "Add a useState hook"  
✅ "Add a ShepLang data field"

### DON'T: Request Implementation Details

❌ "Use a for loop to iterate todos"  
✅ "Filter todos where done is true"

---

## AI-Friendly Code Style

### Use Consistent Naming

```sheplang
# ✅ Good: Consistent naming
data Todo:
  fields:
    title: text
    
view TodoList:
  list Todo
  
action CreateTodo:
  add Todo
```

```sheplang
# ❌ Bad: Inconsistent naming
data Todo:
  fields:
    taskTitle: text
    
view Tasks:
  list Todo
  
action AddTask:
  add Todo
```

### Keep It Simple

```sheplang
# ✅ Good: Simple, clear actions
action CreateTodo(title):
  call POST "/todos"(title)
  show Dashboard
```

```sheplang
# ❌ Bad: Overly complex
action CreateTodo(title):
  if title:
    if title.length > 0:
      call POST "/todos"(title)
      if success:
        show Dashboard
```

### Use Descriptive Names

```sheplang
# ✅ Good: Descriptive
action MarkTodoAsComplete(id):
  call PUT "/todos/:id"(done=true)
```

```sheplang
# ❌ Bad: Vague
action DoThing(id):
  call PUT "/todos/:id"(done=true)
```

---

## Troubleshooting AI-Generated Code

### AI Generated Wrong Syntax

**Problem:** AI uses framework-specific syntax

**Example:**
```javascript
// AI generated React code
const [todos, setTodos] = useState([])
```

**Fix:**
```sheplang
# Tell AI explicitly:
"Use ShepLang syntax, not React. Show me the ShepLang data model."
```

### AI Mixed Frontend/Backend

**Problem:** AI put backend code in .shep file

**Fix:**
```
"Split this into two files:
- app.shep (frontend with data, view, action)
- app.shepthon (backend with model, endpoint, job)"
```

### AI Used Wrong Field Types

**Problem:**
```sheplang
data Todo:
  fields:
    title: string  # ❌ Should be 'text'
```

**Fix:**
```
"In ShepLang, use 'text' not 'string' for frontend data models.
Refer to the language reference for correct field types."
```

### AI Generated Non-Existent Keywords

**Problem:**
```sheplang
action CreateTodo:
  validate title  # ❌ 'validate' doesn't exist
  add Todo
```

**Fix:**
```
"ShepLang doesn't have a 'validate' keyword. Use 'rules' in the data model:

data Todo:
  fields:
    title: text
  rules:
    - \"title must be at least 3 characters\"
"
```

---

## Example AI Conversations

### Conversation 1: Build a Todo App

**You:**
```
Create a ShepLang todo application with:
- Frontend (.shep):
  - Todo data model (title: text, done: yes/no)
  - Dashboard view with list of todos
  - Add Task button
- Backend (.shepthon):
  - Todo model
  - GET /todos endpoint
  - POST /todos endpoint
```

**AI:** *Generates complete app.shep and app.shepthon*

**You:**
```
Add edit functionality. Users should click a todo to edit its title.
```

**AI:** *Adds edit action to frontend and PUT endpoint to backend*

**You:**
```
Add a delete button with trash icon to each todo.
```

**AI:** *Adds delete action and DELETE endpoint*

---

### Conversation 2: Add Features

**You:**
```
I have a working todo app. Add a priority system:
- Priority field (1-5)
- Frontend shows stars (★★★☆☆)
- Backend validates priority range
- Sort todos by priority (high to low)
```

**AI:** *Generates updated models, validation, and sorting logic*

**You:**
```
The sorting isn't working. Fix the GET /todos endpoint to return 
todos sorted by priority descending, then by createdAt ascending.
```

**AI:** *Fixes the endpoint query*

---

## Advanced Techniques

### Chain of Thought Prompting

```
"Let's build a todo app step by step:
1. First, create the basic data models (frontend and backend)
2. Then, add the Dashboard view
3. Then, add Create action and POST endpoint
4. Finally, add Edit and Delete functionality

Start with step 1."
```

### Provide Examples

```
"Add a job like this example:

job \"cleanup\" every 1 day {
  let old = db.Todo.find({ done: true })
  for todo in old {
    db.Todo.delete(todo.id)
  }
}

But make it delete todos older than 7 days instead."
```

### Reference Documentation

```
"According to the ShepLang language reference, field types are:
text, number, yes/no, date, time, datetime, id

Update my model to use the correct types."
```

---

## Best Practices Summary

### ✅ DO

- **Mention "ShepLang" explicitly** in every prompt
- **Be specific** about requirements
- **Reference existing code** when modifying
- **Ask for explanations** when confused
- **Iterate incrementally** - add features one at a time
- **Test AI code** in the preview before committing

### ❌ DON'T

- **Don't assume** AI knows ShepLang syntax
- **Don't mix frameworks** (React, Express, etc.)
- **Don't accept code** without testing
- **Don't let AI** use non-existent keywords
- **Don't trust** validation without checking

---

## Resources

- [Language Reference](./LANGUAGE_REFERENCE.md) - Share this with AI
- [Getting Started](./GETTING_STARTED.md) - AI can reference for structure
- [Examples](../examples/) - Show AI working examples

---

## Sample Prompt Template

```
I'm building a [app description] in ShepLang.

Requirements:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Create:
1. Frontend (app.shep) with:
   - Data model for [model name]
   - [View name] view showing [UI elements]
   - Actions for [operations]

2. Backend (app.shepthon) with:
   - Model matching frontend
   - Endpoints for [operations]
   - [Optional: Jobs for background tasks]

Use ShepLang syntax (not React/Express). 
Reference the language reference if unsure.
```

---

**🤖 Happy AI-assisted coding with ShepLang!**

*Remember: AI is a tool to accelerate development, but you're still the architect. Review, test, and iterate!*
