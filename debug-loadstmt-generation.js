/**
 * Debug LoadStmt generation output
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🔍 LoadStmt Generation Debug\n');

const code = `
app TestApp {
  data Order { fields: { title: text } }
  view Dashboard { list Order }
  action loadOrders() {
    load GET "/orders" into result
    show Dashboard
  }
}`;

try {
  const result = await generateApp(code);
  
  if (result.success && result.output) {
    console.log('Generated files:');
    Object.entries(result.output.files).forEach(([path, content]) => {
      console.log(`\n--- ${path} ---`);
      console.log(content);
    });
  } else {
    console.log('Generation failed:', result.diagnostics);
  }
} catch (error) {
  console.log('Error:', error.message);
}
