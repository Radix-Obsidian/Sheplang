/**
 * Test reserved keywords in LoadStmt
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

console.log('🔍 Reserved Keywords Debug\n');

async function testKeywords() {
  const keywords = [
    'data', 'app', 'view', 'action', 'job', 'states', 'fields',
    'add', 'show', 'call', 'load', 'if', 'for', 'update', 'delete',
    'model', 'enum', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE',
    'with', 'into', 'where', 'set', 'then', 'else'
  ];

  const safeNames = [
    'result', 'response', 'items', 'orders', 'users', 'tasks',
    'myData', 'responseData', 'apiData', 'loadedData', 'fetchedData'
  ];

  console.log('\n--- Testing Reserved Keywords ---');
  for (const keyword of keywords) {
    const code = `
app TestApp {
  action Test() {
    load GET "/test" into ${keyword}
  }
}`;
    
    try {
      const result = await parseShep(code);
      const status = result?.success ? '✅' : '❌';
      console.log(`${status} "${keyword}"`);
    } catch (error) {
      console.log(`💥 "${keyword}" - Exception: ${error.message}`);
    }
  }

  console.log('\n--- Testing Safe Variable Names ---');
  for (const name of safeNames) {
    const code = `
app TestApp {
  action Test() {
    load GET "/test" into ${name}
  }
}`;
    
    try {
      const result = await parseShep(code);
      const status = result?.success ? '✅' : '❌';
      console.log(`${status} "${name}"`);
    } catch (error) {
      console.log(`💥 "${name}" - Exception: ${error.message}`);
    }
  }
}

testKeywords().catch(console.error);
