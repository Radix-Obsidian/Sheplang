import { parseShep } from './sheplang/packages/language/dist/index.js';

const source = `
app TestApp {
  data Order {
    fields: {
      title: text
    }
    states: pending -> processing -> completed
  }
  action CreateOrder(title) {
    add Order with title
    show Dashboard
  }
}`;

console.log('Testing parse...');
const result = await parseShep(source);

console.log('Success:', result.success);
console.log('Diagnostics:', result.diagnostics);

if (result.success) {
  console.log('AppModel:', JSON.stringify(result.appModel, null, 2));
} else {
  console.log('\nErrors:');
  result.diagnostics.forEach(d => {
    console.log(`  - [${d.severity}] ${d.message} at line ${d.start.line}`);
  });
}
