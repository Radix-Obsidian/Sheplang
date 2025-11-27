/**
 * Debug Phase 5 Test 1
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

(async function() {

const code = `
app TestApp {
  data User {
    fields: {
      username: text required
    }
  }
  view Dashboard { list User }
}`;

console.log('Testing validation constraint parsing...\n');

const result = await parseShep(code);

console.log('Success:', result.success);
console.log('Result keys:', Object.keys(result));
console.log('Has app:', !!result.app);
console.log('Has appModel:', !!result.appModel);

if (result.diagnostics && result.diagnostics.length > 0) {
  console.log('\nDiagnostics:');
  result.diagnostics.forEach(d => console.log('  -', d.message));
}

const model = result.appModel || result.app;
if (model) {
  console.log('\nApp name:', model.name);
  console.log('Data models:', model.datas.length);
  if (model.datas.length > 0) {
    const data = model.datas[0];
    console.log('First model:', data.name);
    console.log('Fields:', data.fields.length);
    if (data.fields.length > 0) {
      const field = data.fields[0];
      console.log('First field:', field.name);
      console.log('Constraints:', field.constraints);
    }
  }
}

})();
