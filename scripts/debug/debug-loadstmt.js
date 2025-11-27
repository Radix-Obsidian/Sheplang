/**
 * Debug LoadStmt specifically - isolate the exact issue
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

console.log('🔍 LoadStmt Specific Debug\n');

async function testLoadStmtVariations() {
  const tests = [
    // Test 1: Minimal LoadStmt
    {
      name: 'Minimal LoadStmt',
      code: `
app TestApp {
  action Test() {
    load GET "/test" into data
  }
}`
    },
    
    // Test 2: LoadStmt with data model
    {
      name: 'LoadStmt with data model',
      code: `
app TestApp {
  data Order { fields: { title: text } }
  action Test() {
    load GET "/test" into data
  }
}`
    },
    
    // Test 3: LoadStmt with different variable name
    {
      name: 'LoadStmt with result variable',
      code: `
app TestApp {
  action Test() {
    load GET "/test" into result
  }
}`
    },
    
    // Test 4: LoadStmt with POST
    {
      name: 'LoadStmt with POST',
      code: `
app TestApp {
  action Test() {
    load POST "/test" into data
  }
}`
    },
    
    // Test 5: LoadStmt without data model but with view
    {
      name: 'LoadStmt with view',
      code: `
app TestApp {
  view Dashboard { list Order }
  action Test() {
    load GET "/test" into data
  }
}`
    },
    
    // Test 6: LoadStmt in action with params
    {
      name: 'LoadStmt with action params',
      code: `
app TestApp {
  action Test(id) {
    load GET "/test/:id" into data
  }
}`
    }
  ];

  for (const test of tests) {
    console.log(`\n--- Testing: ${test.name} ---`);
    console.log('Code:', test.code.trim());
    
    try {
      const result = await parseShep(test.code);
      
      if (result && result.success) {
        console.log('✅ PARSED SUCCESSFULLY');
      } else {
        console.log('❌ PARSE FAILED');
        console.log('Success:', result.success);
        console.log('Diagnostics:', result.diagnostics?.length || 0);
        if (result.diagnostics && result.diagnostics.length > 0) {
          result.diagnostics.forEach((diag, i) => {
            console.log(`Diagnostic ${i + 1}:`, diag.message);
            console.log(`  Location: Line ${diag.start?.line}, Column ${diag.start?.column}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ EXCEPTION THROWN');
      console.log('Error:', error.message);
    }
  }
}

testLoadStmtVariations().catch(console.error);
