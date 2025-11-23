# ShepThon Syntax & Features Cheat Sheet
**The Declarative Backend DSL for ShepLang**

---

## 🎯 Quick Reference

### Core Philosophy
- **Declarative**: Describe WHAT you want, not HOW to implement it
- **Database-First**: All operations map to database actions
- **Type-Safe**: Full TypeScript generation from simple declarations
- **API-Ready**: Auto-generated REST endpoints from model definitions

---

## 📚 Basic Structure

### Model Declaration
```shepthon
model ModelName {
  field1: string
  field2: number
  field3: boolean
  field4?: string  // Optional field
}
```

### API Endpoint Declaration
```shepthon
GET /endpoint -> database_operation
POST /endpoint -> database_operation
PUT /endpoint/:id -> database_operation
PATCH /endpoint/:id -> database_operation
DELETE /endpoint/:id -> database_operation
```

---

## 🗃️ Data Models

### Basic Model
```shepthon
model User {
  id: string
  name: string
  email: string
  createdAt: datetime
  updatedAt: datetime
}
```

### Model with Relations
```shepthon
model Post {
  id: string
  title: string
  content: string
  authorId: string
  author: User  // Relation to User model
  createdAt: datetime
}
```

### Model with Enums
```shepthon
model Task {
  id: string
  title: string
  status: TaskStatus
  priority: Priority
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

---

## 🔗 Database Operations

### Basic CRUD Operations
```shepthon
// Create
POST /users -> db.create("users", body)

// Read (all)
GET /users -> db.all("users")

// Read (one)
GET /users/:id -> db.find("users", id)

// Update
PUT /users/:id -> db.update("users", id, body)

// Delete
DELETE /users/:id -> db.remove("users", id)
```

### Advanced Queries
```shepthon
// Find with conditions
GET /users/search -> db.findWhere("users", { email: query.email })

// Count
GET /users/count -> db.count("users")

// Filter and sort
GET /posts -> db.filter("posts", { authorId: userId }).sort("createdAt", "desc")

// Pagination
GET /posts -> db.all("posts").limit(20).offset(page * 20)
```

---

## 🌐 API Endpoints

### RESTful Patterns
```shepthon
// Users API
GET /users -> db.all("users")
GET /users/:id -> db.find("users", id)
POST /users -> db.create("users", body)
PUT /users/:id -> db.update("users", id, body)
DELETE /users/:id -> db.remove("users", id)

// Posts API
GET /posts -> db.all("posts")
GET /posts/:id -> db.find("posts", id)
POST /posts -> db.create("posts", body)
PUT /posts/:id -> db.update("posts", id, body)
DELETE /posts/:id -> db.remove("posts", id)
```

### Custom Endpoints
```shepthon
// Search endpoint
GET /users/search -> db.findWhere("users", { 
  name: { contains: query.q },
  email: { equals: query.email }
})

// Status endpoints
GET /users/:id/posts -> db.findWhere("posts", { authorId: id })
GET /posts/featured -> db.filter("posts", { featured: true }).sort("createdAt", "desc")

// Analytics endpoints
GET /analytics/users -> db.count("users")
GET /analytics/posts -> db.count("posts")
```

---

## 🔧 Advanced Features

### Validation
```shepthon
model User {
  id: string
  name: string { min: 2, max: 50 }
  email: string { format: "email" }
  age: number { min: 18, max: 120 }
  password: string { min: 8 }
}
```

### Default Values
```shepthon
model Task {
  id: string
  title: string
  status: TaskStatus { default: "TODO" }
  priority: Priority { default: "MEDIUM" }
  createdAt: datetime { default: "now" }
}
```

### Unique Constraints
```shepthon
model User {
  id: string
  email: string { unique: true }
  username: string { unique: true }
}
```

---

## 🔄 State Machine Integration

### Status Field with Transitions
```shepthon
model Order {
  id: string
  title: string
  status: OrderStatus
  transitions: OrderTransition[]
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
}

model OrderTransition {
  from: OrderStatus
  to: OrderStatus
  allowed: boolean
}
```

### State Transition Endpoints
```shepthon
POST /orders/:id/transition -> db.transition("orders", id, body.to)
GET /orders/:id/transitions -> db.getTransitions("orders", id)
```

---

## 📊 Analytics & Reporting

### Count Operations
```shepthon
GET /analytics/users/count -> db.count("users")
GET /analytics/posts/count -> db.count("posts")
GET /analytics/orders/status -> db.groupBy("orders", "status")
```

### Aggregation
```shepthon
GET /analytics/revenue -> db.sum("orders", "amount")
GET /analytics/average -> db.average("orders", "amount")
GET /analytics/trends -> db.groupBy("orders", "createdAt", "day")
```

---

## 🔍 Query Patterns

### Common Patterns
```shepthon
// Search with multiple filters
GET /products/search -> db.findWhere("products", {
  category: query.category,
  price: { between: [query.min, query.max] },
  inStock: true
})

// Related data
GET /users/:id/posts -> db.findWhere("posts", { authorId: id })
GET /posts/:id/comments -> db.findWhere("comments", { postId: id })

// Sorting and pagination
GET /posts -> db.all("posts").sort("createdAt", "desc").limit(20)

// Complex filtering
GET /tasks -> db.filter("tasks", { 
  status: "TODO",
  priority: "HIGH",
  dueDate: { lt: "today" }
})
```

---

## 🛡️ Security & Permissions

### Basic Permission Checks
```shepthon
GET /users/me -> db.find("users", auth.userId)
PUT /users/:id -> db.update("users", id, body).if(auth.userId == id)
DELETE /users/:id -> db.remove("users", id).if(auth.isAdmin)
```

### Row-Level Security
```shepthon
GET /posts -> db.filter("posts", { authorId: auth.userId })
GET /admin/users -> db.all("users").if(auth.isAdmin)
```

---

## 🚀 Project Structure

Generated Files:
```
api/
  routes/
    users.ts           // User endpoints
    posts.ts           // Post endpoints
    analytics.ts       // Analytics endpoints
  models/
    User.ts            // TypeScript interfaces
    Post.ts            // TypeScript interfaces
  prisma/
    schema.prisma      // Database schema
  services/
    userService.ts     // Business logic
    postService.ts     // Business logic
```

---

## 📱 Integration Examples

### Full CRUD API
```shepthon
// Model
model Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: datetime
  createdAt: datetime
  updatedAt: datetime
}

// Endpoints
GET /tasks -> db.all("tasks").sort("createdAt", "desc")
GET /tasks/:id -> db.find("tasks", id)
POST /tasks -> db.create("tasks", body)
PUT /tasks/:id -> db.update("tasks", id, body)
DELETE /tasks/:id -> db.remove("tasks", id)

// Custom endpoints
GET /tasks/status/:status -> db.filter("tasks", { status: status })
GET /tasks/priority/:priority -> db.filter("tasks", { priority: priority })
GET /tasks/overdue -> db.filter("tasks", { 
  dueDate: { lt: "today" },
  status: { not: "DONE" }
})
```

### E-commerce Example
```shepthon
model Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
  images: string[]
  createdAt: datetime
}

model Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  shippingAddress: Address
  createdAt: datetime
}

model OrderItem {
  productId: string
  quantity: number
  price: number
}

// Product endpoints
GET /products -> db.all("products").sort("name")
GET /products/:id -> db.find("products", id)
GET /products/category/:category -> db.filter("products", { category: category })
GET /products/search -> db.findWhere("products", {
  name: { contains: query.q },
  category: query.category
})

// Order endpoints
GET /orders -> db.filter("orders", { userId: auth.userId })
POST /orders -> db.create("orders", body)
GET /orders/:id -> db.find("orders", id).if(auth.userId == order.userId)
```

---

## 🔧 Best Practices

### Naming Conventions
- **Models**: PascalCase (e.g., `User`, `Product`, `Order`)
- **Fields**: camelCase (e.g., `firstName`, `createdAt`, `isActive`)
- **Endpoints**: kebab-case (e.g., `/users`, `/order-items`, `/blog-posts`)
- **Enums**: PascalCase (e.g., `TaskStatus`, `Priority`, `OrderStatus`)

### Model Design
```shepthon
// Good: Clear field names
model User {
  id: string
  firstName: string
  lastName: string
  emailAddress: string
  createdAt: datetime
}

// Good: Include timestamps
model Post {
  id: string
  title: string
  content: string
  createdAt: datetime
  updatedAt: datetime
}

// Good: Use enums for status fields
model Task {
  id: string
  title: string
  status: TaskStatus
  priority: Priority
}
```

### API Design
```shepthon
// RESTful patterns
GET /users -> List all users
GET /users/:id -> Get specific user
POST /users -> Create user
PUT /users/:id -> Update user
DELETE /users/:id -> Delete user

// Nested resources
GET /users/:id/posts -> Posts by user
GET /posts/:id/comments -> Comments on post

// Search and filter
GET /users/search -> Search users
GET /posts/filter -> Filter posts
```

---

## 🧩 Advanced Patterns

### Soft Deletes
```shepthon
model User {
  id: string
  name: string
  deletedAt: datetime?
}

GET /users -> db.filter("users", { deletedAt: null })
DELETE /users/:id -> db.update("users", id, { deletedAt: "now" })
```

### Audit Trail
```shepthon
model AuditLog {
  id: string
  entity: string
  entityId: string
  action: string
  changes: string
  userId: string
  createdAt: datetime
}

// Auto-generated audit logs
POST /users -> db.create("users", body).audit("CREATE", auth.userId)
PUT /users/:id -> db.update("users", id, body).audit("UPDATE", auth.userId)
```

### Multi-tenancy
```shepthon
model Tenant {
  id: string
  name: string
  domain: string
}

model User {
  id: string
  tenantId: string
  name: string
  email: string
}

GET /users -> db.filter("users", { tenantId: auth.tenantId })
```

---

## 🔍 Debugging Tips

### Common Issues
1. **Type Mismatches**: Ensure field types match between model and API
2. **Missing Relations**: Define relations before using them
3. **Validation Errors**: Check field constraints in model definitions

### Generated Code Inspection
- Check `api/routes/model.ts` for generated endpoints
- Verify `api/models/Model.ts` for TypeScript interfaces
- Review `api/prisma/schema.prisma` for database schema

---

## 📖 Reference

### Supported Types
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `datetime` - Date/time values
- `json` - JSON objects

### Database Operations
- `db.create(model, data)` - Create record
- `db.find(model, id)` - Find by ID
- `db.all(model)` - Get all records
- `db.filter(model, conditions)` - Filter records
- `db.findWhere(model, conditions)` - Find with conditions
- `db.update(model, id, data)` - Update record
- `db.remove(model, id)` - Delete record
- `db.count(model)` - Count records
- `db.sum(model, field)` - Sum field values
- `db.average(model, field)` - Average field values

### Query Methods
- `.sort(field, direction)` - Sort results
- `.limit(count)` - Limit results
- `.offset(count)` - Skip results
- `.if(condition)` - Conditional execution

---

**💡 Remember**: ShepThon generates the entire backend API from simple declarations. Focus on the data model and let the system handle the implementation.

---

*Last Updated: November 22, 2025*  
*Version: 1.0 (Backend API Generation)*
