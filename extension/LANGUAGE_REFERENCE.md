# 📖 ShepLang Language Reference

Complete syntax reference for ShepLang (frontend) and ShepThon (backend).

---

## Table of Contents

**ShepLang (Frontend)**
- [Application Declaration](#application-declaration)
- [Data Models](#data-models)
- [Views](#views)
- [Actions](#actions)
- [Field Types](#field-types)

**ShepThon (Backend)**
- [App Declaration](#app-declaration-shepthon)
- [Models](#models-shepthon)
- [Endpoints](#endpoints)
- [Jobs](#jobs)
- [Database Operations](#database-operations)

---

# ShepLang (Frontend)

## Application Declaration

Every ShepLang file starts with an app declaration:

```sheplang
app AppName
```

**Rules:**
- Must be the first line
- `AppName` should be PascalCase
- No semicolon needed

---

## Data Models

Define your data structures:

```sheplang
data ModelName:
  fields:
    fieldName: fieldType
    anotherField: fieldType = defaultValue
  rules:
    - "validation rule"
```

### Example

```sheplang
data Todo:
  fields:
    title: text
    done: yes/no = no
    priority: number = 1
  rules:
    - "title must be at least 3 characters"
    - "priority must be between 1 and 5"
```

### Field Types

| Type | Description | Example Values |
|------|-------------|----------------|
| `text` | String values | `"Hello"`, `"Buy milk"` |
| `number` | Numeric values | `42`, `3.14`, `-10` |
| `yes/no` | Boolean values | `yes`, `no`, `true`, `false` |
| `date` | Date values | `2025-11-17`, `today` |
| `time` | Time values | `14:30`, `now` |
| `datetime` | Date + time | `2025-11-17 14:30` |
| `id` | Unique identifier | Auto-generated |

### Default Values

```sheplang
done: yes/no = no           # Boolean default
priority: number = 1        # Number default
status: text = "pending"    # String default
createdAt: datetime = now   # Current date/time
```

---

## Views

Views define what users see:

```sheplang
view ViewName:
  show "Title Text"
  list ModelName
  button "Label" -> ActionName
```

### View Components

**Show Text:**
```sheplang
view Welcome:
  show "Welcome to My App!"
```

**List Data:**
```sheplang
view TodoList:
  list Todo
```

**Buttons:**
```sheplang
view Dashboard:
  button "Add Task" -> CreateTask
  button "Settings" -> OpenSettings
```

### Full Example

```sheplang
view Dashboard:
  show "My Dashboard"
  list Todo
  button "Add Task" -> CreateTask
  button "Clear All" -> ClearAll
```

---

## Actions

Actions define what happens when users interact:

```sheplang
action ActionName:
  # operations
  
action ActionName(param1, param2):
  # operations with parameters
```

### Operations

**Add Data:**
```sheplang
action CreateTask:
  add Todo with title="New task", done=no
```

**Add with Parameters:**
```sheplang
action CreateTask(title):
  add Todo with title, done=no
```

**Show View:**
```sheplang
action GoHome:
  show Dashboard
```

**Call Backend:**
```sheplang
action LoadTasks:
  call GET "/todos"
  show TaskList
```

**Combined Operations:**
```sheplang
action AddAndRefresh(title):
  call POST "/todos"(title, done=false)
  show Dashboard
```

### Full Example

```sheplang
action CreateTodo(title):
  add Todo with title, done=false
  call POST "/todos"(title, done=false)
  show Dashboard

action ToggleDone(id):
  call PUT "/todos/:id"(done=true)
  show Dashboard

action DeleteTodo(id):
  call DELETE "/todos/:id"
  show Dashboard
```

---

## Complete ShepLang Example

```sheplang
app MyTodos

data Todo:
  fields:
    id: id
    title: text
    done: yes/no = no
    priority: number = 1
  rules:
    - "title required"
    - "user can update own items"

view Dashboard:
  show "My Tasks"
  list Todo
  button "Add Task" -> CreateTodo
  button "Settings" -> ShowSettings

view Settings:
  show "Settings"
  button "Back" -> Dashboard

action CreateTodo(title):
  add Todo with title, done=false, priority=1
  call POST "/todos"(title)
  show Dashboard

action ToggleTodo(id, done):
  call PUT "/todos/:id"(done)
  show Dashboard

action DeleteTodo(id):
  call DELETE "/todos/:id"
  show Dashboard

action ShowSettings:
  show Settings
```

---

# ShepThon (Backend)

## App Declaration (ShepThon)

```shepthon
app AppName {
  // models, endpoints, jobs
}
```

**Rules:**
- Curly braces required
- Name should match frontend app

---

## Models (ShepThon)

Define database tables:

```shepthon
model ModelName {
  id: id
  fieldName: fieldType
  anotherField: fieldType = defaultValue
}
```

### Field Types (Backend)

| Type | Description | Maps To |
|------|-------------|---------|
| `id` | Auto-generated ID | UUID |
| `string` / `text` | Text values | String |
| `int` / `number` | Integers | Number |
| `float` / `decimal` | Decimals | Number |
| `bool` / `yes/no` | Boolean | Boolean |
| `datetime` | Date + time | Date |
| `date` | Date only | Date |
| `time` | Time only | String |

### Example

```shepthon
model Todo {
  id: id
  title: text
  done: bool = false
  priority: int = 1
  createdAt: datetime = now
}
```

---

## Endpoints

Define REST API routes:

```shepthon
endpoint METHOD "path" -> ReturnType {
  // logic
}

endpoint METHOD "path" (param: type) -> ReturnType {
  // logic with parameters
}
```

### HTTP Methods

**GET** - Read data:
```shepthon
endpoint GET "/todos" -> [Todo] {
  return db.Todo.findAll()
}

endpoint GET "/todos/:id" -> Todo {
  return db.Todo.findOne(:id)
}
```

**POST** - Create data:
```shepthon
endpoint POST "/todos" (title: string) -> Todo {
  let todo = db.Todo.create({ title, done: false })
  return todo
}
```

**PUT** - Update data:
```shepthon
endpoint PUT "/todos/:id" (title: string, done: bool) -> Todo {
  let todo = db.Todo.update(:id, { title, done })
  return todo
}
```

**DELETE** - Remove data:
```shepthon
endpoint DELETE "/todos/:id" {
  db.Todo.delete(:id)
  return { success: true }
}
```

### Path Parameters

Use `:paramName` in the path:

```shepthon
endpoint GET "/users/:userId/posts/:postId" -> Post {
  let post = db.Post.findOne(:postId)
  return post
}
```

### Request Body Parameters

Specify after the path:

```shepthon
endpoint POST "/todos" (title: string, priority: int) -> Todo {
  let todo = db.Todo.create({ title, priority, done: false })
  return todo
}
```

### Return Types

- `ModelName` - Single object
- `[ModelName]` - Array of objects
- `{ success: bool }` - Custom response
- No return type - Void response

---

## Jobs

Background tasks that run on a schedule:

```shepthon
job "jobName" every duration {
  // logic
}
```

### Durations

- `every 5 minutes`
- `every 1 hour`
- `every 1 day`
- `every 1 week`

### Example

```shepthon
job "cleanup-completed" every 1 day {
  let completed = db.Todo.find({ done: true })
  for todo in completed {
    db.Todo.delete(todo.id)
  }
}

job "send-reminders" every 1 hour {
  let reminders = db.Reminder.find({ time <= now(), sent: false })
  for reminder in reminders {
    // Send notification logic
    db.Reminder.update(reminder.id, { sent: true })
  }
}
```

---

## Database Operations

### Find Operations

**Find All:**
```shepthon
let all = db.Todo.findAll()
```

**Find One by ID:**
```shepthon
let todo = db.Todo.findOne(123)
```

**Find with Filter:**
```shepthon
let pending = db.Todo.find({ done: false })
let highPriority = db.Todo.find({ priority >= 3 })
```

### Create Operations

**Create Single:**
```shepthon
let todo = db.Todo.create({
  title: "New task",
  done: false,
  priority: 1
})
```

### Update Operations

**Update by ID:**
```shepthon
let updated = db.Todo.update(123, {
  done: true,
  priority: 2
})
```

### Delete Operations

**Delete by ID:**
```shepthon
db.Todo.delete(123)
```

**Delete with Filter:**
```shepthon
db.Todo.delete({ done: true })
```

---

## Complete ShepThon Example

```shepthon
app MyTodos {

  model Todo {
    id: id
    title: string
    done: bool = false
    priority: int = 1
    createdAt: datetime = now
  }

  // List all todos
  endpoint GET "/todos" -> [Todo] {
    return db.Todo.findAll()
  }

  // Get one todo
  endpoint GET "/todos/:id" -> Todo {
    return db.Todo.findOne(:id)
  }

  // Create new todo
  endpoint POST "/todos" (title: string) -> Todo {
    let todo = db.Todo.create({ 
      title, 
      done: false,
      priority: 1 
    })
    return todo
  }

  // Update todo
  endpoint PUT "/todos/:id" (title: string, done: bool) -> Todo {
    let todo = db.Todo.update(:id, { title, done })
    return todo
  }

  // Delete todo
  endpoint DELETE "/todos/:id" {
    db.Todo.delete(:id)
    return { success: true }
  }

  // Background job: Clean up old completed tasks
  job "cleanup" every 1 day {
    let old = db.Todo.find({ 
      done: true,
      createdAt < (now() - 7 days)
    })
    for todo in old {
      db.Todo.delete(todo.id)
    }
  }

  // Background job: Auto-complete expired tasks
  job "auto-complete" every 1 hour {
    let expired = db.Todo.find({ 
      done: false,
      createdAt < (now() - 30 days)
    })
    for todo in expired {
      db.Todo.update(todo.id, { done: true })
    }
  }
}
```

---

## Comments

Both languages support comments:

```sheplang
# This is a comment in ShepLang
data Todo:  # inline comment
  fields:
    title: text  # field comment
```

```shepthon
// This is a comment in ShepThon
model Todo {  // inline comment
  id: id  // field comment
}
```

---

## Reserved Keywords

### ShepLang
- `app`, `data`, `view`, `action`
- `fields`, `rules`, `list`, `button`, `show`
- `add`, `with`, `call`, `GET`, `POST`, `PUT`, `DELETE`
- `text`, `number`, `yes`, `no`, `date`, `time`, `datetime`, `id`

### ShepThon
- `app`, `model`, `endpoint`, `job`
- `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- `return`, `let`, `for`, `in`, `if`, `else`
- `db`, `findAll`, `findOne`, `find`, `create`, `update`, `delete`
- `id`, `string`, `text`, `int`, `number`, `float`, `bool`, `datetime`, `date`, `time`
- `every`, `minutes`, `hour`, `day`, `week`, `now`

---

## Common Patterns

### CRUD Operations

**ShepLang Actions:**
```sheplang
action Create(title):
  call POST "/items"(title)
  show List

action Read:
  call GET "/items"
  show List

action Update(id, title):
  call PUT "/items/:id"(title)
  show List

action Delete(id):
  call DELETE "/items/:id"
  show List
```

**ShepThon Endpoints:**
```shepthon
endpoint POST "/items" (title: string) -> Item {
  return db.Item.create({ title })
}

endpoint GET "/items" -> [Item] {
  return db.Item.findAll()
}

endpoint PUT "/items/:id" (title: string) -> Item {
  return db.Item.update(:id, { title })
}

endpoint DELETE "/items/:id" {
  db.Item.delete(:id)
  return { success: true }
}
```

---

## Best Practices

### File Naming
- Frontend: `appname.shep`
- Backend: `appname.shepthon`
- **Must have same base name!**

### Model Naming
- Use PascalCase: `Todo`, `UserProfile`, `BlogPost`
- Keep singular: `Todo` not `Todos`
- Must match between frontend and backend

### Endpoint Paths
- Use lowercase: `/todos` not `/Todos`
- Use plural for collections: `/todos` not `/todo`
- Use `:id` for parameters: `/todos/:id`

### Field Names
- Use camelCase: `firstName`, `isCompleted`
- Be consistent between frontend and backend
- Use descriptive names

---

## Need Help?

- [Getting Started Guide](./GETTING_STARTED.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [AI Best Practices](./AI_BEST_PRACTICES.md)
- [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)

---

**Reference Complete! 🐑📚**
