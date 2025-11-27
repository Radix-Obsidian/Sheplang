/**
 * Simple Phase 3 Test - Focus on parsing and basic code generation
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 3 Simple Test\n');

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

// Test 1: CallStmt parsing
await test('CallStmt parsing works', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`;
  
  const result = await parseShep(code);
  if (!result.success) {
    throw new Error('Failed to parse CallStmt');
  }
});

// Test 2: LoadStmt parsing (with non-reserved variable name)
await test('LoadStmt parsing works', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action loadOrders() {
    load GET "/orders" into result
    show Dashboard
  }
}`;
  
  const result = await parseShep(code);
  if (!result.success) {
    throw new Error('Failed to parse LoadStmt');
  }
});

// Test 3: CallStmt code generation
await test('CallStmt code generation works', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`;
  
  const parseResult = await parseShep(code);
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Code generation failed');
  }
  
  const actionFile = Object.entries(result.output.files).find(([path, content]) => path.includes('createOrder'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  const [path, content] = actionFile;
  
  if (!content.includes('fetch')) {
    throw new Error('No fetch call generated');
  }
  
  if (!content.includes('POST')) {
    throw new Error('POST method not generated');
  }
});

// Test 4: LoadStmt code generation
await test('LoadStmt code generation works', async () => {
  const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action loadOrders() {
    load GET "/orders" into result
    show Dashboard
  }
}`;
  
  const parseResult = await parseShep(code);
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Code generation failed');
  }
  
  const actionFile = Object.entries(result.output.files).find(([path, content]) => path.includes('loadOrders'));
  if (!actionFile) {
    throw new Error('Action file not generated');
  }
  
  const [path, content] = actionFile;
  
  if (!content.includes('Load data: GET /orders')) {
    throw new Error('Load comment not generated');
  }
  
  if (!content.includes('const result')) {
    throw new Error('Result variable not created');
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);

if (passedTests === totalTests) {
  console.log('✅ ALL TESTS PASSED');
  console.log('✅ Phase 3 CallStmt and LoadStmt working!');
  process.exit(0);
} else {
  console.log(`❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}
