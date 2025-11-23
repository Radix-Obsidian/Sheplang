/**
 * Debug Phase 3 Parsing Issues - Incremental Testing
 * Following battle-tested methodology: start small, add complexity gradually
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

console.log('🔍 Phase 3 Parsing Debug - Incremental Testing\n');

async function testParsing(description, code) {
  console.log(`\n--- Testing: ${description} ---`);
  console.log('Code:', code.trim());
  
  try {
    const result = await parseShep(code);
    console.log('Parse result type:', typeof result);
    console.log('Parse result keys:', Object.keys(result || {}));
    
    if (result && result.success) {
      console.log('✅ PARSED SUCCESSFULLY');
      console.log('App model found:', !!result.appModel);
      return true;
    } else {
      console.log('❌ PARSE FAILED');
      console.log('Success:', result.success);
      console.log('Diagnostics:', result.diagnostics?.length || 0);
      if (result.diagnostics && result.diagnostics.length > 0) {
        console.log('First diagnostic:', result.diagnostics[0]);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ EXCEPTION THROWN');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    return false;
  }
}

// Run all tests
async function runTests() {
  // Test 1: Known working Phase 1 syntax (baseline)
  await testParsing('Phase 1 baseline - basic app', `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action CreateOrder(title) { add Order with title }
}`);

  // Test 2: Phase 2 syntax (should work)
  await testParsing('Phase 2 - state machine', `
app TestApp {
  data Order { 
    fields: { title: text }
    states: pending -> processing
  }
  view Dashboard { list Order }
}`);

  // Test 3: Phase 2 background job (should work)
  await testParsing('Phase 2 - background job', `
app TestApp {
  data Order { fields: { title: text } }
  job DailyReport {
    schedule: daily at "9am"
    action { ~ "Generate report" }
  }
}`);

  // Test 4: CallStmt - minimal version
  await testParsing('Phase 3 - CallStmt minimal', `
app TestApp {
  data Order { fields: { title: text } }
  action Test() {
    call GET "/test"
  }
}`);

  // Test 5: CallStmt with parameters
  await testParsing('Phase 3 - CallStmt with params', `
app TestApp {
  data Order { fields: { title: text } }
  action Test(title) {
    call POST "/test" with title
  }
}`);

  // Test 6: LoadStmt - minimal version
  await testParsing('Phase 3 - LoadStmt minimal', `
app TestApp {
  data Order { fields: { title: text } }
  action Test() {
    load GET "/test" into data
  }
}`);

  // Test 7: Combined CallStmt and LoadStmt
  await testParsing('Phase 3 - Combined CallStmt and LoadStmt', `
app TestApp {
  data Order { fields: { title: text } }
  action Test(title) {
    call POST "/test" with title
    load GET "/test" into data
  }
}`);

  // Test 8: Full Phase 3 example (like our failing test)
  await testParsing('Phase 3 - Full example', `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`);

  console.log('\n🔍 Debug complete - analyze results above');
}

runTests().catch(console.error);
