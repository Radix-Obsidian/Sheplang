/**
 * Debug Test 5 specifically
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

(async function() {

const code = `
app TestApp {
  data Order { fields: { title: text, amount: number } }
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

console.log('Testing workflow with multiple statements per step\n');

const result = await generateApp(code);

console.log('Success:', result.success);
console.log('Diagnostics:', JSON.stringify(result.diagnostics, null, 2));

if (result.output) {
  console.log('\nGeneration successful!');
  console.log('Files:', Object.keys(result.output.files));
  
  const actionFile = result.output.files['actions/processOrder.ts'];
  if (actionFile) {
    console.log('\n=== Generated Action ===\n');
    console.log(actionFile);
  }
} else {
  console.log('\nGeneration failed!');
}

})();
