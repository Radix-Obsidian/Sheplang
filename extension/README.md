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
- **Show Preview** - Preview your ShepLang app (Coming Soon)
- **New Project** - Create from templates
- **Restart Backend** - Reload ShepThon runtime (Coming Soon)

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

## Roadmap

### Phase 1: Foundation (Current)
- ✅ Syntax highlighting
- ✅ Basic completion
- ✅ Hover documentation
- ✅ Snippets
- ✅ Project templates

### Phase 2: Intelligence
- 🔜 Live preview webview
- 🔜 ShepThon runtime integration
- 🔜 Cross-file type checking
- 🔜 ShepVerify engine
- 🔜 Refactoring support

### Phase 3: Collaboration
- 🔜 Git integration
- 🔜 Team templates
- 🔜 Shared components

## Extension Settings

This extension contributes the following settings:

* `sheplang.trace.server`: Enable/disable tracing the language server
* `sheplang.autoPreview`: Automatically show preview when opening .shep files
* `sheplang.shepthon.autoStart`: Automatically start ShepThon backend when opening .shepthon files

## Known Issues

- Preview feature is under development (Phase 2)
- Backend runtime is under development (Phase 2)

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
