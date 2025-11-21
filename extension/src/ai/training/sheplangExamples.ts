/**
 * ShepLang Training Examples
 * 
 * These examples train the AI agent to generate production-ready code.
 * NOT just CRUD - includes auth, search, uploads, webhooks, etc.
 */

export interface ShepLangExamples {
  components: string[];
  backends: string[];
  patterns: string[];
}

export const SHEPLANG_TRAINING_EXAMPLES: ShepLangExamples = {
  components: [
    // Example 1: Simple Button Component
    `app ExampleApp

component Button:
  props:
    label: text = "Click me"
  
  state:
    clicked: yes/no = no
  
  view:
    container:
      button label -> handleClick
      if clicked:
        text "Button was clicked!"
      
action handleClick():
  set clicked = yes
  log "Button clicked"`,

    // Example 2: Simple Login Form
    `app ExampleApp

component LoginForm:
  state:
    email: text = ""
    password: text = ""
    error: text = ""
  
  view:
    container:
      text "Login"
      input -> setEmail
      input -> setPassword
      if error:
        text error
      button "Login" -> submitForm
      
action setEmail(value):
  set email = value
  
action setPassword(value):
  set password = value
  
action submitForm():
  if email is empty:
    set error = "Email required"
  else:
    show Dashboard`,

    // Example 3: Simple User List
    `app ExampleApp

component UserList:
  state:
    users: list = []
    loading: yes/no = yes
  
  mounted:
    call loadUsers
  
  view:
    container:
      text "Users"
      if loading:
        text "Loading..."
      else:
        list users as user:
          container:
            text user.name
            text user.email
            button "View" -> viewUser
      
action loadUsers():
  set loading = yes
  call GET "/users"
  set loading = no
  
action viewUser():
  show UserDetails
  
computed filteredUsers:
  return users`
  ],

  backends: [
    // Example 1: Complete Auth System (NOT just CRUD!)
    `model User {
  id: String
  email: String
  passwordHash: String
  name: String
  role: String
  createdAt: DateTime
}

POST /auth/signup -> {
  if (!body.email || !body.password) {
    return error(400, "Missing required fields")
  }
  
  existing = db.find("users", {"email": body.email})
  if (existing) {
    return error(409, "Email already registered")
  }
  
  hash = crypto.hash(body.password)
  user = db.add("users", {
    "email": body.email,
    "passwordHash": hash,
    "name": body.name,
    "role": "user",
    "createdAt": now()
  })
  
  token = jwt.sign({"userId": user.id}, secret, {"expiresIn": "7d"})
  
  return {"user": user, "token": token}
}

POST /auth/login -> {
  user = db.find("users", {"email": body.email})
  if (!user) {
    return error(401, "Invalid credentials")
  }
  
  valid = crypto.verify(body.password, user.passwordHash)
  if (!valid) {
    return error(401, "Invalid credentials")
  }
  
  token = jwt.sign({"userId": user.id}, secret, {"expiresIn": "7d"})
  return {"user": user, "token": token}
}

GET /auth/me -> {
  userId = jwt.verify(headers.authorization)
  if (!userId) {
    return error(401, "Unauthorized")
  }
  user = db.find("users", userId)
  return user
}`,

    // Example 2: Product API with Search & Filters (NOT just CRUD!)
    `model Product {
  id: String
  name: String
  price: Number
  category: String
  stock: Number
  createdAt: DateTime
}

GET /products -> {
  query = {}
  if (params.category) {
    query.category = params.category
  }
  if (params.minPrice) {
    query.price_gte = parseFloat(params.minPrice)
  }
  
  page = parseInt(params.page || "1")
  limit = parseInt(params.limit || "20")
  offset = (page - 1) * limit
  
  products = db.query("products", query, {
    "limit": limit,
    "offset": offset,
    "orderBy": "createdAt",
    "order": "desc"
  })
  
  total = db.count("products", query)
  
  return {
    "products": products,
    "pagination": {
      "page": page,
      "total": total,
      "pages": Math.ceil(total / limit)
    }
  }
}

GET /products/search -> {
  if (!params.q) {
    return error(400, "Missing search query")
  }
  
  results = db.search("products", {
    "fields": ["name", "category"],
    "query": params.q,
    "limit": 50
  })
  
  return results
}

GET /products/:id -> {
  product = db.find("products", params.id)
  if (!product) {
    return error(404, "Product not found")
  }
  return product
}

POST /products -> {
  user = auth.verify(headers.authorization)
  if (!user || user.role !== "admin") {
    return error(403, "Admin access required")
  }
  
  product = db.add("products", {
    "name": body.name,
    "price": parseFloat(body.price),
    "category": body.category,
    "stock": parseInt(body.stock || "0"),
    "createdAt": now()
  })
  
  return product
}`
  ],

  patterns: [
    "NEVER generate CRUD-only endpoints - always add auth, search, filters",
    "Always include authentication (signup, login, logout, me) if User entity exists",
    "Always add search endpoint: GET /:entity/search?q=:query",
    "Always add filters: GET /:entity?field=:value",
    "Always validate input before processing",
    "Always hash passwords - never store plain text",
    "Always verify authentication tokens for protected endpoints",
    "Use pagination for list endpoints (default: 20 items per page)",
    "Include error handling with appropriate HTTP status codes (400, 401, 403, 404, 409, 500)",
    "Add timestamps (createdAt, updatedAt) on all models",
    "Use role-based access control (RBAC) for admin endpoints",
    "Return consistent error format: error(code, message)",
    "Include helpful comments for non-technical founders",
    "Generate realistic business logic, not just TODOs",
    "Make code readable by 13-year-olds (founder-friendly)"
  ]
};
