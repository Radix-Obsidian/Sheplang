# Phase 3-01 Grammar Extensions Task
**Phase:** 3  
**Task:** 01  
**Description:** Grammar Extensions  
**Status:** PENDING  
**Estimated Time:** 3-4 days

---

## Overview

Add workflow declaration syntax to ShepLang grammar to support multi-step business processes. This enables users to define complex workflows that connect UI actions to backend orchestration.

---

## Task Requirements

### 1. Grammar Rules to Add
```langium
WorkflowDecl:
  'workflow' name=ShepIdentifier ':'
    'trigger' ':' trigger=STRING
    'from' ':' fromScreen=ShepIdentifier
    'steps' ':' steps+=WorkflowStep+;

WorkflowStep:
  (ValidateStep | CallStep | CreateStep | UpdateStep | DeleteStep | NotifyStep | ConditionalStep);

ValidateStep:
  'validate' ':' description=STRING;

CallStep:
  'call' ':' apiCall=STRING ('with' parameters+=ID (',' parameters+=ID)*)?;

CreateStep:
  'create' ':' entity=ShepIdentifier ('with' fields+=ID (',' fields+=ID)*)?;

UpdateStep:
  'update' ':' entity=ShepIdentifier ('set' field=ID 'to' value=STRING)?;

DeleteStep:
  'delete' ':' entity=ShepIdentifier;

NotifyStep:
  'notify' ':' target=ShepIdentifier 'with' message=STRING;

ConditionalStep:
  'if' ':' condition=STRING
    'then' ':' thenSteps+=WorkflowStep+
    ('else' ':' elseSteps+=WorkflowStep+)?;
```

### 2. AST Type Definitions
```typescript
interface WorkflowDeclaration {
  name: string;
  trigger: string;
  fromScreen: string;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  $type: string;
  description?: string;
  apiCall?: string;
  parameters?: string[];
  entity?: string;
  fields?: string[];
  target?: string;
  message?: string;
  condition?: string;
  thenSteps?: WorkflowStep[];
  elseSteps?: WorkflowStep[];
}
```

### 3. Mapper Functions
```typescript
function mapWorkflowDecl(decl: WorkflowDecl): WorkflowDeclaration {
  return {
    name: decl.name,
    trigger: decl.trigger,
    fromScreen: decl.fromScreen,
    steps: decl.steps.map(step => mapWorkflowStep(step))
  };
}

function mapWorkflowStep(step: WorkflowStep): WorkflowStep {
  // Handle each step type appropriately
}
```

---

## Files to Modify

### 1. Grammar File
**File:** `sheplang/packages/language/src/shep.langium`
- Add WorkflowDecl rule
- Add WorkflowStep rules
- Add individual step type rules
- Ensure proper rule ordering

### 2. Mapper File
**File:** `sheplang/packages/language/src/mapper.ts`
- Add mapWorkflowDecl function
- Add mapWorkflowStep function
- Add individual step mappers
- Update AppModel to include workflows

### 3. Types File
**File:** `sheplang/packages/language/src/types.ts`
- Add WorkflowDeclaration interface
- Add WorkflowStep interfaces
- Add individual step type interfaces
- Update AppModel type

---

## Success Criteria

### 1. Grammar Parsing ✅
- Workflow declarations parse without errors
- All step types are recognized
- Conditional logic works correctly
- No syntax errors in valid workflows

### 2. AST Generation ✅
- Correct AST structure for workflows
- All step properties mapped correctly
- Conditional steps handled properly
- Type safety maintained

### 3. Integration ✅
- Existing Phase 1 & 2 features still work
- No breaking changes to current syntax
- Backward compatibility maintained
- All existing tests pass

---

## Test Cases

### 1. Basic Workflow
```sheplang
workflow PurchaseItem:
  trigger: "User clicks 'Buy Now'"
  from: ProductDetail
  steps:
    - validate: "Product is in stock"
    - call: "Stripe.createPaymentIntent" with productId, userId
    - create: "Order" with productId, userId, paymentId
```

### 2. Conditional Workflow
```sheplang
workflow RegisterUser:
  trigger: "User submits registration"
  from: SignUpForm
  steps:
    - validate: "Email is not already registered"
    - create: "User" with email, hashedPassword
    - if: "user.needsEmailVerification"
      then:
        - notify: "User" with "Please verify your email"
      else:
        - notify: "User" with "Welcome to our platform"
```

### 3. Complex Workflow
```sheplang
workflow ProcessOrder:
  trigger: "Order placed"
  from: CheckoutPage
  steps:
    - validate: "Payment is valid"
    - validate: "Items are in stock"
    - create: "Order" with items, paymentId
    - update: "Product.stockCount" decrement by itemQuantity
    - notify: "Customer" with "Order confirmation"
    - notify: "Admin" with "New order received"
```

---

## Development Steps

### Step 1: Grammar Development
1. Add WorkflowDecl rule to shep.langium
2. Add WorkflowStep rules
3. Add individual step type rules
4. Test grammar with simple examples

### Step 2: Type Definitions
1. Add WorkflowDeclaration interface
2. Add WorkflowStep interfaces
3. Add individual step type interfaces
4. Update AppModel type

### Step 3: Mapper Implementation
1. Add mapWorkflowDecl function
2. Add mapWorkflowStep function
3. Add individual step mappers
4. Test with example workflows

### Step 4: Integration Testing
1. Test grammar parsing
2. Test AST generation
3. Test backward compatibility
4. Run existing test suite

---

## Acceptance Tests

### 1. Grammar Tests
```javascript
// Test workflow declaration parsing
const result = parseShep(`
  workflow TestWorkflow:
    trigger: "Test trigger"
    from: TestScreen
    steps:
      - validate: "Test validation"
      - create: "TestEntity" with field1, field2
`);

assert(result.workflows.length === 1);
assert(result.workflows[0].name === "TestWorkflow");
assert(result.workflows[0].steps.length === 2);
```

### 2. Type Tests
```javascript
// Test AST structure
const workflow = result.workflows[0];
assert(workflow.trigger === "Test trigger");
assert(workflow.fromScreen === "TestScreen");
assert(workflow.steps[0].$type === "ValidateStep");
assert(workflow.steps[1].$type === "CreateStep");
```

### 3. Integration Tests
```javascript
// Test backward compatibility
const oldResult = parseShep(`
  app TestApp {
    data User:
      fields: { name: text }
    action testAction():
      add User with name="test"
  }
`);

assert(oldResult.datas.length === 1);
assert(oldResult.actions.length === 1);
```

---

## Dependencies

### Required Components
- ✅ ShepLang Language Core (Phase 1)
- ✅ State Machine System (Phase 2)
- ✅ Background Job System (Phase 2)

### External Dependencies
- **Langium** - Grammar parsing framework
- **TypeScript** - Type definitions

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Grammar conflicts | Use unique keywords, test thoroughly |
| Type complexity | Start simple, expand gradually |
| Breaking changes | Maintain backward compatibility |

### Schedule Risks
| Risk | Mitigation |
|------|-----------|
| Grammar complexity | Start with basic workflows |
| AST mapping issues | Test each step type individually |
| Integration problems | Run full test suite after each change |

---

## Deliverables

### Code Files
- Updated `shep.langium` with workflow grammar
- Updated `mapper.ts` with workflow mapping
- Updated `types.ts` with workflow types

### Test Files
- Grammar parsing tests
- AST generation tests
- Backward compatibility tests

### Documentation
- Grammar documentation
- Type definitions
- Example workflows

---

## Completion Criteria

- [ ] Grammar parses all workflow examples
- [ ] AST structure matches specification
- [ ] All step types supported
- [ ] Backward compatibility maintained
- [ ] All tests pass
- [ ] Code reviewed and approved

---

**Status:** PENDING  
**Next Task:** Phase 3-02 Workflow Parser Implementation  
**Dependencies:** None (can start immediately)
