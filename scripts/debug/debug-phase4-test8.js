/**
 * Debug Test 8 and 10
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

(async function() {

// Test 8 code
const code8 = `
app TestApp {
  data Message {
    fields: {
      text: text
    }
  }
  
  view Dashboard { list Message }
}`;

console.log('Testing Test 8 code...\n');
const result8 = await generateApp(code8);
console.log('Test 8 Success:', result8.success);
if (result8.diagnostics) console.log('Diagnostics:', result8.diagnostics);

// Test 10 code
const code10 = `
app TestApp {
  data Record {
    fields: {
      data: text
    }
  }
  
  view Dashboard { list Record }
}`;

console.log('\nTesting Test 10 code...\n');
const result10 = await generateApp(code10);
console.log('Test 10 Success:', result10.success);
if (result10.diagnostics) console.log('Diagnostics:', result10.diagnostics);

})();
