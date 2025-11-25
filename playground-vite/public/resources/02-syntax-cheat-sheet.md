# ShepLang Playground Syntax Cheat Sheet
**Your Complete Guide to Building Apps in Minutes**

---

## 🎯 Quick Reference

### Core Philosophy
- **🎨 AI-Optimized**: Small grammar designed for AI code generation
- **👥 Human-Readable**: Non-technical founders can read and understand
- **✅ Type-Safe**: 100% inferred types with compile-time verification
- **🌐 Full-Stack Ready**: Frontend here, backend in VS Code extension

---

## 📚 Basic Structure (🎨 Playground Ready)

### Application Declaration
```sheplang
app AppName {
  // data models, views, actions go here
}
```
**✅ Try this in playground now!**

### Data Models
```sheplang
data ModelName {
  fields: {
    fieldName: text
    anotherField: number
    optionalField: text?
  }
}
```
**✅ Try this in playground now!**

### Views (UI Screens)
```sheplang
view ViewName {
  list ModelName
  button "Button Text" -> ActionName
  input "Label" -> fieldName
}
```
**✅ Try this in playground now!**

### Actions (Operations)
```sheplang
action ActionName(param1, param2) {
  add ModelName with param1, param2
  show ViewName
}
```
**✅ Try this in playground now!**

---

## 🎨 Data Types (🎨 Playground Ready)

### Basic Types
```sheplang
text        // String values like "Hello World"
number      // Numbers like 42, 3.14
yes/no      // Boolean values true/false
```

### Advanced Types
```sheplang
text?       // Optional text field
number?     // Optional number field
```

### Specialized Types
```sheplang
id          // Unique identifiers
date        // Date values
email       // Email addresses
money       // Currency values
image       // Image files
file        // File uploads
```

**✅ All types work in playground!**

---

## 🔧 Control Flow (🎨 Playground Ready)

### If Statements
```sheplang
action processOrder(orderId) {
  if orderId != "" {
    add Order with orderId
  }
  show Orders
}
```
**✅ Try this in playground now!**

### Raw Operations
```sheplang
action customLogic() {
  ~ "Custom JavaScript code here"
  show Dashboard
}
```
**✅ Try this in playground now!**

---

## 📱 UI Components (🎨 Playground Ready)

### View Elements
```sheplang
view Dashboard {
  list Order                    // Display list of items
  button "New Order" -> CreateOrder  // Clickable button
  input "Search" -> searchQuery  // Text input field
}
```

### Navigation
```sheplang
action goToOrders() {
  show OrdersList  // Navigate to another view
}
```

**✅ All UI components work in playground!**

---

## 🚀 Extension-Only Features (Coming Soon in VS Code)

### State Machines 🚀
```sheplang
data Order {
  fields: {
    title: text
    amount: number
  }
  states: pending -> processing -> shipped -> delivered
}
```
**🔒 Unlock in VS Code extension**

### Background Jobs 🚀
```sheplang
job DailyReport {
  schedule: daily at "9am"
  action {
    ~ "Generate daily sales report"
  }
}
```
**🔒 Unlock in VS Code extension**

### API Calls (Full-Stack) 🚀
```sheplang
action createOrder(title, amount) {
  call POST "/orders" with title, amount
  show Dashboard
}
```
**🔒 Unlock in VS Code extension**

### Data Loading (Full-Stack) 🚀
```sheplang
action loadDashboard() {
  load GET "/orders" into orders
  show Dashboard
}
```
**🔒 Unlock in VS Code extension**

---

## 🌟 Playground Examples (Try These Now!)

### Simple Todo App
```sheplang
app TodoApp {
  data Task {
    fields: {
      title: text
      completed: yes/no
    }
  }
  
  view Dashboard {
    list Task
    button "New Task" -> TaskForm
  }
  
  view TaskForm {
    input "Task title" -> title
    button "Save" -> CreateTask
  }
  
  action CreateTask(title) {
    add Task with title, completed=no
    show Dashboard
  }
}
```
**✅ Copy and paste this into the playground!**

### Contact Manager
```sheplang
app ContactManager {
  data Contact {
    fields: {
      name: text
      email: email
      phone: text
    }
  }
  
  view ContactsList {
    list Contact
    button "Add Contact" -> ContactForm
  }
  
  view ContactForm {
    input "Name" -> name
    input "Email" -> email
    input "Phone" -> phone
    button "Save" -> CreateContact
  }
  
  action CreateContact(name, email, phone) {
    add Contact with name, email, phone
    show ContactsList
  }
}
```
**✅ Try this advanced example!**

---

## 🔍 Common Patterns (🎨 Playground Ready)

### CRUD Operations
```sheplang
// Create
action createItem(name) {
  add Item with name
  show ItemsList
}

// Read (implicit in views)
view ItemsList {
  list Item
}

// Update
action updateItem(id, newName) {
  ~ "Update logic here"
  show ItemsList
}

// Delete
action deleteItem(id) {
  ~ "Delete logic here"
  show ItemsList
}
```

### Form Handling
```sheplang
view UserForm {
  input "First Name" -> firstName
  input "Last Name" -> lastName
  input "Email" -> email
  button "Submit" -> CreateUser
}

action CreateUser(firstName, lastName, email) {
  add User with firstName, lastName, email
  show UsersList
}
```

---

## 🏗️ Naming Conventions (Best Practices)

### Recommended Patterns
- **Apps**: PascalCase (e.g., `OrderManagementSystem`)
- **Models**: PascalCase (e.g., `Order`, `Customer`)
- **Views**: PascalCase (e.g., `Dashboard`, `OrdersList`)
- **Actions**: PascalCase (e.g., `CreateOrder`, `LoadUsers`)
- **Fields**: camelCase (e.g., `firstName`, `orderDate`)

### Why This Matters
Consistent naming makes your code:
- ✅ More readable for team members
- ✅ Easier for AI to understand
- ✅ Simpler to maintain and scale

---

## 🚀 Ready for More Power?

You've mastered the playground! But what if you could:

### 🔓 Unlock in VS Code Extension:
- 🗄️ **Real Databases** - Connect to PostgreSQL, MongoDB, Supabase
- 🎨 **Figma Import** - Convert designs directly to ShepLang
- 📁 **GitHub Import** - Convert existing projects to ShepLang
- 🤖 **AI-Powered Generation** - Let AI write your entire application
- ✅ **Full Verification** - Catch bugs before deployment
- 🌐 **Full-Stack** - Frontend + Backend + Database in one language

### 🎉 Playground Limitations:
- Frontend-only (no backend/database)
- Manual coding only (no AI assistance)
- No imports from other tools
- Basic verification only

---

## 🎯 Your Next Steps

### Keep Exploring (Playground)
- Try the examples above
- Experiment with different data types
- Build your own custom app

### Level Up (VS Code Extension)
**👉 [Download ShepLang VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)**

### Join the Community
**⭐ [Star Our GitHub](https://github.com/Radix-Obsidian/Sheplang-BobaScript)**
**💬 [Join Discord Community](https://discord.gg/sheplang)**

---

## 💡 Pro Tips

1. **Start Simple**: Begin with basic data models and views
2. **Test Often**: Use the playground preview to see changes instantly
3. **Follow Patterns**: Use the CRUD patterns above for consistency
4. **Think Business**: Focus on what you want to accomplish, not technical details

---

## 📖 Legend

- **🎨 Playground Ready** - Works right now in the playground
- **🚀 Extension Only** - Requires VS Code extension for full functionality
- **🔒 Unlock in Extension** - Premium feature available in VS Code
- **✅ Try this now** - Copy-paste ready example

---

**💡 Remember**: ShepLang is designed to be written by AI, read by humans, and verified by the compiler. The playground is your training ground - the extension is your production powerhouse.

---

*Ready to build something amazing? Start with the examples above!*

**🌟 [Back to Quick Start](./01-quick-start.md) | 🚀 [Compare Playground vs Extension](./03-playground-vs-extension.md) | 📱 [Migration Guide](./05-migration-guide.md)**
