# 🐑 ShepLang + BobaScript

[![Build Status](https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions/workflows/verify.yml/badge.svg)](https://github.com/Radix-Obsidian/Sheplang-BobaScript/actions)
[![Version](https://img.shields.io/badge/version-v0.1.2--alpha-blue)](https://github.com/Radix-Obsidian/Sheplang-BobaScript/releases/tag/v0.1.2-alpha)
[![Playground](https://img.shields.io/badge/Playground-Run%20Locally-brightgreen)](./sheplang/playground/README.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Build apps by describing them in plain language.**  
> ShepLang reads like thought — BobaScript turns it into working code.

---

## 🧠 What It Is

**ShepLang** is a human-first scripting language for non-coders.  
It lets you describe your app in everyday words — like a storyboard — and automatically transforms that into real, production-ready code.

**BobaScript** is the engine underneath. # ShepLang + BobaScript

**Build full-stack MVPs with declarative ShepLang → executable BobaScript**

## 💡 Why It Matters

Most people with great ideas can’t code.  
ShepLang and BobaScript remove that barrier — giving designers, founders, and creatives the power to build real digital products **without needing a full engineering team**.

- **ShepLang →** reads like “what you mean”  
- **BobaScript →** builds “what you said”  
- **Explain Mode →** teaches you what happened

It’s programming that feels more like storytelling than syntax.

---

## 🚀 Quick Install (NPM)

```bash
# Install globally
npm install -g sheplang

# Or run directly
npx sheplang --help
```

## 📦 What You Get

- **ShepLang Parser**: Full language validation and AST generation
- **BobaScript Transpiler**: Deterministic code compilation
- **Development Server**: Live preview with hot module reloading
- **CLI Tools**: Build, explain, analyze commands

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
sheplang/
├── packages/
│   ├── language/          # Langium parser (@sheplang/language)
│   └── cli/              # Main CLI package (sheplang)
├── adapters/
│   └── sheplang-to-boba/ # Transpiler (@adapters/sheplang-to-boba)
├── playground/           # Web playground (Vite)
├── examples/            # Sample .shep files
└── e2e/                # End-to-end tests
```

## 📝 Language Examples

### Components & State
```shep
component TodoApp {
  state todos = []
  "My Todo List"
}

component Header props { title: "MyApp", count: 0 } {
  "Welcome Header"
}
```

### Actions & Routes
```shep
action AddTodo(item) { "Todo added" }
action DeleteTodo(id) { "Todo removed" }

route "/" -> TodoApp
route "/about" -> About
```

### Full Application
```shep
component Dashboard {
  state users = []
  "User Dashboard"  
}

action FetchUsers() { "Loading users..." }
action CreateUser(name, email) { "User created" }

route "/" -> Dashboard
route "/users" -> UserList
```

## 🛠️ CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all commands | `sheplang help` |
| `parse <file>` | Validate & show AST | `sheplang parse app.shep` |
| `build <file>` | Compile to BobaScript | `sheplang build app.shep --out dist` |
| `dev <file>` | Development server | `sheplang dev app.shep --port 3000` |
| `explain <file>` | Human-readable summary | `sheplang explain app.shep` |
| `stats` | Repository analytics | `sheplang stats` |
| `--version` | Show version | `sheplang --version` |

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

## ✅ Acceptance Tests

- ✅ `pnpm -w -r build` → green
- ✅ `pnpm -w -r test` → green  
- ✅ `node packages/cli/dist/index.js help` → prints commands
- ✅ `npx sheplang --version` → 0.1.3
- ✅ `npx sheplang dev examples/todo.shep` → serves at :8787

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
Current Phase: 2.5 → 3 (Alpha Hardening)
Edition: 2025 Syntax Freeze
Latest Tag: v0.1.2-alpha (Playground release, Verify OK)

---

## ❤️ Built by
Golden Sheep AI
A solo design & development studio building meaningful tools for non-technical founders.
🐑 ShepLang — human-first DSL
☕ BobaScript — typed scripting engine
🧭 Explain Mode — AI-powered code mentor
🧱 Shepherd Studio (coming soon) — all-in-one design & build environment

---

## 📜 License
MIT License © 2025 Golden Sheep AI

🌟 “From idea to app — in one language you already speak.”
