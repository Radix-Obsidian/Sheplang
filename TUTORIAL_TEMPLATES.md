# 📚 Beginner-Friendly Tutorial Templates

## Template 1: Hello World ✅ **WORKS TODAY** (2 minutes)

```sheplang
// FILE: examples/01-hello-world.shep
// GOAL: Learn the basics - views and navigation
// TIME: 2 minutes
// STATUS: ✅ WORKS NOW

app HelloWorld

// A view is like a screen in your app
view Welcome:
  // Buttons let users navigate between screens
  button "Say Hello" -> Greeting
  button "Learn More" -> About

// Another screen that shows when you click "Say Hello"
view Greeting:
  button "Go Back" -> Welcome

// An info screen
view About:
  button "Back to Welcome" -> Welcome

// Actions control what happens when you click
action ShowWelcome:
  show Welcome

action ShowGreeting:
  show Greeting

action ShowAbout:
  show About
```

**What You'll Learn:**
- How to declare an app
- How to create views (screens)
- How to add buttons
- How to navigate between screens

**Success Criteria:**
- Click buttons and see screens change
- Three screens work smoothly

---

## Template 2: Todo List (Local) ❌ **BLOCKED** (needs state)

```sheplang
// FILE: examples/02-todo-local.shep
// GOAL: Learn data models and lists
// TIME: 5 minutes
// STATUS: ❌ BLOCKED - No local state management

app TodoLocal

// Data models define the structure of your information
data Todo:
  fields:
    text: text        // What needs to be done
    done: yes/no      // Is it complete?
  rules:
    - "todos belong to the user who created them"

// The main screen shows all todos
view TodoList:
  list Todo                    // Show all todos (❌ doesn't work yet)
  button "Add Todo" -> AddForm

// Screen for adding a new todo
view AddForm:
  // ❌ BLOCKER: No input fields in ShepLang yet
  // We need: input field for "text"
  button "Save" -> SaveTodo
  button "Cancel" -> TodoList

// This action would save the todo
action SaveTodo(text):
  add Todo with text, done=false   // ❌ Doesn't actually save
  show TodoList
```

**Blockers:**
1. No input field syntax in grammar
2. No way to capture user input  
3. `add` doesn't persist without backend
4. `list` doesn't display without data

---

## Template 3: Dog Reminders (Full Stack) ⚠️ **BACKEND WORKS, FRONTEND BROKEN**

### Backend: ✅ COMPLETE
```shepthon
// FILE: examples/03-dog-reminders.shepthon
// This is your backend - it stores and manages data

app DogReminders {
  // A model is like a database table
  model Reminder {
    id: id              // Unique identifier (auto-generated)
    text: string        // What to remind about
    time: datetime      // When to remind
    done: bool = false  // Is it complete? (default: false)
  }

  // GET endpoint - retrieve all reminders
  // Returns a list of reminders
  endpoint GET "/reminders" -> [Reminder] {
    // db.Reminder.findAll() gets all reminders from database
    return db.Reminder.findAll()
  }

  // POST endpoint - create a new reminder
  // Takes text and time as input, returns the created reminder
  endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
    // db.Reminder.create() saves to database
    let reminder = db.Reminder.create({ text, time })
    return reminder
  }

  // PUT endpoint - mark a reminder as done
  endpoint PUT "/reminders/:id/done" (id: id) -> Reminder {
    let reminder = db.Reminder.update(id, { done: true })
    return reminder
  }

  // Background job - runs every 5 minutes
  job "mark-overdue" every 5 minutes {
    // Find all reminders
    let all = db.Reminder.findAll()
    // Loop through each one
    for r in all {
      // If time has passed and not done, mark as done
      if r.time < now() and r.done == false {
        db.Reminder.update(r.id, { done: true })
      }
    }
  }
}
```

### Frontend: ❌ BROKEN (call/load don't work)
```sheplang
// FILE: examples/03-dog-reminders.shep
// This is your frontend - what users see and click

app DogReminders

// Define the data structure (matches backend)
data Reminder:
  fields:
    id: id
    text: text
    time: date
    done: yes/no

// Main screen - shows list of reminders
view RemindersList:
  list Reminder                       // ❌ Shows empty (no data loaded)
  button "Add Reminder" -> AddForm

// Screen for adding a new reminder
view AddForm:
  // ❌ BLOCKER: No input fields yet
  // Need: input for "text", input for "time"
  button "Save" -> SaveReminder
  button "Cancel" -> RemindersList

// Load reminders from backend when app starts
action InitApp():
  load GET "/reminders" into reminders   // ❌ Doesn't execute
  show RemindersList

// Load fresh data
action LoadReminders():
  load GET "/reminders" into reminders   // ❌ Doesn't execute
  show RemindersList

// Save a new reminder
action SaveReminder(text, time):
  call POST "/reminders"(text, time)     // ❌ Doesn't execute  
  action LoadReminders()                 // Reload the list

// Mark a reminder as done
action MarkDone(id):
  call PUT "/reminders/${id}/done"()     // ❌ Doesn't execute
  action LoadReminders()
```

**What SHOULD Happen:**
1. User opens app → `InitApp()` runs → Calls GET /reminders → Shows list
2. User clicks "Add Reminder" → Form appears
3. User enters text & time → Clicks "Save" → Calls POST → New reminder appears
4. User clicks "Mark Done" → Calls PUT → Reminder updates

**What ACTUALLY Happens:**
1. User opens app → ❌ Nothing (InitApp not auto-run)
2. Load/call statements → ❌ Just converted to text strings
3. Buttons → ❌ Only navigate, don't execute actions
4. List → ❌ Empty (no data loaded)

**Blockers:**
1. `load` and `call` not connected to bridge
2. Actions not executed on button click
3. No input fields
4. No app initialization

---

## Template 4: Simple Counter ❌ **NOT POSSIBLE** (no local state)

```sheplang
// FILE: examples/04-counter.shep
// GOAL: Learn about state management
// STATUS: ❌ IMPOSSIBLE - ShepLang has no local state

app Counter

// ❌ This doesn't work - no state system in ShepLang
// We would need:
// state count: number = 0

view CounterView:
  // ❌ Can't display dynamic values
  // show "Count: ${count}"
  button "+" -> Increment
  button "-" -> Decrement
  button "Reset" -> Reset

action Increment:
  // ❌ No 'set' statement in ShepLang
  // set count = count + 1
  show CounterView

action Decrement:
  // ❌ No 'set' statement
  // set count = count - 1
  show CounterView

action Reset:
  // ❌ No 'set' statement
  // set count = 0
  show CounterView
```

**Why This Doesn't Work:**
1. ShepLang has no `state` declaration
2. No `set` statement for updating values
3. No way to display dynamic values in views
4. No arithmetic expressions

**Would Need:**
- State variables
- Set/get operations
- Expression evaluation
- Template syntax for displaying values

---

## Template 5: Contact Form (Input Demo) ❌ **NOT POSSIBLE** (no inputs)

```sheplang
// FILE: examples/05-contact-form.shep
// GOAL: Learn about user input
// STATUS: ❌ IMPOSSIBLE - No input field syntax

app ContactForm

data Contact:
  fields:
    name: text
    email: email
    message: text

view ContactFormView:
  // ❌ No input field syntax in ShepLang
  // We would need:
  // input name: text placeholder="Your Name"
  // input email: email placeholder="Your Email"
  // textarea message placeholder="Your Message"
  button "Submit" -> SubmitForm

view ThankYou:
  button "Send Another" -> ContactFormView

action SubmitForm(name, email, message):
  // ❌ Without backend, can't save
  // Would need: call POST "/contacts"(name, email, message)
  show ThankYou
```

**Why This Doesn't Work:**
1. No `input` or `textarea` in grammar
2. No way to capture user-entered text
3. Parameters come from... nowhere
4. No form validation

---

## Summary: What Actually Works for Beginners?

### ✅ Template 1 (Hello World)
**Works:** View navigation, buttons  
**User Can:** Click buttons and see screens change  
**Good for:** Understanding app structure

### ❌ Templates 2-5
**Blocked by:**
- No input fields
- No local state
- Call/load not working  
- No form handling

### Recommendation:
**For Alpha, only ship Template 1 as "working"**  
Mark others as "Coming Soon" with clear explanations of what's missing.
