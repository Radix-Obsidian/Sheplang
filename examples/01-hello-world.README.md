# 👋 Example 1: Hello World

**Estimated Time:** 5 minutes  
**Difficulty:** Beginner  
**Concepts:** Basic app structure, data models, views, actions

---

## 🎯 What You'll Learn

- How to declare a ShepLang app
- Creating a simple data model
- Building a basic view with a button
- Writing your first action

---

## 🚀 Quick Start

1. **Open in VS Code**
   - Open `01-hello-world.shep`
   - The extension activates automatically

2. **View the Preview**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Or run "ShepLang: Show Preview" from command palette

3. **Try It Out**
   - Click the "Say Hello" button
   - Watch the message appear in the list!
   - Click the 🗑️ icon to delete messages

---

## 📖 Code Walkthrough

### Frontend (`01-hello-world.shep`)

```sheplang
app HelloWorld
```
Every ShepLang app starts with an `app` declaration.

```sheplang
data Message:
  fields:
    text: text
```
This defines a **Message** data model with one field: `text`.

```sheplang
view Welcome:
  list Message
  button "Say Hello" -> SayHello
```
The **Welcome** view shows:
- A list of all messages
- A button that triggers the `SayHello` action

```sheplang
action SayHello:
  add Message with text="Hello from ShepLang! 🐑"
  show Welcome
```
The **SayHello** action:
- Creates a new message with preset text
- Refreshes the Welcome view

### Backend (`01-hello-world.shepthon`)

```shepthon
model Message {
  id: id
  text: text
}
```
Backend model matches the frontend model.

```shepthon
endpoint GET "/messages" {
  return db.messages.findMany()
}
```
Returns all messages from the database.

```shepthon
endpoint POST "/messages" {
  const { text } = request.body
  const message = db.messages.create({ text: text })
  return message
}
```
Creates a new message and returns it.

---

## ✨ What Makes This Special

**Traditional Way (React + Express):**
```javascript
// 150+ lines of boilerplate
// useState, useEffect, fetch, express routes
// Error handling, CORS, JSON parsing
```

**ShepLang Way:**
```sheplang
// 15 lines total
// Just describe what you want
// Everything else is automatic
```

---

## 🎓 Key Concepts

### Data Models
- Define your data structure once
- Use in both frontend and backend
- Fields have types: `text`, `number`, `yes/no`

### Views
- Describe what users see
- Use `list` to show data
- Use `button` to trigger actions

### Actions
- Describe what happens when users interact
- Use `add` to create data
- Use `show` to navigate between views

---

## 🔄 Try These Modifications

### Challenge 1: Add a Delete Button
Already included! Click the 🗑️ icon to delete messages.

### Challenge 2: Change the Message
Modify the text in the `SayHello` action:
```sheplang
add Message with text="Your custom message here!"
```

### Challenge 3: Add More Messages
Change the action to add different messages each time (you'll learn how in Example 2!)

---

## ➡️ Next Steps

**Completed:** ✅ Basic app structure  
**Next:** [Example 2: Counter](./02-counter.README.md) - Learn state management

---

**Estimated Completion Time:** 5 minutes  
**Your Time:** ___ minutes

🎉 **Congratulations!** You've built your first ShepLang app!
