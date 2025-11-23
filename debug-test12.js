import { generateApp } from './sheplang/packages/compiler/dist/index.js';

const code = `
app CompleteApp {
  data Order {
    fields: {
      customerName: text required
      total: number min=1
    }
  }
  view OrderFeed { list Order }
  action CreateOrder(customerName, total) {
    call POST "/orders" with customerName, total
    show OrderFeed
  }
}`;

console.log('Testing Complete App...\n');
const result = await generateApp(code);

console.log('Success:', result.success);

if (result.output) {
  console.log('\nAll generated files:');
  Object.keys(result.output.files).forEach(key => {
    console.log(`  - ${key}`);
  });
  
  console.log('\nLooking for API routes...');
  const apiFiles = Object.keys(result.output.files).filter(k => k.includes('api/routes'));
  console.log('API route files:', apiFiles);
}
