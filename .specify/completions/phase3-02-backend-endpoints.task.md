# Phase 3-02: Backend Endpoint Generation and Full-Stack Integration
**Version:** 1.0  
**Date:** November 22, 2025  
**Status:** TASK - Ready for Execution  
**Prerequisite:** Phase 3-01 CallStmt/LoadStmt Code Generation (✅ COMPLETE)

---

## 🎯 Overview

Phase 3-02 focuses on **backend endpoint generation** to support the frontend API calls generated in Phase 3-01. This ensures that every `call` and `load` statement in ShepLang has a corresponding backend endpoint.

**Goal:** Generate complete backend API endpoints that match frontend CallStmt/LoadStmt calls  
**Timeline:** 1 week  
**Success:** Full-stack integration where frontend calls have backend endpoints

---

## 📋 Current State

### ✅ What Works (Phase 3-01)
- CallStmt parsing and code generation
- LoadStmt parsing and code generation
- Frontend fetch() calls with proper HTTP methods
- Error handling in frontend actions

### ⚠️ What's Missing (Phase 3-02)
- Backend endpoints for custom API paths
- Request body validation
- Response serialization
- Path parameter handling (e.g., `/orders/:id`)
- Integration between frontend calls and backend routes

---

## 🔧 Task Requirements

### 1. Backend Endpoint Generation

**Current State:**
- Phase 1 generates basic CRUD endpoints for data models
- No custom endpoints for CallStmt/LoadStmt paths

**Target:**
Generate backend endpoints for all CallStmt/LoadStmt paths found in actions

**Example:**
```sheplang
// Frontend (ShepLang)
action createOrder(productId, quantity) {
  call POST "/orders/create" with productId, quantity
  show Dashboard
}

action getOrderDetails(orderId) {
  load GET "/orders/:id" into order
  show OrderDetail
}
```

**Should Generate:**
```typescript
// Backend (Express)
router.post('/orders/create', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // Validate inputs
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create order
    const order = await prisma.order.create({
      data: { productId, quantity }
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Path Parameter Handling

**Requirement:** Support path parameters in CallStmt/LoadStmt

**Syntax:**
```sheplang
load GET "/orders/:id" into order
call PUT "/orders/:id" with title, amount
call DELETE "/orders/:id"
```

**Generated Code:**
```typescript
// Frontend
const order = await fetch(`/api/orders/${orderId}`, { method: 'GET' });

// Backend
router.get('/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id }
  });
  res.json(order);
});
```

### 3. Request Body Validation

**Requirement:** Validate request bodies match expected fields

**Implementation:**
- Extract field names from CallStmt
- Generate validation middleware
- Return 400 errors for missing/invalid fields

**Example:**
```typescript
router.post('/orders', async (req, res) => {
  const { title, amount } = req.body;
  
  // Validate required fields
  if (!title || !amount) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, amount' 
    });
  }
  
  // Validate types
  if (typeof title !== 'string') {
    return res.status(400).json({ 
      error: 'Field title must be string' 
    });
  }
  
  if (typeof amount !== 'number') {
    return res.status(400).json({ 
      error: 'Field amount must be number' 
    });
  }
  
  // Process request
  const order = await prisma.order.create({ data: { title, amount } });
  res.json(order);
});
```

### 4. Response Handling

**Requirement:** Proper response serialization and error handling

**Implementation:**
- Success responses: 200 with JSON data
- Not found: 404 with error message
- Validation errors: 400 with field details
- Server errors: 500 with error message

**Example:**
```typescript
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id }
    });
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        id: req.params.id 
      });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch order',
      message: error.message 
    });
  }
});
```

---

## 📁 Files to Modify/Create

### Modify
- `sheplang/packages/compiler/src/transpiler.ts` - Add endpoint generation logic
- `sheplang/packages/compiler/src/api-templates.ts` - Add custom endpoint templates

### Create
- `sheplang/packages/compiler/src/endpoint-generator.ts` - Extract and generate endpoints
- `sheplang/packages/compiler/src/validation-templates.ts` - Request validation templates

---

## ✅ Success Criteria

### Parsing & Analysis
- [ ] Extract all CallStmt/LoadStmt from actions
- [ ] Identify unique API paths
- [ ] Extract HTTP methods
- [ ] Extract field parameters
- [ ] Identify path parameters (`:id`, `:userId`, etc.)

### Code Generation
- [ ] Generate Express router for each endpoint
- [ ] Include request validation
- [ ] Include error handling
- [ ] Include Prisma operations
- [ ] Support all HTTP methods (GET, POST, PUT, PATCH, DELETE)

### Integration
- [ ] Frontend calls match backend endpoints
- [ ] Path parameters properly handled
- [ ] Request bodies validated
- [ ] Responses properly formatted
- [ ] Error messages informative

### Testing
- [ ] All generated endpoints work
- [ ] Validation catches invalid requests
- [ ] Path parameters properly substituted
- [ ] Error responses have correct status codes

---

## 🧪 Test Cases

### Test 1: Simple POST Endpoint
```sheplang
action createOrder(title) {
  call POST "/orders" with title
}
```

**Expected Backend:**
```typescript
router.post('/orders', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });
  const order = await prisma.order.create({ data: { title } });
  res.json(order);
});
```

### Test 2: GET with Path Parameter
```sheplang
action getOrder(orderId) {
  load GET "/orders/:id" into order
}
```

**Expected Backend:**
```typescript
router.get('/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id }
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

### Test 3: PUT with Multiple Parameters
```sheplang
action updateOrder(orderId, title, amount) {
  call PUT "/orders/:id" with title, amount
}
```

**Expected Backend:**
```typescript
router.put('/orders/:id', async (req, res) => {
  const { title, amount } = req.body;
  if (!title || !amount) return res.status(400).json({ error: 'Missing fields' });
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { title, amount }
  });
  res.json(order);
});
```

### Test 4: DELETE Endpoint
```sheplang
action deleteOrder(orderId) {
  call DELETE "/orders/:id"
}
```

**Expected Backend:**
```typescript
router.delete('/orders/:id', async (req, res) => {
  await prisma.order.delete({
    where: { id: req.params.id }
  });
  res.status(204).send();
});
```

### Test 5: Multiple Endpoints in One App
```sheplang
action createOrder(title) {
  call POST "/orders" with title
}

action getOrders() {
  load GET "/orders" into orders
}

action updateOrder(orderId, title) {
  call PUT "/orders/:id" with title
}
```

**Expected Backend:**
- POST /orders
- GET /orders
- PUT /orders/:id

---

## 🔄 Development Steps

### Step 1: Analyze CallStmt/LoadStmt (2 hours)
- [ ] Extract all API paths from parsed app model
- [ ] Identify HTTP methods
- [ ] Extract parameters
- [ ] Identify path parameters
- [ ] Create endpoint registry

### Step 2: Generate Endpoint Stubs (2 hours)
- [ ] Create endpoint generator module
- [ ] Generate basic Express routes
- [ ] Add error handling structure
- [ ] Add response structure

### Step 3: Add Request Validation (2 hours)
- [ ] Extract field names from CallStmt
- [ ] Generate validation logic
- [ ] Handle missing fields
- [ ] Handle type mismatches

### Step 4: Add Database Operations (2 hours)
- [ ] Map endpoints to Prisma operations
- [ ] Handle CREATE operations
- [ ] Handle READ operations
- [ ] Handle UPDATE operations
- [ ] Handle DELETE operations

### Step 5: Integration Testing (2 hours)
- [ ] Test endpoint generation
- [ ] Test validation
- [ ] Test database operations
- [ ] Test error handling
- [ ] Test full-stack flow

---

## 🎯 Acceptance Criteria

### Code Quality
- [ ] No TypeScript errors
- [ ] Follows existing code patterns
- [ ] Proper error handling
- [ ] Comprehensive comments

### Functionality
- [ ] All endpoints generated
- [ ] All HTTP methods supported
- [ ] Path parameters work
- [ ] Request validation works
- [ ] Database operations work

### Testing
- [ ] All test cases pass
- [ ] No regressions in Phase 2
- [ ] Full-stack integration works
- [ ] Error cases handled

### Documentation
- [ ] Code is well-commented
- [ ] Examples provided
- [ ] Integration guide created

---

## 🚀 Deliverables

### Code
- [ ] Endpoint generator module
- [ ] Validation templates
- [ ] Updated transpiler
- [ ] Updated API templates

### Tests
- [ ] Endpoint generation tests
- [ ] Validation tests
- [ ] Integration tests
- [ ] Full-stack tests

### Documentation
- [ ] Implementation guide
- [ ] API endpoint reference
- [ ] Integration examples
- [ ] Troubleshooting guide

---

## ⚠️ Risk Mitigation

### Risk: Breaking Phase 2 Functionality
**Mitigation:** Only add new endpoint generation, don't modify existing CRUD

### Risk: Path Parameter Conflicts
**Mitigation:** Validate path parameters match action parameters

### Risk: Missing Validation
**Mitigation:** Generate validation for all CallStmt fields

### Risk: Database Operation Failures
**Mitigation:** Proper error handling and status codes

---

## 📊 Success Metrics

- **Endpoints Generated:** 100% of CallStmt/LoadStmt paths
- **Test Pass Rate:** 100%
- **Code Coverage:** >90%
- **Performance:** <100ms per endpoint
- **Zero Regressions:** All Phase 2 tests still pass

---

## 🔗 Related Documents

- `.specify/plans/phase3-api-integration-REVISED-2025-11-22.plan.md` - Overall Phase 3 plan
- `.specify/tasks/phase3-01-callstmt-codegen.task.md` - Phase 3-01 (completed)
- `.specify/memory/sheplang-syntax-cheat-sheet.md` - ShepLang syntax reference
- `.specify/memory/common-syntax-patterns.md` - Common patterns and gotchas

---

**Status:** Ready to begin  
**Estimated Duration:** 1 week  
**Next Phase:** Phase 3-03 Integration Testing
