# 🚀 Getting Started with ShepLang

Welcome to ShepLang! This guide will help you build your first full-stack application in under 10 minutes.

---

## 📋 **Prerequisites**

Before you begin, make sure you have:

- **Visual Studio Code** (v1.85.0 or higher)
- **Node.js** 20+ (for extension development)
- **pnpm** 9+ (package manager)

---

## 📦 **Installation**

### Option 1: Install from VSIX (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/Radix-Obsidian/Sheplang-BobaScript/releases)
2. Open VS Code
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded `.vsix` file

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript
cd Sheplang-BobaScript/extension

# Install dependencies
pnpm install

# Build the extension
pnpm run compile

# Press F5 in VS Code to launch Extension Development Host
```

---

## ✨ **Your First ShepLang App**

Let's build a simple todo application!

### Step 1: Create Project Files

Create a new folder and open it in VS Code:

```bash
mkdir my-todos
cd my-todos
code .
```

### Step 2: Create the Frontend (`app.shep`)

Create a new file called `app.shep`:

```sheplang
app MyTodos

data Todo:
  fields:
    title: text
    done: yes/no
  rules:
    - "user can update own items"

view Dashboard:
  list Todo
  button "Add Task" -> CreateTodo

action CreateTodo(title):
  add Todo with title, done=false
  show Dashboard
```

**What this does:**
- Defines a `Todo` data model with `title` and `done` fields
- Creates a `Dashboard` view that shows all todos
- Adds a button that triggers the `CreateTodo` action
- The action adds a new todo and refreshes the Dashboard

### Step 3: Create the Backend (`app.shepthon`)

Create a new file called `app.shepthon` in the same folder:

```shepthon
app MyTodos {

  model Todo {
    id: id
    title: text
    done: yes/no = no
  }

  endpoint GET "/todos" -> [Todo] {
    return db.Todo.findAll()
  }

  endpoint POST "/todos" (title: text) -> Todo {
    let todo = db.Todo.create({ title, done: false })
    return todo
  }

  endpoint PUT "/todos/:id" (title: text, done: yes/no) -> Todo {
    let todo = db.Todo.update(:id, { title, done })
    return todo
  }

  endpoint DELETE "/todos/:id" {
    db.Todo.delete(:id)
    return { success: true }
  }
}
```

**What this does:**
- Defines the same `Todo` model for the backend
- Creates REST API endpoints for CRUD operations
- Uses an in-memory database (zero config!)

### Step 4: Open the Preview

1. Open `app.shep` in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. The preview panel opens automatically! 🎉

You should see:
- ✅ "Dashboard" title
- ✅ "Add Task" button
- ✅ Green "✓ Backend" badge (backend connected)
- ✅ Empty list (no tasks yet)

### Step 5: Add Your First Task

1. Click the "Add Task" button
2. A VS Code input box appears at the top
3. Type "Buy groceries" and press Enter
4. Watch your task appear in the list! 🎊

### Step 6: Try Full CRUD

**Mark as Done:**
- Click on any task title to toggle its done status
- Watch the strikethrough appear/disappear

**Edit Task:**
- Click the ✏️ (pencil) icon
- Change the title in the input box
- Press Enter to save

**Delete Task:**
- Click the 🗑️ (trash) icon
- Task is removed from the list

---

## 🎯 **Key Concepts**

### ShepLang (Frontend)

ShepLang describes **what users see and do**:

- **`data`** - Define your data models
- **`view`** - Define what users see (screens, lists, buttons)
- **`action`** - Define what happens when users interact

### ShepThon (Backend)

ShepThon describes **how data is stored and accessed**:

- **`model`** - Define database tables
- **`endpoint`** - Define REST API routes (GET, POST, PUT, DELETE)
- **`job`** - Define background tasks (optional)

### The Bridge

The ShepLang extension automatically:
- Connects your frontend (.shep) to your backend (.shepthon)
- Starts an in-memory database
- Routes API calls between preview and backend
- Provides real-time feedback

---

## 🎓 **Learning Path**

### 1. Start with Examples

Open the built-in examples:
- `examples/todo.shep` - Simple todo list (what you just built!)
- `examples/dog-reminders.shepthon` - Backend with scheduled jobs

### 2. Use IntelliSense

As you type, the extension provides:
- **Auto-completions** - Relevant keywords and constructs
- **Hover docs** - Documentation for any keyword
- **Error detection** - Red squiggles for syntax errors

### 3. Use Snippets

Type these prefixes and press Tab:
- `model` → Full model definition
- `view` → Full view definition  
- `action` → Full action definition
- `endpoint` → Full endpoint definition
- `job` → Background job template

### 4. Explore Commands

Press `Ctrl+Shift+P` and type "ShepLang" to see all commands:
- **Show Preview** (`Ctrl+Shift+P`) - Open live preview
- **Create Backend File** - Generate `.shepthon` template
- **Show Output Logs** (`Ctrl+Shift+L`) - View extension logs
- **Restart Backend** (`Ctrl+Shift+R`) - Reload backend runtime

---

## 🐛 **Troubleshooting**

### Preview Not Loading?

**Check the backend:**
1. Make sure you have a `.shepthon` file with the same base name
   - `app.shep` needs `app.shepthon`
   - `todo.shep` needs `todo.shepthon`
2. Check for a green "✓ Backend" badge in the preview

**View logs:**
1. Press `Ctrl+Shift+L` to open the Output channel
2. Look for errors in the "ShepLang" output

**Restart:**
1. Press `Ctrl+Shift+R` to restart the backend
2. Or reload VS Code: `Ctrl+R` in Extension Development Host

### "No Active Editor" Error?

- Open a `.shep` file first, then run the preview command
- The preview only works with ShepLang files

### Backend Connection Failed?

- The backend starts automatically when you open a `.shepthon` file
- Check the Output channel for error messages
- Try restarting VS Code

### Syntax Errors?

- Red squiggles show syntax errors
- Hover over them for suggestions
- Check [Language Reference](./LANGUAGE_REFERENCE.md) for correct syntax

---

## 📚 **Next Steps**

### Learn More
- [Language Reference](./LANGUAGE_REFERENCE.md) - Complete syntax guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and fixes
- [AI Best Practices](./AI_BEST_PRACTICES.md) - Working with Cursor/Copilot

### Build More
- Try the **Counter** example (coming soon)
- Build a **Message Board** with real-time updates
- Create your own app from scratch

### Get Help
- [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)
- [Documentation](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- Check the Output logs: `Ctrl+Shift+L`

---

## 🎉 **Congratulations!**

You've built your first full-stack app with ShepLang! 

**What you learned:**
- ✅ Creating ShepLang frontend files
- ✅ Creating ShepThon backend files
- ✅ Using the live preview
- ✅ Full CRUD operations
- ✅ Keyboard shortcuts

**What's next:**
- Explore more complex examples
- Add scheduled jobs to your backend
- Build your own app idea

---

**Happy coding! 🐑✨**

Need help? Press `Ctrl+Shift+L` to view logs or check [Troubleshooting](./TROUBLESHOOTING.md).
