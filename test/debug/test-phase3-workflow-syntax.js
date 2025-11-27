/**
 * Phase 3: Workflow Engine - Syntax Tests
 * Testing step → step → step syntax
 * Following proper test creation protocol
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

console.log('🧪 Phase 3: Workflow Engine - Syntax Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
    if (error.stack) {
      console.log(`   Stack: ${error.stack.split('\n').slice(1, 3).join('\n')}`);
    }
  }
}

// Test 1: Simple workflow with two steps
test('Parse simple two-step workflow', async () => {
  const code = `
app TestApp {
  data Order {
    fields: {
      title: text
    }
  }
  
  view Dashboard { list Order }
  
  action processOrder(title) {
    step validate {
      call GET "/orders/validate" with title
    } -> step process {
      call POST "/orders" with title
    }
  }
}`;

  const result = await parseShep(code);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  if (!result.app) {
    throw new Error('No app model generated');
  }
  
  const action = result.app.actions.find(a => a.name === 'processOrder');
  if (!action) {
    throw new Error('processOrder action not found');
  }
  
  const workflowStmt = action.ops.find(op => op.kind === 'workflow');
  if (!workflowStmt) {
    throw new Error('Workflow statement not found');
  }
  
  if (workflowStmt.steps.length !== 2) {
    throw new Error(`Expected 2 steps, got ${workflowStmt.steps.length}`);
  }
  
  if (workflowStmt.steps[0].name !== 'validate') {
    throw new Error(`Expected first step name 'validate', got '${workflowStmt.steps[0].name}'`);
  }
  
  if (workflowStmt.steps[1].name !== 'process') {
    throw new Error(`Expected second step name 'process', got '${workflowStmt.steps[1].name}'`);
  }
});

// Test 2: Three-step workflow
test('Parse three-step workflow', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action createOrder(title) {
    step validate {
      call GET "/validate" with title
    } -> step process {
      call POST "/orders" with title
    } -> step notify {
      call POST "/notifications" with title
    }
  }
}`;

  const result = await parseShep(code);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const action = result.app.actions[0];
  const workflowStmt = action.ops.find(op => op.kind === 'workflow');
  
  if (workflowStmt.steps.length !== 3) {
    throw new Error(`Expected 3 steps, got ${workflowStmt.steps.length}`);
  }
});

// Test 3: Workflow with error handler
test('Parse workflow with error handler', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action handleError() {
    show Dashboard
  }
  
  action processOrder(title) {
    step validate {
      call GET "/validate" with title
    } -> step process {
      call POST "/orders" with title
    }
    on error -> handleError
  }
}`;

  const result = await parseShep(code);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const action = result.app.actions.find(a => a.name === 'processOrder');
  const workflowStmt = action.ops.find(op => op.kind === 'workflow');
  
  if (!workflowStmt.errorHandler) {
    throw new Error('Error handler not found');
  }
  
  if (workflowStmt.errorHandler !== 'handleError') {
    throw new Error(`Expected error handler 'handleError', got '${workflowStmt.errorHandler}'`);
  }
});

// Test 4: Workflow step with multiple statements
test('Parse workflow step with multiple statements', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text, amount: number } }
  view Dashboard { list Order }
  
  action processOrder(title, amount) {
    step validate {
      call GET "/validate" with title
      call GET "/check-amount" with amount
    } -> step process {
      call POST "/orders" with title, amount
    }
  }
}`;

  const result = await parseShep(code);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const action = result.app.actions[0];
  const workflowStmt = action.ops.find(op => op.kind === 'workflow');
  
  if (workflowStmt.steps[0].body.length !== 2) {
    throw new Error(`Expected 2 statements in first step, got ${workflowStmt.steps[0].body.length}`);
  }
});

// Test 5: Workflow with mixed statements
test('Parse workflow with other statements before/after', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action processOrder(title) {
    call GET "/init" with title
    
    step validate {
      call GET "/validate" with title
    } -> step process {
      call POST "/orders" with title
    }
    
    show Dashboard
  }
}`;

  const result = await parseShep(code);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Parse errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const action = result.app.actions[0];
  
  if (action.ops.length !== 3) {
    throw new Error(`Expected 3 operations, got ${action.ops.length}`);
  }
  
  if (action.ops[0].kind !== 'call') {
    throw new Error('First op should be call');
  }
  
  if (action.ops[1].kind !== 'workflow') {
    throw new Error('Second op should be workflow');
  }
  
  if (action.ops[2].kind !== 'show') {
    throw new Error('Third op should be show');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 3: Workflow Syntax COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}
