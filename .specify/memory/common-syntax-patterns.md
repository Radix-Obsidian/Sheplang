# Common Syntax Patterns & Gotchas
**Quick Reference for Frequently Used Patterns**

---

## 🎯 ShepLang Common Patterns

### ✅ Correct Action Syntax
```sheplang
// ✅ Use curly braces for actions
action CreateTask(title) {
  add Task with title
  show Dashboard
}

// ❌ WRONG - Using colons
action CreateTask(title):
  add Task with title
  show Dashboard
```

### ✅ Correct View Syntax
```sheplang
// ✅ Simple view
view Dashboard {
  list Task
  button "New Task" -> CreateTask
}

// ✅ View with inputs
view TaskForm {
  input "Title" -> title
  input "Description" -> description
  button "Save" -> CreateTask
}
```

### ✅ Correct API Call Syntax
```sheplang
// ✅ POST with parameters
action CreateTask(title) {
  call POST "/tasks" with title
  show Dashboard
}

// ✅ GET without parameters
action LoadTasks() {
  call GET "/tasks"
  show Dashboard
}

// ✅ Load into variable
action LoadTasks() {
  load GET "/tasks" into tasks
  show Dashboard
}

// ✅ Multiple parameters
action CreateTask(title, priority) {
  call POST "/tasks" with title, priority
  show Dashboard
}
```

### ✅ Correct State Machine Syntax
```sheplang
// ✅ State machine with clear progression
data Order {
  fields: {
    title: text
    amount: number
  }
  states: pending -> processing -> shipped -> delivered
}
```

### ✅ Correct Background Job Syntax
```sheplang
// ✅ Daily job
job DailyReport {
  schedule: daily at "9am"
  action {
    ~ "Generate daily report"
  }
}

// ✅ Interval job
job ProcessQueue {
  schedule: every 30 minutes
  action {
    ~ "Process pending items"
  }
}
```

---

## 🎯 ShepThon Common Patterns

### ✅ Correct Model Syntax
```shepthon
// ✅ Basic model
model User {
  id: string
  name: string
  email: string
  createdAt: datetime
}

// ✅ Model with optional field
model User {
  id: string
  name: string
  email: string?
  createdAt: datetime
}

// ✅ Model with enum
model Task {
  id: string
  title: string
  status: TaskStatus
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

### ✅ Correct API Endpoint Syntax
```shepthon
// ✅ CRUD operations
GET /users -> db.all("users")
GET /users/:id -> db.find("users", id)
POST /users -> db.create("users", body)
PUT /users/:id -> db.update("users", id, body)
DELETE /users/:id -> db.remove("users", id)

// ✅ Custom endpoints
GET /users/search -> db.findWhere("users", { email: query.email })
GET /users/:id/posts -> db.findWhere("posts", { authorId: id })
```

### ✅ Correct Validation Syntax
```shepthon
// ✅ Field validation
model User {
  id: string
  name: string { min: 2, max: 50 }
  email: string { format: "email" }
  age: number { min: 18, max: 120 }
}

// ✅ Unique constraints
model User {
  id: string
  email: string { unique: true }
  username: string { unique: true }
}
```

---

## 🚨 Common Gotchas & Mistakes

### ShepLang Gotchas

#### 1. Action Syntax - Curly Braces vs Colons
```sheplang
// ❌ WRONG
action CreateTask(title):
  add Task with title
  show Dashboard

// ✅ CORRECT
action CreateTask(title) {
  add Task with title
  show Dashboard
}
```

#### 2. API Call Parameter Syntax
```sheplang
// ❌ WRONG - Missing 'with'
action CreateTask(title) {
  call POST "/tasks" title
}

// ✅ CORRECT
action CreateTask(title) {
  call POST "/tasks" with title
}
```

#### 3. Load Statement Syntax
```sheplang
// ❌ WRONG - Missing 'into'
action LoadTasks() {
  load GET "/tasks" tasks
}

// ✅ CORRECT
action LoadTasks() {
  load GET "/tasks" into tasks
}
```

#### 4. State Machine Syntax
```sheplang
// ❌ WRONG - States in wrong section
data Order {
  fields: {
    title: text
  }
}
states: pending -> processing  // ❌ Should be inside data

// ✅ CORRECT
data Order {
  fields: {
    title: text
  }
  states: pending -> processing
}
```

#### 5. Job Syntax
```sheplang
// ❌ WRONG - Action missing curly braces
job DailyReport {
  schedule: daily at "9am"
  action ~ "Generate report"  // ❌ Should be in braces
}

// ✅ CORRECT
job DailyReport {
  schedule: daily at "9am"
  action {
    ~ "Generate report"
  }
}
```

### ShepThon Gotchas

#### 1. Model Field Types
```shepthon
// ❌ WRONG - Using ShepLang types
model User {
  id: string
  name: text  // ❌ Should be string
  age: number
}

// ✅ CORRECT
model User {
  id: string
  name: string
  age: number
}
```

#### 2. API Endpoint Syntax
```shepthon
// ❌ WRONG - Missing arrow
GET /users db.all("users")

// ✅ CORRECT
GET /users -> db.all("users")
```

#### 3. Body Parameter
```shepthon
// ❌ WRONG - Missing body parameter
POST /users -> db.create("users")

// ✅ CORRECT
POST /users -> db.create("users", body)
```

#### 4. Enum Syntax
```shepthon
// ❌ WRONG - Enum values in quotes
enum Status {
  "TODO"
  "IN_PROGRESS"
}

// ✅ CORRECT
enum Status {
  TODO
  IN_PROGRESS
}
```

---

## 🔧 Quick Fix Patterns

### Fixing Action Syntax Errors
```sheplang
// If you see this error:
// "Failed to parse ShepLang code"

// Check these things:
// 1. Actions use curly braces, not colons
action Name(params) {
  // statements
}

// 2. API calls use 'with' for parameters
call POST "/endpoint" with param1, param2

// 3. Load statements use 'into' for variables
load GET "/endpoint" into variableName
```

### Fixing Model Syntax Errors
```shepthon
// If you see this error:
// "Type mismatch" or "Field not found"

// Check these things:
// 1. Use correct types (string, number, boolean)
model User {
  name: string      // ✅ Not text
  age: number
  active: boolean   // ✅ Not yes/no
}

// 2. API endpoints use '->' and 'body'
GET /users -> db.all("users")
POST /users -> db.create("users", body)
```

### Fixing API Integration Errors
```sheplang
// Frontend
action CreateTask(title) {
  call POST "/tasks" with title
  show Dashboard
}

// Backend
POST /tasks -> db.create("tasks", body)

// Common mismatches:
// 1. Path mismatch: "/task" vs "/tasks"
// 2. Method mismatch: POST vs GET
// 3. Parameter mismatch: missing 'with' clause
```

---

## 🎯 Template Patterns

### Basic CRUD Template
```sheplang
app MyApp {
  data Item {
    fields: {
      name: text
      description: text
    }
  }
  
  view List {
    list Item
    button "New" -> CreateItem
  }
  
  view Form {
    input "Name" -> name
    input "Description" -> description
    button "Save" -> CreateItem
  }
  
  action CreateItem(name, description) {
    call POST "/items" with name, description
    show List
  }
}
```

```shepthon
model Item {
  id: string
  name: string
  description: string
  createdAt: datetime
}

GET /items -> db.all("items")
POST /items -> db.create("items", body)
PUT /items/:id -> db.update("items", id, body)
DELETE /items/:id -> db.remove("items", id)
```

### State Machine Template
```sheplang
app WorkflowApp {
  data Ticket {
    fields: {
      title: text
      assignee: text
    }
    states: open -> in_progress -> resolved
  }
  
  view Dashboard {
    list Ticket
    button "New Ticket" -> CreateTicket
  }
  
  action CreateTicket(title) {
    add Ticket with title, assignee="unassigned"
    show Dashboard
  }
  
  action AssignTicket(ticketId, assignee) {
    call POST "/tickets/:id/assign" with ticketId, assignee
    show Dashboard
  }
}
```

```shepthon
model Ticket {
  id: string
  title: string
  assignee: string
  status: TicketStatus
  createdAt: datetime
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}

GET /tickets -> db.all("tickets")
POST /tickets -> db.create("tickets", body)
POST /tickets/:id/assign -> db.update("tickets", id, { 
  status: "IN_PROGRESS", 
  assignee: body.assignee 
})
```

### Background Job Template
```sheplang
app ScheduledApp {
  data Report {
    fields: {
      title: text
      content: text
      generatedAt: datetime
    }
  }
  
  job GenerateDailyReport {
    schedule: daily at "9am"
    action {
      call POST "/reports/generate"
    }
  }
  
  view Reports {
    list Report
  }
}
```

```shepthon
model Report {
  id: string
  title: string
  content: string
  generatedAt: datetime
}

GET /reports -> db.all("reports")
POST /reports/generate -> db.create("reports", {
  title: "Daily Report",
  content: "Generated content",
  generatedAt: "now"
})
```

---

## 📋 Debugging Checklist

### Before Running Tests
- [ ] Actions use curly braces `{ }` not colons `:`
- [ ] API calls use `with` for parameters
- [ ] Load statements use `into` for variables
- [ ] State machines defined inside `data` blocks
- [ ] Jobs use `action { }` with curly braces
- [ ] Model fields use correct types (`string`, `number`, `boolean`)
- [ ] API endpoints use `->` arrow syntax
- [ ] POST/PUT endpoints include `body` parameter

### Common Error Messages
```
"Failed to parse ShepLang code"
→ Check action syntax (curly braces vs colons)

"Type mismatch"
→ Check model field types vs API parameters

"Endpoint not found"
→ Check API path matches frontend call

"Missing parameter"
→ Check API call includes all required parameters
```

### Quick Fixes
1. **Replace colons with curly braces in actions**
2. **Add 'with' to API calls with parameters**
3. **Add 'into' to load statements**
4. **Use correct model field types**
5. **Include 'body' in POST/PUT endpoints**

---

**💡 Remember**: Most syntax errors are due to mixing up ShepLang and ShepThon syntax patterns. Keep this reference handy!

---

*Last Updated: November 22, 2025*  
*Version: 1.0 (Common Patterns & Gotchas)*
