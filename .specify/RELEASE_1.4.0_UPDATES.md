# Release v1.4.0 - Multi-Language ShepVerify

**Release Date:** November 27, 2025  
**Codename:** "The Lighthouse Update"

---

## 🆕 What's New

### ShepVerify Dashboard
- **11 Languages Supported** - TypeScript, JavaScript, React TSX/JSX, Python, HTML, CSS, SCSS, LESS, JSON, ShepLang
- **Real-time Verification** - Scores update as you type
- **Click-to-Navigate** - Double-click errors to jump to exact line
- **Language-specific Metrics** - Each language has its own relevant scores

### Playground Updates
- **Language Switcher** - Preview verification for TypeScript, Python, React, HTML, CSS
- **Demo Code Samples** - See sample issues ShepVerify would catch
- **Syntax Highlighting** - Monaco editor switches language for demos

---

## 📦 Version Updates

| Package | Old | New |
|---------|-----|-----|
| VS Code Extension | 1.3.2 | **1.4.0** |
| Language Package | 1.0.0 | **1.1.0** |

---

## 📝 Updated READMEs

### GitHub README (Main)

```markdown
<div align="center">
  <h1>🐑 ShepLang + ShepVerify</h1>
  
  <p>
    <strong>Ship Verified Code. Any Language.</strong><br>
    Real-time code verification for VS Code with Lighthouse-style scores.
  </p>
  
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode">
      <img src="https://img.shields.io/badge/VS%20Code-Extension-blue" alt="VS Code Extension">
    </a>
    <img src="https://img.shields.io/badge/Languages-11-brightgreen" alt="Languages">
    <img src="https://img.shields.io/badge/version-1.4.0-blue" alt="Version">
  </p>
</div>

---

## 🛡️ ShepVerify Dashboard

Real-time code verification that works across **11 languages**:

| Language | What We Check |
|----------|---------------|
| **TypeScript** | Type safety, null checks, any usage |
| **JavaScript** | Type coercion, null access |
| **React TSX/JSX** | Hook rules, prop types, patterns |
| **Python** | Type hints, None safety, PEP8 |
| **HTML** | Accessibility, SEO, semantics |
| **CSS/SCSS/LESS** | Best practices, performance |
| **JSON** | Syntax, schema validation |
| **ShepLang** | Full 4-phase verification |

### Features
- ✅ **Lighthouse-style scores** (0-100%)
- ✅ **Click-to-navigate** errors
- ✅ **Phase breakdown** per language
- ✅ **History tracking**
- ✅ **Status bar** quick view

---

## 🐑 ShepLang

Write apps in plain English, get verified full-stack code:

\`\`\`sheplang
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
\`\`\`

---

## 🚀 Quick Start

1. Install the [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)
2. Open any supported file
3. See verification scores in the ShepVerify panel

---

## 📖 Documentation

- [Quick Start Guide](./docs/QUICKSTART.md)
- [ShepLang Syntax](./docs/SYNTAX.md)
- [Playground](https://sheplangpg.vercel.app)
```

---

### VS Code Extension README

```markdown
# 🛡️ ShepVerify - Real-Time Code Verification

**Ship verified code with confidence. Works across 11 languages.**

---

## ✨ What's New in v1.4.0

### Multi-Language Verification
ShepVerify now verifies **11 languages**, not just ShepLang:

- 🔷 **TypeScript** - Type safety, null checks, any usage
- 🟡 **JavaScript** - Type coercion, null access  
- ⚛️ **React TSX/JSX** - Hook rules, prop types
- 🐍 **Python** - Type hints, None safety, PEP8
- 🌐 **HTML** - Accessibility, SEO
- 🎨 **CSS/SCSS/LESS** - Best practices
- 📦 **JSON** - Syntax, schema
- 🐑 **ShepLang** - Full verification

### Dashboard Features
- **Lighthouse-style scores** (0-100%)
- **Click any error** to jump to exact line
- **Language-specific metrics**
- **Verification history**

---

## 🚀 Quick Start

1. **Install** this extension
2. **Open** any supported file
3. **See** real-time verification in the ShepVerify panel

---

## 📊 How It Works

ShepVerify analyzes your code in real-time and provides:

| Metric | What It Catches |
|--------|-----------------|
| **Type Safety** | Missing types, `any` usage, unsafe assertions |
| **Null Safety** | Potential null access, missing optional chaining |
| **Code Quality** | Best practices violations, patterns |
| **Framework Patterns** | React hooks, HTML accessibility |

---

## 🐑 Bonus: ShepLang

Also includes full support for ShepLang - the AI-native programming language:

\`\`\`sheplang
app MyApp

data User:
  fields:
    name: text
    email: text

view Dashboard:
  list User
  button "Add User" -> CreateUser

action CreateUser(name, email):
  call POST "/users" with name, email
  show Dashboard
\`\`\`

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `ShepLang: Quick Create Project` | AI-powered app generation |
| `ShepLang: Run ShepVerify` | Manual verification |
| `ShepLang: Import from GitHub` | Convert existing code |

---

## 🔧 Requirements

- VS Code 1.80.0+
- Works with: VS Code, Cursor, Windsurf

---

## 📚 Resources

- [Documentation](https://github.com/Radix-Obsidian/Sheplang)
- [Playground](https://sheplangpg.vercel.app)
- [Report Issues](https://github.com/Radix-Obsidian/Sheplang/issues)
```

---

## 📢 Product Hunt Copy

### Tagline (60 chars)
```
Ship verified code. Any language. Real-time in VS Code.
```

### Description (260 chars)
```
ShepVerify is a VS Code extension that catches bugs before they ship. 
Get Lighthouse-style scores for TypeScript, Python, React, HTML, CSS & more. 
Click any error to jump to the exact line. Stop shipping broken code.
```

### Longer Description
```
🛡️ ShepVerify - The Lighthouse for Your Code

Tired of finding bugs after deployment? ShepVerify analyzes your code 
in real-time and gives you a quality score before you ship.

✅ 11 Languages - TypeScript, Python, React, HTML, CSS, JSON & more
✅ Real-Time Scores - See issues as you type
✅ Click-to-Fix - Jump to exact line with one click
✅ Language-Specific - Different checks for each language

It's like having a senior developer reviewing every line.

🐑 BONUS: Includes ShepLang - write apps in plain English!

Install free → VS Code Marketplace
```

### Maker Comment
```
Hey Product Hunt! 👋

I built ShepVerify because I was tired of AI coding tools 
generating buggy code. Copilot, Claude, Cursor - they're 
amazing at writing code, but who verifies it?

ShepVerify is the verification layer. It catches:
- Type errors before runtime
- Null access bugs
- Missing accessibility attributes  
- React hook mistakes
- Python type hint issues
- And much more across 11 languages

The best part? It works in real-time, so you see issues 
as you type - not after you deploy.

Try it free. I'd love your feedback! 🚀

- Jordan (@GoldenSheepAI)
```

---

## 🏷️ Version Bump Files

### extension/package.json
Change `"version": "1.3.2"` → `"version": "1.4.0"`

### CHANGELOG.md
Add:
```markdown
## [1.4.0] - 2025-11-27

### Added
- Multi-language ShepVerify support (11 languages)
- TypeScript/JavaScript verification adapter
- Python verification adapter (type hints, None safety, PEP8)
- HTML verification adapter (accessibility, SEO, semantics)
- CSS/SCSS/LESS verification adapter
- JSON verification adapter
- Language switcher in playground
- Demo code samples for each language
- Click-to-navigate errors with line highlighting

### Changed
- Playground now shows ShepVerify panel instead of preview
- Dashboard displays language-specific metrics
- Header updated for multi-language focus

### Fixed
- Python files now correctly verified (was using TypeScript adapter)
```

---

## 🔗 Links to Update

| Location | Current | Update To |
|----------|---------|-----------|
| Marketplace Description | ShepLang language | ShepVerify + ShepLang |
| Landing Page | sheplang.lovable.app | (Update copy) |
| Playground | sheplangpg.vercel.app | (Deployed ✅) |
| NPM Package | README outdated | Update description |

---

## ✅ Checklist

- [ ] Update `extension/package.json` version to 1.4.0
- [ ] Update `CHANGELOG.md` with new features
- [ ] Update GitHub README.md
- [ ] Update VS Code Extension README.md
- [ ] Update NPM README-NPM.md
- [ ] Publish VS Code extension (`vsce publish`)
- [ ] Update Product Hunt page
- [ ] Update landing page copy

---

*Golden Sheep AI - November 27, 2025*
