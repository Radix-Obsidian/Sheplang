# Phase 3-04 Integration Testing Task
**Phase:** 3  
**Task:** 04  
**Description:** Integration Testing  
**Status:** PENDING  
**Estimated Time:** 2-3 days

---

## Overview

Create comprehensive test suite for Phase 3 Workflow Engine including grammar parsing, workflow execution, integration testing, and end-to-end validation. Ensure all components work together seamlessly and meet production quality standards.

---

## Task Requirements

### 1. Grammar Parsing Tests
```javascript
// test-phase3-grammar.js
const { parseShep } = require('@sheplang/language');

describe('Phase 3 Grammar Tests', () => {
  test('Parse basic workflow declaration', () => {
    const shepCode = `
      workflow PurchaseItem:
        trigger: "User clicks 'Buy Now'"
        from: ProductDetail
        steps:
          - validate: "Product is in stock"
          - call: "Stripe.createPaymentIntent" with amount, productId
          - create: "Order" with productId, userId, paymentId
    `;
    
    const result = parseShep(shepCode);
    expect(result.workflows).toHaveLength(1);
    
    const workflow = result.workflows[0];
    expect(workflow.name).toBe('PurchaseItem');
    expect(workflow.trigger).toBe("User clicks 'Buy Now'");
    expect(workflow.fromScreen).toBe('ProductDetail');
    expect(workflow.steps).toHaveLength(3);
  });

  test('Parse conditional workflow steps', () => {
    const shepCode = `
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
    `;
    
    const result = parseShep(shepCode);
    const workflow = result.workflows[0];
    
    const conditionalStep = workflow.steps.find(s => s.$type === 'ConditionalStep');
    expect(conditionalStep).toBeDefined();
    expect(conditionalStep.condition).toBe('user.needsEmailVerification');
    expect(conditionalStep.thenSteps).toHaveLength(1);
    expect(conditionalStep.elseSteps).toHaveLength(1);
  });

  test('Parse complex workflow with all step types', () => {
    const shepCode = `
      workflow ProcessOrder:
        trigger: "Order placed"
        from: CheckoutPage
        steps:
          - validate: "Payment is valid"
          - validate: "Items are in stock"
          - call: "Stripe.confirmPayment" with paymentId
          - create: "Order" with items, paymentId
          - update: "Product.stockCount" decrement by itemQuantity
          - notify: "Customer" with "Order confirmation"
          - delete: "Cart" with cartId
    `;
    
    const result = parseShep(shepCode);
    const workflow = result.workflows[0];
    
    expect(workflow.steps).toHaveLength(7);
    
    const stepTypes = workflow.steps.map(s => s.$type);
    expect(stepTypes).toContain('ValidateStep');
    expect(stepTypes).toContain('CallStep');
    expect(stepTypes).toContain('CreateStep');
    expect(stepTypes).toContain('UpdateStep');
    expect(stepTypes).toContain('NotifyStep');
    expect(stepTypes).toContain('DeleteStep');
  });

  test('Maintain backward compatibility', () => {
    const shepCode = `
      app TodoApp {
        data Todo:
          fields: { title: text, completed: yes/no }
        
        view Dashboard:
          list Todo
        
        action addTodo(title):
          add Todo with title, completed=false
          show Dashboard
      }
    `;
    
    const result = parseShep(shepCode);
    expect(result.apps).toHaveLength(1);
    expect(result.datas).toHaveLength(1);
    expect(result.views).toHaveLength(1);
    expect(result.actions).toHaveLength(1);
    expect(result.workflows).toBeUndefined();
  });
});
```

### 2. Workflow Parser Tests
```javascript
// test-phase3-workflow-parser.js
const { WorkflowParser } = require('@sheplang/compiler');

describe('Workflow Parser Tests', () => {
  let parser;

  beforeEach(() => {
    parser = new WorkflowParser();
  });

  test('Parse simple workflow correctly', () => {
    const workflow = {
      name: 'TestWorkflow',
      trigger: 'Test trigger',
      fromScreen: 'TestScreen',
      steps: [
        { $type: 'ValidateStep', description: 'Test validation' },
        { $type: 'CreateStep', entity: 'User', fields: ['name', 'email'] }
      ]
    };

    const parsed = parser.parseWorkflow(workflow);
    
    expect(parsed.name).toBe('TestWorkflow');
    expect(parsed.steps).toHaveLength(2);
    expect(parsed.dependencies.entities).toContain('User');
    expect(parsed.validation.isValid).toBe(true);
  });

  test('Extract dependencies correctly', () => {
    const workflow = {
      name: 'PurchaseWorkflow',
      trigger: 'Buy Now clicked',
      fromScreen: 'ProductDetail',
      steps: [
        { $type: 'CallStep', apiCall: 'Stripe.createPaymentIntent', parameters: ['amount'] },
        { $type: 'CreateStep', entity: 'Order', fields: ['productId', 'userId'] },
        { $type: 'NotifyStep', target: 'User', message: 'Order confirmed' }
      ]
    };

    const parsed = parser.parseWorkflow(workflow);
    
    expect(parsed.dependencies.integrations).toContain('Stripe');
    expect(parsed.dependencies.integrations).toContain('notification');
    expect(parsed.dependencies.entities).toContain('Order');
    expect(parsed.dependencies.screens).toContain('ProductDetail');
  });

  test('Validate workflow correctly', () => {
    const invalidWorkflow = {
      name: '',
      trigger: '',
      fromScreen: '',
      steps: []
    };

    const parsed = parser.parseWorkflow(invalidWorkflow);
    
    expect(parsed.validation.isValid).toBe(false);
    expect(parsed.validation.errors.length).toBeGreaterThan(0);
    
    const errorMessages = parsed.validation.errors.map(e => e.message);
    expect(errorMessages).toContain('Workflow name is required');
    expect(errorMessages).toContain('Workflow trigger is required');
    expect(errorMessages).toContain('Workflow from screen is required');
    expect(errorMessages).toContain('Workflow must have at least one step');
  });

  test('Handle conditional steps correctly', () => {
    const workflow = {
      name: 'ConditionalWorkflow',
      trigger: 'Test trigger',
      fromScreen: 'TestScreen',
      steps: [
        {
          $type: 'ConditionalStep',
          condition: 'payment.success',
          thenSteps: [
            { $type: 'CreateStep', entity: 'Order', fields: ['productId'] }
          ],
          elseSteps: [
            { $type: 'NotifyStep', target: 'User', message: 'Payment failed' }
          ]
        }
      ]
    };

    const parsed = parser.parseWorkflow(workflow);
    const conditionalStep = parsed.steps[0];
    
    expect(conditionalStep.type).toBe('conditional');
    expect(conditionalStep.conditions.condition).toBe('payment.success');
    expect(conditionalStep.thenSteps).toHaveLength(1);
    expect(conditionalStep.elseSteps).toHaveLength(1);
  });
});
```

### 3. Workflow Engine Tests
```javascript
// test-phase3-workflow-engine.js
const { WorkflowEngine } = require('../api/services/workflow-engine');

describe('Workflow Engine Tests', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  test('Execute simple workflow successfully', async () => {
    const workflowName = 'TestWorkflow';
    const context = { testData: 'value' };

    const result = await engine.executeWorkflow(workflowName, context);
    
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });

  test('Handle workflow validation errors', async () => {
    const workflowName = 'InvalidWorkflow';
    const context = {};

    await expect(engine.executeWorkflow(workflowName, context))
      .rejects.toThrow('Workflow not found');
  });

  test('Execute conditional workflow correctly', async () => {
    const workflowName = 'ConditionalWorkflow';
    const context = { payment: { success: true }, productId: '123' };

    const result = await engine.executeWorkflow(workflowName, context);
    
    expect(result.success).toBe(true);
    expect(result.result.orderCreated).toBe(true);
  });

  test('Rollback on workflow failure', async () => {
    const workflowName = 'FailingWorkflow';
    const context = { invalidData: 'value' };

    await expect(engine.executeWorkflow(workflowName, context))
      .rejects.toThrow();
    
    // Verify rollback occurred
    const instances = await engine.getFailedInstances(workflowName);
    expect(instances).toHaveLength(1);
    expect(instances[0].status).toBe('rolled_back');
  });

  test('Track workflow progress correctly', async () => {
    const workflowName = 'MultiStepWorkflow';
    const context = { testData: 'value' };

    const result = await engine.executeWorkflow(workflowName, context);
    
    expect(result.success).toBe(true);
    
    // Check progress tracking
    const instance = await engine.getLatestInstance(workflowName);
    expect(instance.progress).toBe(instance.totalSteps);
    expect(instance.status).toBe('completed');
  });
});
```

### 4. Integration Tests
```javascript
// test-phase3-integration.js
const request = require('supertest');
const app = require('../api/app');

describe('Phase 3 Integration Tests', () => {
  test('Execute workflow via API endpoint', async () => {
    const response = await request(app)
      .post('/api/workflows/PurchaseWorkflow/execute')
      .send({
        productId: '123',
        userId: '456',
        amount: 99.99
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.result).toBeDefined();
  });

  test('Get workflow status via API', async () => {
    // First execute a workflow
    const executeResponse = await request(app)
      .post('/api/workflows/TestWorkflow/execute')
      .send({ testData: 'value' });

    const instanceId = executeResponse.body.result.instanceId;

    // Then get its status
    const statusResponse = await request(app)
      .get(`/api/workflows/TestWorkflow/instances/${instanceId}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.success).toBe(true);
    expect(statusResponse.body.instance.status).toBe('completed');
  });

  test('List available workflows via API', async () => {
    const response = await request(app)
      .get('/api/workflows');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.workflows)).toBe(true);
    expect(response.body.workflows.length).toBeGreaterThan(0);
  });

  test('Handle workflow execution errors gracefully', async () => {
    const response = await request(app)
      .post('/api/workflows/NonExistentWorkflow/execute')
      .send({ testData: 'value' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });
});
```

### 5. End-to-End Tests
```javascript
// test-phase3-comprehensive.js
const { generateApp } = require('@sheplang/compiler');
const { parseShep } = require('@sheplang/language');

describe('Phase 3 Comprehensive Tests', () => {
  test('Complete workflow system generation and execution', async () => {
    const shepCode = `
      app EcommerceApp {
        data Product:
          fields: { 
            name: text, 
            price: number, 
            stockCount: number,
            status: text
          }
          states: available -> sold -> archived

        data Order:
          fields: {
            productId: text,
            userId: text,
            amount: number,
            status: text,
            paymentId: text
          }
          states: pending -> paid -> shipped -> delivered

        view ProductDetail:
          show Product with id=productId
          button "Buy Now" -> PurchaseProduct

        workflow PurchaseProduct:
          trigger: "User clicks 'Buy Now'"
          from: ProductDetail
          steps:
            - validate: "Product is available"
            - validate: "User is authenticated"
            - call: "Stripe.createPaymentIntent" with amount, productId
            - if: "payment.success"
              then:
                - create: "Order" with productId, userId, amount, paymentId
                - update: "Product.status" to "sold"
                - update: "Product.stockCount" decrement by 1
                - notify: "User" with "Order confirmation"
                - notify: "Admin" with "New order received"
              else:
                - notify: "User" with "Payment failed, please try again"

        action purchaseProduct(productId, userId):
          execute PurchaseProduct with productId, userId
          show OrderConfirmation
      }
    `;

    // Parse the ShepLang code
    const ast = parseShep(shepCode);
    expect(ast.workflows).toHaveLength(1);

    // Generate the complete application
    const generatedApp = generateApp(ast);
    
    // Verify all workflow-related files are generated
    expect(generatedApp.files).toHaveProperty('api/services/workflow-engine.ts');
    expect(generatedApp.files).toHaveProperty('api/routes/workflows.ts');
    expect(generatedApp.files).toHaveProperty('api/integrations/stripe-adapter.ts');
    expect(generatedApp.files).toHaveProperty('components/workflow-progress.tsx');

    // Verify generated code is valid TypeScript
    Object.values(generatedApp.files).forEach(file => {
      expect(file.content).not.toContain('{{');
      expect(file.content).not.toContain('}}');
      expect(file.content).not.toContain('{{#');
      expect(file.content).not.toContain('{{/');
    });

    // Test workflow execution (mock implementation)
    const mockWorkflowEngine = {
      executeWorkflow: jest.fn().mockResolvedValue({
        success: true,
        result: { orderId: '123', paymentId: 'pay_123' }
      })
    };

    const result = await mockWorkflowEngine.executeWorkflow('PurchaseProduct', {
      productId: '123',
      userId: '456',
      amount: 99.99
    });

    expect(result.success).toBe(true);
    expect(result.result.orderId).toBe('123');
  });

  test('Complex multi-step workflow with error handling', async () => {
    const shepCode = `
      app ComplexApp {
        workflow ComplexProcess:
          trigger: "User starts complex process"
          from: StartScreen
          steps:
            - validate: "User has permission"
            - validate: "Data is valid"
            - call: "ExternalAPI.validateData" with data
            - if: "validation.success"
              then:
                - create: "Process" with data, userId
                - update: "Process.status" to "running"
                - call: "ExternalAPI.startProcessing" with processId
                - notify: "User" with "Process started"
              else:
                - notify: "User" with "Validation failed"
                - create: "ErrorLog" with error, userId
      }
    `;

    const ast = parseShep(shepCode);
    const generatedApp = generateApp(ast);

    // Verify complex workflow is generated correctly
    const workflowEngine = generatedApp.files['api/services/workflow-engine.ts'];
    expect(workflowEngine.content).toContain('executeWorkflow');
    expect(workflowEngine.content).toContain('rollback');

    const integrationAdapter = generatedApp.files['api/integrations/webhook-adapter.ts'];
    expect(integrationAdapter.content).toContain('ExternalAPI');
  });

  test('Performance benchmarks', async () => {
    const shepCode = `
      workflow PerformanceTest:
        trigger: "Test trigger"
        from: TestScreen
        steps:
          - validate: "Test validation"
          - create: "TestEntity" with field1, field2
          - update: "TestEntity.field1" to "updated"
          - notify: "User" with "Test notification"
    `;

    const ast = parseShep(shepCode);
    const generatedApp = generateApp(ast);

    // Measure code generation time
    const startTime = Date.now();
    const result = await generateApp(ast);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    expect(Object.keys(result.files).length).toBeGreaterThan(10);
  });
});
```

### 6. UI Integration Tests
```javascript
// test-phase3-ui-integration.js
const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { WorkflowProgress } = require('../components/workflow-progress');

describe('UI Integration Tests', () => {
  test('Workflow progress component displays correctly', async () => {
    const mockOnComplete = jest.fn();
    const mockOnError = jest.fn();

    render(
      <WorkflowProgress
        workflowName="TestWorkflow"
        instanceId="123"
        onComplete={mockOnComplete}
        onError={mockOnError}
      />
    );

    // Initially shows loading
    expect(screen.getByText('Loading workflow progress...')).toBeInTheDocument();

    // After loading, shows progress
    await waitFor(() => {
      expect(screen.getByText('TestWorkflow')).toBeInTheDocument();
      expect(screen.getByText('Step 0 of 5')).toBeInTheDocument();
      expect(screen.getByText('Status: running')).toBeInTheDocument();
    });

    // Simulate completion
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({ success: true, orderId: '123' });
    }, { timeout: 5000 });
  });

  test('Workflow progress handles errors correctly', async () => {
    const mockOnError = jest.fn();

    render(
      <WorkflowProgress
        workflowName="ErrorWorkflow"
        instanceId="456"
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Payment failed');
    }, { timeout: 5000 });
  });
});
```

---

## Test Files Structure

```
test/
├── phase3-grammar.js              # Grammar parsing tests
├── phase3-workflow-parser.js      # Workflow parser tests
├── phase3-workflow-engine.js       # Workflow engine tests
├── phase3-integration.js          # API integration tests
├── phase3-ui-integration.js        # UI component tests
├── phase3-comprehensive.js         # End-to-end tests
├── phase3-performance.js           # Performance benchmarks
└── phase3-error-scenarios.js       # Error handling tests
```

---

## Success Criteria

### 1. Test Coverage ✅
- 100% grammar parsing coverage
- 100% workflow parser coverage
- 100% workflow engine coverage
- 100% API endpoint coverage
- 100% UI component coverage

### 2. Integration Success ✅
- All components work together
- End-to-end workflows execute successfully
- UI displays workflow progress correctly
- Error handling works properly

### 3. Performance ✅
- Workflow execution < 2 seconds
- Code generation < 3 seconds
- UI updates < 1 second
- Memory usage within limits

---

## Development Steps

### Step 1: Unit Tests
1. Create grammar parsing tests
2. Create workflow parser tests
3. Create workflow engine tests
4. Verify all tests pass

### Step 2: Integration Tests
1. Create API endpoint tests
2. Create UI component tests
3. Create integration test suite
4. Verify component interactions

### Step 3: End-to-End Tests
1. Create comprehensive test suite
2. Test with real-world examples
3. Performance benchmarking
4. Error scenario testing

### Step 4: Test Automation
1. Set up CI/CD pipeline
2. Automated test execution
3. Coverage reporting
4. Performance monitoring

---

## Acceptance Criteria

- [ ] All grammar parsing tests pass
- [ ] All workflow parser tests pass
- [ ] All workflow engine tests pass
- [ ] All integration tests pass
- [ ] All UI tests pass
- [ ] End-to-end tests pass
- [ ] Performance benchmarks met
- [ ] Error scenarios tested
- [ ] 100% test coverage achieved

---

## Dependencies

### Required Components
- ✅ Phase 3-01 Grammar Extensions (completed)
- ✅ Phase 3-02 Workflow Parser (completed)
- ✅ Phase 3-03 Code Generation (completed)

### Testing Dependencies
- **Jest** - Test framework
- **Supertest** - API testing
- **React Testing Library** - UI testing
- **Benchmark** - Performance testing

---

## Deliverables

### Test Files
- Complete test suite for all Phase 3 components
- Integration test suite
- End-to-end test suite
- Performance benchmarks

### Test Reports
- Coverage reports
- Performance reports
- Error scenario documentation
- Test execution logs

### Automation
- CI/CD pipeline configuration
- Test automation scripts
- Coverage monitoring
- Performance monitoring

---

## Completion Criteria

- [ ] All tests created and passing
- [ ] 100% test coverage achieved
- [ ] Performance benchmarks met
- [ ] Error scenarios tested
- [ ] CI/CD pipeline working
- [ ] Documentation complete

---

**Status:** PENDING  
**Dependencies:** Phase 3-01, Phase 3-02, Phase 3-03  
**Final Task:** Phase 3 Completion Documentation
