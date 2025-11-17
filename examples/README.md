# 🎓 ShepLang Examples - Progressive Tutorial Series

Welcome to the **ShepLang Learning Path**! These examples are designed to take you from zero to full-stack developer in under 1 hour.

---

## 🗺️ **Learning Path**

Each example builds on the previous one, introducing new concepts while reinforcing what you've learned.

| # | Example | Time | Concepts | Status |
|---|---------|------|----------|--------|
| **1** | [Hello World](#1-hello-world-5-minutes) | 5 min | Basic structure, data, views, actions | 🟢 Ready |
| **2** | [Counter](#2-counter-10-minutes) | 10 min | Number types, multiple actions, state | 🟢 Ready |
| **3** | [Contact List](#3-contact-list-20-minutes) | 20 min | Multiple fields, validation, CRUD | 🟢 Ready |
| **4** | [Dog Reminders](#4-dog-reminders-30-minutes) | 30 min | DateTime, background jobs, automation | 🟢 Ready |
| **5** | [Todo List](#5-todo-list-reference) | Reference | Complete CRUD, edit functionality | 🟢 Working |

**Total Learning Time:** ~60 minutes  
**Prerequisite:** VS Code with ShepLang extension installed

---

## 📚 **The Examples**

### **1. Hello World** (5 minutes)

**File:** `01-hello-world.shep` + `01-hello-world.shepthon`  
**[Read Full Tutorial →](./01-hello-world.README.md)**

The simplest possible ShepLang app. Perfect for first-time users!

**What You'll Learn:**
- ✅ App structure basics
- ✅ Creating data models
- ✅ Building views with buttons
- ✅ Writing simple actions

**Try It:**
```bash
# Open in VS Code
code 01-hello-world.shep

# Press Ctrl+Shift+P to preview
# Click "Say Hello" button
```

**Key Code:**
```sheplang
action SayHello:
  add Message with text="Hello from ShepLang! 🐑"
  show Welcome
```

---

### **2. Counter** (10 minutes)

**File:** `02-counter.shep` + `02-counter.shepthon`  
**[Read Full Tutorial →](./02-counter.README.md)**

Learn state management with a simple counter app.

**What You'll Learn:**
- ✅ Number data types
- ✅ Multiple buttons and actions
- ✅ Updating values
- ✅ Building interactive UIs

**Try It:**
```bash
code 02-counter.shep
# Click Increment/Decrement/Reset buttons
# See your counter history grow!
```

**Key Code:**
```sheplang
action Increment:
  add Counter with label="Count", value=1
  show Dashboard
```

---

### **3. Contact List** (20 minutes)

**File:** `03-contact-list.shep` + `03-contact-list.shepthon`  
**[Read Full Tutorial →](./03-contact-list.README.md)**

Build a mini-CRM with multiple fields and validation.

**What You'll Learn:**
- ✅ Working with multiple fields
- ✅ Data validation rules
- ✅ Edit and delete functionality
- ✅ Real-world application structure

**Try It:**
```bash
code 03-contact-list.shep
# Add contacts with name, email, phone, notes
# Edit with ✏️ button
# Delete with 🗑️ button
```

**Key Code:**
```sheplang
data Contact:
  fields:
    name: text
    email: text
    phone: text
    notes: text
  rules:
    - "name is required"
    - "email must be valid"
```

---

### **4. Dog Reminders** (30 minutes)

**File:** `04-dog-reminders.shep` + `04-dog-reminders.shepthon`  
**[Read Full Tutorial →](./04-dog-reminders.README.md)**

Advanced example with date/time fields and background jobs!

**What You'll Learn:**
- ✅ DateTime field types
- ✅ Creating background jobs
- ✅ Scheduling automated tasks
- ✅ Time-based logic
- ✅ Production-ready features

**Try It:**
```bash
code 04-dog-reminders.shep
# Add reminders with future times
# Wait 5 minutes past reminder time
# Watch them auto-mark as done!
```

**Key Code:**
```shepthon
job "mark-due-as-done" every 5 minutes {
  const now = new Date()
  const dueReminders = db.reminders.findMany({
    where: { time: { lte: now }, done: false }
  })
  for (const reminder of dueReminders) {
    db.reminders.update({
      where: { id: reminder.id },
      data: { done: true }
    })
  }
}
```

---

### **5. Todo List** (Reference)

**File:** `todo.shep` + `todo.shepthon`  
**Status:** Fully working production example

The original working example with complete CRUD operations.

**What It Demonstrates:**
- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Edit functionality with VS Code input boxes
- ✅ Toggle status by clicking items
- ✅ Multiple endpoints (GET, POST, PUT, DELETE)
- ✅ Production-ready structure

**Try It:**
```bash
code todo.shep
# Add tasks via input box
# Edit tasks with ✏️ button
# Mark done by clicking task
# Delete with 🗑️ button
```

---

## 🎯 **Learning Objectives**

### By the End of This Series, You'll Know:

**Frontend (ShepLang):**
- ✅ Declaring apps
- ✅ Defining data models
- ✅ Creating views (list, button)
- ✅ Writing actions (add, show)
- ✅ All field types (text, number, yes/no, datetime)
- ✅ Validation rules

**Backend (ShepThon):**
- ✅ Defining models
- ✅ Creating endpoints (GET, POST, PUT, DELETE)
- ✅ Database operations (findMany, create, update, delete)
- ✅ Background jobs
- ✅ Time-based logic
- ✅ Request handling

**VS Code Extension:**
- ✅ Live preview panel
- ✅ Keyboard shortcuts
- ✅ Error recovery
- ✅ Output logging
- ✅ Backend integration

---

## 🚀 **Quick Start Guide**

### Prerequisites

1. **Install VS Code** (v1.85.0+)
2. **Install ShepLang Extension**
   ```bash
   # From VSIX
   code --install-extension sheplang-0.1.0.vsix
   ```

### Run Your First Example

```bash
# 1. Clone the repository
git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript
cd Sheplang-BobaScript

# 2. Open examples folder in VS Code
code examples/

# 3. Open 01-hello-world.shep

# 4. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
#    Preview opens automatically!

# 5. Click buttons and see it work!
```

---

## 🎓 **Recommended Learning Path**

### For Complete Beginners

**Week 1:**
- Day 1: Example 1 (Hello World) - 5 min
- Day 2: Example 2 (Counter) - 10 min
- Day 3: Review Examples 1-2, try modifications

**Week 2:**
- Day 4: Example 3 (Contact List) - 20 min
- Day 5: Example 4 (Dog Reminders) - 30 min
- Day 6: Review all examples

**Week 3:**
- Day 7: Build your own app from scratch!

### For Experienced Developers

**Day 1:** Complete all examples (60 min)  
**Day 2:** Build production app

### For AI-Assisted Learning

Use [AI Best Practices Guide](../extension/AI_BEST_PRACTICES.md) with these examples:
- Ask AI to explain each example
- Have AI generate variations
- Use AI to troubleshoot issues

---

## 📖 **Additional Resources**

### Documentation
- [Getting Started Guide](../extension/GETTING_STARTED.md)
- [Language Reference](../extension/LANGUAGE_REFERENCE.md)
- [Troubleshooting Guide](../extension/TROUBLESHOOTING.md)
- [AI Best Practices](../extension/AI_BEST_PRACTICES.md)

### Extension Commands
- `Ctrl+Shift+P` - Show Preview
- `Ctrl+Shift+R` - Restart Backend
- `Ctrl+Shift+L` - Show Output Logs

### Getting Help
- [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)
- [Documentation](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- Press `Ctrl+Shift+L` to view logs

---

## 🔄 **Example Progression**

```
Example 1: Hello World
    ↓
  Adds: Basic structure
    ↓
Example 2: Counter
    ↓
  Adds: Number types, multiple actions
    ↓
Example 3: Contact List
    ↓
  Adds: Multiple fields, validation
    ↓
Example 4: Dog Reminders
    ↓
  Adds: DateTime, background jobs
    ↓
Example 5: Todo List (Reference)
    ↓
  Shows: Production-ready CRUD
```

---

## 💡 **Tips for Success**

### 1. **Follow the Order**
Start with Example 1, don't skip ahead. Each builds on the previous.

### 2. **Try Modifications**
Each example includes "Try These Modifications" challenges. Do them!

### 3. **Use the Preview**
The live preview is your best friend. See changes instantly.

### 4. **Read the Code**
Study the working examples. Understand why they work.

### 5. **Check the Logs**
Press `Ctrl+Shift+L` when things don't work. Logs explain everything.

### 6. **Build Your Own**
After Example 4, build something from scratch. That's when it clicks!

---

## 🎯 **What Can You Build?**

After completing these examples, you can build:

✅ **Todo/Task Managers** - Like Example 5  
✅ **Contact/CRM Systems** - Like Example 3  
✅ **Reminder Apps** - Like Example 4  
✅ **Event Calendars** - Combine Examples 3 & 4  
✅ **Inventory Trackers** - Use number fields  
✅ **Note-Taking Apps** - Use text fields  
✅ **Time Trackers** - Use datetime fields  
✅ **Booking Systems** - Use background jobs  
✅ **And much more!**

---

## 🏆 **Completion Certificate**

Once you've completed all examples:

**You are now a ShepLang Developer!** 🎉

**Skills Unlocked:**
- ✅ Full-stack development
- ✅ Data modeling
- ✅ UI/UX design
- ✅ Backend APIs
- ✅ Database operations
- ✅ Background jobs
- ✅ Time-based logic

**Next Steps:**
1. Build your own app
2. Share it with the community
3. Contribute examples
4. Help others learn

---

## 📊 **Example Comparison**

| Feature | Ex 1 | Ex 2 | Ex 3 | Ex 4 | Todo |
|---------|------|------|------|------|------|
| Fields | 1 | 2 | 4 | 3 | 2 |
| Field Types | text | text, number | text (4x) | text, datetime, yes/no | text, yes/no |
| Actions | 1 | 4 | 1 | 1 | 3 |
| Endpoints | 3 | 4 | 4 | 4 | 4 |
| CRUD | Partial | Partial | Full | Full | Full |
| Jobs | ❌ | ❌ | ❌ | ✅ | ❌ |
| Difficulty | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Reference |

---

## 🎬 **Video Tutorials**

*(Coming Soon)*

Each example will have a 2-3 minute video walkthrough:
- Example 1: "Your First ShepLang App"
- Example 2: "State Management Made Easy"
- Example 3: "Building a Real CRM"
- Example 4: "Background Jobs & Automation"
- Todo: "Production CRUD Operations"

---

## ❓ **FAQ**

**Q: Do I need to know programming?**  
A: No! These examples teach you from scratch.

**Q: How long does it take?**  
A: ~60 minutes for all examples. Take your time!

**Q: What if I get stuck?**  
A: Check the logs (`Ctrl+Shift+L`), read the README for that example, or ask for help.

**Q: Can I build real apps with this?**  
A: Yes! The Todo example is production-ready. Scale from there.

**Q: Do I need a database?**  
A: No! ShepLang includes an in-memory database. Zero config.

---

## 🌟 **Success Stories**

*(Share yours!)*

After completing these examples, developers have built:
- Personal productivity tools
- Small business CRMs
- Event management systems
- Inventory trackers
- And more!

---

**Ready to start?** Open [Example 1: Hello World](./01-hello-world.README.md) and begin your journey! 🐑✨

---

**Total Examples:** 5  
**Total Time:** ~60 minutes  
**Difficulty:** Beginner to Advanced  
**Status:** ✅ All Examples Ready

🎉 **Happy Learning!**
