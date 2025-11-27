/**
 * Phase 3-02: Backend Endpoint Generation Tests
 * Following proper test creation protocol
 * References: .specify/memory/sheplang-syntax-cheat-sheet.md
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 3-02: Backend Endpoint Generation Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Test 1: POST endpoint generation with validation
await test('POST endpoint generates with field validation', async () => {
  const code = `
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
}`;
  
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  // Find the orders route file
  const routeFile = Object.entries(result.output.files).find(([path]) => 
    path.includes('api/routes/orders')
  );
  
  if (!routeFile) {
    throw new Error('Orders route file not generated');
  }
  
  const [path, content] = routeFile;
  
  // Verify POST endpoint exists
  if (!content.includes('router.post')) {
    throw new Error('POST endpoint not generated');
  }
  
  // Verify field validation exists
  if (!content.includes('title') || !content.includes('amount')) {
    throw new Error('Field validation not generated');
  }
  
  // Verify proper error status codes
  if (!content.includes('400')) {
    throw new Error('400 status code not included');
  }
  
  // Verify Prisma create operation
  if (!content.includes('prisma.order.create')) {
    throw new Error('Prisma create operation not generated');
  }
});

// Test 2: GET endpoint with path parameter
await test('GET endpoint handles path parameters correctly', async () => {
  const code = `
app TestApp {
  data Order { 
    fields: { title: text } 
  }
  
  view Dashboard { list Order }
  
  action getOrder(orderId) {
    load GET "/orders/:id" into order
    show Dashboard
  }
}`;
  
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const routeFile = Object.entries(result.output.files).find(([path]) => 
    path.includes('api/routes/orders')
  );
  
  if (!routeFile) {
    throw new Error('Orders route file not generated');
  }
  
  const [path, content] = routeFile;
  
  // Verify GET endpoint with :id parameter
  if (!content.includes('router.get') || !content.includes(':id')) {
    throw new Error('GET endpoint with :id not generated');
  }
  
  // Verify 404 handling
  if (!content.includes('404')) {
    throw new Error('404 status code not included');
  }
  
  // Verify Prisma findUnique operation
  if (!content.includes('prisma.order.findUnique')) {
    throw new Error('Prisma findUnique operation not generated');
  }
});

// Test 3: Multiple endpoints (full CRUD)
await test('Multiple endpoints generate correctly in single router', async () => {
  const code = `
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
}`;
  
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const routeFile = Object.entries(result.output.files).find(([path]) => 
    path.includes('api/routes/orders')
  );
  
  if (!routeFile) {
    throw new Error('Orders route file not generated');
  }
  
  const [path, content] = routeFile;
  
  // Verify all HTTP methods
  if (!content.includes('router.post')) {
    throw new Error('POST endpoint not generated');
  }
  if (!content.includes('router.get')) {
    throw new Error('GET endpoint not generated');
  }
  if (!content.includes('router.put')) {
    throw new Error('PUT endpoint not generated');
  }
  if (!content.includes('router.delete')) {
    throw new Error('DELETE endpoint not generated');
  }
  
  // Verify all Prisma operations
  if (!content.includes('prisma.order.create')) {
    throw new Error('Create operation not generated');
  }
  if (!content.includes('prisma.order.findMany')) {
    throw new Error('FindMany operation not generated');
  }
  if (!content.includes('prisma.order.update')) {
    throw new Error('Update operation not generated');
  }
  if (!content.includes('prisma.order.delete')) {
    throw new Error('Delete operation not generated');
  }
});

// Test 4: Server file integration
await test('Server file integrates custom endpoints correctly', async () => {
  const code = `
app TestApp {
  data Order { 
    fields: { title: text } 
  }
  
  view Dashboard { list Order }
  
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`;
  
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const serverFile = result.output.files['api/server.ts'];
  
  if (!serverFile) {
    throw new Error('Server file not generated');
  }
  
  // Verify import exists
  if (!serverFile.includes('import ordersRoutes from')) {
    throw new Error('Route import not in server file');
  }
  
  // Verify route registration
  if (!serverFile.includes('app.use(\'/api/orders\', ordersRoutes)')) {
    throw new Error('Route not registered in server');
  }
  
  // Verify NO duplicates
  const importMatches = (serverFile.match(/import ordersRoutes from/g) || []).length;
  if (importMatches > 1) {
    throw new Error(`Duplicate imports found: ${importMatches} imports`);
  }
  
  const usageMatches = (serverFile.match(/app\.use\('\/api\/orders', ordersRoutes\)/g) || []).length;
  if (usageMatches > 1) {
    throw new Error(`Duplicate route usage found: ${usageMatches} usages`);
  }
});

// Test 5: Error handling included
await test('Generated endpoints include proper error handling', async () => {
  const code = `
app TestApp {
  data Order { 
    fields: { title: text } 
  }
  
  view Dashboard { list Order }
  
  action createOrder(title) {
    call POST "/orders" with title
    show Dashboard
  }
}`;
  
  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const routeFile = Object.entries(result.output.files).find(([path]) => 
    path.includes('api/routes/orders')
  );
  
  if (!routeFile) {
    throw new Error('Orders route file not generated');
  }
  
  const [path, content] = routeFile;
  
  // Verify try-catch blocks
  if (!content.includes('try {')) {
    throw new Error('Try-catch blocks not included');
  }
  
  // Verify error status codes
  if (!content.includes('400') || !content.includes('500')) {
    throw new Error('Error status codes not included');
  }
  
  // Verify error messages
  if (!content.includes('error:')) {
    throw new Error('Error messages not included');
  }
  
  // Verify console logging
  if (!content.includes('console.error')) {
    throw new Error('Error logging not included');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 3-02: Backend Endpoint Generation COMPLETE!');
  console.log('✅ Full-stack integration working!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  console.log('❌ Fix failing tests before proceeding');
  process.exit(1);
}
