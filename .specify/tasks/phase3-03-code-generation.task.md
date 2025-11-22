# Phase 3-03 Code Generation Task
**Phase:** 3  
**Task:** 03  
**Description:** Code Generation  
**Status:** PENDING  
**Estimated Time:** 4-5 days

---

## Overview

Generate complete workflow system code including the workflow engine, step handlers, integration adapters, database schema, and UI components. This transforms parsed workflow structures into production-ready TypeScript code.

---

## Task Requirements

### 1. Workflow Engine Generation
```typescript
// Generated: api/services/workflow-engine.ts
export class WorkflowEngine {
  private workflows: Map<string, ParsedWorkflow> = new Map();
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.loadWorkflows();
  }

  async executeWorkflow(name: string, context: any): Promise<WorkflowResult> {
    const workflow = this.workflows.get(name);
    if (!workflow) {
      throw new Error(`Workflow not found: ${name}`);
    }

    const instance = await this.createInstance(workflow, context);
    
    try {
      for (const step of workflow.steps) {
        await this.executeStep(step, instance);
        instance.progress++;
        await this.updateInstance(instance);
      }
      
      await this.completeInstance(instance, { success: true });
      return { success: true, result: instance.context };
    } catch (error) {
      await this.rollbackInstance(instance);
      await this.failInstance(instance, error);
      throw error;
    }
  }

  private async executeStep(step: ParsedStep, instance: WorkflowInstance): Promise<void> {
    const handler = this.getStepHandler(step.type);
    await handler.execute(step, instance);
  }

  private getStepHandler(type: StepType): StepHandler {
    switch (type) {
      case 'validate': return new ValidateHandler(this.prisma);
      case 'call': return new CallHandler(this.prisma);
      case 'create': return new CreateHandler(this.prisma);
      case 'update': return new UpdateHandler(this.prisma);
      case 'delete': return new DeleteHandler(this.prisma);
      case 'notify': return new NotifyHandler(this.prisma);
      case 'conditional': return new ConditionalHandler(this.prisma);
      default: throw new Error(`Unknown step type: ${type}`);
    }
  }
}
```

### 2. Step Handler Generation
```typescript
// Generated: api/workflows/handlers/validate-handler.ts
export class ValidateHandler implements StepHandler {
  constructor(private prisma: PrismaClient) {}

  async execute(step: ParsedValidateStep, instance: WorkflowInstance): Promise<void> {
    const { validationRules } = step.parameters;
    
    for (const rule of validationRules) {
      const result = await this.validateRule(rule, instance.context);
      if (!result.valid) {
        throw new ValidationError(`Validation failed: ${result.message}`);
      }
    }
  }

  private async validateRule(rule: ValidationRule, context: any): Promise<ValidationResult> {
    // Implementation based on rule type
    switch (rule.type) {
      case 'entity_exists':
        return await this.validateEntityExists(rule, context);
      case 'field_required':
        return this.validateFieldRequired(rule, context);
      case 'unique_constraint':
        return await this.validateUniqueConstraint(rule, context);
      default:
        return { valid: true, message: '' };
    }
  }
}

// Generated: api/workflows/handlers/call-handler.ts
export class CallHandler implements StepHandler {
  constructor(private prisma: PrismaClient) {}

  async execute(step: ParsedCallStep, instance: WorkflowInstance): Promise<void> {
    const { api, method, arguments: args } = step.parameters;
    
    switch (api) {
      case 'Stripe':
        return await this.executeStripeCall(method, args, instance);
      case 'SendGrid':
        return await this.executeSendGridCall(method, args, instance);
      case 'Webhook':
        return await this.executeWebhookCall(method, args, instance);
      default:
        throw new Error(`Unknown API: ${api}`);
    }
  }

  private async executeStripeCall(method: string, args: string[], instance: WorkflowInstance): Promise<void> {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    switch (method) {
      case 'createPaymentIntent':
        const amount = this.extractValue(args[0], instance.context);
        const currency = this.extractValue(args[1], instance.context) || 'usd';
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // Convert to cents
          currency,
          payment_method_types: ['card'],
        });
        
        instance.context.paymentIntent = paymentIntent;
        break;
      default:
        throw new Error(`Unknown Stripe method: ${method}`);
    }
  }
}
```

### 3. Integration Adapters
```typescript
// Generated: api/integrations/stripe-adapter.ts
export class StripeAdapter {
  private stripe: Stripe;

  constructor() {
    this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        payment_method_types: ['card'],
      });
      
      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      
      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Generated: api/integrations/sendgrid-adapter.ts
export class SendGridAdapter {
  private sendGrid: any;

  constructor() {
    this.sendGrid = require('@sendgrid/mail');
    this.sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to: string, subject: string, content: string): Promise<EmailResult> {
    try {
      const msg = {
        to,
        from: process.env.FROM_EMAIL,
        subject,
        text: content,
        html: `<p>${content}</p>`
      };

      await this.sendGrid.send(msg);
      
      return {
        success: true,
        messageId: 'email_sent_' + Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### 4. Database Schema Generation
```prisma
// Generated: api/prisma/workflow-schema.prisma
model WorkflowInstance {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("running") // running, completed, failed, rolled_back
  context   Json     // Workflow execution context
  progress  Int      @default(0)
  result    Json?    // Final result
  error     String?  // Error message if failed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WorkflowStepLog {
  id         String   @id @default(cuid())
  instanceId String
  stepId     String
  stepType   String
  status     String   // running, completed, failed
  input      Json?    // Step input data
  output     Json?    // Step output data
  error      String?  // Error message if failed
  startedAt  DateTime @default(now())
  completedAt DateTime?
  
  instance WorkflowInstance @relation(fields: [instanceId], references: [id])
}

model WorkflowDependency {
  id           String @id @default(cuid())
  workflowName String
  type         String // entity, integration, screen, api
  name         String
  required     Boolean @default(true)
  
  @@unique([workflowName, type, name])
}
```

### 5. API Endpoints Generation
```typescript
// Generated: api/routes/workflows.ts
import { Router } from 'express';
import { WorkflowEngine } from '../services/workflow-engine';

const router = Router();
const workflowEngine = new WorkflowEngine();

// Trigger workflow execution
router.post('/workflows/:name/execute', async (req, res) => {
  try {
    const { name } = req.params;
    const context = req.body;
    
    const result = await workflowEngine.executeWorkflow(name, context);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow status
router.get('/workflows/:name/instances/:instanceId', async (req, res) => {
  try {
    const { name, instanceId } = req.params;
    
    const instance = await workflowEngine.getInstance(instanceId);
    
    res.json({
      success: true,
      instance
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow definitions
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await workflowEngine.getWorkflows();
    
    res.json({
      success: true,
      workflows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

### 6. UI Components Generation
```typescript
// Generated: components/workflow-progress.tsx
import React, { useState, useEffect } from 'react';

interface WorkflowProgressProps {
  workflowName: string;
  instanceId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  workflowName,
  instanceId,
  onComplete,
  onError
}) => {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pollInstance = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflowName}/instances/${instanceId}`);
        const data = await response.json();
        
        setInstance(data.instance);
        
        if (data.instance.status === 'completed') {
          onComplete?.(data.instance.result);
        } else if (data.instance.status === 'failed') {
          onError?.(data.instance.error);
        } else if (data.instance.status === 'running') {
          // Continue polling
          setTimeout(pollInstance, 1000);
        }
      } catch (error) {
        onError?.(error.message);
      } finally {
        setLoading(false);
      }
    };

    pollInstance();
  }, [workflowName, instanceId]);

  if (loading) {
    return <div>Loading workflow progress...</div>;
  }

  if (!instance) {
    return <div>Workflow instance not found</div>;
  }

  const progressPercentage = (instance.progress / instance.totalSteps) * 100;

  return (
    <div className="workflow-progress">
      <h3>{workflowName}</h3>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="progress-text">
        Step {instance.progress} of {instance.totalSteps}
      </div>
      <div className="status">
        Status: {instance.status}
      </div>
    </div>
  );
};
```

---

## Files to Create

### 1. Code Templates
**File:** `sheplang/packages/compiler/src/workflow-templates.ts`
- Workflow engine template
- Step handler templates
- Integration adapter templates
- Database schema template
- API endpoint template
- UI component template

### 2. Template Compiler
**File:** `sheplang/packages/compiler/src/workflow-template-compiler.ts`
- Template compilation logic
- Data context preparation
- Code generation orchestration

### 3. Generated Output Structure
```
api/
├── services/
│   └── workflow-engine.ts
├── workflows/
│   └── handlers/
│       ├── validate-handler.ts
│       ├── call-handler.ts
│       ├── create-handler.ts
│       ├── update-handler.ts
│       ├── delete-handler.ts
│       └── notify-handler.ts
├── integrations/
│   ├── stripe-adapter.ts
│   ├── sendgrid-adapter.ts
│   └── webhook-adapter.ts
├── routes/
│   └── workflows.ts
└── prisma/
    └── workflow-schema.prisma

components/
└── workflow-progress.tsx
```

---

## Success Criteria

### 1. Code Generation ✅
- All workflow components generated
- Templates compile correctly
- Generated code is syntactically valid
- No template syntax leakage

### 2. Functionality ✅
- Workflow engine executes workflows
- Step handlers work correctly
- Integration adapters function properly
- UI components display progress

### 3. Integration ✅
- Generated code integrates with existing codebase
- API endpoints work with UI
- Database schema compatible
- No breaking changes

---

## Test Cases

### 1. Template Compilation
```javascript
const templates = new WorkflowTemplates();
const parsedWorkflow = createParsedWorkflow();
const context = { workflow: parsedWorkflow };

const generatedCode = templates.compileTemplate('workflow-engine', context);
assert(generatedCode.includes('export class WorkflowEngine'));
assert(!generatedCode.includes('{{'));
assert(!generatedCode.includes('}}'));
```

### 2. Generated Code Execution
```javascript
// Test generated workflow engine
const engine = new WorkflowEngine();
const result = await engine.executeWorkflow('TestWorkflow', { testData: 'value' });
assert(result.success === true);
```

### 3. Integration Testing
```javascript
// Test UI integration
const { getByText } = render(<WorkflowProgress workflowName="Test" instanceId="123" />);
expect(getByText('Test')).toBeInTheDocument();
```

---

## Development Steps

### Step 1: Template Creation
1. Create workflow engine template
2. Create step handler templates
3. Create integration adapter templates
4. Test template compilation

### Step 2: Code Generation
1. Implement template compiler
2. Add workflow generation to transpiler
3. Test code generation
4. Verify output quality

### Step 3: Integration Testing
1. Generate complete workflow system
2. Test workflow execution
3. Test UI integration
4. Performance testing

### Step 4: End-to-End Testing
1. Create example workflows
2. Generate complete application
3. Test full workflow execution
4. Verify all components work together

---

## Acceptance Tests

### 1. Template Tests
```javascript
describe('Workflow Templates', () => {
  it('should generate valid workflow engine', () => {
    const template = templates.getTemplate('workflow-engine');
    const code = template.compile({ workflow: testWorkflow });
    expect(code).toContain('export class WorkflowEngine');
  });

  it('should generate step handlers', () => {
    const template = templates.getTemplate('validate-handler');
    const code = template.compile({ step: testStep });
    expect(code).toContain('export class ValidateHandler');
  });
});
```

### 2. Generation Tests
```javascript
describe('Workflow Code Generation', () => {
  it('should generate complete workflow system', () => {
    const files = transpiler.generateWorkflows([testWorkflow]);
    
    expect(files).toHaveProperty('api/services/workflow-engine.ts');
    expect(files).toHaveProperty('api/routes/workflows.ts');
    expect(files).toHaveProperty('components/workflow-progress.tsx');
  });

  it('should generate valid TypeScript code', () => {
    const files = transpiler.generateWorkflows([testWorkflow]);
    
    Object.values(files).forEach(code => {
      expect(() => TypeScript.compile(code)).not.toThrow();
    });
  });
});
```

---

## Dependencies

### Required Components
- ✅ Phase 3-01 Grammar Extensions (completed)
- ✅ Phase 3-02 Workflow Parser (completed)
- ✅ Handlebars templating system
- ✅ Existing code generation infrastructure

### External Dependencies
- **TypeScript** - Code compilation
- **Prisma** - Database schema
- **Express** - API endpoints
- **React** - UI components

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Template complexity | Start with simple templates, expand gradually |
| Code generation errors | Comprehensive testing, validation |
| Integration issues | Test with existing codebase early |

### Schedule Risks
| Risk | Mitigation |
|------|-----------|
| Template creation time | Parallel development of templates |
| Testing complexity | Automated testing pipeline |
| Integration testing | Mock external services |

---

## Deliverables

### Code Files
- Workflow templates
- Template compiler
- Updated transpiler

### Generated Code
- Complete workflow engine system
- Integration adapters
- API endpoints
- UI components

### Test Files
- Template tests
- Generation tests
- Integration tests

---

## Completion Criteria

- [ ] All workflow templates created
- [ ] Code generation working
- [ ] Generated code valid and functional
- [ ] Integration with existing codebase
- [ ] All tests pass
- [ ] Documentation complete

---

**Status:** PENDING  
**Dependencies:** Phase 3-01 Grammar Extensions, Phase 3-02 Workflow Parser  
**Next Task:** Phase 3 Integration Testing
