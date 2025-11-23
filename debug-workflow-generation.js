/**
 * Debug script for workflow generation
 * Following proper test creation protocol - understand actual output first
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🔍 Debugging Workflow Generation\n');

(async function() {

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

console.log('Input code:');
console.log(code);
console.log('\n' + '='.repeat(60) + '\n');

const result = await generateApp(code);

console.log('Generate result structure:');
console.log('Keys:', Object.keys(result));
console.log('Type:', typeof result);
console.log('\n');

if (result.output) {
  console.log('Has output property');
  console.log('Output keys:', Object.keys(result.output));
  if (result.output.files) {
    console.log('Files generated:');
    Object.keys(result.output.files).forEach(file => {
      console.log(`  - ${file}`);
    });
  }
} else {
  console.log('No output property');
  console.log('Result:', JSON.stringify(result, null, 2).slice(0, 500));
}

if (result.errors) {
  console.log('\nErrors:', result.errors);
}

if (result.files) {
  console.log('\nDirect files property found:');
  console.log('Files:', Object.keys(result.files));
  
  const actionFile = result.files['actions/processOrder.ts'];
  if (actionFile) {
    console.log('\n=== Generated processOrder.ts ===\n');
    console.log(actionFile);
  }
}

})();
