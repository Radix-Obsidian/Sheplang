# 📚 ShepLang Examples

Production-ready examples showcasing ShepLang's capabilities from simple apps to enterprise features.

---

## 🚀 Quick Start

All examples are ready to run with the VSCode extension:

1. Install [ShepLang for VSCode](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode)
2. Open any `.shep` file below
3. Click "Show Preview" to see your app running

---

## 📱 Examples by Complexity

### 🟢 **Beginner** (Learn the basics)

#### [HelloWorld](./hello-world.shep)
- **What:** Simple greeting app
- **Learn:** Basic app structure, data, views, actions
- **Features:** Text display, button interaction

#### [Counter](./counter.shep)
- **What:** Number counter with increment/decrement
- **Learn:** State management, user input
- **Features:** State updates, multiple actions

#### [ContactList](./contact-list.shep)
- **What:** Simple contact manager
- **Learn:** CRUD operations, data persistence
- **Features:** Add, view contacts

---

### 🟡 **Intermediate** (Full-stack features)

#### [TodoApp](./todo-app.shep)
- **What:** Complete task management system
- **Learn:** Full-stack API integration
- **Features:** 
  - Frontend: React components, forms
  - Backend: Express endpoints, validation
  - Database: Prisma CRUD operations
  - API: POST/GET/PUT/DELETE calls

#### [DogReminders](./dog-reminders.shep)
- **What:** Pet care reminder system
- **Learn:** State machines, background jobs
- **Features:** 
  - State transitions (pending → completed)
  - Scheduled daily reminders
  - Email notifications

---

### 🔴 **Advanced** (Enterprise features)

#### [TaskManager](./task-manager.shep) ⭐ **Featured Example**
- **What:** Complete enterprise task management
- **Learn:** Full AIVP Stack capabilities
- **Features:**
  - **Frontend:** React UI with real-time updates
  - **Backend:** Express API with validation
  - **Database:** Prisma with complex relationships
  - **Workflows:** Multi-step business processes
  - **Authentication:** JWT + role-based access
  - **Real-time:** WebSocket live collaboration
  - **Integrations:** Stripe, SendGrid, Twilio
  - **Background Jobs:** Scheduled automation
  - **Validation:** Frontend & backend rules

#### [EcommercePlatform](./ecommerce-platform.shep)
- **What:** Full e-commerce system
- **Learn:** Payment processing, inventory management
- **Features:** Stripe payments, order workflows

#### [SocialApp](./social-app.shep)
- **What:** Social networking features
- **Learn:** Real-time feeds, user interactions
- **Features:** Posts, likes, comments, real-time updates

---

## 🏗️ Generated Architecture

Every example generates a complete production stack:

### Frontend (React + TypeScript)
```typescript
// Generated from ShepLang actions
actions/CreateTodo.ts     // API calls with fetch()
views/Dashboard.tsx       // React components
hooks/useTodos.ts         // Custom hooks
```

### Backend (Express + Prisma)
```typescript
// Generated from ShepLang data/calls
api/routes/todos.ts       // Express endpoints
middleware/auth.ts        // JWT authentication
services/email.ts         // SendGrid integration
```

### Database (PostgreSQL + Prisma)
```prisma
// Generated from ShepLang data models
schema.prisma             // Type-safe database
migrations/               // Database schema
```

### Infrastructure (Production Ready)
```yaml
# Generated deployment config
docker-compose.yml        // Local development
vercel.json              // Production deployment
github-actions.yml       // CI/CD pipeline
```

---

## 🎯 Learning Path

### 1. Start Here
```sheplang
app HelloWorld {
  view Home:
    show "Hello, World!"
    button "Click me" -> SayHello
  
  action SayHello():
    show "Hello from ShepLang!"
}
```

### 2. Add Data
```sheplang
data Message:
  fields:
    text: text
    created: datetime

view Home:
  list Message
  button "Add" -> CreateMessage
```

### 3. Add API Calls
```sheplang
action CreateMessage(text):
  call POST "/messages" with text
  load GET "/messages" into messages
  show Home
```

### 4. Add Advanced Features
```sheplang
// Workflows
action OnboardUser(email):
  step SendWelcome
  step VerifyEmail
  step SetupProfile
  on error -> SupportTeam

// Background jobs
job DailyDigest:
  schedule: daily at "9am"
  action: SendEmailDigest

// Real-time
subscribe to MessageUpdates
```

---

## 🚀 Run Examples

### Using VSCode Extension (Recommended)
1. Open any `.shep` file
2. Click "Show Preview"
3. See your app running instantly

### Using CLI
```bash
# Clone the repo
git clone https://github.com/Radix-Obsidian/Sheplang-BobaScript.git
cd Sheplang-BobaScript/examples

# Run specific example
sheplang run task-manager.shep

# Or start development server
sheplang dev
```

### Using Web Playground (Coming Soon)
Visit [playground.sheplang.com](https://playground.sheplang.com)

---

## 📊 What You Get

From simple ShepLang syntax, you generate:

✅ **Complete Frontend** - React components with hooks  
✅ **Full Backend** - Express API with validation  
✅ **Database Layer** - Prisma ORM with migrations  
✅ **Authentication** - JWT + role-based access  
✅ **Real-time Features** - WebSocket live updates  
✅ **Third-party Integrations** - Stripe, SendGrid, Twilio  
✅ **Background Jobs** - Scheduled automation  
✅ **Production Deployment** - Vercel/Netlify ready  

---

## 🎓 Next Steps

1. **Try the examples** - Start with HelloWorld, work up to TaskManager
2. **Read the docs** - [docs.sheplang.com](https://docs.sheplang.com)
3. **Join the community** - [Discord](https://discord.gg/sheplang)
4. **Build your own** - Create your first ShepLang app

---

## 💡 Tips

- **Start simple** - Master basics before advanced features
- **Use the playground** - Experiment without setup
- **Check generated code** - Learn how ShepLang compiles
- **Read error messages** - ShepVerify provides helpful feedback
- **Join the community** - Get help from other builders

---

**Ready to build?** Start with [HelloWorld](./hello-world.shep) and work your way up to [TaskManager](./task-manager.shep).

🐑 **Welcome to the future of programming!**
