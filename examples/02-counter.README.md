# 🔢 Example 2: Counter

**Estimated Time:** 10 minutes  
**Difficulty:** Beginner  
**Concepts:** Number data type, multiple actions, state changes

---

## 🎯 What You'll Learn

- Working with number data types
- Creating multiple buttons with different actions
- Updating values in the database
- Building interactive UI controls

---

## 🚀 Quick Start

1. **Open in VS Code**
   - Open `02-counter.shep`

2. **View the Preview**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)

3. **Try It Out**
   - Click "New Counter" to create a counter
   - Click "Increment" to add to the count
   - Click "Decrement" to subtract
   - Click "Reset" to go back to zero

---

## 📖 Code Walkthrough

### Frontend (`02-counter.shep`)

```sheplang
data Counter:
  fields:
    value: number
    label: text
```
**New concept:** `number` data type for numeric values.

```sheplang
view Dashboard:
  list Counter
  button "New Counter" -> CreateCounter
  button "Increment" -> Increment
  button "Decrement" -> Decrement
  button "Reset" -> Reset
```
**Multiple buttons** trigger different actions.

```sheplang
action CreateCounter(label):
  add Counter with label, value=0
  show Dashboard
```
Creates a new counter starting at 0.

```sheplang
action Increment:
  add Counter with label="Count", value=1
  show Dashboard
```
Each click adds a new counter entry with value 1 (shows history of clicks).

### Backend (`02-counter.shepthon`)

```shepthon
model Counter {
  id: id
  value: number
  label: text
}
```
The `number` type stores integers and decimals.

```shepthon
endpoint PUT "/counters/:id" {
  const { id } = request.params
  const { value } = request.body
  const counter = db.counters.update({
    where: { id: id },
    data: { value: value }
  })
  return counter
}
```
**New concept:** `PUT` endpoint for updating existing records.

---

## ✨ How It Works

### The Flow

1. **User clicks "New Counter"**
   - `CreateCounter` action runs
   - Adds Counter with value=0
   - Shows updated Dashboard

2. **User clicks "Increment"**
   - `Increment` action runs
   - Adds new Counter with value=1
   - List shows all counter entries

3. **User clicks "Decrement"**
   - Adds Counter with value=-1

4. **User clicks "Reset"**
   - Adds Counter with value=0

### Understanding the List

Each button click creates a **new record** in the list. This shows:
- History of all your clicks
- Different values (positive, negative, zero)
- How lists work in ShepLang

---

## 🎓 Key Concepts

### Number Data Type
```sheplang
value: number
```
- Stores integers: `0`, `1`, `-5`, `42`
- Stores decimals: `3.14`, `-0.5`
- Used for counts, prices, scores, etc.

### Multiple Actions
```sheplang
button "Increment" -> Increment
button "Decrement" -> Decrement
```
- Each button can trigger a different action
- Actions can have different logic
- Build complex UIs with simple buttons

### State Management
Every action that adds or updates data changes your app's state:
- Frontend stays in sync automatically
- Backend persists the data
- No manual state management needed!

---

## 🔄 Try These Modifications

### Challenge 1: Custom Increment Value
Modify the Increment action to add 5 instead of 1:
```sheplang
action Increment:
  add Counter with label="Count", value=5
  show Dashboard
```

### Challenge 2: Add a "Double" Button
Add a new button that adds 2 to the count:
```sheplang
button "Double" -> Double

action Double:
  add Counter with label="Double", value=2
  show Dashboard
```

### Challenge 3: Add a Total Counter
**Advanced:** Try tracking a single counter that updates (hint: you'll need to use the PUT endpoint!)

---

## 🆚 Comparison

**Traditional Way (React):**
```javascript
const [count, setCount] = useState(0);

const increment = () => {
  setCount(prev => prev + 1);
  // Also need: API call, error handling, loading state
};
```

**ShepLang Way:**
```sheplang
action Increment:
  add Counter with label="Count", value=1
  show Dashboard
```

---

## 🐛 Common Issues

**Q: Why does clicking "Increment" add a new item instead of updating?**  
A: The current action uses `add` which creates new records. This shows the history of all clicks! To update a single counter, you'd need to track the counter ID and use the PUT endpoint.

**Q: Can I have negative numbers?**  
A: Yes! The "Decrement" action uses `value=-1` to show negative numbers.

---

## ➡️ Next Steps

**Completed:** ✅ Number data types, multiple actions  
**Next:** [Example 3: Contact List](./03-contact-list.README.md) - Learn multiple fields

---

**Prerequisites:** Example 1 (Hello World)  
**Estimated Time:** 10 minutes  
**Your Time:** ___ minutes

🎉 **Congratulations!** You've learned state management in ShepLang!
