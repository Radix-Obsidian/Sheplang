/**
 * Debug parse error details
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

console.log('🔍 Parse Error Debug\n');

async function debugParse(code, description) {
  console.log(`\n--- ${description} ---`);
  console.log('Code:', code.trim());
  
  try {
    const result = await parseShep(code);
    console.log('Success:', result.success);
    
    if (!result.success) {
      console.log('Diagnostics count:', result.diagnostics?.length || 0);
      if (result.diagnostics && result.diagnostics.length > 0) {
        result.diagnostics.forEach((diag, i) => {
          console.log(`\nDiagnostic ${i + 1}:`);
          console.log('  Message:', diag.message);
          console.log('  Location:', `Line ${diag.start?.line}, Column ${diag.start?.column}`);
          console.log('  Severity:', diag.severity);
        });
      }
    } else {
      console.log('✅ PARSED SUCCESSFULLY');
      console.log('App model keys:', Object.keys(result.appModel || {}));
    }
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    console.log('Stack:', error.stack);
  }
}

// Test the exact code from our test
await debugParse(`
app TestApp {
  data Order { fields: { title: text } }
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`, 'CallStmt Test Code');

// Test a simpler version
await debugParse(`
app TestApp {
  action test() {
    call GET "/test"
  }
}`, 'Simple CallStmt');

// Test LoadStmt
await debugParse(`
app TestApp {
  action test() {
    load GET "/test" into result
  }
}`, 'Simple LoadStmt');
