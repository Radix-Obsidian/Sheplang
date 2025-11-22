# Phase 3-02 Workflow Parser Implementation Task
**Phase:** 3  
**Task:** 02  
**Description:** Workflow Parser Implementation  
**Status:** PENDING  
**Estimated Time:** 3-4 days

---

## Overview

Build the workflow parser that understands workflow AST structures and prepares them for code generation. This handles the semantic analysis of workflow declarations and prepares data for the workflow engine.

---

## Task Requirements

### 1. Workflow Parser Class
```typescript
export class WorkflowParser {
  parseWorkflow(workflow: WorkflowDeclaration): ParsedWorkflow {
    return {
      name: workflow.name,
      trigger: workflow.trigger,
      fromScreen: workflow.fromScreen,
      steps: this.parseSteps(workflow.steps),
      dependencies: this.extractDependencies(workflow),
      validation: this.validateWorkflow(workflow)
    };
  }

  parseSteps(steps: WorkflowStep[]): ParsedStep[] {
    return steps.map(step => this.parseStep(step));
  }

  parseStep(step: WorkflowStep): ParsedStep {
    switch (step.$type) {
      case 'ValidateStep':
        return this.parseValidateStep(step);
      case 'CallStep':
        return this.parseCallStep(step);
      case 'CreateStep':
        return this.parseCreateStep(step);
      case 'UpdateStep':
        return this.parseUpdateStep(step);
      case 'DeleteStep':
        return this.parseDeleteStep(step);
      case 'NotifyStep':
        return this.parseNotifyStep(step);
      case 'ConditionalStep':
        return this.parseConditionalStep(step);
      default:
        throw new Error(`Unknown step type: ${step.$type}`);
    }
  }
}
```

### 2. Parsed Workflow Structure
```typescript
interface ParsedWorkflow {
  name: string;
  trigger: string;
  fromScreen: string;
  steps: ParsedStep[];
  dependencies: WorkflowDependencies;
  validation: WorkflowValidation;
}

interface ParsedStep {
  id: string;
  type: StepType;
  description?: string;
  parameters: StepParameters;
  conditions?: StepConditions;
  errorHandling: ErrorHandling;
  rollback?: RollbackAction;
}

interface WorkflowDependencies {
  entities: string[];
  integrations: string[];
  screens: string[];
  externalApis: string[];
}

interface WorkflowValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### 3. Step Type Parsers
```typescript
// Validate Step Parser
parseValidateStep(step: ValidateStep): ParsedValidateStep {
  return {
    id: this.generateStepId(),
    type: 'validate',
    description: step.description,
    parameters: {
      validationRules: this.extractValidationRules(step.description)
    },
    conditions: {},
    errorHandling: {
      strategy: 'stop',
      message: `Validation failed: ${step.description}`
    }
  };
}

// Call Step Parser
parseCallStep(step: CallStep): ParsedCallStep {
  const apiInfo = this.parseApiCall(step.apiCall);
  return {
    id: this.generateStepId(),
    type: 'call',
    description: step.apiCall,
    parameters: {
      api: apiInfo.service,
      method: apiInfo.method,
      arguments: step.parameters || []
    },
    conditions: {},
    errorHandling: {
      strategy: 'retry',
      maxRetries: 3,
      message: `API call failed: ${step.apiCall}`
    },
    rollback: this.generateRollbackAction(apiInfo)
  };
}

// Create Step Parser
parseCreateStep(step: CreateStep): ParsedCreateStep {
  return {
    id: this.generateStepId(),
    type: 'create',
    description: `Create ${step.entity}`,
    parameters: {
      entity: step.entity,
      fields: step.fields || []
    },
    conditions: {},
    errorHandling: {
      strategy: 'rollback',
      message: `Failed to create ${step.entity}`
    },
    rollback: {
      action: 'delete',
      target: step.entity
    }
  };
}
```

### 4. Dependency Extraction
```typescript
extractDependencies(workflow: WorkflowDeclaration): WorkflowDependencies {
  const entities = new Set<string>();
  const integrations = new Set<string>();
  const screens = new Set<string>();
  const externalApis = new Set<string>();

  // Extract from screen
  screens.add(workflow.fromScreen);

  // Extract from steps
  workflow.steps.forEach(step => {
    switch (step.$type) {
      case 'CreateStep':
      case 'UpdateStep':
      case 'DeleteStep':
        entities.add(step.entity);
        break;
      case 'CallStep':
        const apiInfo = this.parseApiCall(step.apiCall);
        integrations.add(apiInfo.service);
        externalApis.add(apiInfo.endpoint);
        break;
      case 'NotifyStep':
        integrations.add('notification');
        break;
    }
  });

  return {
    entities: Array.from(entities),
    integrations: Array.from(integrations),
    screens: Array.from(screens),
    externalApis: Array.from(externalApis)
  };
}
```

### 5. Workflow Validation
```typescript
validateWorkflow(workflow: WorkflowDeclaration): WorkflowValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate workflow name
  if (!workflow.name || workflow.name.trim() === '') {
    errors.push({
      type: 'syntax',
      message: 'Workflow name is required',
      location: 'workflow declaration'
    });
  }

  // Validate trigger
  if (!workflow.trigger || workflow.trigger.trim() === '') {
    errors.push({
      type: 'syntax',
      message: 'Workflow trigger is required',
      location: 'trigger declaration'
    });
  }

  // Validate from screen
  if (!workflow.fromScreen || workflow.fromScreen.trim() === '') {
    errors.push({
      type: 'syntax',
      message: 'Workflow from screen is required',
      location: 'from declaration'
    });
  }

  // Validate steps
  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push({
      type: 'syntax',
      message: 'Workflow must have at least one step',
      location: 'steps declaration'
    });
  } else {
    workflow.steps.forEach((step, index) => {
      this.validateStep(step, index, errors, warnings);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## Files to Create

### 1. Workflow Parser
**File:** `sheplang/packages/compiler/src/workflow-parser.ts`
- WorkflowParser class
- Step type parsers
- Dependency extraction
- Validation logic

### 2. Parser Types
**File:** `sheplang/packages/compiler/src/workflow-parser-types.ts`
- ParsedWorkflow interface
- ParsedStep interfaces
- Validation interfaces
- Dependency interfaces

### 3. API Parser Utilities
**File:** `sheplang/packages/compiler/src/api-parser.ts`
- API call parsing logic
- Integration identification
- Parameter extraction

---

## Success Criteria

### 1. Parsing Success ✅
- All workflow step types parsed correctly
- Conditional logic handled properly
- Dependencies extracted accurately
- Validation errors identified

### 2. Data Structure ✅
- ParsedWorkflow structure matches specification
- All step properties mapped correctly
- Dependencies tracked properly
- Validation results accurate

### 3. Error Handling ✅
- Invalid workflows rejected appropriately
- Helpful error messages provided
- Partial parsing handled gracefully
- Recovery mechanisms in place

---

## Test Cases

### 1. Simple Workflow Parsing
```javascript
const workflow = {
  name: "TestWorkflow",
  trigger: "User action",
  fromScreen: "TestScreen",
  steps: [
    { $type: "ValidateStep", description: "Test validation" },
    { $type: "CreateStep", entity: "User", fields: ["name", "email"] }
  ]
};

const parsed = parser.parseWorkflow(workflow);
assert(parsed.name === "TestWorkflow");
assert(parsed.steps.length === 2);
assert(parsed.dependencies.entities.includes("User"));
```

### 2. Complex Workflow Parsing
```javascript
const complexWorkflow = {
  name: "PurchaseWorkflow",
  trigger: "Buy Now clicked",
  fromScreen: "ProductDetail",
  steps: [
    { $type: "ValidateStep", description: "Product in stock" },
    { $type: "CallStep", apiCall: "Stripe.createPaymentIntent", parameters: ["amount", "currency"] },
    { 
      $type: "ConditionalStep",
      condition: "payment.success",
      thenSteps: [
        { $type: "CreateStep", entity: "Order", fields: ["productId", "userId"] }
      ],
      elseSteps: [
        { $type: "NotifyStep", target: "User", message: "Payment failed" }
      ]
    }
  ]
};

const parsed = parser.parseWorkflow(complexWorkflow);
assert(parsed.dependencies.integrations.includes("Stripe"));
assert(parsed.steps[2].type === "conditional");
assert(parsed.steps[2].thenSteps.length === 1);
```

### 3. Error Handling
```javascript
const invalidWorkflow = {
  name: "", // Invalid: empty name
  trigger: "", // Invalid: empty trigger
  fromScreen: "", // Invalid: empty from screen
  steps: [] // Invalid: no steps
};

const parsed = parser.parseWorkflow(invalidWorkflow);
assert(!parsed.validation.isValid);
assert(parsed.validation.errors.length >= 4);
```

---

## Development Steps

### Step 1: Basic Parser Structure
1. Create WorkflowParser class
2. Define ParsedWorkflow interface
3. Implement basic parseWorkflow method
4. Test with simple workflows

### Step 2: Step Type Parsers
1. Implement parseValidateStep
2. Implement parseCallStep
3. Implement parseCreateStep
4. Implement remaining step types
5. Test all step types

### Step 3: Dependency Extraction
1. Implement extractDependencies method
2. Add API parsing utilities
3. Test dependency extraction
4. Validate dependency accuracy

### Step 4: Validation Logic
1. Implement validateWorkflow method
2. Add step validation
3. Test error detection
4. Verify error messages

### Step 5: Integration Testing
1. Test with complex workflows
2. Test error scenarios
3. Test edge cases
4. Performance testing

---

## Acceptance Tests

### 1. Parser Tests
```javascript
describe('WorkflowParser', () => {
  it('should parse simple workflows correctly', () => {
    const workflow = createSimpleWorkflow();
    const parsed = parser.parseWorkflow(workflow);
    expect(parsed.steps.length).toBe(2);
    expect(parsed.dependencies.entities).toContain('User');
  });

  it('should handle conditional steps', () => {
    const workflow = createConditionalWorkflow();
    const parsed = parser.parseWorkflow(workflow);
    const conditionalStep = parsed.steps.find(s => s.type === 'conditional');
    expect(conditionalStep.thenSteps).toBeDefined();
    expect(conditionalStep.elseSteps).toBeDefined();
  });

  it('should validate workflows correctly', () => {
    const invalidWorkflow = createInvalidWorkflow();
    const parsed = parser.parseWorkflow(invalidWorkflow);
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.length).toBeGreaterThan(0);
  });
});
```

### 2. Integration Tests
```javascript
describe('WorkflowParser Integration', () => {
  it('should work with grammar output', () => {
    const shepCode = `
      workflow TestWorkflow:
        trigger: "Test trigger"
        from: TestScreen
        steps:
          - validate: "Test validation"
          - create: "User" with name, email
    `;
    
    const ast = parseShep(shepCode);
    const parsed = parser.parseWorkflow(ast.workflows[0]);
    expect(parsed.name).toBe('TestWorkflow');
    expect(parsed.steps.length).toBe(2);
  });
});
```

---

## Dependencies

### Required Components
- ✅ Phase 3-01 Grammar Extensions (completed)
- ✅ ShepLang Language Core (Phase 1)
- ✅ Workflow AST types (from Phase 3-01)

### External Dependencies
- **TypeScript** - Type definitions
- **Jest** - Testing framework

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Complex conditional logic | Start with simple conditions, expand gradually |
| API call parsing complexity | Use pattern matching, test with various formats |
| Validation logic complexity | Modular validation, clear error messages |

### Schedule Risks
| Risk | Mitigation |
|------|-----------|
| Step type complexity | Implement step types one by one |
| Integration issues | Test with grammar output early |
| Performance concerns | Benchmark with large workflows |

---

## Deliverables

### Code Files
- `workflow-parser.ts` - Main parser class
- `workflow-parser-types.ts` - Type definitions
- `api-parser.ts` - API parsing utilities

### Test Files
- Parser unit tests
- Integration tests
- Error handling tests

### Documentation
- Parser documentation
- API reference
- Usage examples

---

## Completion Criteria

- [ ] All workflow step types parsed correctly
- [ ] Conditional logic handled properly
- [ ] Dependencies extracted accurately
- [ ] Validation logic working
- [ ] Error handling robust
- [ ] All tests pass
- [ ] Code reviewed and approved

---

**Status:** PENDING  
**Dependencies:** Phase 3-01 Grammar Extensions  
**Next Task:** Phase 3-03 Code Generation
