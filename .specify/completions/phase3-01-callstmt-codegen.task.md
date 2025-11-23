# Phase 3-01 CallStmt Code Generation Task
**Phase:** 3  
**Task:** 01  
**Description:** CallStmt Code Generation  
**Status:** PENDING  
**Estimated Time:** 2-3 days

---

## Overview

Implement code generation for the EXISTING `CallStmt` grammar that's already in ShepLang. This adds zero new grammar, modifies zero existing Phase 2 code, and builds purely on top of what works.

**Grammar Location:** Line 159-160 in `shep.langium` (ALREADY EXISTS)  
**Mapper Location:** Lines 236-242 in `mapper.ts` (ALREADY WORKS)  
**Code Generation:** MISSING (we'll add this)

---

## Current State

### ✅ What Already Works
```langium
// Line 159-160 in shep.langium (EXISTING - DO NOT MODIFY)
CallStmt:
  'call' method=('GET'|'POST'|'PUT'|'PATCH'|'DELETE') path=STRING ('with' fields+=ShepIdentifier (',' fields+=ShepIdentifier)*)?;
```

```typescript
// Lines 236-242 in mapper.ts (EXISTING - DO NOT MODIFY)
} else if (stmt.$type === 'CallStmt') {
  return {
    kind: 'call',
    method: stmt.method,
    path: stmt.path,
    fields: stmt.fields?.map((f: any) => f) || []
  };
}
```

### ❌ What's Missing
```typescript
// In transpiler.ts - NO CODE GENERATION for CallStmt yet
// We need to add this!
```

---

## Task Requirements

### 1. Extend Action Template Generation
**File:** `sheplang/packages/compiler/src/templates.ts`

**Add CallStmt handling to action generation:**
```typescript
function generateActionBody(action: ActionDeclaration): string {
  let code = '';
  
  for (const op of action.ops) {
    if (op.kind === 'call') {
      code += generateCallStatement(op);
    } else if (op.kind === 'add') {
      code += generateAddStatement(op);
    } else if (op.kind === 'show') {
      code += generateShowStatement(op);
    }
    // ... existing code for other op types
  }
  
  return code;
}

function generateCallStatement(op: CallOperation): string {
  const fields = op.fields.join(', ');
  
  return `
  // API call: ${op.method} ${op.path}
  const response_${generateId()} = await fetch('/api${op.path}', {
    method: '${op.method}',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ${fields} })
  });
  
  if (!response_${generateId()}.ok) {
    throw new Error(\`API call failed: \${response_${generateId()}.statusText}\`);
  }
  
  const result_${generateId()} = await response_${generateId()}.json();
  `;
}
```

### 2. Update Action Template to Support Async
**File:** `sheplang/packages/compiler/src/templates.ts`

**Change action function signature:**
```typescript
// BEFORE (existing Phase 1):
export function ${actionName}(${params}) {
  ${body}
}

// AFTER (Phase 3 with async support):
export async function ${actionName}(${params}) {
  try {
    ${body}
  } catch (error) {
    console.error('Action error:', error);
    throw error;
  }
}
```

### 3. Generate Corresponding Backend Endpoints
**File:** `sheplang/packages/compiler/src/api-templates.ts`

**Scan actions for CallStmt and generate matching endpoints:**
```typescript
function generateApiEndpointsForCalls(app: AppModel): GenFile[] {
  const files: GenFile[] = [];
  const paths = new Set<string>();
  
  // Scan all actions for call statements
  for (const action of app.actions) {
    for (const op of action.ops) {
      if (op.kind === 'call') {
        paths.add(op.path);
      }
    }
  }
  
  // Generate endpoint for each unique path
  for (const path of paths) {
    files.push(generateEndpointFile(path, app));
  }
  
  return files;
}

function generateEndpointFile(path: string, app: AppModel): GenFile {
  // Extract entity from path (e.g., "/orders" -> "Order")
  const entity = inferEntityFromPath(path, app);
  
  return {
    path: `api/routes${path}.ts`,
    content: `
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('${path}', async (req, res) => {
  try {
    const data = req.body;
    const result = await prisma.${entity.toLowerCase()}.create({ data });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
    `
  };
}
```

---

## Test Cases

### 1. Simple POST Call
```javascript
test('CallStmt generates POST request code', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      action createOrder(title):
        call POST "/orders" with title
        show Dashboard
    }
  `;
  
  const result = generateApp(parseShep(shepCode));
  
  // Verify action code
  const actionFile = result.files.find(f => f.path.includes('CreateOrder'));
  expect(actionFile.content).toContain('async function');
  expect(actionFile.content).toContain('fetch(\'/api/orders\'');
  expect(actionFile.content).toContain('method: \'POST\'');
  expect(actionFile.content).toContain('JSON.stringify({ title })');
  
  // Verify backend endpoint
  const endpointFile = result.files.find(f => f.path.includes('api/routes/orders'));
  expect(endpointFile).toBeDefined();
  expect(endpointFile.content).toContain('router.post');
});
```

### 2. GET Call
```javascript
test('CallStmt generates GET request code', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      action fetchOrders():
        call GET "/orders"
        show Dashboard
    }
  `;
  
  const result = generateApp(parseShep(shepCode));
  
  const actionFile = result.files.find(f => f.path.includes('FetchOrders'));
  expect(actionFile.content).toContain('method: \'GET\'');
  expect(actionFile.content).not.toContain('body:');
});
```

### 3. Multiple Parameters
```javascript
test('CallStmt handles multiple parameters', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text, amount: number } }
      
      action createOrder(title, amount):
        call POST "/orders" with title, amount
        show Dashboard
    }
  `;
  
  const result = generateApp(parseShep(shepCode));
  
  const actionFile = result.files.find(f => f.path.includes('CreateOrder'));
  expect(actionFile.content).toContain('JSON.stringify({ title, amount })');
});
```

### 4. Error Handling
```javascript
test('CallStmt includes error handling', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      action createOrder(title):
        call POST "/orders" with title
        show Dashboard
    }
  `;
  
  const result = generateApp(parseShep(shepCode));
  
  const actionFile = result.files.find(f => f.path.includes('CreateOrder'));
  expect(actionFile.content).toContain('try {');
  expect(actionFile.content).toContain('catch (error)');
  expect(actionFile.content).toContain('if (!response');
});
```

### 5. Backward Compatibility
```javascript
test('Phase 2 examples still work', () => {
  const phase2Code = fs.readFileSync('examples/phase2-complete-test.shep', 'utf8');
  
  const result = generateApp(parseShep(phase2Code));
  
  // Verify state machine code still generates
  expect(result.files.some(f => f.path.includes('state-transitions'))).toBe(true);
  
  // Verify job scheduler still generates
  expect(result.files.some(f => f.path.includes('job-scheduler'))).toBe(true);
  
  // Verify no breaking changes
  expect(result.files.length).toBeGreaterThan(15);
});
```

---

## Development Steps

### Step 1: Extend Action Template
1. Open `sheplang/packages/compiler/src/templates.ts`
2. Add `generateCallStatement()` function
3. Update `generateActionBody()` to handle CallStmt
4. Change action signature to `async`
5. Add try/catch wrapper

### Step 2: Test Action Generation
1. Create test file `test-phase3-callstmt.js`
2. Test simple POST call
3. Test GET call
4. Test multiple parameters
5. Verify generated code compiles

### Step 3: Backend Endpoint Generation
1. Open `sheplang/packages/compiler/src/api-templates.ts`
2. Add `generateApiEndpointsForCalls()` function
3. Add `generateEndpointFile()` function
4. Integrate with existing route generation
5. Test endpoint generation

### Step 4: Integration with Transpiler
1. Open `sheplang/packages/compiler/src/transpiler.ts`
2. Ensure CallStmt operations are processed
3. Call new endpoint generation functions
4. Test with full compilation

### Step 5: End-to-End Testing
1. Test with Phase 2 examples (ensure no breaking)
2. Test with new CallStmt examples
3. Test generated code actually runs
4. Performance testing

---

## Files to Modify

### Primary Files
- ✅ `sheplang/packages/compiler/src/templates.ts` - Action template extension
- ✅ `sheplang/packages/compiler/src/api-templates.ts` - Endpoint generation
- ✅ `sheplang/packages/compiler/src/transpiler.ts` - Integration

### Test Files
- ✅ `test-phase3-callstmt.js` - New test file

### DO NOT MODIFY (Working Phase 2)
- ❌ `sheplang/packages/language/src/shep.langium` - Grammar (already has CallStmt)
- ❌ `sheplang/packages/language/src/mapper.ts` - Mapper (already works)
- ❌ `sheplang/packages/compiler/src/state-machine-templates.ts` - Phase 2 code
- ❌ `sheplang/packages/compiler/src/job-templates.ts` - Phase 2 code

---

## Success Criteria

### Code Generation ✅
- CallStmt generates valid TypeScript code
- Actions become async functions
- Fetch calls properly formatted
- Error handling included

### Backend Endpoints ✅
- Corresponding endpoints generated
- Prisma integration works
- HTTP methods respected
- Validation included

### Testing ✅
- All new tests pass
- All Phase 2 tests still pass
- Generated code compiles
- No breaking changes

### Integration ✅
- Works with existing Phase 1/2 features
- No conflicts with state machines
- No conflicts with background jobs
- Backward compatible

---

## Acceptance Criteria

- [ ] CallStmt generates fetch() calls
- [ ] All HTTP methods supported (GET, POST, PUT, PATCH, DELETE)
- [ ] Parameters properly serialized
- [ ] Backend endpoints generated
- [ ] Error handling robust
- [ ] All tests pass (new + old)
- [ ] No breaking changes to Phase 2
- [ ] Code quality maintained

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Breaking Phase 2 | Only ADD code, don't modify existing |
| Async complexity | Use proven fetch() patterns |
| Backend conflicts | Namespace endpoints properly |

### Schedule Risks
| Risk | Mitigation |
|------|-----------|
| Template complexity | Start simple, expand gradually |
| Integration issues | Test with Phase 2 examples first |
| Testing delays | Write tests before implementation |

---

## Deliverables

### Code Files
- Updated `templates.ts` with CallStmt handling
- Updated `api-templates.ts` with endpoint generation
- Integration in `transpiler.ts`

### Test Files
- `test-phase3-callstmt.js` with comprehensive tests

### Documentation
- CallStmt usage guide
- Backend endpoint documentation
- Migration guide (none needed - backward compatible)

---

## Completion Criteria

- [ ] Code generation working
- [ ] Tests passing (100%)
- [ ] Phase 2 still working
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for Phase 3.2 (LoadStmt)

---

**Status:** PENDING  
**Dependencies:** None (builds on existing Phase 2)  
**Next Task:** Phase 3-02 LoadStmt Code Generation  
**Philosophy:** "We don't take steps backward. We build on top of what works."
