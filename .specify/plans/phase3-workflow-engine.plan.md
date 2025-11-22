# Phase 3 Workflow Engine Implementation Plan
**Version:** 1.0  
**Date:** November 22, 2025  
**Status:** PLAN - Ready for Execution

---

## Overview

Phase 3 implements the **Workflow Engine** that connects your working UI buttons to multi-step backend processes. This builds directly on your functional UI and demonstrates the full power of ShepLang workflows.

**Timeline:** 2-3 weeks  
**Success:** Users can click UI buttons that trigger complex business processes with real integrations

---

## Phase 3 Strategy

### Why This Phase First
- ✅ **Builds on Working UI** - You have functional todo apps users can click
- ✅ **Demonstrates Power** - Shows multi-step workflows with real APIs
- ✅ **Testable at Each Step** - Every component can be tested independently
- ✅ **Foundation for Future** - Required for real-time, validation, and integrations

### Power Demonstration
"Click button → Validate → Process payment → Send email → Update UI"
This shows ShepLang can handle real business logic, not just CRUD.

---

## Implementation Phases

### Phase 3.1: Grammar Extensions (Week 1)
**Goal:** Add workflow syntax to ShepLang grammar

**Deliverables:**
- ✅ Workflow declaration grammar rules
- ✅ Step type parsing (validate, call, create, update, delete, notify, if/else)
- ✅ Conditional logic support
- ✅ AST mapping for workflow structures

**Files to Modify:**
- `sheplang/packages/language/src/shep.langium` - Grammar rules
- `sheplang/packages/language/src/mapper.ts` - AST mapping
- `sheplang/packages/language/src/types.ts` - Type definitions

**Success Criteria:**
- Workflow declarations parse without errors
- All step types recognized correctly
- Conditional logic works properly
- AST structure matches specification

---

### Phase 3.2: Workflow Engine Core (Week 1-2)
**Goal:** Build the orchestration runtime

**Deliverables:**
- ✅ WorkflowEngine class with execute method
- ✅ Step handler framework
- ✅ Context management system
- ✅ Error handling and rollback
- ✅ State tracking database schema

**Files to Create:**
- `sheplang/packages/compiler/src/workflow-engine.ts` - Core engine
- `sheplang/packages/compiler/src/workflow-templates.ts` - Code templates
- `sheplang/packages/compiler/src/step-handlers/` - Individual step processors

**Success Criteria:**
- Workflow executes from start to finish
- Errors are caught and handled gracefully
- State is tracked accurately
- Rollback works on failures

---

### Phase 3.3: Integration Adapters (Week 2)
**Goal:** Connect to external services

**Deliverables:**
- ✅ Stripe payment processing adapter
- ✅ SendGrid email delivery adapter
- ✅ Generic webhook caller
- ✅ Database operation handlers
- ✅ Notification system

**Files to Create:**
- `sheplang/packages/compiler/src/integrations/stripe-adapter.ts`
- `sheplang/packages/compiler/src/integrations/sendgrid-adapter.ts`
- `sheplang/packages/compiler/src/integrations/database-adapter.ts`

**Success Criteria:**
- Real Stripe payments can be processed
- Emails are sent successfully
- Database operations work correctly
- Webhooks can be called

---

### Phase 3.4: Code Generation (Week 2-3)
**Goal:** Generate complete workflow system

**Deliverables:**
- ✅ Workflow engine API endpoints
- ✅ Step handler implementations
- ✅ Integration adapter code
- ✅ Database schema and migrations
- ✅ UI workflow triggers

**Files to Generate:**
- `api/services/workflow-engine.ts` - Main engine
- `api/routes/workflows.ts` - Trigger endpoints
- `api/prisma/workflow-schema.prisma` - Database schema
- `components/workflow-progress.tsx` - UI components

**Success Criteria:**
- Generated code compiles without errors
- All workflow types are supported
- API endpoints work correctly
- UI components display progress

---

### Phase 3.5: Integration Testing (Week 3)
**Goal:** End-to-end workflow functionality

**Deliverables:**
- ✅ Complete test suite
- ✅ Example workflows implemented
- ✅ UI integration verified
- ✅ Performance benchmarks
- ✅ Error scenario testing

**Test Files:**
- `test-phase3-grammar.js` - Grammar parsing tests
- `test-phase3-workflow-engine.js` - Engine execution tests
- `test-phase3-integrations.js` - External API tests
- `test-phase3-comprehensive.js` - End-to-end tests

**Success Criteria:**
- 100% test coverage
- All example workflows work
- UI triggers function correctly
- Performance meets requirements

---

## Technical Implementation Details

### 1. Grammar Extensions
```langium
WorkflowDecl:
  'workflow' name=ShepIdentifier ':'
    'trigger' ':' trigger=STRING
    'from' ':' fromScreen=ShepIdentifier
    'steps' ':' steps+=WorkflowStep+;

WorkflowStep:
  (ValidateStep | CallStep | CreateStep | UpdateStep | DeleteStep | NotifyStep | ConditionalStep);
```

### 2. Code Generation Templates
```typescript
// Workflow Engine Template
const templateWorkflowEngine = `
export class WorkflowEngine {
  async executeWorkflow(name: string, context: any): Promise<any> {
    const workflow = this.getWorkflow(name);
    const instance = await this.createInstance(workflow, context);
    
    try {
      for (const step of workflow.steps) {
        await this.executeStep(step, instance);
        instance.progress++;
      }
      return { success: true, result: instance.context };
    } catch (error) {
      await this.rollback(instance);
      throw error;
    }
  }
}
`;
```

### 3. Integration Pattern
```typescript
// Stripe Integration Example
const stripeAdapter = `
export class StripeAdapter {
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<any> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        payment_method_types: ['card'],
      });
      return { success: true, paymentIntent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
`;
```

---

## Development Workflow

### Step 1: Grammar Development
1. Add workflow syntax to `shep.langium`
2. Update mapper to handle workflows
3. Add type definitions
4. Test with example workflows

### Step 2: Engine Development
1. Create WorkflowEngine class
2. Implement step handlers
3. Add error handling
4. Test with mock workflows

### Step 3: Integration Development
1. Implement Stripe adapter
2. Implement SendGrid adapter
3. Add database operations
4. Test with real APIs

### Step 4: Code Generation
1. Create Handlebars templates
2. Update transpiler to generate workflow code
3. Generate complete workflow system
4. Test generated code

### Step 5: Integration Testing
1. Create comprehensive test suite
2. Build example applications
3. Verify UI integration
4. Performance testing

---

## Success Metrics

### Technical Metrics
- **Test Coverage:** 100%
- **Workflow Execution Time:** < 2 seconds
- **Concurrent Workflows:** 100+ supported
- **Error Recovery:** < 5 seconds

### Business Metrics
- **User Actions:** UI buttons trigger real workflows
- **Integrations:** Real payments and emails sent
- **Error Handling:** Graceful failure recovery
- **User Experience:** Progress indicators and feedback

### Quality Metrics
- **Code Quality:** Generated code passes all linting
- **Type Safety:** Full TypeScript coverage
- **Documentation:** Complete API documentation
- **Examples:** 3+ working workflow examples

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Grammar complexity | Start with simple workflows, expand gradually |
| Integration failures | Mock external services for testing |
| Performance issues | Benchmark at each step |
| State management | Use proven database patterns |

### Schedule Risks
| Risk | Mitigation |
|------|-----------|
| Scope creep | Strict adherence to specification |
| Integration delays | Parallel development of adapters |
| Testing bottlenecks | Automated testing from day 1 |
| UI integration issues | Early UI testing |

---

## Deliverables Summary

### Code Files
- Grammar extensions (language package)
- Workflow engine (compiler package)
- Integration adapters (compiler package)
- Code generation templates (compiler package)

### Generated Applications
- E-commerce purchase workflow
- User registration workflow
- Content moderation workflow
- Data processing workflow

### Test Suite
- Grammar parsing tests
- Engine execution tests
- Integration tests
- End-to-end tests

### Documentation
- API documentation
- Integration guides
- Example tutorials
- Performance benchmarks

---

## Next Steps

1. **Approve this plan** ✅
2. **Create task breakdown files** in `/tasks/`
3. **Begin Phase 3.1: Grammar Extensions**
4. **Set up integration testing environment**
5. **Prepare example workflow specifications**

---

**Status:** PLAN - Ready for Execution  
**Confidence:** High (builds on working foundation)  
**Next Review:** After Phase 3.1 completion
