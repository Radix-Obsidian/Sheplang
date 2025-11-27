/**
 * Debug Phase 3-02 Endpoint Generation
 * Following proper test creation protocol: debug actual output first
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🔍 Phase 3-02: Backend Endpoint Generation Debug\n');

// Test Case 1: Simple POST endpoint
const testCase1 = `
app TestApp {
  data Order { 
    fields: { 
      title: text
      amount: number
    } 
  }
  
  view Dashboard { list Order }
  
  action createOrder(title, amount) {
    call POST "/orders" with title, amount
    show Dashboard
  }
}
`;

console.log('='.repeat(60));
console.log('TEST CASE 1: Simple POST endpoint');
console.log('='.repeat(60));

try {
  const result = await generateApp(testCase1);
  
  if (result.success && result.output) {
    console.log('\n✅ Generation succeeded');
    console.log('\nGenerated files:');
    
    Object.keys(result.output.files).forEach(path => {
      console.log(`  - ${path}`);
    });
    
    // Show the orders route file
    const ordersRoute = Object.entries(result.output.files).find(([path]) => 
      path.includes('api/routes/orders')
    );
    
    if (ordersRoute) {
      console.log('\n--- Generated Orders Route ---');
      console.log(ordersRoute[1]);
    }
    
    // Show the server file
    const serverFile = result.output.files['api/server.ts'];
    if (serverFile) {
      console.log('\n--- Generated Server File ---');
      console.log(serverFile);
    }
  } else {
    console.log('\n❌ Generation failed');
    console.log('Diagnostics:', result.diagnostics);
  }
} catch (error) {
  console.log('\n❌ Exception:', error.message);
  console.log('Stack:', error.stack);
}

// Test Case 2: GET with path parameter
const testCase2 = `
app TestApp {
  data Order { 
    fields: { title: text } 
  }
  
  view Dashboard { list Order }
  
  action getOrder(orderId) {
    load GET "/orders/:id" into order
    show Dashboard
  }
}
`;

console.log('\n\n' + '='.repeat(60));
console.log('TEST CASE 2: GET with path parameter');
console.log('='.repeat(60));

try {
  const result = await generateApp(testCase2);
  
  if (result.success && result.output) {
    console.log('\n✅ Generation succeeded');
    
    // Show the orders route file
    const ordersRoute = Object.entries(result.output.files).find(([path]) => 
      path.includes('api/routes/orders')
    );
    
    if (ordersRoute) {
      console.log('\n--- Generated Orders Route ---');
      console.log(ordersRoute[1]);
    }
  } else {
    console.log('\n❌ Generation failed');
  }
} catch (error) {
  console.log('\n❌ Exception:', error.message);
}

// Test Case 3: Multiple endpoints
const testCase3 = `
app TestApp {
  data Order { 
    fields: { 
      title: text
      amount: number
    } 
  }
  
  view Dashboard { list Order }
  
  action createOrder(title, amount) {
    call POST "/orders" with title, amount
    show Dashboard
  }
  
  action getOrders() {
    load GET "/orders" into orders
    show Dashboard
  }
  
  action updateOrder(orderId, title) {
    call PUT "/orders/:id" with title
    show Dashboard
  }
  
  action deleteOrder(orderId) {
    call DELETE "/orders/:id"
    show Dashboard
  }
}
`;

console.log('\n\n' + '='.repeat(60));
console.log('TEST CASE 3: Multiple endpoints (CRUD)');
console.log('='.repeat(60));

try {
  const result = await generateApp(testCase3);
  
  if (result.success && result.output) {
    console.log('\n✅ Generation succeeded');
    console.log('\nGenerated route files:');
    
    Object.keys(result.output.files)
      .filter(path => path.includes('api/routes'))
      .forEach(path => {
        console.log(`  - ${path}`);
      });
    
    // Show the orders route file
    const ordersRoute = Object.entries(result.output.files).find(([path]) => 
      path.includes('api/routes/orders')
    );
    
    if (ordersRoute) {
      console.log('\n--- Generated Complete Orders Route ---');
      console.log(ordersRoute[1]);
    }
    
    // Show server imports
    const serverFile = result.output.files['api/server.ts'];
    if (serverFile) {
      console.log('\n--- Server Imports Section ---');
      const lines = serverFile.split('\n');
      const importLines = lines.filter(line => 
        line.includes('import') || line.includes('app.use')
      );
      importLines.forEach(line => console.log(line));
    }
  } else {
    console.log('\n❌ Generation failed');
  }
} catch (error) {
  console.log('\n❌ Exception:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('Debug complete - Review output above');
console.log('='.repeat(60));
