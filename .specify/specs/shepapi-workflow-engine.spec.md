# ShepAPI Workflow Engine Specification
**Version:** 1.0  
**Date:** November 22, 2025  
**Status:** SPECIFICATION  

---

## Overview

ShepAPI Workflow Engine enables **multi-step business processes** that connect UI actions to backend orchestration. This bridges the gap between your working UI buttons and complex backend workflows.

**Use Cases:**
- Purchase workflows (validate → charge → create order → notify)
- User onboarding (validate → create account → send welcome → setup profile)
- Content moderation (review → approve → publish → notify)
- Data processing (upload → validate → transform → store → notify)

---

## Requirements

### 1. Workflow Declaration Syntax
```sheplang
workflow PurchaseListing:
  trigger: "User clicks 'Buy Now'"
  from: ListingDetail
  steps:
    - validate: "Listing is still available"
    - validate: "User has sufficient funds"
    - call: "Stripe.createPaymentIntent" with amount, listingId
    - if: "payment.success"
      then:
        - create: "Purchase" with listingId, userId, paymentId
        - update: "Listing.status" to "sold"
        - notify: "Buyer" with "Purchase confirmation"
        - notify: "Seller" with "Item sold notification"
    - else:
      - notify: "User" with "Payment failed"
```

### 2. Step Types Supported
- **validate** - Business rule validation
- **call** - Third-party API integration
- **create** - Entity creation
- **update** - Entity modification
- **delete** - Entity removal
- **notify** - Email/push notifications
- **if/else** - Conditional logic
- **loop** - Iterative processing

### 3. Integration Points
- **Stripe** - Payment processing
- **SendGrid** - Email notifications
- **Twilio** - SMS notifications
- **Webhooks** - External API callbacks
- **Database** - Entity operations

### 4. Error Handling
- Step-level error catching
- Rollback capabilities
- User-friendly error messages
- Retry mechanisms for external calls

### 5. State Management
- Workflow instance tracking
- Step completion status
- Progress indicators
- Resume capability

---

## Technical Architecture

### 1. Grammar Extensions
```langium
WorkflowDecl:
  'workflow' name=ShepIdentifier ':'
    'trigger' ':' trigger=STRING
    'from' ':' fromScreen=ShepIdentifier
    'steps' ':' steps+=WorkflowStep+;

WorkflowStep:
  (ValidateStep | CallStep | CreateStep | UpdateStep | DeleteStep | NotifyStep | ConditionalStep | LoopStep);

ValidateStep:
  'validate' ':' description=STRING;

CallStep:
  'call' ':' apiCall=STRING ('with' parameters+=ID (',' parameters+=ID)*)?;

ConditionalStep:
  'if' ':' condition=STRING
    'then' ':' thenSteps+=WorkflowStep+
    ('else' ':' elseSteps+=WorkflowStep+)?;
```

### 2. AST Mapping
```typescript
interface WorkflowDeclaration {
  name: string;
  trigger: string;
  fromScreen: string;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  type: 'validate' | 'call' | 'create' | 'update' | 'delete' | 'notify' | 'if' | 'loop';
  description?: string;
  apiCall?: string;
  parameters?: string[];
  condition?: string;
  thenSteps?: WorkflowStep[];
  elseSteps?: WorkflowStep[];
}
```

### 3. Code Generation Targets
- **Workflow Engine** - Orchestration runtime
- **Step Handlers** - Individual step processors
- **Integration Adapters** - Third-party API wrappers
- **State Management** - Workflow tracking database
- **API Endpoints** - Workflow trigger endpoints
- **UI Integration** - Progress indicators and status

---

## Generated Code Structure

### 1. Workflow Engine (`api/services/workflow-engine.ts`)
```typescript
export class WorkflowEngine {
  async executeWorkflow(name: string, context: WorkflowContext): Promise<WorkflowResult> {
    // Load workflow definition
    // Execute steps in order
    // Handle errors and rollbacks
    // Track progress
    // Return result
  }
}
```

### 2. Step Handlers (`api/workflows/steps/`)
- `validate-handler.ts` - Business rule validation
- `call-handler.ts` - Third-party API calls
- `entity-handler.ts` - Database operations
- `notify-handler.ts` - Notification delivery

### 3. Integration Adapters (`api/integrations/`)
- `stripe-adapter.ts` - Payment processing
- `sendgrid-adapter.ts` - Email delivery
- `twilio-adapter.ts` - SMS delivery

### 4. State Management (`api/prisma/workflow-schema.prisma`)
```prisma
model WorkflowInstance {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("running")
  context   Json
  progress  Int      @default(0)
  result    Json?
  error     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Success Criteria

### 1. Grammar Parsing ✅
- Workflow declarations parse correctly
- All step types recognized
- Conditional logic supported
- No syntax errors in valid workflows

### 2. Code Generation ✅
- Complete workflow engine generated
- All step handlers implemented
- Integration adapters created
- Database schema generated

### 3. Execution ✅
- Workflows execute end-to-end
- Error handling works correctly
- State tracking accurate
- Rollback functions properly

### 4. UI Integration ✅
- Workflow triggers from UI actions
- Progress indicators update
- Results reflected in UI
- Error messages displayed

### 5. Testing ✅
- 100% test coverage
- Integration tests pass
- Error scenarios tested
- Performance benchmarks met

---

## Examples

### Example 1: E-commerce Purchase
```sheplang
workflow PurchaseItem:
  trigger: "User clicks 'Buy Now'"
  from: ProductDetail
  steps:
    - validate: "Product is in stock"
    - validate: "User is authenticated"
    - call: "Stripe.createPaymentIntent" with productId, userId
    - if: "payment.success"
      then:
        - create: "Order" with productId, userId, paymentId
        - update: "Product.stockCount" decrement by 1
        - notify: "User" with "Order confirmation"
        - notify: "Seller" with "New order notification"
    - else:
      - notify: "User" with "Payment failed, please try again"
```

### Example 2: User Registration
```sheplang
workflow RegisterUser:
  trigger: "User submits registration form"
  from: SignUpForm
  steps:
    - validate: "Email is not already registered"
    - validate: "Password meets requirements"
    - create: "User" with email, hashedPassword
    - call: "SendGrid.sendWelcomeEmail" with email, userName
    - notify: "Admin" with "New user registration"
```

---

## Dependencies

### Required Components
- ✅ ShepLang Language Core (Phase 1)
- ✅ State Machine System (Phase 2)
- ✅ Background Job System (Phase 2)
- ✅ Basic UI Framework (Phase 1)

### External Dependencies
- **Stripe SDK** - Payment processing
- **SendGrid SDK** - Email delivery
- **Prisma** - Database operations
- **Node-cron** - Background scheduling

---

## Performance Requirements

- **Workflow Execution:** < 2 seconds for typical workflows
- **Concurrent Workflows:** Support 100+ simultaneous executions
- **Error Recovery:** < 5 seconds rollback time
- **State Tracking:** Real-time progress updates

---

## Security Requirements

- **Input Validation:** All workflow inputs validated
- **API Authentication:** Third-party calls properly authenticated
- **Data Encryption:** Sensitive data encrypted at rest
- **Audit Trail:** All workflow steps logged

---

**Status:** SPECIFICATION - Ready for Implementation Planning  
**Next:** Create phase3-workflow-engine.plan.md
