# 🐑 ShepLang VS Code Extension

[![Build Status](https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions/workflows/verify.yml/badge.svg)](https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions)
[![Version](https://img.shields.io/badge/version-v0.2.0--alpha-blue)](https://github.com/Radix-Obsidian/Sheplang-BobaScript/releases)
[![Tests](https://img.shields.io/badge/tests-315%2F316%20passing-brightgreen)](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AI‑native full‑stack DSL inside VS Code.**  
> ShepLang for UI, ShepThon for backend, BobaScript under the hood.

---

## 🧠 What It Is

**The Problem:** Most non‑technical founders live in VS Code with Cursor/Copilot, but the code AI generates is hard to understand and maintain.

**The Solution:** A language and extension that are designed to be written by AI and understood by humans.

- **ShepLang** → Describe your UI and flows in `.shep` (data, views, actions)
- **ShepThon** → Describe your backend in `.shepthon` (models, endpoints, jobs)
- **VS Code Extension** → LSP + preview + backend runner
- **BobaScript** → Internal TypeScript runtime that executes your app

Today, the primary way to use ShepLang is through the **ShepLang VS Code extension**.  
The CLI and ShepYard browser IDE are experimental and secondary.

---

## 💡 Why It Matters

**Before:**
- AI dumps React/Node/Prisma boilerplate you can't safely edit
- You ship a prototype once, then get stuck when requirements change

**With ShepLang:**
- AI generates **high‑level DSL** instead of low‑level framework code
- The extension gives you **LSP feedback + preview + backend** in one place
- You can actually read, modify, and maintain what AI wrote

### The Stack
- **ShepLang** → Frontend (data, views, actions)
- **ShepThon** → Backend (models, endpoints, jobs)
- **VS Code Extension** → Editor experience (LSP, outline, go‑to‑def, preview)
- **BobaScript** → Execution engine (TypeScript output, in‑memory DB)

---

## 🚀 Quick Start (VS Code Extension)

### 1. Clone & Install

```bash
git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript
cd Sheplang-BobaScript/extension

pnpm install
pnpm run compile
```

### 2. Launch Extension Development Host

1. Open the `extension/` folder in VS Code
2. Press `F5` to start an **Extension Development Host**

### 3. Open the Todo Example

1. In the dev host, open `examples/todo.shep`
2. Run command: **“ShepLang: Show Preview”**
3. You should see:
   - A **Dashboard** view in the preview panel
   - **Outline** entries: `Todo` (data), `Dashboard` (view), `CreateTodo` (action)
   - **Hover docs** when you hover `app`, `data`, `view`, `action`
   - **Context‑aware completions** when you type inside fields/view/action blocks

> For now, treat this as the **canonical happy‑path demo**.

## ⚡ Usage

```bash
# Create a simple app
echo 'component App { "Hello World" }' > hello.shep

# Start development
sheplang dev hello.shep
# → http://localhost:8787

# Build for production  
sheplang build hello.shep
# → dist/hello.boba
```

## 🏗️ Repository Structure (Monorepo)

```
Sheplang-BobaScript/
├── sheplang/
│   ├── packages/
│   │   ├── language/        # ShepLang parser (Langium)
│   │   ├── shepthon/        # 🆕 ShepThon backend language
│   │   ├── cli/            # CLI tools
│   │   └── runtime/        # BobaScript runtime
│   └── adapters/
│       └── sheplang-to-boba/ # Transpiler
├── shepyard/               # 🆕 Visual IDE (React + Monaco)
│   ├── src/
│   │   ├── editor/         # Monaco editor integration
│   │   ├── backend-panel/  # ShepThon backend viewer
│   │   ├── services/       # ShepThon runtime bridge
│   │   └── workers/        # Web Worker for ShepThon
│   └── examples/
│       ├── shep/           # ShepLang examples
│       └── shepthon/       # ShepThon examples
└── examples/               # Sample apps
    └── dog-reminders/      # Full-stack example
```

## 📝 Language Examples

### ShepLang (Frontend)
```shep
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

### ShepThon (Backend) 🆕
```shepthon
app DogReminders {
  model Reminder {
    id: id
    text: string
    time: datetime
    done: bool = false
  }

  endpoint GET "/reminders" -> [Reminder] {
    return db.Reminder.findAll()
  }

  endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
    let reminder = db.Reminder.create({ text, time })
    return reminder
  }

  job "mark-due-as-done" every 5 minutes {
    let due = db.Reminder.findAll()
    for r in due {
      db.Reminder.update(r.id, { done: true })
    }
  }
}
```

### That's It!
No Python, no Node.js setup, no database config. Just describe what you want.

## 🛠️ CLI Commands

### CLI Commands (ShepLang)
| Command | Description | Example |
|---------|-------------|---------|  
| `dev <file>` | Live preview | `sheplang dev app.shep` |
| `build <file>` | Compile to BobaScript | `sheplang build app.shep` |
| `explain <file>` | Human summary | `sheplang explain app.shep` |
| `parse <file>` | Validate syntax | `sheplang parse app.shep` |
| `stats` | Project analytics | `sheplang stats` |

### ShepYard IDE Features 🆕
- **Monaco Editor**: Syntax highlighting for ShepLang & ShepThon
- **Live Preview**: See your app as you type
- **Backend Panel**: View models, endpoints, jobs
- **File Manager**: Local project support (File System Access API)
- **Terminal**: Integrated xterm.js
- **Explain Mode**: AI-powered code insights

### ShepThon Runtime 🆕
- **In-Memory Database**: Zero-config data storage
- **Endpoint Router**: REST API handling (GET/POST)
- **Job Scheduler**: Cron-like background tasks
- **Full Type Safety**: TypeScript throughout

## 🚦 Development Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- PowerShell 7+ (Windows)

### Build from Source
```bash
git clone https://github.com/your-org/sheplang.git
cd sheplang/sheplang

# Install dependencies
pnpm install

# Build all packages
pnpm -w -r build

# Run tests
pnpm -w -r test

# Test CLI locally
node ./packages/cli/dist/index.js --help
```

### Package Development
```bash
# Build specific package
pnpm --filter @sheplang/language build

# Test specific package
pnpm --filter sheplang test

# Start playground
pnpm --filter @sheplang/playground dev
```

## 📦 Publishing

Packages are automatically published to NPM on tag push:

```bash
git tag v0.1.3
git push --follow-tags
```

Published packages:
- `sheplang` - Main CLI (umbrella package)
- `@sheplang/language` - Language parser
- `@adapters/sheplang-to-boba` - Transpiler

## ✅ Test Results

**Current Status: 315/316 tests passing (99.7%)**

- ✅ ShepLang Parser: 100% passing
- ✅ ShepThon Parser: 59/59 tests (100%)
- ✅ ShepThon Runtime: 256/257 tests (99.6%)
- ✅ CLI: All commands working
- ✅ ShepYard: Builds successfully
- ✅ `pnpm run verify` → GREEN

## 📄 License

MIT - Built with ❤️ by Golden Sheep AI---

## 🧩 Architecture Overview


/sheplang/
├── packages/
│ ├── language/ # ShepLang parser (Langium)
│ ├── adapter/ # ShepLang → BobaScript transpiler
│ └── cli/ # sheplang CLI & preview server
├── adapters/
│ └── sheplang-to-boba # Deterministic code generator
├── playground/ # Browser-based live editor
├── examples/ # Example apps (todo, dashboard, auth)
└── scripts/verify.ps1 # Build → Test → Serve → Validate → Playground

**Flow:**  
`ShepLang (.shep)` → **Adapter** → `BobaScript (.boba)` → **Runtime Preview / Deployment**

---

## 🧰 Quick Start

```bash
# Clone
git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript
cd Sheplang-BobaScript/sheplang

# Install
pnpm install

# Run everything
pnpm run verify     # Builds, tests, previews, and builds Playground

# Or start the Playground (browser-based IDE)
pnpm --filter @sheplang/playground dev
```
Then open: http://localhost:5173
You’ll see:
Left: ShepLang editor
Right: AST (JSON), BobaScript output, and live preview

---

## 🧭 Vision
Our mission is to make software creation as natural as explaining an idea.
ShepLang and BobaScript are being built for:
🧩 Non-technical founders who need MVPs fast
🎨 Designers who think visually and narratively
🤖 AI-native tools that teach as they build
“If TypeScript made JavaScript safer, ShepLang makes it human.”

---

## 🛠 Status

**Current Phase:** Alpha (YC-Ready)  
**Version:** v0.2.0-alpha  
**Build:** ✅ GREEN (315/316 tests passing)  
**Lines of Code:** ~150,000 (core + tests + IDE)  

### What's Working:
- ✅ ShepLang frontend language (complete)
- ✅ ShepThon backend language (complete)
- ✅ BobaScript transpiler (complete)
- ✅ ShepYard visual IDE (complete)
- ✅ In-memory database & runtime (complete)
- ✅ Job scheduler & cron (complete)
- ⏳ Full E2E integration (90% complete)

### Roadmap:
- **Phase 1 (✅ DONE):** Core languages (ShepLang, ShepThon)
- **Phase 2 (✅ DONE):** Runtime & IDE (ShepYard)
- **Phase 3 (🔄 NOW):** E2E integration & polish
- **Phase 4 (📋 NEXT):** Production deployment, real databases
- **Phase 5 (🔮 FUTURE):** AI co-pilot, marketplace, teams

---

## 🎯 Vision

> "If TypeScript made JavaScript safer,  
> ShepLang makes it human."

We're building the **Figma of full-stack development**. Anyone with an idea should be able to build it—without learning to code.

### For:
- 🧩 Non-technical founders who need MVPs fast
- 🎨 Designers who think visually
- 🤖 AI-native tools that teach as they build

### Not For:
- ❌ Replacing developers (we empower non-coders)
- ❌ Complex enterprise apps (we focus on MVPs)
- ❌ Production at scale (yet—that's Phase 4)

## ❤️ Built by Golden Sheep AI

A solo founder building meaningful tools for non-technical creators.

- 🐑 **ShepLang** — Human-first frontend language
- 🐍 **ShepThon** — Python-like backend language (but for founders)
- ☕ **BobaScript** — TypeScript-powered runtime
- 🎨 **ShepYard** — Visual IDE for both languages
- 🧭 **Explain Mode** — AI-powered code mentor (coming soon)

---

## 📜 License
MIT License © 2025 Golden Sheep AI

🌟 “From idea to app — in one language you already speak.”
