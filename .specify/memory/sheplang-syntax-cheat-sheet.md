# ShepLang Syntax & Features Cheat Sheet
**The AI-Native Full-Stack Programming Language**

---

## 🎯 Quick Reference

### Core Philosophy
- **AI-Optimized**: Small, deterministic grammar designed for AI code generation
- **Human-Readable**: Non-technical founders can read and understand
- **Type-Safe**: 100% inferred types with compile-time verification
- **Full-Stack**: Frontend UI + Backend API in one language

---

## 📚 Basic Structure

### Application Declaration
```sheplang
app AppName {
  // data models, views, actions, jobs, workflows
}
```

### Data Models
```sheplang
data ModelName {
  fields: {
    fieldName: text
    anotherField: number
    optionalField: text?
  }
  // Phase 2: State Machines
  states: state1 -> state2 -> state3
}
```

### Views (UI Screens)
```sheplang
view ViewName {
  list ModelName
  button "Button Text" -> ActionName
  input "Label" -> fieldName
}
```

### Actions (Operations)
```sheplang
action ActionName(param1, param2) {
  add ModelName with param1, param2
  show ViewName
}
```

---

## 🔄 Phase 2 Features

### State Machines
```sheplang
data Order {
  fields: {
    title: text
    amount: number
  }
  states: pending -> processing -> shipped -> delivered
}
```

### Background Jobs
```sheplang
job JobName {
  schedule: daily at "9am"
  // or: every 30 minutes
  // or: weekly on "Monday"
  action {
    ~ "Description of what this job does"
  }
}
```

### Job Triggers (Advanced)
```sheplang
job ProcessOrder {
  trigger: on Order.status change to "processing"
  delay: after 5 minutes
  action {
    ~ "Process the order"
  }
}
```

---

## 🌐 Phase 3 API Integration

### API Calls (CallStmt)
```sheplang
action createOrder(title, amount) {
  call POST "/orders" with title, amount
  show Dashboard
}

action deleteOrder(orderId) {
  call DELETE "/orders/:id" with orderId
  show OrdersList
}

action fetchOrders() {
  call GET "/orders"
  show OrdersList
}
```

### Data Loading (LoadStmt)
```sheplang
action loadDashboard() {
  load GET "/orders" into orders
  load GET "/users" into users
  show Dashboard
}
```

### API Methods Supported
- `GET` - Data retrieval (no body)
- `POST` - Create data (with body)
- `PUT` - Full update (with body)
- `PATCH` - Partial update (with body)
- `DELETE` - Remove data (no body)

---

## 🎨 Data Types

### Basic Types
```sheplang
text        // String values
number      // Numeric values
yes/no      // Boolean values
```

### Advanced Types
```sheplang
text?       // Optional text field
number?     // Optional number field
```

---

## 🔧 Control Flow

### If Statements
```sheplang
action processOrder(orderId) {
  if orderId != "" {
    call POST "/process" with orderId
  }
  show Orders
}
```

### Raw Operations
```sheplang
action customLogic() {
  ~ "Custom JavaScript code here"
  show Dashboard
}
```

---

## 📱 UI Components

### View Elements
```sheplang
view Dashboard {
  list Order                    // Display list of orders
  button "New Order" -> CreateOrder  // Button that triggers action
  input "Search" -> searchQuery  // Input field
}
```

### Navigation
```sheplang
action goToOrders() {
  show OrdersList  // Navigate to view
}
```

---

## 🔗 Integration Patterns

### CRUD Operations
```sheplang
// Create
action createOrder(title) {
  call POST "/orders" with title
  show OrdersList
}

// Read
action loadOrders() {
  load GET "/orders" into orders
  show OrdersList
}

// Update
action updateOrder(id, title) {
  call PUT "/orders/:id" with id, title
  show OrdersList
}

// Delete
action deleteOrder(id) {
  call DELETE "/orders/:id" with id
  show OrdersList
}
```

---

## 🏗️ Project Structure

Generated Files:
```
actions/
  ActionName.ts          // Generated action functions
api/
  routes/
    modelname.ts         // API endpoints
  prisma/
    schema.prisma        // Database schema
components/
  ViewName.tsx          // React components
models/
  ModelName.ts          // TypeScript interfaces
```

---

## 🚀 Best Practices

### Naming Conventions
- **Apps**: PascalCase (e.g., `OrderManagementSystem`)
- **Models**: PascalCase (e.g., `Order`, `Customer`)
- **Views**: PascalCase (e.g., `Dashboard`, `OrdersList`)
- **Actions**: PascalCase (e.g., `CreateOrder`, `LoadOrders`)
- **Fields**: camelCase (e.g., `firstName`, `orderDate`)

### State Machine Patterns
```sheplang
// Good: Clear state progression
states: draft -> review -> approved -> published

// Good: Business logic states
states: pending -> processing -> shipped -> delivered

// Avoid: Unclear states
states: state1 -> state2 -> state3
```

### API Design Patterns
```sheplang
// RESTful endpoints
call POST "/orders"        // Create
call GET "/orders"         // List all
call GET "/orders/:id"     // Get one
call PUT "/orders/:id"     // Update
call DELETE "/orders/:id"  // Delete

// Data loading
load GET "/orders" into orders
load GET "/users" into users
```

---

## ⚡ Quick Start Template

```sheplang
app MyApp {
  data Task {
    fields: {
      title: text
      completed: yes/no
    }
    states: todo -> in_progress -> done
  }
  
  view Dashboard {
    list Task
    button "New Task" -> CreateTask
  }
  
  view TaskForm {
    input "Title" -> title
    button "Save" -> CreateTask
  }
  
  action CreateTask(title) {
    add Task with title, completed=no
    show Dashboard
  }
  
  action CompleteTask(taskId) {
    call POST "/tasks/:id/complete" with taskId
    show Dashboard
  }
  
  job DailyCleanup {
    schedule: daily at "11pm"
    action {
      ~ "Clean up old completed tasks"
    }
  }
}
```

---

## 🧩 Advanced Features

### Workflows (Future)
```sheplang
workflow OrderProcessing {
  on pending {
    event start_processing -> processing
  }
  on processing {
    event complete_order -> shipped
  }
}
```

### Real-time (Future)
```sheplang
subscribe OrderStatus {
  on Order.status change {
    refresh Dashboard
  }
}
```

---

## 🔍 Debugging Tips

### Common Issues
1. **Syntax Errors**: Check curly braces vs colons in actions
2. **Type Errors**: Ensure field types match data model
3. **API Errors**: Verify endpoint paths match backend

### Generated Code Inspection
- Check `actions/ActionName.ts` for generated functions
- Verify `api/routes/modelname.ts` for API endpoints
- Review `components/ViewName.tsx` for UI components

---

## 📖 Reference

### Grammar Rules (Simplified)
```
app        -> 'app' name '{' content* '}'
data       -> 'data' name '{' fields ('states' states)? '}'
view       -> 'view' name '{' elements* '}'
action     -> 'action' name '(' params? ')' '{' statements* '}'
job        -> 'job' name '{' (schedule | trigger)? 'action' '{' raw '}' '}'
call       -> 'call' method path ('with' fields)?
load       -> 'load' method path 'into' variable
add        -> 'add' model 'with' fields
show       -> 'show' view
raw        -> '~' string
```

### Type System
- **Inference**: All types inferred from usage
- **Safety**: Compile-time type checking
- **Generation**: TypeScript types auto-generated

---

**💡 Remember**: ShepLang is designed to be written by AI, read by humans, and verified by the compiler. Keep it simple, clear, and type-safe.

---

*Last Updated: November 22, 2025*  
*Version: 3.0 (Phase 3 API Integration)*
