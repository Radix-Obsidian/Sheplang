<div align="center">
  <h1>🛡️ ShepVerify + 🐑 ShepLang</h1>
  
  <p>
    <strong>Ship verified code. Any language.</strong><br>
    Real-time code verification for VS Code with Lighthouse-style scores.
  </p>
  
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode">
      <img src="https://img.shields.io/badge/VS%20Code-Install%20Free-blue" alt="VS Code Extension">
    </a>
    <img src="https://img.shields.io/badge/Languages-11-brightgreen" alt="Languages">
    <img src="https://img.shields.io/badge/version-1.4.0-blue" alt="Version">
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
    </a>
  </p>
  
  <p>
    <a href="#-shepverify-dashboard">ShepVerify</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="#-sheplang">ShepLang</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="#-quick-start">Quick Start</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="#-playground">Playground</a>
  </p>
</div>

---

## 🛡️ ShepVerify Dashboard

Real-time code verification that works across **11 languages**:

| Language | What We Check |
|----------|---------------|
| 🔷 **TypeScript** | Type safety, null checks, `any` usage |
| 🟡 **JavaScript** | Type coercion, null access |
| ⚛️ **React TSX/JSX** | Hook rules, prop types, patterns |
| 🐍 **Python** | Type hints, None safety, PEP8 |
| 🌐 **HTML** | Accessibility, SEO, semantics |
| 🎨 **CSS/SCSS/LESS** | Best practices, performance |
| 📦 **JSON** | Syntax, schema validation |
| 🐑 **ShepLang** | Full 4-phase verification |

### Features
- ✅ **Lighthouse-style scores** (0-100%) for code quality
- ✅ **Click any error** to jump to the exact line
- ✅ **Language-specific metrics** (Type Safety, Null Safety, etc.)
- ✅ **Verification history** across sessions
- ✅ **Status bar** for quick glance

---

## 🐑 ShepLang

The AI-native programming language with built-in verification:

```sheplang
app TaskManager

data Task:
  fields:
    title: text
    done: yes/no

view Dashboard:
  list Task
  button "Add" -> CreateTask

action CreateTask(title):
  call POST "/tasks" with title
  show Dashboard
```

### Why ShepLang?
- **AI-optimized** - Small, deterministic grammar for LLMs
- **Human-readable** - Non-technical founders can understand it
- **100% verified** - Type safety, null safety, API validation

---

## 🚀 Quick Start

### 1. Install VS Code Extension

```
1. Open VS Code
2. Extensions (Ctrl+Shift+X)
3. Search "ShepVerify"
4. Click Install
```

**Or:** [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)

### 2. Open Any File

Open a TypeScript, Python, React, HTML, CSS, or ShepLang file.

### 3. See Verification

The ShepVerify panel shows your code quality score instantly!

---

## 🎮 Playground

Try ShepLang and ShepVerify in your browser:

**[sheplangpg.vercel.app](https://sheplangpg.vercel.app)**

- Write ShepLang code
- See verification scores in real-time
- Preview demos for TypeScript, Python, React, HTML, CSS

---

## 📦 What's Included

| Component | Description |
|-----------|-------------|
| **ShepVerify Dashboard** | Real-time verification panel |
| **11 Language Adapters** | TypeScript, Python, React, HTML, CSS, JSON, ShepLang |
| **AI Wizard** | Generate ShepLang apps with AI |
| **Syntax Highlighting** | Full TextMate grammar for `.shep` files |
| **IntelliSense** | Code completion and diagnostics |

---

## 🏗️ For Developers

### Install from Source

```bash
git clone https://github.com/Radix-Obsidian/Sheplang.git
cd Sheplang

pnpm install
pnpm run build
pnpm run test
```

### Build Extension

```bash
cd extension
pnpm run package
```

---

## 📄 License

MIT © [Golden Sheep AI](https://goldensheepai.com)

---

<div align="center">
  <p>
    <strong>🐑 Making programming human again.</strong>
  </p>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode">Install Extension</a>
    •
    <a href="https://sheplangpg.vercel.app">Try Playground</a>
    •
    <a href="https://github.com/Radix-Obsidian/Sheplang/issues">Report Issues</a>
  </p>
</div>”
