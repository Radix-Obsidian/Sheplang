# 🌱 Shipyard User Journey (Beginner → Builder → Power User)

This journey shows what real people can build, how long it takes, and how your platform helps them learn while building.

---

## 🧭 Phase 0 — The First 5 Minutes

### Goal: "OMG I can actually build something."

**User lands in Shipyard.**

They see:
- Editor (ShepLang)
- Backend (ShepThon)
- Live Preview Panel
- Explain Mode (AI tutor)

**"Start a Starter App" → To-Do List**

**Emotional goal:**  
"I'm not lost. This explains itself."

---

### What They Actually Build:

**Frontend (ShepLang):**
```sheplang
component TodoApp {
  state todos = []

  on mount {
    action LoadTodos()
  }

  "My Tasks"

  for t in todos {
    show t.text
  }

  form AddTask(text: string) {
    submit {
      action AddTask(text)
    }
  }
}
```

**Backend (ShepThon):**
```shepthon
app TodoBackend {
  model Todo { id: id, text: string }

  endpoint GET "/todos" -> [Todo] {
    return db.Todo.findAll()
  }

  endpoint POST "/todos" (text: string) -> Todo {
    return db.Todo.create({ text })
  }
}
```

They click "Save" → **Preview updates instantly.**

**Time needed:** 5–10 minutes  
**Founder's reaction:**  
"This is WAY easier than React + Node."

---

## 🌿 Phase 1 — First 30 Minutes

### Goal: Build a real mini-app. Understand the loop.

**Step 1 — Add forms, lists, styling**
- They tweak their app. Add labels, add simple UI patterns, change layout.

**Step 2 — Add logic**
- They add a "Done" checkbox or similar behavior.

**Step 3 — Add a job (optional)**

Shipyard job example:
```shepthon
job "cleanup" every 10 minutes {
  let old = db.Todo.find({ done: true })
  for t in old {
    db.Todo.delete(t.id)
  }
}
```

**Step 4 — AI "Explain Mode"**
- They click any line → "Explain this in simple terms."

**Step 5 — Save version**
- Shipyard auto-creates a version named:  
  `My Todo App — Version 1`

**Emotional goal:**  
"I understand the language AND I see the results."

---

## 🌳 Phase 2 — First Week ("Founder MVP")

### Goal: Build a real product idea they had in their head.

**What they can realistically build within a week:**

### Example 1 — Personal CRM

**Frontend (ShepLang):**
- Contact list + filters
- Click to add note
- Promote lead → customer button

**Backend (ShepThon):**
- Models: Lead, Note
- Endpoints: CRUD
- Business logic: Promote, qualify
- Daily job: "cleanup stale leads"

---

### Example 2 — Pet Reminders App

**Frontend:**
- Reminders list
- Form for "walk", "feed", "meds"
- Daily/weekly schedule views

**Backend:**
- Model Reminder
- 3 endpoints
- "Mark overdue reminders as done" job

---

### Example 3 — Mood Tracker

**Backend:**
- Model MoodEntry
- Model User
- AI analysis endpoint (future)

**Frontend:**
- Form + charts + filters

---

**Time needed:** 3–7 days  
**Founder reaction:**  
"I'm legit building an MVP and I don't feel stupid."

---

## 🌲 Phase 3 — Power User (Week 2–4)

### Goal: Building something actually useful, demo-ready.

These users start creating:

### ⚡ AI-powered weather dashboard

**Frontend:**
- Weather cards
- Favorites
- Animations

**Backend:**
- Weather fetch endpoint (ShepThon)
- Cache jobs
- Data normalization

**AI agent:**
- "Generate a weather card layout"
- "Connect this to the backend endpoint"

---

### ⚡ Personal finance tracker

**Frontend:**
- Expenses list
- Categories
- Charts

**Backend:**
- Models: Expense, Category
- Monthly summary job
- Sync with CSV importer

---

### ⚡ Basic SaaS starter (real!)

**Frontend:**
- Pricing page
- Dashboard
- Settings

**Backend:**
- Auth (simple version)
- Users model
- Team model
- Billing scaffold

---

**Time needed:** 2–4 weeks  
**Founder reaction:**  
"This feels like actual coding, but easier."

---

## 🌴 Phase 4 — The "I can build anything" Moment (Month 1–2)

### Goal: Build something pitch-ready for investors.

**Final projects users can build:**

- 🚀 Solo CRM
- 🚀 Budget planner
- 🚀 Habit coach
- 🚀 Recipe finder
- 🚀 Local directory app
- 🚀 Appointment scheduler
- 🚀 Mini e-commerce
- 🚀 Social "wall" app
- 🚀 Mini AI-coach

**These apps include:**
- Multiple screens
- Multiple data models
- API calls
- Background jobs
- State transitions
- Small analytics layer
- **Deploy to shareable URL**

**Founder reaction:**  
"I made a real app without months of struggle."

---

## 🏁 Final Phase — The Pivot / Pitch Ready Stage

When founders reach this stage, they understand:

- **ShepLang** → makes frontend readable
- **ShepThon** → makes backend readable
- **BobaScript** → compiles both into something that runs
- **Shipyard** → lets them build + preview + iterate

**They now have:**
- A real MVP
- Real users testing it
- A clear pitch
- A sense of empowerment

---

## 🔥 Why This Journey Works

Because it hits all the things you cared about:

### Not "Build it in 10 minutes" B.S.
- We don't lie.
- We empower.

### Learning while building
- Shipyard explains everything.

### Founder-first, not developer-first
- ShepThon + ShepLang are readable like English.

### A real sandbox
- Not mockups.
- Real backend.
- Real frontend.
- Real jobs.
- Real logic.

### Under-promise, over-deliver
**We say:**  
"Build your MVP in weeks."

**They discover:**  
"I built a working version in 9 days."

**Exactly how you wanted it.**
