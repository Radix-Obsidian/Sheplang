# ShepLang vs ShepThon Syntax Reference

**Source:** Official examples and parser tests  
**Date:** November 16, 2025

---

## ⚠️ CRITICAL: They Use Different Syntax!

ShepLang (.shep) and ShepThon (.shepthon) are **different languages** with **different syntax rules**.

---

## ShepLang Syntax (.shep files)

**Source:** `examples/todo.shep` (official working example)

### App Declaration
```sheplang
app MyTodos          // ✅ NO colon, NO braces
```

### Data Models
```sheplang
data Todo:           // ✅ Colon after name
  fields:            // ✅ REQUIRED fields block
    title: text
    done: yes/no
  rules:             // Optional
    - "user can update own items"
```

### Field Types (ShepLang)
- `text` - Text strings
- `number` - Numeric values
- `yes/no` - Boolean values
- `date` - Date/time values
- `email` - Email addresses
- `id` - Unique identifiers

### Views
```sheplang
view Dashboard:
  list Todo
  button "Add Task" -> CreateTodo
```

### Actions
```sheplang
action CreateTodo(title):
  add Todo with title, done=false
  show Dashboard

action LoadItems():
  load GET "/todos" into todos
  show Dashboard
```

---

## ShepThon Syntax (.shepthon files)

**Source:** `sheplang/packages/shepthon/test/parser.test.ts` (official parser tests)

### App Declaration
```shepthon
app DogReminders {    // ✅ Curly braces required
  // content here
}
```

### Models
```shepthon
model Reminder {      // ✅ Curly braces, NO fields block
  id: id
  text: string
  time: datetime
  done: bool = false
}
```

### Field Types (ShepThon)
- `id` - Unique identifier
- `string` - Text data
- `int` - Integer numbers
- `float` - Decimal numbers
- `bool` - True/false
- `datetime` - Date and time
- `json` - JSON data

### Endpoints
```shepthon
endpoint GET "/reminders" -> [Reminder] {
  return db.Reminder.findAll()
}

endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
  let reminder = db.Reminder.create({ text, time, done: false })
  return reminder
}
```

### Jobs
```shepthon
job "cleanup" every 5 minutes {
  let old = db.Session.find()
  return old
}
```

### Statements
```shepthon
let user = db.User.find(id)        // Variable declaration
return user                         // Return statement
if condition {                      // If statement
  return value
}
for item in items {                 // For loop
  return process(item)
}
```

---

## Side-by-Side Comparison

| Feature | ShepLang (.shep) | ShepThon (.shepthon) |
|---------|------------------|---------------------|
| **App** | `app Name` | `app Name { }` |
| **Data/Model** | `data Name:` | `model Name { }` |
| **Fields Block** | Required: `fields:` | Not used |
| **Text Type** | `text` | `string` |
| **Boolean Type** | `yes/no` | `bool` |
| **Date Type** | `date` | `datetime` |
| **Endpoints** | Not in ShepLang | `endpoint GET "/path"` |
| **Actions** | `action Name():` | Not in ShepThon |
| **Views** | `view Name:` | Not in ShepThon |

---

## Dog Reminders Example

### dog-reminders.shep (Frontend)
```sheplang
app DogReminders

data Reminder:
  fields:
    id: id
    text: text
    time: date
    done: yes/no

view RemindersPage:
  list Reminder
  button "Add Reminder" -> AddReminderForm

action LoadReminders():
  load GET "/reminders" into reminders
  show RemindersPage

action AddReminder(text, time):
  call POST "/reminders"(text, time)
  action LoadReminders()
```

### dog-reminders.shepthon (Backend)
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
    let reminder = db.Reminder.create({ text, time, done: false })
    return reminder
  }
}
```

---

## Common Mistakes

### ❌ Wrong: Mixing ShepThon syntax in ShepLang
```sheplang
app DogReminders {        // ❌ Braces not allowed in ShepLang
  data Reminder {         // ❌ Braces not allowed
    text: string          // ❌ Wrong type, should be 'text'
  }
}
```

### ✅ Correct: ShepLang syntax
```sheplang
app DogReminders          // ✅ No braces

data Reminder:            // ✅ Colon
  fields:                 // ✅ Required fields block
    text: text            // ✅ Correct type
```

### ❌ Wrong: Using ShepLang syntax in ShepThon
```shepthon
app DogReminders:         // ❌ Colon not allowed
model Reminder:           // ❌ Colon not allowed
  fields:                 // ❌ fields block not allowed
    text: text            // ❌ Wrong type, should be 'string'
```

### ✅ Correct: ShepThon syntax
```shepthon
app DogReminders {        // ✅ Braces required
  model Reminder {        // ✅ Braces required
    text: string          // ✅ Correct type, no fields block
  }
}
```

---

## Type Mapping Between Languages

When data flows from ShepLang to ShepThon:

| ShepLang Type | ShepThon Type | Notes |
|--------------|---------------|-------|
| `text` | `string` | Text data |
| `number` | `int` or `float` | Numeric values |
| `yes/no` | `bool` | Boolean |
| `date` | `datetime` | Date/time |
| `email` | `string` | Validated email |
| `id` | `id` | Unique identifier (same) |

---

## Testing Your Syntax

### For ShepLang (.shep):
Look at: `examples/todo.shep` - Official working example

### For ShepThon (.shepthon):
Look at: `sheplang/packages/shepthon/test/parser.test.ts` - Official parser tests, line 318+

---

## Key Takeaway

**ShepLang is Python-like (colons, indentation)**  
**ShepThon is C-like (braces, semicolons optional)**

**Always check the official examples/tests before writing syntax!**
