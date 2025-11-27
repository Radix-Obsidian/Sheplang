import { generateApp } from './sheplang/packages/compiler/dist/index.js';

const code = `
app MultiViewApp {
  data User {
    fields: {
      name: text
      userEmail: text
    }
  }
  data Post {
    fields: {
      title: text
    }
  }
  view UserList { list User }
  view PostList { list Post }
}`;

console.log('Testing Multi-View App...\n');
const result = await generateApp(code);

console.log('Success:', result.success);
console.log('Diagnostics:', JSON.stringify(result.diagnostics, null, 2));
