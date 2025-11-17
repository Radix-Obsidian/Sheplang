# 🐕 Example 4: Dog Reminders

**Estimated Time:** 30 minutes  
**Difficulty:** Advanced  
**Concepts:** DateTime fields, background jobs, time-based logic, automated workflows

---

## 🎯 What You'll Learn

- Working with date and time data
- Creating background jobs
- Scheduling automated tasks
- Time-based conditionals
- Building production-ready features

---

## 🚀 Quick Start

1. **Open in VS Code**
   - Open `04-dog-reminders.shep`

2. **View the Preview**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)

3. **Try It Out**
   - Click "Add Reminder"
   - Enter: "Take Milo out", Time: (future time)
   - Watch the reminder appear
   - Wait 5 minutes past the reminder time
   - See it automatically marked as done!

---

## 📖 Code Walkthrough

### Frontend (`04-dog-reminders.shep`)

```sheplang
data Reminder:
  fields:
    text: text
    time: datetime
    done: yes/no
```

**New concept:** `datetime` field type!

- Stores date AND time together
- Example: "2025-11-17 10:00 AM"
- Used for schedules, deadlines, timestamps

```sheplang
rules:
  - "text is required"
  - "time must be in the future"
```

Smart validation ensures:
- Reminder has text
- Time is set to future (can't remind about the past!)

### Backend (`04-dog-reminders.shepthon`)

```shepthon
model Reminder {
  id: id
  text: text
  time: datetime
  done: yes/no
}
```

Backend model matches frontend.

**The Magic: Background Job**

```shepthon
job "mark-due-as-done" every 5 minutes {
  const now = new Date()
  const dueReminders = db.reminders.findMany({
    where: { 
      time: { lte: now },
      done: false
    }
  })
  
  for (const reminder of dueReminders) {
    db.reminders.update({
      where: { id: reminder.id },
      data: { done: true }
    })
  }
}
```

**This is HUGE!** Let's break it down:

1. **`job "mark-due-as-done"`** - Names the background job
2. **`every 5 minutes`** - Runs automatically every 5 minutes
3. **`const now = new Date()`** - Gets current time
4. **Find due reminders** - Queries reminders where time has passed and not done
5. **Mark as done** - Updates each reminder to done=true

---

## ✨ How Background Jobs Work

### The Power of Automation

**Traditional apps require:**
- User manually marks things done
- User checks frequently for updates
- Manual intervention for time-based tasks

**With ShepLang jobs:**
- Automatic execution on schedule
- No user intervention needed
- Runs even when user isn't using app
- Perfect for time-based workflows

### Job Schedule Options

```shepthon
every 1 minute    // Very frequent (testing)
every 5 minutes   // Our example
every 1 hour      // Hourly tasks
every 1 day       // Daily tasks
every 1 week      // Weekly tasks
```

---

## 🎓 Key Concepts

### DateTime Field Type

```sheplang
time: datetime
```

**Stores:**
- Date: Year, month, day
- Time: Hour, minute, second
- Timezone information

**Use Cases:**
- Appointment scheduling
- Deadline tracking
- Event planning
- Log timestamps

### Background Jobs

```shepthon
job "job-name" every duration {
  // automated logic
}
```

**Perfect For:**
- Scheduled emails/notifications
- Data cleanup tasks
- Status updates
- Report generation
- Automated workflows

### Time Comparisons

```shepthon
where: { 
  time: { lte: now }  // less than or equal
}
```

**Operators:**
- `lte` - Less than or equal (past/now)
- `gte` - Greater than or equal (future/now)
- `lt` - Less than (past)
- `gt` - Greater than (future)

---

## 🔄 Try These Modifications

### Challenge 1: Change Job Frequency

Make it check every minute for testing:
```shepthon
job "mark-due-as-done" every 1 minute {
```

### Challenge 2: Add Notification Text

Add a message when reminder is due:
```shepthon
job "mark-due-as-done" every 5 minutes {
  const now = new Date()
  const dueReminders = db.reminders.findMany({
    where: { 
      time: { lte: now },
      done: false
    }
  })
  
  for (const reminder of dueReminders) {
    console.log(`Reminder due: ${reminder.text}`)
    db.reminders.update({
      where: { id: reminder.id },
      data: { done: true }
    })
  }
}
```

### Challenge 3: Add Priority Field

Add urgent vs normal reminders:
```sheplang
priority: text = "normal"
```

### Challenge 4: Delete Old Reminders

Add a job to clean up old reminders:
```shepthon
job "cleanup-old" every 1 day {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const oldReminders = db.reminders.findMany({
    where: { 
      time: { lt: weekAgo },
      done: true
    }
  })
  
  for (const reminder of oldReminders) {
    db.reminders.delete({ where: { id: reminder.id } })
  }
}
```

---

## 🆚 Real-World Applications

### Use Case 1: Dog Walking App
```
Reminder: "Take Milo out"
Time: 8:00 AM daily
Job: Auto-mark when time passes
Result: Never forget to walk your dog!
```

### Use Case 2: Medication Reminders
```
Reminder: "Take vitamin D"
Time: 9:00 AM
Job: Mark done automatically
Result: Track medication adherence
```

### Use Case 3: Task Deadlines
```
Reminder: "Submit report"
Time: Friday 5:00 PM
Job: Auto-flag overdue tasks
Result: Never miss a deadline
```

### Use Case 4: Event Notifications
```
Reminder: "Team meeting"
Time: 2:00 PM today
Job: Mark past events automatically
Result: Clean event calendar
```

---

## 🏗️ Architecture Deep Dive

### The Job Scheduler

**How it works:**
1. Extension starts backend when you open `.shepthon` file
2. Scheduler registers all jobs defined in code
3. Scheduler runs jobs at specified intervals
4. Jobs query database and perform actions
5. Changes reflect in frontend automatically

**In Development:**
- Jobs run immediately on start
- Use short intervals (1 minute) for testing
- Check Output logs: `Ctrl+Shift+L`

**In Production:**
- Jobs run on server
- Use appropriate intervals
- Scale with your user base

---

## 🐛 Common Issues

**Q: Job not running?**
1. Check backend is connected (green "✓ Backend" badge)
2. View logs: `Ctrl+Shift+L`
3. Look for "[Job] mark-due-as-done executed"
4. Restart backend: `Ctrl+Shift+R`

**Q: Reminders not auto-marking as done?**
1. Wait for job interval (5 minutes)
2. Check reminder time is in the past
3. Verify `done` is false before job runs
4. Check Output logs for job execution

**Q: How do I test jobs quickly?**
- Change `every 5 minutes` to `every 1 minute`
- Add reminders with time = 1 minute from now
- Watch them auto-complete!

---

## 📊 Data Flow

```
User Action (Add Reminder)
    ↓
Frontend calls POST /reminders
    ↓
Backend creates reminder in DB
    ↓
Frontend refreshes list
    ↓
[5 minutes pass]
    ↓
Background job runs automatically
    ↓
Job queries due reminders
    ↓
Job marks reminders as done
    ↓
Frontend shows updated status
```

---

## 🎯 Learning Objectives Achieved

- ✅ DateTime field type
- ✅ Time-based validation
- ✅ Background job creation
- ✅ Scheduled task execution
- ✅ Time comparisons in queries
- ✅ Automated workflows
- ✅ Production-ready architecture

---

## ➡️ Next Steps

**Completed:** ✅ All core ShepLang features!  
**Next Steps:**
- Combine concepts from all examples
- Build your own app from scratch
- Explore [Language Reference](../extension/LANGUAGE_REFERENCE.md)
- Check out [AI Best Practices](../extension/AI_BEST_PRACTICES.md)

---

## 🏆 Achievement Unlocked!

**You've completed all ShepLang tutorials!**

You now know:
- ✅ Data modeling (Examples 1-4)
- ✅ Views and actions (Examples 1-4)
- ✅ Multiple field types (text, number, yes/no, datetime)
- ✅ CRUD operations (Examples 1-4)
- ✅ State management (Example 2)
- ✅ Validation rules (Example 3)
- ✅ Background jobs (Example 4)
- ✅ Time-based logic (Example 4)

**What you can build:**
- Todo lists
- Contact management
- Reminder systems
- Scheduling apps
- CRM systems
- Event planners
- And much more!

---

**Prerequisites:** Examples 1-3  
**Estimated Time:** 30 minutes  
**Your Time:** ___ minutes

🎉 **Congratulations!** You're a ShepLang developer!
