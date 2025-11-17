# ShepLang VSCode Extension

![ShepLang](./media/icon.png)

AI-Native full-stack language support for Visual Studio Code.

## Features

### 🎨 Syntax Highlighting
- **ShepLang** (.shep) - Frontend UI language
- **ShepThon** (.shepthon) - Backend API language

### ✨ IntelliSense
- Smart code completion for keywords and constructs
- Context-aware suggestions
- Hover documentation for all language features

### 📝 Snippets
Quick scaffolding for common patterns:
- Models, Views, Actions (ShepLang)
- Endpoints, Jobs (ShepThon)
- Database operations
- HTTP methods

### 🔍 Language Server
- Real-time error detection
- Syntax validation
- Semantic analysis
- Go to Definition

### 🚀 Commands
- **Show Preview** (`Ctrl+Shift+P`) - Live preview with full CRUD operations ✅
- **New Project** - Create from templates ✅
- **Restart Backend** (`Ctrl+Shift+R`) - Reload ShepThon runtime ✅
- **Show Output Logs** (`Ctrl+Shift+L`) - View extension logs ✅
- **Create Backend File** - Generate .shepthon template from .shep file ✅

## Quick Start

### 1. Install Extension
```bash
# From VSIX
code --install-extension sheplang-0.1.0.vsix
```

### 2. Create New Project
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type "ShepLang: New Project"
- Select a template
- Choose folder location

### 3. Start Coding
Open a `.shep` file and start typing. IntelliSense will guide you!

## Language Reference

### ShepLang (Frontend)

**Define App:**
```sheplang
app MyApp {
  model Todo {
    text: string
    done: bool = false
  }

  view Home:
    show "My Todos"
    list Todo
    button "Add" -> AddTodo

  action AddTodo:
    add Todo { text: "New task" }
}
```

### ShepThon (Backend)

**Define API:**
```shepthon
app MyAPI {
  model Todo {
    id: id
    text: string
    done: bool = false
  }

  endpoint GET "/todos" -> [Todo] {
    return db.Todo.findAll()
  }

  endpoint POST "/todos" (text: string) -> Todo {
    return db.Todo.create({ text })
  }

  job "cleanup" every 1 day {
    db.Todo.delete({ done: true })
  }
}
```

## What's New in Week 1! 🎉

### ✅ Phase 1: Foundation (COMPLETE)
- ✅ Syntax highlighting for .shep and .shepthon
- ✅ Context-aware IntelliSense
- ✅ Hover documentation
- ✅ 29 code snippets
- ✅ Project templates
- ✅ Language Server Protocol (LSP)

### ✅ Phase 2: Live Preview & Backend (COMPLETE)
- ✅ **Live Preview** - See your app as you type!
- ✅ **ShepThon Runtime** - In-memory backend with CRUD
- ✅ **Full CRUD Operations** - Add, edit, delete, toggle tasks
- ✅ **Bridge Service** - Frontend ↔ Backend communication
- ✅ **Toast Notifications** - Visual feedback for all actions
- ✅ **Live Reload** - File changes update preview automatically

### ✅ Phase 3: Developer Experience (COMPLETE)
- ✅ **Smart Error Recovery** - Context-aware suggestions
- ✅ **Output Channel** - Timestamped logs with levels
- ✅ **Keyboard Shortcuts** - Fast access to common commands
- ✅ **Backend Templates** - One-command file generation
- ✅ **Error Pattern Detection** - 15+ common errors handled

### 🔜 Phase 4: Templates & Docs (Coming This Week)
- 📝 5 progressive tutorial templates
- 📝 Comprehensive documentation
- 📝 Video walkthroughs
- 📝 AI best practices guide

## Extension Settings

This extension contributes the following settings:

* `sheplang.trace.server`: Enable/disable tracing the language server
* `sheplang.autoPreview`: Automatically show preview when opening .shep files (default: true)
* `sheplang.shepthon.autoStart`: Automatically start ShepThon backend when opening .shepthon files (default: true)
* `sheplang.verboseLogging`: Enable detailed debug logging in output channel (default: false)

## Features in Action

### Live Preview with Full CRUD
![Preview Demo](https://via.placeholder.com/800x450?text=ShepLang+Preview+Demo)

### Smart Error Recovery
![Error Recovery](https://via.placeholder.com/800x450?text=Smart+Error+Suggestions)

### IntelliSense & Hover Docs
![IntelliSense](https://via.placeholder.com/800x450?text=Context-Aware+Completions)

## Keyboard Shortcuts

| Command | Windows/Linux | macOS |
|---------|---------------|-------|
| Show Preview | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Restart Backend | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Show Output Logs | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Troubleshooting

**Preview not loading?**
1. Check that you have a matching `.shepthon` backend file
2. View logs: Press `Ctrl+Shift+L`
3. Restart backend: Press `Ctrl+Shift+R`

**Backend connection failed?**
- The backend starts automatically when you open a `.shepthon` file
- Check the green "✓ Backend" badge in the preview panel
- View detailed logs in the Output channel

**Need help?**
- Press `Ctrl+Shift+L` to view logs
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Report an Issue](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)

## Contributing

Contributions are welcome! Please see [GitHub repository](https://github.com/Radix-Obsidian/Sheplang-BobaScript).

## License

MIT - See LICENSE file for details

## More Information

* [ShepLang Documentation](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
* [Examples](https://github.com/Radix-Obsidian/Sheplang-BobaScript/tree/main/examples)
* [Report Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)

---

**Enjoy coding with ShepLang! 🐑✨**
