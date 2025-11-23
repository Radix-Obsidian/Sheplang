/**
 * Phase 3: Workflow Engine - Code Generation Tests
 * Testing complete UI + Backend integration
 * Following proper test creation protocol
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 3: Workflow Engine - Code Generation Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

(async function runAllTests() {

// Test 1: Simple two-step workflow generates correct code
await test('Generate code for two-step workflow', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action processOrder(title) {
    step validate {
      call GET "/orders/validate" with title
    } -> step process {
      call POST "/orders" with title
    }
  }
}`;

  const result = await generateApp(code);
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Generation errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const actionFile = result.output.files['actions/processOrder.ts'];
  if (!actionFile) {
    throw new Error('processOrder action file not generated');
  }
  
  if (!actionFile.includes('// Workflow: validate → process')) {
    throw new Error('Workflow comment not found in generated code');
  }
  
  if (!actionFile.includes('// Step: validate')) {
    throw new Error('Validate step not found');
  }
  
  if (!actionFile.includes('// Step: process')) {
    throw new Error('Process step not found');
  }
  
  if (!actionFile.includes('GET')) {
    throw new Error('GET request not found in validate step');
  }
  
  if (!actionFile.includes('POST')) {
    throw new Error('POST request not found in process step');
  }
});

// Test 2: Three-step workflow
await test('Generate code for three-step workflow', async () => {
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

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/createOrder.ts'];
  
  if (!actionFile.includes('// Step: validate')) {
    throw new Error('Validate step not found');
  }
  
  if (!actionFile.includes('// Step: process')) {
    throw new Error('Process step not found');
  }
  
  if (!actionFile.includes('// Step: notify')) {
    throw new Error('Notify step not found');
  }
});

// Test 3: Workflow with error handler
await test('Generate code for workflow with error handler', async () => {
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

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/processOrder.ts'];
  
  if (!actionFile.includes('return await handleError()')) {
    throw new Error('Error handler call not found');
  }
  
  if (!actionFile.includes('try {')) {
    throw new Error('Try-catch block not found');
  }
  
  if (!actionFile.includes('catch (error)')) {
    throw new Error('Catch block not found');
  }
});

// Test 4: Workflow with try-catch error handling
await test('Generate try-catch blocks for each step', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action processOrder(title) {
    step validate {
      call GET "/validate" with title
    } -> step process {
      call POST "/orders" with title
    }
  }
}`;

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/processOrder.ts'];
  
  // Count try-catch blocks (should be one per step)
  const tryCount = (actionFile.match(/try \{/g) || []).length;
  const catchCount = (actionFile.match(/catch \(error\)/g) || []).length;
  
  if (tryCount !== 2) {
    throw new Error(`Expected 2 try blocks, found ${tryCount}`);
  }
  
  if (catchCount !== 2) {
    throw new Error(`Expected 2 catch blocks, found ${catchCount}`);
  }
});

// Test 5: Workflow with multiple statements per step
await test('Generate code for steps with multiple statements', async () => {
  const code = `
app TestApp {
  data Order {
    fields: {
      title: text
      amount: number
    }
  }
  view Dashboard { list Order }
  
  action processOrder(title, amount) {
    step validate {
      call GET "/validate-title" with title
      call GET "/validate-amount" with amount
    } -> step process {
      call POST "/orders" with title, amount
    }
  }
}`;

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/processOrder.ts'];
  
  if (!actionFile.includes('/validate-title')) {
    throw new Error('First validation call not found');
  }
  
  if (!actionFile.includes('/validate-amount')) {
    throw new Error('Second validation call not found');
  }
});

// Test 6: Workflow mixed with other statements
await test('Generate code for action with workflow and other statements', async () => {
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

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/processOrder.ts'];
  
  if (!actionFile.includes('// API call: GET /init')) {
    throw new Error('Init API call not found');
  }
  
  if (!actionFile.includes('// Workflow: validate → process')) {
    throw new Error('Workflow not found');
  }
  
  if (!actionFile.includes('// Navigate to Dashboard')) {
    throw new Error('Show statement not found');
  }
});

// Test 7: Async function signature
await test('Generate async function for workflow action', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action processOrder(title) {
    step validate {
      call GET "/validate" with title
    } -> step process {
      call POST "/orders" with title
    }
  }
}`;

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/processOrder.ts'];
  
  if (!actionFile.includes('export async function processOrder')) {
    throw new Error('Async function signature not found');
  }
  
  if (!actionFile.includes('await fetch')) {
    throw new Error('Await fetch not found');
  }
});

// Test 8: API paths in workflow
await test('Generate correct API paths in workflow steps', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  
  action processOrder(title) {
    step validate {
      call GET "/api/validate" with title
    } -> step process {
      call POST "/api/orders" with title
    }
  }
}`;

  const result = await generateApp(code);
  const actionFile = result.output.files['actions/processOrder.ts'];
  
  if (!actionFile.includes("fetch('/api/api/validate'")) {
    throw new Error('Validate API path not correct');
  }
  
  if (!actionFile.includes("fetch('/api/api/orders'")) {
    throw new Error('Process API path not correct');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 3: Workflow Code Generation COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();
