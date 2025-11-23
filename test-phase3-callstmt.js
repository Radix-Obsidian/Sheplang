/**
 * Phase 3-01 CallStmt Code Generation Tests
 * Tests CallStmt and LoadStmt code generation without breaking Phase 2
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';
import { parseShep } from './sheplang/packages/language/dist/index.js';
import fs from 'fs';

console.log('🧪 Phase 3-01: CallStmt Code Generation Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`\n✅ TEST ${totalTests}: ${name}`);
    passedTests++;
    return true;
  } catch (error) {
    console.log(`\n❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
    if (error.stack) {
      console.log(`   Stack: ${error.stack.split('\n').slice(1, 3).join('\n')}`);
    }
    return false;
  }
}

// Test 1: CallStmt generates POST request code
test('CallStmt generates POST request code', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action createOrder(title) {
        call POST "/orders" with title
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  
  const result = generateApp(parseResult.appModel);
  
  // Find the action file
  const actionFile = result.files.find(f => f.path.includes('createOrder') || f.path.includes('CreateOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify it contains async function
  if (!actionFile.content.includes('async function')) {
    throw new Error('Action should be async function');
  }
  
  // Verify it contains fetch call
  if (!actionFile.content.includes('fetch(\'/api/orders\'')) {
    throw new Error('Should contain fetch call to /api/orders');
  }
  
  // Verify it contains POST method
  if (!actionFile.content.includes('method: \'POST\'')) {
    throw new Error('Should contain POST method');
  }
  
  // Verify it contains body with title
  if (!actionFile.content.includes('JSON.stringify({ title })')) {
    throw new Error('Should contain JSON.stringify with title');
  }
  
  // Verify error handling
  if (!actionFile.content.includes('if (!callResponse.ok)')) {
    throw new Error('Should contain error handling');
  }
});

// Test 2: CallStmt generates GET request code (no body)
test('CallStmt generates GET request code without body', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action fetchOrders() {
        call GET "/orders"
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  const result = generateApp(parseResult.appModel);
  
  const actionFile = result.files.find(f => f.path.includes('fetchOrders') || f.path.includes('FetchOrders'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify it contains GET method
  if (!actionFile.content.includes('method: \'GET\'')) {
    throw new Error('Should contain GET method');
  }
  
  // Verify it does NOT contain body
  if (actionFile.content.includes('body: JSON.stringify')) {
    throw new Error('GET request should not have body');
  }
});

// Test 3: LoadStmt generates data loading code
test('LoadStmt generates data loading code', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action loadOrderData() {
        load GET "/orders" into result
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  const result = generateApp(parseResult.appModel);
  
  const actionFile = result.files.find(f => f.path.includes('loadOrderData') || f.path.includes('LoadOrderData'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify it contains load comment
  if (!actionFile.content.includes('// Load data:')) {
    throw new Error('Should contain load data comment');
  }
  
  // Verify it creates the variable
  if (!actionFile.content.includes('const orders =')) {
    throw new Error('Should create orders variable');
  }
  
  // Verify it contains loadResponse
  if (!actionFile.content.includes('loadResponse')) {
    throw new Error('Should contain loadResponse variable');
  }
});

// Test 4: Multiple parameters in CallStmt
test('CallStmt handles multiple parameters', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text, amount: number } }
      
      view Dashboard {
        list Order
      }
      
      action createOrder(title, amount) {
        call POST "/orders" with title, amount
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  const result = generateApp(parseResult.appModel);
  
  const actionFile = result.files.find(f => f.path.includes('createOrder') || f.path.includes('CreateOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify it contains both parameters
  if (!actionFile.content.includes('JSON.stringify({ title, amount })')) {
    throw new Error('Should contain both title and amount in body');
  }
});

// Test 5: CRITICAL - Phase 2 examples still work (backward compatibility)
test('Phase 2 examples still work (backward compatibility)', () => {
  const phase2Code = fs.readFileSync('./examples/phase2-complete-test.shep', 'utf8');
  
  const parseResult = parseShep(phase2Code);
  if (!parseResult.success) {
    throw new Error('Failed to parse Phase 2 example');
  }
  
  const result = generateApp(parseResult.appModel);
  
  // Verify state machine code still generates
  const stateMachineFile = result.files.find(f => f.path.includes('state-transitions') || f.path.includes('state-machine'));
  if (!stateMachineFile) {
    throw new Error('State machine file should still be generated');
  }
  
  // Verify job scheduler still generates
  const jobFile = result.files.find(f => f.path.includes('job-scheduler') || f.path.includes('jobs'));
  if (!jobFile) {
    throw new Error('Job scheduler file should still be generated');
  }
  
  // Verify we still have substantial file generation (Phase 1 + Phase 2)
  if (result.files.length < 15) {
    throw new Error(`Expected at least 15 files, got ${result.files.length}`);
  }
});

// Test 6: CallStmt doesn't leak template syntax
test('CallStmt generated code has no template syntax leakage', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action createOrder(title) {
        call POST "/orders" with title
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  const result = generateApp(parseResult.appModel);
  
  const actionFile = result.files.find(f => f.path.includes('createOrder') || f.path.includes('CreateOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Check for template syntax leakage
  if (actionFile.content.includes('{{') || actionFile.content.includes('}}')) {
    throw new Error('Template syntax leaked into generated code');
  }
  
  if (actionFile.content.includes('{{#') || actionFile.content.includes('{{/')) {
    throw new Error('Handlebars block syntax leaked into generated code');
  }
});

// Test 7: Error handling included in generated code
test('CallStmt includes proper error handling', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action createOrder(title) {
        call POST "/orders" with title
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  const result = generateApp(parseResult.appModel);
  
  const actionFile = result.files.find(f => f.path.includes('createOrder') || f.path.includes('CreateOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify error handling exists
  if (!actionFile.content.includes('if (!callResponse.ok)')) {
    throw new Error('Should check response status');
  }
  
  if (!actionFile.content.includes('throw new Error')) {
    throw new Error('Should throw error on failure');
  }
});

// Test 8: Actions remain async functions
test('Actions with CallStmt are async functions', () => {
  const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action createOrder(title) {
        call POST "/orders" with title
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  const result = generateApp(parseResult.appModel);
  
  const actionFile = result.files.find(f => f.path.includes('createOrder') || f.path.includes('CreateOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify async function
  if (!actionFile.content.includes('export async function')) {
    throw new Error('Action should be exported async function');
  }
  
  // Verify await is used
  if (!actionFile.content.includes('await fetch')) {
    throw new Error('Should use await for fetch call');
  }
});

// Run all tests and show summary
async function runTests() {
  // Test 1: CallStmt generates POST request code
  await test('CallStmt generates POST request code', () => {
    const shepCode = `
    app TestApp {
      data Order { fields: { title: text } }
      
      view Dashboard {
        list Order
      }
      
      action createOrder(title) {
        call POST "/orders" with title
        show Dashboard
      }
    }
  `;
  
  const parseResult = await parseShep(shepCode);
  if (!parseResult.success) {
    throw new Error('Failed to parse ShepLang code');
  }
  
  const result = generateApp(parseResult.appModel);
  
  // Find the action file
  const actionFile = result.files.find(f => f.path.includes('createOrder') || f.path.includes('CreateOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  // Verify it contains async function
  if (!actionFile.content.includes('async function')) {
    throw new Error('Action should be async function');
  }
  
  // Verify it contains fetch call
  if (!actionFile.content.includes('fetch(\'/api/orders\'')) {
    throw new Error('Should contain fetch call to /api/orders');
  }
  
  // Verify it contains POST method
  if (!actionFile.content.includes('method: \'POST\'')) {
    throw new Error('Should contain POST method');
  }
  
  // Verify it contains body with title
  if (!actionFile.content.includes('JSON.stringify({ title })')) {
    throw new Error('Should contain JSON.stringify with title');
  }
  
  // Verify error handling
  if (!actionFile.content.includes('if (!callResponse.ok)')) {
    throw new Error('Should contain error handling');
  }
});

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 PHASE 3-01 TEST RESULTS:`);
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n✅ ALL TESTS PASSED - CallStmt code generation working!');
    console.log('✅ Phase 2 backward compatibility maintained!');
    console.log('✅ Ready for Phase 3-02: LoadStmt backend endpoints\n');
    process.exit(0);
  } else {
    console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
    console.log('❌ Fix failing tests before proceeding\n');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
