/**
 * Phase 4: Real-time Layer - Integration Tests
 * Testing end-to-end realtime generation in transpiler
 * Following proper test creation protocol
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 4: Real-time Integration Tests\n');
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

(async function runTests() {

// Test 1: Generate realtime server files
await test('Generate realtime server files for app', async () => {
  const code = `
app TestApp {
  data Task {
    fields: {
      title: text
      status: text
    }
  }
  
  view Dashboard { list Task }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const files = result.output.files;
  
  if (!files['api/realtime/server.ts']) {
    throw new Error('Realtime server file not generated');
  }
  
  if (!files['api/realtime/middleware.ts']) {
    throw new Error('Realtime middleware file not generated');
  }
});

// Test 2: Generate hooks for each model
await test('Generate realtime hooks for each data model', async () => {
  const code = `
app TodoApp {
  data Todo {
    fields: {
      title: text
    }
  }
  
  data User {
    fields: {
      name: text
    }
  }
  
  view Dashboard { list Todo }
}`;

  const result = await generateApp(code);
  const files = result.output.files;
  
  if (!files['hooks/useTodoRealtime.ts']) {
    throw new Error('useTodoRealtime hook not generated');
  }
  
  if (!files['hooks/useUserRealtime.ts']) {
    throw new Error('useUserRealtime hook not generated');
  }
});

// Test 3: Generate global realtime context
await test('Generate global RealtimeContext', async () => {
  const code = `
app TestApp {
  data Product {
    fields: {
      name: text
    }
  }
  
  view Dashboard { list Product }
}`;

  const result = await generateApp(code);
  const files = result.output.files;
  
  if (!files['contexts/RealtimeContext.tsx']) {
    throw new Error('RealtimeContext not generated');
  }
  
  const contextContent = files['contexts/RealtimeContext.tsx'];
  
  if (!contextContent.includes('RealtimeProvider')) {
    throw new Error('RealtimeProvider not in context file');
  }
  
  if (!contextContent.includes('useRealtime')) {
    throw new Error('useRealtime hook not in context file');
  }
});

// Test 4: Hook contains model-specific code
await test('Generated hook contains model-specific code', async () => {
  const code = `
app OrderApp {
  data Order {
    fields: {
      total: number
    }
  }
  
  view Dashboard { list Order }
}`;

  const result = await generateApp(code);
  const files = result.output.files;
  
  const hookContent = files['hooks/useOrderRealtime.ts'];
  
  if (!hookContent.includes('useOrderRealtime')) {
    throw new Error('useOrderRealtime function not found');
  }
  
  if (!hookContent.includes("'order'")) {
    throw new Error('Order channel subscription not found');
  }
  
  if (!hookContent.includes('Order')) {
    throw new Error('Order model name not found');
  }
});

// Test 5: Server has TypeScript types
await test('Generated server has proper TypeScript types', async () => {
  const code = `
app TestApp {
  data Item {
    fields: {
      name: text
    }
  }
  
  view Dashboard { list Item }
}`;

  const result = await generateApp(code);
  const serverContent = result.output.files['api/realtime/server.ts'];
  
  if (!serverContent.includes('ServerToClientEvents')) {
    throw new Error('ServerToClientEvents interface not found');
  }
  
  if (!serverContent.includes('ClientToServerEvents')) {
    throw new Error('ClientToServerEvents interface not found');
  }
  
  if (!serverContent.includes('SocketServer<')) {
    throw new Error('TypeScript generics not used');
  }
});

// Test 6: Middleware integrates with Prisma
await test('Middleware properly integrates with Prisma', async () => {
  const code = `
app BlogApp {
  data Post {
    fields: {
      title: text
    }
  }
  
  view Dashboard { list Post }
}`;

  const result = await generateApp(code);
  const middlewareContent = result.output.files['api/realtime/middleware.ts'];
  
  if (!middlewareContent.includes('prisma.$use')) {
    throw new Error('Prisma middleware not used');
  }
  
  if (!middlewareContent.includes('emitModelCreated')) {
    throw new Error('emitModelCreated not called');
  }
  
  if (!middlewareContent.includes('emitModelUpdated')) {
    throw new Error('emitModelUpdated not called');
  }
});

// Test 7: Multiple models generate multiple hooks
await test('Multiple models generate separate hooks', async () => {
  const code = `
app MultiApp {
  data Task {
    fields: {
      title: text
    }
  }
  
  data Note {
    fields: {
      content: text
    }
  }
  
  data Comment {
    fields: {
      message: text
    }
  }
  
  view Dashboard { list Task }
}`;

  const result = await generateApp(code);
  const files = result.output.files;
  
  const hookFiles = Object.keys(files).filter(f => f.startsWith('hooks/use'));
  
  if (hookFiles.length !== 3) {
    throw new Error(`Expected 3 hook files, found ${hookFiles.length}`);
  }
  
  if (!files['hooks/useTaskRealtime.ts']) {
    throw new Error('Task hook missing');
  }
  
  if (!files['hooks/useNoteRealtime.ts']) {
    throw new Error('Note hook missing');
  }
  
  if (!files['hooks/useCommentRealtime.ts']) {
    throw new Error('Comment hook missing');
  }
});

// Test 8: Server exports RealtimeServer class
await test('Server exports RealtimeServer class', async () => {
  const code = `
app TestApp {
  data Message {
    fields: {
      content: text
    }
  }
  
  view Dashboard { list Message }
}`;

  const result = await generateApp(code);
  const serverContent = result.output.files['api/realtime/server.ts'];
  
  if (!serverContent.includes('export class RealtimeServer')) {
    throw new Error('RealtimeServer class not exported');
  }
  
  if (!serverContent.includes('constructor(httpServer: HttpServer)')) {
    throw new Error('Constructor not found');
  }
});

// Test 9: Hook handles connection states
await test('Hook properly handles connection states', async () => {
  const code = `
app TestApp {
  data Event {
    fields: {
      name: text
    }
  }
  
  view Dashboard { list Event }
}`;

  const result = await generateApp(code);
  const hookContent = result.output.files['hooks/useEventRealtime.ts'];
  
  if (!hookContent.includes('isConnected')) {
    throw new Error('isConnected state not found');
  }
  
  if (!hookContent.includes('error')) {
    throw new Error('error state not found');
  }
  
  if (!hookContent.includes("newSocket.on('connect'")) {
    throw new Error('connect handler not found');
  }
  
  if (!hookContent.includes("newSocket.on('disconnect'")) {
    throw new Error('disconnect handler not found');
  }
});

// Test 10: Context provides subscribe/unsubscribe
await test('Context provides subscribe and unsubscribe functions', async () => {
  const code = `
app TestApp {
  data Record {
    fields: {
      value: text
    }
  }
  
  view Dashboard { list Record }
}`;

  const result = await generateApp(code);
  const contextContent = result.output.files['contexts/RealtimeContext.tsx'];
  
  if (!contextContent.includes('subscribe:')) {
    throw new Error('subscribe function not found in context');
  }
  
  if (!contextContent.includes('unsubscribe:')) {
    throw new Error('unsubscribe function not found in context');
  }
  
  if (!contextContent.includes("socket.emit('subscribe'")) {
    throw new Error('subscribe emit not found');
  }
});

// Test 11: Middleware handles all CRUD operations
await test('Middleware handles create, update, delete', async () => {
  const code = `
app TestApp {
  data Activity {
    fields: {
      type: text
    }
  }
  
  view Dashboard { list Activity }
}`;

  const result = await generateApp(code);
  const middlewareContent = result.output.files['api/realtime/middleware.ts'];
  
  if (!middlewareContent.includes("case 'create'")) {
    throw new Error('create case not handled');
  }
  
  if (!middlewareContent.includes("case 'update'")) {
    throw new Error('update case not handled');
  }
  
  if (!middlewareContent.includes("case 'delete'")) {
    throw new Error('delete case not handled');
  }
});

// Test 12: Hook includes cleanup on unmount
await test('Hook includes proper cleanup on unmount', async () => {
  const code = `
app TestApp {
  data Session {
    fields: {
      userId: text
    }
  }
  
  view Dashboard { list Session }
}`;

  const result = await generateApp(code);
  const hookContent = result.output.files['hooks/useSessionRealtime.ts'];
  
  if (!hookContent.includes('return () =>')) {
    throw new Error('Cleanup function not found');
  }
  
  if (!hookContent.includes('newSocket.close()')) {
    throw new Error('Socket close not called on cleanup');
  }
  
  if (!hookContent.includes("emit('unsubscribe'")) {
    throw new Error('unsubscribe not called on cleanup');
  }
});

// Test 13: Server has CRUD event emitters
await test('Server has all CRUD event emitter methods', async () => {
  const code = `
app TestApp {
  data Log {
    fields: {
      message: text
    }
  }
  
  view Dashboard { list Log }
}`;

  const result = await generateApp(code);
  const serverContent = result.output.files['api/realtime/server.ts'];
  
  if (!serverContent.includes('emitModelCreated')) {
    throw new Error('emitModelCreated method not found');
  }
  
  if (!serverContent.includes('emitModelUpdated')) {
    throw new Error('emitModelUpdated method not found');
  }
  
  if (!serverContent.includes('emitModelDeleted')) {
    throw new Error('emitModelDeleted method not found');
  }
  
  if (!serverContent.includes('broadcastNotification')) {
    throw new Error('broadcastNotification method not found');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4 Week 2: Real-time Integration COMPLETE!');
  console.log('✅ Phase 4: Real-time Layer COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();
