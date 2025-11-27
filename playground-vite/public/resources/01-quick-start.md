# ShepLang & ShepVerify Quick Start
**Write Code. See It Verified in Real-Time.**

---

## 🛡️ Welcome to ShepVerify!

This playground demonstrates **ShepVerify** - our real-time code verification system. Write ShepLang code on the left, and watch the verification panel on the right show you:

- **Verification Score** (0-100%)
- **Phase-by-Phase Breakdown**
- **Clickable Errors** (jump to exact line)

---

## 📝 Try This Code

The default code is already loaded. Try making changes and watch the verification update in real-time!

```sheplang
app MyTodoApp

data Task:
  fields:
    title: text
    completed: yes/no

view Dashboard:
  list Task
  button "Add Task" -> AddTask

action AddTask(title):
  add Task with title, completed = false
  show Dashboard
```

**Watch the ShepVerify panel update as you type!**

---

## 🎯 Understanding ShepVerify

The verification panel shows four phases:

### ✓ Type Safety
Ensures all fields and types are correctly defined.

### ✓ Null Safety  
Catches potential null/undefined access.

### ✓ API Contracts
Validates action signatures and data flow.

### ✓ Exhaustiveness
Checks that all cases are handled.

---

## 💡 Try Introducing an Error

Change `text` to `texxt` (typo) and watch what happens:

```sheplang
data Task:
  fields:
    title: texxt  # Typo!
```

**ShepVerify instantly catches it!** Click the error to jump to the line.

---

## 🚀 Want ShepVerify for 11 Languages?

The playground only verifies ShepLang. Our **VS Code Extension** verifies:

| Language | What We Check |
|----------|---------------|
| **TypeScript** | Type safety, null checks |
| **JavaScript** | Type coercion, patterns |
| **React TSX/JSX** | Hook rules, prop types |
| **Python** | Type hints, PEP8, None safety |
| **HTML** | Accessibility, SEO |
| **CSS/SCSS/LESS** | Best practices |
| **JSON** | Schema validation |

**👉 [Install ShepVerify for VS Code](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)**

---

## 🎨 ShepLang Basics

### `app AppName`
Your application container

### `data EntityName:`
Define your data models

### `view ViewName:`
Define your user interfaces

### `action ActionName():`
Define your business logic

---

## 🌟 Why ShepLang + ShepVerify?

**Traditional Development:**
```
Write code → Run it → See error → Fix → Run again → Repeat
```

**With ShepVerify:**
```
Write code → Verified instantly → Ship with confidence
```

---

## 🎯 Your Next Step

### Option 1: Keep Experimenting
Try different ShepLang patterns. Watch verification update in real-time.

### Option 2: Install the VS Code Extension
Get ShepVerify for TypeScript, Python, React, and more.

**👉 [Install VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)**

---

*Reading time: 2 minutes*  
*Difficulty: Beginner*  
*Next: [ShepLang Syntax](./02-syntax-cheat-sheet.md)*
