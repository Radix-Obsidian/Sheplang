# AIVP Stack Quick Reference
**AI-Native Verified Platform - Complete Development Stack**

---

## 🎯 Overview

The AIVP Stack is the world's first AI-native full-stack development platform, enabling end-to-end application generation from simple, human-readable specifications.

### Core Components
1. **ShepLang** - Frontend language (UI + Actions)
2. **ShepThon** - Backend language (API + Database)
3. **BobaScript** - Intermediate representation
4. **ShepVerify** - 4-phase verification engine

---

## 🚀 Development Workflow

### 1. Write ShepLang (Frontend)
```sheplang
app TodoApp {
  data Task {
    fields: {
      title: text
      completed: yes/no
    }
    states: todo -> in_progress -> done
  }
  
  view Dashboard {
    list Task
    button "New Task" -> CreateTask
  }
  
  action CreateTask(title) {
    call POST "/tasks" with title
    show Dashboard
  }
}
```

### 2. Write ShepThon (Backend)
```shepthon
model Task {
  id: string
  title: string
  completed: boolean
  status: TaskStatus
  createdAt: datetime
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

GET /tasks -> db.all("tasks")
POST /tasks -> db.create("tasks", body)
PUT /tasks/:id -> db.update("tasks", id, body)
DELETE /tasks/:id -> db.remove("tasks", id)
```

### 3. Generate Full-Stack Application
```bash
sheplang build TodoApp.shep
shepthon build TodoApp.shepthon
```

### 4. Verify with ShepVerify
```bash
shepverify verify --all
```

---

## 📁 Generated Project Structure

```
my-app/
├── frontend/                 # React application
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── TaskList.tsx
│   │   └── CreateTask.tsx
│   ├── actions/
│   │   ├── CreateTask.ts
│   │   └── UpdateTask.ts
│   └── App.tsx
├── backend/                  # Express API
│   ├── routes/
│   │   ├── tasks.ts
│   │   └── users.ts
│   ├── models/
│   │   ├── Task.ts
│   │   └── User.ts
│   ├── services/
│   │   └── taskService.ts
│   └── server.ts
├── database/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── api.md
    └── deployment.md
```

---

## 🔧 Key Features

### ShepLang Features
- **Type-Safe**: 100% inferred types
- **State Machines**: Built-in state management
- **Background Jobs**: Scheduled tasks
- **API Integration**: Direct backend calls
- **UI Components**: Auto-generated React components

### ShepThon Features
- **Database-First**: Prisma ORM integration
- **RESTful APIs**: Auto-generated endpoints
- **Type Safety**: Full TypeScript generation
- **Validation**: Built-in field validation
- **Relations**: Automatic foreign key handling

### ShepVerify Features
- **Phase 1**: Type safety verification
- **Phase 2**: Null safety verification  
- **Phase 3**: API endpoint validation
- **Phase 4**: Integration testing

---

## 🎯 Quick Start Templates

### Basic CRUD App
```sheplang
app MyApp {
  data Item {
    fields: {
      name: text
      description: text
    }
  }
  
  view List {
    list Item
    button "New" -> CreateItem
  }
  
  view Form {
    input "Name" -> name
    input "Description" -> description
    button "Save" -> CreateItem
  }
  
  action CreateItem(name, description) {
    add Item with name, description
    show List
  }
}
```

```shepthon
model Item {
  id: string
  name: string
  description: string
  createdAt: datetime
}

GET /items -> db.all("items")
POST /items -> db.create("items", body)
PUT /items/:id -> db.update("items", id, body)
DELETE /items/:id -> db.remove("items", id)
```

### State Machine App
```sheplang
app WorkflowApp {
  data Ticket {
    fields: {
      title: text
      assignee: text
    }
    states: open -> in_progress -> resolved -> closed
  }
  
  view Dashboard {
    list Ticket
    button "New Ticket" -> CreateTicket
  }
  
  action CreateTicket(title) {
    add Ticket with title, assignee="unassigned"
    show Dashboard
  }
  
  action AssignTicket(ticketId, assignee) {
    call POST "/tickets/:id/assign" with ticketId, assignee
    show Dashboard
  }
}
```

```shepthon
model Ticket {
  id: string
  title: string
  assignee: string
  status: TicketStatus
  createdAt: datetime
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

GET /tickets -> db.all("tickets")
POST /tickets -> db.create("tickets", body)
POST /tickets/:id/assign -> db.update("tickets", id, { 
  status: "IN_PROGRESS", 
  assignee: body.assignee 
})
```

### Background Job App
```sheplang
app ScheduledApp {
  data Report {
    fields: {
      title: text
      content: text
      generatedAt: datetime
    }
  }
  
  job GenerateDailyReport {
    schedule: daily at "9am"
    action {
      call POST "/reports/generate"
    }
  }
  
  view Reports {
    list Report
  }
}
```

```shepthon
model Report {
  id: string
  title: string
  content: string
  generatedAt: datetime
}

GET /reports -> db.all("reports")
POST /reports/generate -> db.create("reports", {
  title: "Daily Report",
  content: "Generated content",
  generatedAt: "now"
})
```

---

## 🔍 Common Patterns

### Authentication
```sheplang
app AuthenticatedApp {
  data User {
    fields: {
      email: text
      name: text
    }
  }
  
  action Login(email, password) {
    call POST "/auth/login" with email, password
    show Dashboard
  }
  
  action Logout() {
    call POST "/auth/logout"
    show Login
  }
}
```

```shepthon
model User {
  id: string
  email: string
  name: string
  passwordHash: string
}

POST /auth/login -> db.findWhere("users", { 
  email: body.email 
}).if(password.verify(body.password))
```

### File Upload
```sheplang
app FileApp {
  data Document {
    fields: {
      title: text
      filename: text
      url: text
    }
  }
  
  action UploadDocument(title, file) {
    call POST "/documents/upload" with title, file
    show Documents
  }
}
```

```shepthon
model Document {
  id: string
  title: string
  filename: string
  url: string
  uploadedBy: string
  createdAt: datetime
}

POST /documents/upload -> fileStorage.upload(file).then(db.create("documents", {
  title: body.title,
  filename: file.name,
  url: file.url,
  uploadedBy: auth.userId
}))
```

### Search & Filtering
```sheplang
app SearchApp {
  data Product {
    fields: {
      name: text
      category: text
      price: number
    }
  }
  
  action SearchProducts(query, category) {
    call GET "/products/search" with query, category
    show SearchResults
  }
}
```

```shepthon
model Product {
  id: string
  name: string
  category: string
  price: number
}

GET /products/search -> db.findWhere("products", {
  name: { contains: query.q },
  category: query.category
}).sort("name")
```

---

## 🛠️ Development Commands

### Build Commands
```bash
# Build frontend
sheplang build app.shep

# Build backend
shepthon build api.shepthon

# Build full stack
aivp build app.shep api.shepthon

# Development mode
aivp dev --watch
```

### Verification Commands
```bash
# Type safety check
shepverify types

# API validation
shepverify api

# Full verification
shepverify verify --all

# Generate test coverage
shepverify coverage
```

### Deployment Commands
```bash
# Build for production
aivp build --production

# Deploy to Vercel
aivp deploy vercel

# Deploy to AWS
aivp deploy aws

# Docker build
aivp docker build
```

---

## 📊 Metrics & Analytics

### Built-in Analytics
```shepthon
# Usage tracking
GET /analytics/users -> db.count("users")
GET /analytics/posts -> db.count("posts")
GET /analytics/engagement -> db.sum("interactions", "count")

# Performance metrics
GET /analytics/performance -> db.average("requests", "responseTime")
GET /analytics/errors -> db.count("errors")
```

### Custom Metrics
```shepthon
model Analytics {
  id: string
  metric: string
  value: number
  timestamp: datetime
}

POST /analytics/track -> db.create("analytics", {
  metric: body.metric,
  value: body.value,
  timestamp: "now"
})
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost/db"

# Authentication
JWT_SECRET="your-secret-key"
AUTH_PROVIDER="jwt"

# File Storage
STORAGE_PROVIDER="aws-s3"
AWS_ACCESS_KEY="your-access-key"
AWS_SECRET_KEY="your-secret-key"

# Email
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-api-key"
```

### App Configuration
```yaml
# aivp.config.yml
app:
  name: "MyApp"
  version: "1.0.0"
  
database:
  provider: "postgresql"
  url: "${DATABASE_URL}"
  
auth:
  provider: "jwt"
  secret: "${JWT_SECRET}"
  
storage:
  provider: "aws-s3"
  bucket: "my-app-files"
  
email:
  provider: "sendgrid"
  from: "noreply@myapp.com"
```

---

## 🚀 Best Practices

### ShepLang Best Practices
1. **Clear Naming**: Use descriptive names for models, views, and actions
2. **State Machines**: Define clear state transitions
3. **API Calls**: Use RESTful patterns
4. **Error Handling**: Include proper error handling in actions

### ShepThon Best Practices
1. **Type Safety**: Define all field types
2. **Relations**: Use proper foreign key relationships
3. **Validation**: Add field constraints
4. **Security**: Implement proper authentication

### General Best Practices
1. **Verification**: Always run ShepVerify before deployment
2. **Testing**: Write comprehensive tests
3. **Documentation**: Document API endpoints
4. **Monitoring**: Set up error tracking and analytics

---

## 📚 Reference Materials

### Documentation
- `sheplang-syntax-cheat-sheet.md` - ShepLang language reference
- `shepthon-syntax-cheat-sheet.md` - ShepThon language reference
- `shepverify-guide.md` - Verification engine guide

### Examples
- `examples/basic-crud/` - Basic CRUD application
- `examples/state-machine/` - State machine workflow
- `examples/background-jobs/` - Scheduled tasks
- `examples/full-stack/` - Complete e-commerce app

### Templates
- `templates/todo-app/` - Todo application template
- `templates/blog/` - Blog platform template
- `templates/saas/` - SaaS application template
- `templates/marketplace/` - Marketplace template

---

**💡 Remember**: The AIVP Stack is designed to make full-stack development as simple as writing specifications. Focus on the business logic, let the platform handle the implementation.

---

*Last Updated: November 22, 2025*  
*Version: 1.0 (Complete AIVP Stack)*
