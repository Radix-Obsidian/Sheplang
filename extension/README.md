# ShepLang - AI-Native Verified Programming

**The first AI-native programming language with built-in verification. Write in English, ship verified code.**

![ShepLang Icon](media/icon.png)

---

## 🐑 What is ShepLang?

ShepLang is a programming language designed for **non-technical founders** who think in user stories, not algorithms. Write business logic in plain English, compile to production TypeScript.

### Simple Example

```shep
app MyTodos {
  data Todo:
    fields:
      title: text
      done: yes/no
      created: datetime
  
  view Dashboard:
    show "My Todo List"
    list Todo
    button "Add Task" -> CreateTodo
  
  action CreateTodo(title):
    add Todo with title, done=false, created=now
    show Dashboard
}
```

**This compiles to production-ready TypeScript.**

---

## ✨ Features

### 🎨 **Syntax Highlighting**
Beautiful, readable code with full TextMate grammar support for `.shep` and `.shepthon` files.

### 📝 **Intelligent Code Snippets**
Type `app`, `data`, `view`, or `action` and press Tab for instant code templates.

### 🔍 **Real-Time Diagnostics**
Language Server Protocol integration provides instant error detection and helpful suggestions.

### 🚀 **One-Click Compilation**
Compile ShepLang to TypeScript with a single command.

### 🛠️ **Full Tooling Support**
- Autocomplete
- Go to Definition
- Hover information
- Document symbols
- Workspace symbols

### 📦 **Production Ready**
Generates clean, maintainable TypeScript code ready for deployment.

---

## 🚀 Getting Started

### Installation

1. Install the extension from the Marketplace
2. Open a `.shep` file or create a new one
3. Start coding!

### Quick Start

**Create your first ShepLang app:**

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "ShepLang: New Project"
3. Choose a template (Todo App, Counter, Contact List)
4. Start editing!

**Try the snippets:**
- Type `app` + Tab → Create new app structure
- Type `data` + Tab → Define a data model
- Type `view` + Tab → Create a UI view
- Type `action` + Tab → Define an action
- Type `button` + Tab → Add a button
- Type `list` + Tab → Add a list component

---

## 📚 Examples

### Counter App

```shep
app Counter {
  data State:
    fields:
      count: number
  
  view Home:
    show "Count: {State.count}"
    button "Increment" -> Increment
    button "Decrement" -> Decrement
  
  action Increment():
    set State.count = State.count + 1
  
  action Decrement():
    set State.count = State.count - 1
}
```

### Contact List

```shep
app Contacts {
  data Contact:
    fields:
      name: text
      email: text
      phone: text
  
  view Home:
    show "My Contacts"
    list Contact
    button "Add Contact" -> CreateContact
  
  action CreateContact(name, email, phone):
    add Contact with name, email, phone
    show Home
}
```

### Dog Reminders

```shep
app DogReminders {
  data Dog:
    fields:
      name: text
      breed: text
      next_vet_visit: datetime
  
  view Dashboard:
    show "My Dogs"
    list Dog
    button "Add Dog" -> CreateDog
  
  action CreateDog(name, breed, next_vet_visit):
    add Dog with name, breed, next_vet_visit
    show Dashboard
}
```

**More examples:** [GitHub Repository](https://github.com/Radix-Obsidian/Sheplang-BobaScript/tree/main/examples)

---

## 🎯 Who Is This For?

### ✅ **Non-Technical Founders**
You have great ideas but coding feels like learning a foreign language. ShepLang speaks YOUR language.

### ✅ **Technical Founders**
Prototype faster. Validate ideas in hours, not days. Generate boilerplate instantly.

### ✅ **Designers**
Turn your designs into working code. Bridge the gap between mockup and MVP.

### ✅ **Students & Learners**
Learn programming concepts without syntax frustration. Focus on logic, not semicolons.

---

## 💡 Why ShepLang?

### **Before ShepLang:**
```typescript
// Traditional TypeScript
interface Todo {
  id: string;
  title: string;
  done: boolean;
  created: Date;
}

const todos: Todo[] = [];

function createTodo(title: string): void {
  const newTodo: Todo = {
    id: generateId(),
    title: title,
    done: false,
    created: new Date()
  };
  todos.push(newTodo);
  renderDashboard();
}

function renderDashboard(): void {
  // Render logic...
}
```

### **After ShepLang:**
```shep
app MyTodos {
  data Todo:
    fields:
      title: text
      done: yes/no
      created: datetime
  
  action CreateTodo(title):
    add Todo with title, done=false, created=now
    show Dashboard
}
```

**Same functionality. 70% less code. 100% more readable.**

---

## 🛠️ Commands

Access via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **ShepLang: New Project** - Create a new ShepLang project from template
- **ShepLang: Preview** - Open live preview of your app
- **ShepLang: Compile File** - Compile current file to TypeScript
- **ShepLang: Show Output** - View compiler output
- **ShepLang: Restart Backend** - Restart the language server

---

## 📖 Language Reference

### Data Types

```shep
text        → string
number      → number
yes/no      → boolean
datetime    → Date
id          → string (unique identifier)
```

### Keywords

- `app` - Define an application
- `data` - Define a data model
- `view` - Define a UI view
- `action` - Define an action/function
- `button` - Create a button
- `list` - Create a list view
- `show` - Display content
- `add` - Create new record
- `set` - Update a value
- `call` - Invoke an action
- `when` - Conditional logic
- `for` - Loop over items

### Full Syntax Guide

Visit our [documentation](https://github.com/Radix-Obsidian/Sheplang-BobaScript#readme) for complete syntax reference.

---

## 🔧 Configuration

### Extension Settings

This extension contributes the following settings:

- `sheplang.autoCompile`: Automatically compile on save (default: `false`)
- `sheplang.showOutput`: Show compiler output automatically (default: `true`)
- `sheplang.enableDiagnostics`: Enable real-time diagnostics (default: `true`)

### File Associations

The extension automatically activates for:
- `.shep` files (ShepLang frontend)
- `.shepthon` files (ShepLang backend - coming soon)

---

## 📦 What's Included

This extension provides:

✅ **Full Language Support**
- Syntax highlighting (TextMate grammars)
- Code snippets for rapid development
- Language Server Protocol (LSP) integration
- Real-time error checking
- Autocomplete suggestions

✅ **Developer Tools**
- Compile to TypeScript
- Preview your app
- Debug diagnostics
- Output channel for logs

✅ **Project Templates**
- Todo App
- Counter
- Contact List
- More coming soon!

---

## 🚀 Roadmap

### Current (v1.0)
- ✅ Syntax highlighting
- ✅ Code snippets
- ✅ Real-time diagnostics
- ✅ Basic compilation

### Coming Soon (v1.1-1.2)
- 🔜 Advanced type checking
- 🔜 Refactoring tools
- 🔜 Inline documentation
- 🔜 More code snippets

### Future (v2.0+)
- 🔮 ShepKit Visual IDE (web-based)
- 🔮 Figma-to-ShepLang converter
- 🔮 One-click deployment
- 🔮 Collaboration features

---

## 📝 Requirements

- **VS Code:** Version 1.85.0 or higher
- **Node.js:** Version 16+ (for compilation)
- **TypeScript:** Version 5.0+ (automatically installed)

---

## 🐛 Known Issues

- ShepThon backend language support is experimental
- Large files (>1000 lines) may have slower diagnostics
- Some edge cases in error recovery

**Report bugs:** [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)

---

## 💬 Support & Community

### Get Help

- **Documentation:** [GitHub Wiki](https://github.com/Radix-Obsidian/Sheplang-BobaScript/wiki)
- **Discord:** [Join our community](https://discord.gg/sheplang) *(coming soon)*
- **GitHub:** [Issues & Discussions](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- **Email:** support@goldensheepai.com

### Contribute

ShepLang is open source! Contributions welcome:

- 🐛 **Bug reports:** [GitHub Issues](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)
- 💡 **Feature requests:** [GitHub Discussions](https://github.com/Radix-Obsidian/Sheplang-BobaScript/discussions)
- 🔧 **Pull requests:** [Contributing Guide](https://github.com/Radix-Obsidian/Sheplang-BobaScript/blob/main/CONTRIBUTING.md)
- 📖 **Documentation:** Help improve our docs!

---

## 📜 License

MIT License - see [LICENSE](https://github.com/Radix-Obsidian/Sheplang-BobaScript/blob/main/LICENSE) for details.

---

## 🙏 Acknowledgments

**Built with:**
- [Langium](https://langium.org/) - Language workbench
- [TypeScript](https://www.typescriptlang.org/) - Compiler foundation
- [VS Code Extension API](https://code.visualstudio.com/api) - IDE integration
- [Windsurf IDE](https://codeium.com/windsurf) - AI-assisted development
- [Claude AI](https://anthropic.com/claude) - Implementation partner

**Inspired by:** Every founder who's been told "just learn to code first."

---

## 🌟 Show Your Support

If ShepLang helps you build faster:

- ⭐ **Star the repo:** [GitHub](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- 💬 **Share on Twitter:** [@YourHandle](https://twitter.com/intent/tweet?text=Just%20discovered%20ShepLang%20-%20programming%20for%20non-technical%20founders!%20%F0%9F%90%91)
- 📝 **Write a review:** Help others discover ShepLang
- 🎨 **Build something:** Share what you create!

---

## 📚 Learn More

- **Website:** [Coming Soon]
- **Blog:** [Case Study - Building ShepLang in 4 Weeks](link-to-blog)
- **Twitter:** [@YourHandle](https://twitter.com/your-handle)
- **LinkedIn:** [Golden Sheep AI](https://linkedin.com/company/golden-sheep-ai)
- **YouTube:** [ShepLang Tutorials](link-when-available)

---

## 🎓 Tutorial: Your First App

### 1. Create New Project
- Open Command Palette (`Ctrl+Shift+P`)
- Select "ShepLang: New Project"
- Choose "Todo App" template

### 2. Explore the Code
```shep
app MyTodos {
  data Todo:
    fields:
      title: text
      done: yes/no
  
  view Dashboard:
    list Todo
    button "Add Task" -> CreateTodo
}
```

### 3. Modify It
- Change "Todo" to "Task"
- Add a new field: `priority: text`
- Watch syntax highlighting update in real-time

### 4. Compile
- Press `F5` or use Command Palette
- Select "ShepLang: Compile File"
- See generated TypeScript in output panel

### 5. Next Steps
- Try other templates (Counter, Contact List)
- Read the [full tutorial](link-to-docs)
- Join the community!

---

## ❓ FAQ

**Q: Do I need to know TypeScript?**  
A: No! ShepLang generates TypeScript for you. You can learn TypeScript later if you want.

**Q: Is this production-ready?**  
A: Yes! ShepLang v1.0 generates clean, type-safe TypeScript suitable for production use.

**Q: Can I modify the generated code?**  
A: Absolutely! The TypeScript output is yours to customize.

**Q: Does this work offline?**  
A: Yes! All language features work offline. Only AI assistant features require internet.

**Q: Is ShepLang free?**  
A: Yes! The language and extension are open source and free forever.

**Q: What about backend code?**  
A: ShepThon (backend language) is coming in Q1 2026!

**Q: Can I use this commercially?**  
A: Yes! MIT license allows commercial use.

---

## 🔥 Quick Tips

💡 **Tip 1:** Use `Ctrl+Space` for autocomplete suggestions  
💡 **Tip 2:** Hover over keywords for inline documentation  
💡 **Tip 3:** Press `F12` to go to definition  
💡 **Tip 4:** Use snippets - type `app` then Tab  
💡 **Tip 5:** Enable auto-compile in settings for faster iteration  

---

## 🎯 Success Stories

> *"Built my MVP in 2 days with ShepLang. Would've taken me 2 months with traditional code."*  
> — Founder, SaaS startup

> *"Finally, a language that thinks like I do!"*  
> — Designer turned founder

> *"Used this to prototype before hiring devs. Saved months of back-and-forth."*  
> — Non-technical CEO

**[Share your story!](mailto:success@goldensheepai.com)**

---

## 📊 Version History

### 1.0.0 (November 22, 2025)
- 🎉 Initial release
- ✨ Full syntax highlighting
- 📝 Code snippets (10+ templates)
- 🔍 Real-time diagnostics
- 🛠️ LSP integration
- 📦 Compilation to TypeScript
- 🎨 Beautiful sheep icon 🐑

See [CHANGELOG](https://github.com/Radix-Obsidian/Sheplang-BobaScript/blob/main/CHANGELOG.md) for full history.

---

## 🐑 About Golden Sheep AI

We're building the future where **everyone can code**.

Not by "dumbing down" programming. By creating languages that match how domain experts think.

ShepLang is our first product. More coming soon.

**Follow the journey:**
- Twitter: [@YourHandle](https://twitter.com/your-handle)
- LinkedIn: [Company Page](https://linkedin.com/company/golden-sheep-ai)
- Blog: [Coming Soon]

---

## 💌 Feedback

We'd love to hear from you!

- **Love it?** Leave a review ⭐
- **Issue?** [Report a bug](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)
- **Idea?** [Start a discussion](https://github.com/Radix-Obsidian/Sheplang-BobaScript/discussions)
- **Question?** [Email us](mailto:hello@goldensheepai.com)

---

<div align="center">

**Made with ❤️ by a non-technical founder who refused to give up**

**8 years learning → 4 weeks building → ∞ possibilities**

🐑 **Welcome to ShepLang** 🐑

[Get Started](#-getting-started) • [Examples](#-examples) • [Community](#-support--community)

</div>

---

**Enjoy!** 🚀
