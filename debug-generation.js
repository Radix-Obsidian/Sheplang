/**
 * Debug code generation output
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🔍 Code Generation Debug\n');

async function debugGeneration(code, description) {
  console.log(`\n--- ${description} ---`);
  console.log('Code:', code.trim());
  
  try {
    const parseResult = await parseShep(code);
    console.log('Parse success:', parseResult.success);
    
    if (parseResult.success) {
      console.log('App model type:', typeof parseResult.appModel);
      console.log('App model keys:', Object.keys(parseResult.appModel || {}));
      
      const result = generateApp(parseResult.appModel);
      console.log('Generation result type:', typeof result);
      console.log('Generation result keys:', Object.keys(result || {}));
      
      if (result && result.files) {
        console.log('Files count:', result.files.length);
        console.log('File paths:', result.files.map(f => f.path));
      } else {
        console.log('❌ No files array in result');
      }
    }
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    console.log('Stack:', error.stack);
  }
}

await debugGeneration(`
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`, 'CallStmt Generation');
