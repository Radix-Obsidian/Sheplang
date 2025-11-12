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

**BobaScript** is the engine underneath.  
It compiles ShepLang into executable TypeScript/Next.js projects, runs them live, and explains what’s happening in plain English through *Explain Mode*.

Together, they form an **idea-to-app engine** — turning your concepts into deployable web apps in minutes.

---

## 💡 Why It Matters

Most people with great ideas can’t code.  
ShepLang and BobaScript remove that barrier — giving designers, founders, and creatives the power to build real digital products **without needing a full engineering team**.

- **ShepLang →** reads like “what you mean”  
- **BobaScript →** builds “what you said”  
- **Explain Mode →** teaches you what happened

It’s programming that feels more like storytelling than syntax.

---

## 🚀 Current Capabilities

✅ Parse & transpile `.shep` → `.boba` (deterministic snapshots)  
✅ Real-time preview server (`sheplang dev`) with HMR  
✅ Explain Mode — human-readable breakdown of app structure  
✅ CLI commands (`parse`, `build`, `dev`, `explain`, `stats`)  
✅ Web Playground (Vite + TypeScript) for live editing  
✅ Windows PowerShell verify script — one command to validate everything

---

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
