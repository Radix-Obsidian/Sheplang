# 📚 ShepLang Examples

Progressive examples demonstrating the VS Code extension features.

---

## 🎯 **Learning Path**

Start from Example 1 and work your way up. Each example builds on concepts from the previous one.

| Example | Time | Complexity | What You'll Learn |
|---------|------|------------|-------------------|
| **01-hello-world** | 5 min | ⭐ | Basic app structure, views, buttons |
| **02-counter** | 10 min | ⭐⭐ | Data models, state management, backend integration |
| **todo** | 15 min | ⭐⭐⭐ | Full CRUD operations, VS Code integration |
| **04-dog-reminders** | 20 min | ⭐⭐⭐⭐ | Datetime fields, background jobs, time-based logic |
| **05-simple-crm** | 30 min | ⭐⭐⭐⭐⭐ | Multiple models, relationships, filtering, business logic |

---

## 📖 **Example Details**

### Example 1: Hello World (5 minutes) ⭐

**Files:**
- `01-hello-world.shep`

**What it demonstrates:**
- Basic app structure (`app` declaration)
- Simple views (`view` with `show` statements)
- Buttons and actions
- Navigation between views

**No backend needed!** This is a pure frontend example.

**How to run:**
1. Open `01-hello-world.shep` in VS Code
2. Press `Ctrl+Shift+P` to show preview
3. Click the buttons and watch navigation work!

---

### Example 2: Counter (10 minutes) ⭐⭐

**Files:**
- `02-counter.shep` (frontend)
- `02-counter.shepthon` (backend)

**What it demonstrates:**
- Data models with number fields
- Backend state management
- Increment/decrement operations
- GET and POST endpoints
- Conditional logic in backend

**Features:**
- ✅ Persistent counter (in-memory)
- ✅ Three operations: Increment, Decrement, Reset
- ✅ Backend creates count on first use

**How to run:**
1. Open `02-counter.shep` in VS Code
2. Press `Ctrl+Shift+P` to show preview
3. Check for green "✓ Backend" badge
4. Click buttons to change the counter!

**What's happening:**
- Backend stores count in database
- Each button calls a POST endpoint
- Preview auto-refreshes to show new value

---

### Example 3: Todo List (15 minutes) ⭐⭐⭐

**Files:**
- `todo.shep` (frontend)
- `todo.shepthon` (backend)

**What it demonstrates:**
- Full CRUD operations (Create, Read, Update, Delete)
- VS Code native input box integration
- List rendering
- Toggle functionality (click to mark done)
- Edit functionality (pencil icon)
- Delete functionality (trash icon)

**Features:**
- ✅ Add tasks via VS Code input box
- ✅ Click task to toggle done/not done
- ✅ Edit button (✏️) to change title
- ✅ Delete button (🗑️) to remove task
- ✅ Toast notifications for all actions
- ✅ Real-time list updates

**How to run:**
1. Open `todo.shep` in VS Code
2. Press `Ctrl+Shift+P` to show preview
3. Check for green "✓ Backend" badge
4. Click "Add Task" - input box appears at top
5. Type task title and press Enter
6. Try clicking, editing, and deleting tasks!

**This is the showcase example - demonstrates all Week 1 features!**

---

### Example 4: Dog Reminders (20 minutes) ⭐⭐⭐⭐

**Files:**
- `04-dog-reminders.shep` (frontend)
- `04-dog-reminders.shepthon` (backend)

**What it demonstrates:**
- Datetime fields
- Time-based logic
- Background jobs (scheduled tasks)
- Filtering by criteria
- Auto-completion based on time

**Features:**
- ✅ Create reminders with time
- ✅ Background job runs every 5 minutes
- ✅ Auto-marks reminders as done when time passes
- ✅ Full CRUD for reminders

**How to run:**
1. Open `04-dog-reminders.shep` in VS Code
2. Press `Ctrl+Shift+P` to show preview
3. Add a reminder with text and time
4. Wait 5 minutes - job will auto-mark as done!

**What's happening:**
- Backend stores reminders with datetime
- Job scheduler runs every 5 minutes
- Compares `time <= now()` to find due reminders
- Updates them to `done: true`

**This is the canonical ShepThon example!**

---

### Example 5: Simple CRM (30 minutes) ⭐⭐⭐⭐⭐

**Files:**
- `05-simple-crm.shep` (frontend)
- `05-simple-crm.shepthon` (backend)

**What it demonstrates:**
- Multiple models (Lead + Note)
- Model relationships (foreign keys)
- Filtering with optional parameters
- Business logic (promote lead to customer)
- Cascading deletes
- Background cleanup jobs
- Complex queries

**Features:**
- ✅ Lead management (name, email, status)
- ✅ Add notes to leads
- ✅ Filter leads by status (new, qualified, etc.)
- ✅ Promote lead to customer (business logic)
- ✅ Auto-cleanup old "lost" leads after 7 days
- ✅ Delete lead with all its notes (cascade)

**How to run:**
1. Open `05-simple-crm.shep` in VS Code
2. Press `Ctrl+Shift+P` to show preview
3. Add a lead with name and email
4. Add notes to the lead
5. Try filtering by status
6. Promote a lead to customer!

**What's happening:**
- Two models: Lead and Note
- Note has `leadId` foreign key
- Optional parameters in GET `/leads` for filtering
- Business logic in POST `/leads/:id/promote`
- Job cleans up old "lost" leads daily

**This is the most advanced example - production-ready patterns!**

---

## 🎓 **Concepts Covered**

### Beginner (Examples 1-2)
- ✅ App structure
- ✅ Views and navigation
- ✅ Buttons and actions
- ✅ Data models
- ✅ Basic backend endpoints

### Intermediate (Example 3)
- ✅ Full CRUD operations
- ✅ VS Code integration (input boxes)
- ✅ List rendering
- ✅ State updates
- ✅ Error handling
- ✅ Toast notifications

### Advanced (Examples 4-5)
- ✅ Datetime fields
- ✅ Background jobs
- ✅ Time-based logic
- ✅ Multiple models
- ✅ Relationships
- ✅ Filtering
- ✅ Business logic
- ✅ Cascading operations
- ✅ Complex queries

---

## 🚀 **Quick Start**

### For Any Example:

1. **Open Files:**
   - Open the `.shep` file in VS Code
   - If there's a `.shepthon` file, it will load automatically

2. **Show Preview:**
   - Press `Ctrl+Shift+P` (Windows/Linux)
   - Or `Cmd+Shift+P` (Mac)
   - Or right-click → "ShepLang: Show Preview"

3. **Check Backend:**
   - Look for green "✓ Backend" badge in preview
   - If red "✗ Backend", check Output logs (`Ctrl+Shift+L`)

4. **Interact:**
   - Click buttons
   - Add/edit/delete items
   - Watch real-time updates!

---

## 🐛 **Troubleshooting**

**Preview not loading?**
- Make sure both `.shep` and `.shepthon` files have the same base name
- Check Output logs: `Ctrl+Shift+L`
- Restart backend: `Ctrl+Shift+R`

**Backend not connecting?**
- Check for syntax errors (red squiggles)
- Restart VS Code if needed
- View logs for detailed errors

**Need help?**
- Check [Troubleshooting Guide](../extension/TROUBLESHOOTING.md)
- View [Language Reference](../extension/LANGUAGE_REFERENCE.md)

---

## 📝 **Creating Your Own Example**

Want to create your own app? Follow this pattern:

1. **Create Frontend** (`myapp.shep`):
   ```sheplang
   app MyApp
   
   data Item:
     fields:
       name: text
   
   view Dashboard:
     list Item
     button "Add" -> CreateItem
   
   action CreateItem(name):
     add Item with name
     show Dashboard
   ```

2. **Create Backend** (`myapp.shepthon`):
   ```shepthon
   app MyApp {
     model Item {
       id: id
       name: text
     }
     
     endpoint GET "/items" -> [Item] {
       return db.Item.findAll()
     }
     
     endpoint POST "/items" (name: string) -> Item {
       return db.Item.create({ name: name })
     }
   }
   ```

3. **Open and Preview:**
   - Open `myapp.shep`
   - Press `Ctrl+Shift+P`
   - Start building!

---

## 🎉 **What's Next?**

After completing all examples:

1. **Build Your Own App**
   - Start with a simple idea
   - Use these examples as templates
   - Experiment and learn!

2. **Learn More**
   - [Getting Started Guide](../extension/GETTING_STARTED.md)
   - [Language Reference](../extension/LANGUAGE_REFERENCE.md)
   - [AI Best Practices](../extension/AI_BEST_PRACTICES.md)

3. **Share Your Creation**
   - Post on GitHub
   - Share with the community
   - Help others learn!

---

**Happy coding! 🐑✨**

Start with Example 1 and work your way up. Each example is designed to teach you one more concept while building on what you've already learned.
