# Phase 3 API Integration Implementation Plan (REVISED)
**Version:** 2.0 (REVISED to build on Phase 2)  
**Date:** November 22, 2025  
**Status:** PLAN - Ready for Execution

---

## 🎯 Critical Revision

**Original Phase 3 Plan:** Would have CONFLICTED with existing grammar  
**Revised Phase 3 Plan:** Implements code generation for EXISTING grammar

**What Changed:**
- ❌ NOT adding new workflow grammar (already exists)
- ✅ Implementing code generation for `CallStmt` and `LoadStmt` (already in grammar, already mapped)
- ✅ Building ON TOP of Phase 2 without modifying working code
- ✅ Following "no steps backward" principle

---

## Overview

Phase 3 implements **API Integration** by adding code generation for the EXISTING `CallStmt` and `LoadStmt` grammar that's already in ShepLang but has no code generation yet.

**Timeline:** 1-2 weeks  
**Success:** Users can make API calls from actions using existing syntax

---

## Current State Analysis

### ✅ What EXISTS and WORKS (Phase 2)
- State machines with transitions
- Background jobs with scheduling
- Basic CRUD operations
- React UI components
- Express API routes

### ⚠️ What EXISTS in Grammar but NO Code Generation
```sheplang
// These parse correctly but generate no code:
action purchaseItem(productId):
  call POST "/purchase" with productId      ← Grammar ✅, Mapper ✅, CodeGen ❌
  load GET "/orders" into orders            ← Grammar ✅, Mapper ✅, CodeGen ❌
  show Dashboard
```

**Grammar Location:** Lines 159-163 in `shep.langium`  
**Mapper Location:** Lines 236-249 in `mapper.ts`  
**Code Generation:** MISSING in `transpiler.ts`

---

## Phase 3 Strategy: Complete Existing Features

### Why This Approach is Safe
1. ✅ Grammar already exists - no grammar changes needed
2. ✅ Mapper already works - no mapper changes needed
3. ✅ Types already defined - minimal type changes
4. ✅ Zero risk to Phase 2 - only ADDING code generation
5. ✅ Natural progression - UI → Backend API calls

---

## Implementation Phases

### Phase 3.1: CallStmt Code Generation (Week 1)
**Goal:** Generate code for `call` statements in actions

**Current State:**
```sheplang
action createOrder(productId):
  call POST "/orders" with productId    ← Parses but generates no code
  show Dashboard
```

**Target Generated Code:**
```typescript
// actions/CreateOrder.ts
export async function createOrder(productId: string) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}
```

**Files to Modify:**
- `sheplang/packages/compiler/src/templates.ts` - Add API call template
- `sheplang/packages/compiler/src/transpiler.ts` - Process CallStmt in actions

**Success Criteria:**
- CallStmt generates valid fetch() calls
- All HTTP methods supported (GET, POST, PUT, PATCH, DELETE)
- Parameters properly serialized
- Error handling included

---

### Phase 3.2: LoadStmt Code Generation (Week 1-2)
**Goal:** Generate code for `load` statements in actions

**Current State:**
```sheplang
action loadOrders():
  load GET "/orders" into orders    ← Parses but generates no code
  show Dashboard
```

**Target Generated Code:**
```typescript
// actions/LoadOrders.ts
export async function loadOrders() {
  try {
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const orders = await response.json();
    
    // Store in state management
    return orders;
  } catch (error) {
    console.error('Load error:', error);
    throw error;
  }
}
```

**Files to Modify:**
- `sheplang/packages/compiler/src/templates.ts` - Add load template
- Add state management context if needed

**Success Criteria:**
- LoadStmt generates valid fetch() calls
- Data loaded into variables
- Integration with React state
- Error handling included

---

### Phase 3.3: Backend API Endpoints (Week 2)
**Goal:** Ensure backend endpoints exist for API calls

**Current State:**
- Phase 1 generates basic CRUD endpoints
- Need to verify endpoints match CallStmt/LoadStmt paths

**Generated Files:**
```typescript
// api/routes/orders.ts
router.post('/orders', async (req, res) => {
  try {
    const { productId } = req.body;
    const order = await prisma.order.create({
      data: { productId }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Files to Generate:**
- API routes for all CallStmt/LoadStmt paths
- Prisma operations for data access
- Validation middleware

**Success Criteria:**
- Backend endpoints match frontend calls
- Full CRUD operations supported
- Validation and error handling
- Integration with existing Phase 1/2 routes

---

### Phase 3.4: Integration Testing (Week 2)
**Goal:** End-to-end testing of API calls

**Test Cases:**
```javascript
// test-phase3-api-integration.js
test('CallStmt generates working API call', async () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      action createOrder(title):
        call POST "/orders" with title
        show Dashboard
    }
  `;
  
  const generated = generateApp(parseShep(shepCode));
  
  // Verify action code
  expect(generated.files['actions/CreateOrder.ts']).toContain('fetch');
  expect(generated.files['actions/CreateOrder.ts']).toContain('POST');
  
  // Verify backend endpoint
  expect(generated.files['api/routes/orders.ts']).toContain('router.post');
});

test('LoadStmt generates working data loading', async () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      action loadOrders():
        load GET "/orders" into orders
        show Dashboard
    }
  `;
  
  const generated = generateApp(parseShep(shepCode));
  
  // Verify load code
  expect(generated.files['actions/LoadOrders.ts']).toContain('fetch');
  expect(generated.files['actions/LoadOrders.ts']).toContain('GET');
});
```

**Success Criteria:**
- All tests pass
- End-to-end flow works
- No breaking changes to Phase 2
- Backward compatibility maintained

---

## Technical Implementation Details

### 1. Action Template Extension
```typescript
// In templates.ts
function generateActionWithApiCalls(action: ActionDeclaration): string {
  const hasApiCalls = action.ops.some(op => op.kind === 'call' || op.kind === 'load');
  
  if (!hasApiCalls) {
    // Use existing Phase 1 template
    return generateBasicAction(action);
  }
  
  // Generate action with API call handling
  return `
export async function ${action.name}(${action.params.join(', ')}) {
  try {
    ${action.ops.map(op => generateOpCode(op)).join('\n    ')}
  } catch (error) {
    console.error('Action error:', error);
    throw error;
  }
}
  `;
}

function generateOpCode(op: Operation): string {
  switch (op.kind) {
    case 'call':
      return generateCallCode(op);
    case 'load':
      return generateLoadCode(op);
    case 'add':
      return generateAddCode(op);
    case 'show':
      return generateShowCode(op);
    default:
      return '';
  }
}

function generateCallCode(op: CallOperation): string {
  return `
const response = await fetch('/api${op.path}', {
  method: '${op.method}',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ${op.fields.join(', ')} })
});

if (!response.ok) {
  throw new Error(\`API call failed: \${response.statusText}\`);
}

const result = await response.json();
  `;
}

function generateLoadCode(op: LoadOperation): string {
  return `
const response = await fetch('/api${op.path}', {
  method: '${op.method}',
  headers: { 'Content-Type': 'application/json' }
});

if (!response.ok) {
  throw new Error(\`Load failed: \${response.statusText}\`);
}

const ${op.variable} = await response.json();
  `;
}
```

### 2. Backend Route Generation
```typescript
// Extend existing API route generation
function generateApiRoutes(app: AppModel): string {
  const routes = [];
  
  // Existing Phase 1 routes
  routes.push(...generateCrudRoutes(app));
  
  // New Phase 3 routes for CallStmt/LoadStmt
  routes.push(...generateApiCallRoutes(app));
  
  return routes.join('\n\n');
}

function generateApiCallRoutes(app: AppModel): string[] {
  const routes: string[] = [];
  
  // Scan all actions for call/load statements
  for (const action of app.actions) {
    for (const op of action.ops) {
      if (op.kind === 'call' || op.kind === 'load') {
        routes.push(generateRouteForApiCall(op));
      }
    }
  }
  
  return routes;
}
```

---

## Deliverables Summary

### Code Files
- Updated `templates.ts` with API call generation
- Updated `transpiler.ts` to process CallStmt/LoadStmt
- Extended API route generation

### Generated Applications
- Actions with working fetch() calls
- Backend endpoints for all API paths
- Error handling and validation

### Test Suite
- CallStmt generation tests
- LoadStmt generation tests
- End-to-end integration tests

### Documentation
- API call syntax documentation
- Backend endpoint documentation
- Migration guide for existing apps

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Breaking Phase 2 code | Only ADD code generation, don't modify existing |
| Backend route conflicts | Namespace API routes properly |
| State management complexity | Use existing React patterns |

### Schedule Risks
| Risk | Mitigation |
|------|-----------|
| Unexpected interactions | Test with Phase 2 examples first |
| Template complexity | Start with simple GET/POST, expand gradually |
| Integration testing | Automated testing from day 1 |

---

## Success Metrics

### Technical Metrics
- **Test Coverage:** 100% for new code
- **API Call Success:** All HTTP methods work
- **Error Handling:** Graceful failure recovery
- **Performance:** API calls < 200ms overhead

### Business Metrics
- **User Actions:** UI buttons can call real APIs
- **Data Loading:** Real data loads into views
- **Error Feedback:** Clear error messages to users
- **Code Quality:** Generated code passes all linting

---

## Next Steps

1. **Verify current Phase 2 stability** ✅
2. **Create Phase 3.1 task file** - CallStmt code generation
3. **Begin implementation** - Template updates
4. **Test with Phase 2 examples** - Ensure no breaking changes
5. **Document changes** - Update completion report

---

## Comparison: Old vs New Plan

### ❌ Original Phase 3 Plan (WOULD BREAK THINGS)
- Add new workflow grammar → CONFLICTS with existing WorkflowDecl
- Modify existing grammar → BREAKS Phase 2
- Replace state machine logic → DESTROYS working code

### ✅ Revised Phase 3 Plan (SAFE)
- Use existing CallStmt/LoadStmt grammar → NO conflicts
- Only ADD code generation → NO modifications to Phase 2
- Build on working foundation → STABLE progress

---

**Status:** PLAN - Ready for Safe Execution  
**Confidence:** High (no breaking changes)  
**Next Review:** After Phase 3.1 completion  

---

*"We don't take steps backward. We build on top of what works."* - Project Philosophy
