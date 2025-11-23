# Phase 3: Workflow Engine (UI + Backend Integration)

**Status:** 🔄 **IN PROGRESS**  
**Duration:** 2-3 weeks  
**Prerequisites:** Phase 2 Complete (Working UI + Basic Backend)  
**Success Criteria:** Multi-step actions that connect UI buttons to backend processes

---

## 🎯 Phase Objective

Extend the working UI with real backend workflows. Users can click buttons that trigger multi-step processes that validate data, perform operations, and update the UI.

**Power Demo:** "Click button → Validate → Process → Notify → Update UI"

---

## 📋 Detailed Tasks

### Week 1: Workflow Syntax & Parsing
- [ ] Extend ShepLang grammar for workflow actions
- [ ] Add workflow step syntax (step → step → step)
- [ ] Implement workflow parser
- [ ] Create workflow AST structure
- [ ] Tests: 5/5 passing

### Week 2: Workflow Code Generation
- [ ] Generate workflow orchestration classes
- [ ] Generate step-by-step execution logic
- [ ] Add workflow state management
- [ ] Generate error handling for workflows
- [ ] Tests: 7/7 passing

### Week 3: UI Integration & Testing
- [ ] Connect UI buttons to workflow execution
- [ ] Add workflow progress indicators
- [ ] Implement workflow result handling
- [ ] Create comprehensive test suite
- [ ] Tests: 8/8 passing

---

## 🧪 Test Requirements

### Parsing Tests
- Simple workflow: `action createOrder → validate → process → notify`
- Complex workflow: Multi-step with branches
- Error handling: Workflow with try/catch
- State management: Workflow with variables
- Nested workflows: Workflows calling other workflows

### Generation Tests
- Workflow class generation
- Step execution order
- State persistence across steps
- Error propagation
- Result aggregation

### Integration Tests
- UI button triggers workflow
- Workflow progress visible in UI
- Workflow completion updates UI
- Workflow errors show in UI
- Multiple concurrent workflows

---

## 📁 Files to Create/Modify

### Grammar & Parser
- `sheplang/packages/language/src/shep.langium` - Add workflow syntax
- `sheplang/packages/language/src/mapper.ts` - Map workflow AST
- `sheplang/packages/language/src/types.ts` - Workflow types

### Code Generation
- `sheplang/packages/compiler/src/workflow-extractor.ts` - Extract workflows
- `sheplang/packages/compiler/src/workflow-generator.ts` - Generate workflow code
- `sheplang/packages/compiler/src/templates.ts` - Update templates

### Testing
- `test-phase3-workflow-parser.js` - Parsing tests
- `test-phase3-workflow-generation.js` - Generation tests
- `test-phase3-workflow-integration.js` - Integration tests

---

## ✅ Success Criteria

### Functional
- [ ] Users can define multi-step workflows in ShepLang
- [ ] Workflows execute in correct sequence
- [ ] Workflows maintain state across steps
- [ ] Workflows handle errors gracefully
- [ ] UI shows workflow progress

### Technical
- [ ] 100% test pass rate (20+ tests)
- [ ] Clean TypeScript compilation
- [ ] No regressions in Phase 2
- [ ] Performance: < 500ms for typical workflow
- [ ] Memory: No leaks in workflow execution

### User Experience
- [ ] Intuitive workflow syntax
- [ ] Clear error messages
- [ ] Visual progress indicators
- [ ] Responsive UI during execution
- [ ] Proper cleanup on cancellation

---

## 🚀 Example Workflow

```sheplang
action createOrder(customerId, items) {
  step validateCustomer {
    call GET "/customers/:id" with customerId
    if customer.status != "active" → error "Customer not active"
  }
  
  step calculateTotal {
    total = sum(items.price)
    if total > 10000 → requireApproval
  }
  
  step processPayment {
    call Stripe.createCharge with total, customer.card
  }
  
  step createOrder {
    call POST "/orders" with customerId, items, total
  }
  
  step sendConfirmation {
    call SendGrid.sendEmail with customer.email, "Order created"
  }
  
  step updateUI {
    show OrderDetail with orderId
  }
  
  on error → show ErrorPage with error.message
}
```

**Generated Output:**
- Workflow class with step methods
- State management across steps
- Error handling and recovery
- UI integration hooks
- Progress tracking

---

## 📊 Progress Tracking

| Week | Tasks | Status | Tests |
|------|-------|--------|-------|
| 1 | Grammar & Parsing | 🔄 | 0/5 |
| 2 | Code Generation | ⏳ | 0/7 |
| 3 | UI Integration | ⏳ | 0/8 |
| **Total** | **All Tasks** | **🔄** | **0/20** |

---

## 🎯 Next Phase

After Phase 3 Complete:
- **Phase 4: Real-time Layer** - WebSocket-driven live updates
- **Phase 5: Validation Engine** - Complex business rules
- **Phase 6: Integration Hub** - External services

---

**Last Updated:** November 22, 2025  
**Owner:** ShepLang Development Team  
**Review Date:** End of Week 1
