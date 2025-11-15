# 🐑 ShepLang + ShepThon + BobaScript

[![Build Status](https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions/workflows/verify.yml/badge.svg)](https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions)
[![Version](https://img.shields.io/badge/version-v0.2.0--alpha-blue)](https://github.com/Radix-Obsidian/Sheplang-BobaScript/releases)
[![Tests](https://img.shields.io/badge/tests-315%2F316%20passing-brightgreen)](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Full-stack app development in plain language — no coding required.**  
> ShepLang for frontends. ShepThon for backends. BobaScript makes it real.

---

## 🧠 What It Is

**The Problem:** 92% of founders can't code. They need technical co-founders or expensive agencies to build MVPs.

**The Solution:** Write apps in plain language. No syntax, no frameworks, no infrastructure.

- **ShepLang** → Describe your UI ("show a list of tasks")
- **ShepThon** → Describe your backend ("save reminders to database")
- **BobaScript** → The engine that makes it work
- **ShepYard IDE** → Visual development environment (browser-based)

## 💡 Why It Matters

**Before:** Founders with ideas → Months finding technical co-founder → Expensive agency → 6 months to MVP

**Now:** Describe what you want → Working app in minutes → Iterate instantly → Deploy when ready

### The Full Stack:
- **ShepLang** → Frontend (UI, actions, state)  
- **ShepThon** → Backend (models, endpoints, jobs)  
- **ShepYard** → IDE (edit, preview, debug)  
- **BobaScript** → Runtime (TypeScript output)

It's like Figma, but for entire applications.

---

## 🚀 Quick Start

### Option 1: CLI (ShepLang only)
```bash
# Install
npm install -g sheplang

# Create a simple app
echo 'app MyApp
data Todo:
  fields:
    title: text
view Dashboard:
  list Todo' > app.shep

# Preview
sheplang dev app.shep
```

### Option 2: ShepYard IDE (Full Stack)
```bash
# Clone repo
git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript
cd Sheplang-BobaScript

# Install & build
pnpm install
pnpm run verify

# Start ShepYard
cd shepyard
pnpm run dev
```

Open `http://localhost:3000` → Build full-stack apps visually!

## 📦 What You Get

- **3 Languages**: ShepLang (frontend), ShepThon (backend), BobaScript (runtime)
- **Visual IDE**: ShepYard with Monaco editor, live preview, debugging
- **In-Memory Database**: Test backends without setup
- **Job Scheduler**: Background tasks and cron jobs
- **CLI Tools**: Build, explain, analyze, deploy

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
