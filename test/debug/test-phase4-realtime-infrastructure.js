/**
 * Phase 4: Real-time Layer - Infrastructure Tests
 * Testing Socket.io server and client infrastructure
 * Following proper test creation protocol
 */

import { 
  generateRealtimeServer, 
  generateRealtimeServerUsage 
} from './sheplang/packages/compiler/dist/realtime-server-template.js';

import {
  generateRealtimeHook,
  generateRealtimeContext
} from './sheplang/packages/compiler/dist/realtime-client-template.js';

import {
  generatePrismaRealtimeMiddleware
} from './sheplang/packages/compiler/dist/realtime-middleware-template.js';

console.log('🧪 Phase 4: Real-time Infrastructure Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Test 1: Generate Socket.io server class
test('Generate Socket.io server with TypeScript types', () => {
  const code = generateRealtimeServer();
  
  if (!code.includes('class RealtimeServer')) {
    throw new Error('RealtimeServer class not generated');
  }
  
  if (!code.includes('ServerToClientEvents')) {
    throw new Error('ServerToClientEvents interface not found');
  }
  
  if (!code.includes('ClientToServerEvents')) {
    throw new Error('ClientToServerEvents interface not found');
  }
  
  if (!code.includes('new SocketServer<')) {
    throw new Error('TypeScript generic types not used');
  }
  
  if (!code.includes('socket.io')) {
    throw new Error('Socket.io import not found');
  }
});

// Test 2: Server has connection handlers
test('Server has connection event handlers', () => {
  const code = generateRealtimeServer();
  
  if (!code.includes("this.io.on('connection'")) {
    throw new Error('Connection handler not found');
  }
  
  if (!code.includes("socket.on('subscribe'")) {
    throw new Error('Subscribe handler not found');
  }
  
  if (!code.includes("socket.on('unsubscribe'")) {
    throw new Error('Unsubscribe handler not found');
  }
  
  if (!code.includes("socket.on('disconnect'")) {
    throw new Error('Disconnect handler not found');
  }
});

// Test 3: Server has CRUD event emitters
test('Server has model CRUD event emitters', () => {
  const code = generateRealtimeServer();
  
  if (!code.includes('emitModelCreated')) {
    throw new Error('emitModelCreated method not found');
  }
  
  if (!code.includes('emitModelUpdated')) {
    throw new Error('emitModelUpdated method not found');
  }
  
  if (!code.includes('emitModelDeleted')) {
    throw new Error('emitModelDeleted method not found');
  }
  
  if (!code.includes("emit('model_created'")) {
    throw new Error('model_created event not emitted');
  }
});

// Test 4: Generate React hook for model
test('Generate React hook with TypeScript', () => {
  const code = generateRealtimeHook('Task');
  
  if (!code.includes('function useTaskRealtime')) {
    throw new Error('useTaskRealtime hook not generated');
  }
  
  if (!code.includes('Socket<ServerToClientEvents, ClientToServerEvents>')) {
    throw new Error('TypeScript socket types not found');
  }
  
  if (!code.includes('useState')) {
    throw new Error('React useState not used');
  }
  
  if (!code.includes('useEffect')) {
    throw new Error('React useEffect not used');
  }
  
  if (!code.includes("io(socketUrl")) {
    throw new Error('Socket.io client connection not found');
  }
});

// Test 5: Client hook handles events
test('Client hook handles all model events', () => {
  const code = generateRealtimeHook('Order');
  
  if (!code.includes("newSocket.on('model_created'")) {
    throw new Error('model_created handler not found');
  }
  
  if (!code.includes("newSocket.on('model_updated'")) {
    throw new Error('model_updated handler not found');
  }
  
  if (!code.includes("newSocket.on('model_deleted'")) {
    throw new Error('model_deleted handler not found');
  }
  
  if (!code.includes("newSocket.on('connect'")) {
    throw new Error('connect handler not found');
  }
  
  if (!code.includes("newSocket.on('disconnect'")) {
    throw new Error('disconnect handler not found');
  }
});

// Test 6: Client hook has cleanup
test('Client hook properly cleans up on unmount', () => {
  const code = generateRealtimeHook('Product');
  
  if (!code.includes('return () =>')) {
    throw new Error('Cleanup function not found');
  }
  
  if (!code.includes("emit('unsubscribe'")) {
    throw new Error('Unsubscribe on cleanup not found');
  }
  
  if (!code.includes('newSocket.close()')) {
    throw new Error('Socket close on cleanup not found');
  }
});

// Test 7: Generate React context
test('Generate React context for realtime', () => {
  const code = generateRealtimeContext();
  
  if (!code.includes('function RealtimeProvider')) {
    throw new Error('RealtimeProvider not generated');
  }
  
  if (!code.includes('function useRealtime')) {
    throw new Error('useRealtime hook not generated');
  }
  
  if (!code.includes('createContext')) {
    throw new Error('React context not created');
  }
  
  if (!code.includes('RealtimeContext.Provider')) {
    throw new Error('Context provider not used');
  }
});

// Test 8: Context has subscribe/unsubscribe
test('Context provides subscribe and unsubscribe', () => {
  const code = generateRealtimeContext();
  
  if (!code.includes('const subscribe =')) {
    throw new Error('subscribe function not found');
  }
  
  if (!code.includes('const unsubscribe =')) {
    throw new Error('unsubscribe function not found');
  }
  
  if (!code.includes("socket.emit('subscribe'")) {
    throw new Error('subscribe emit not found');
  }
  
  if (!code.includes("socket.emit('unsubscribe'")) {
    throw new Error('unsubscribe emit not found');
  }
});

// Test 9: Generate Prisma middleware
test('Generate Prisma realtime middleware', () => {
  const code = generatePrismaRealtimeMiddleware();
  
  if (!code.includes('function setupRealtimeMiddleware')) {
    throw new Error('setupRealtimeMiddleware not generated');
  }
  
  if (!code.includes('prisma.$use')) {
    throw new Error('Prisma middleware not used');
  }
  
  if (!code.includes('realtimeServer.emitModelCreated')) {
    throw new Error('emitModelCreated not called');
  }
  
  if (!code.includes('realtimeServer.emitModelUpdated')) {
    throw new Error('emitModelUpdated not called');
  }
  
  if (!code.includes('realtimeServer.emitModelDeleted')) {
    throw new Error('emitModelDeleted not called');
  }
});

// Test 10: Middleware handles CRUD operations
test('Middleware handles all CRUD operations', () => {
  const code = generatePrismaRealtimeMiddleware();
  
  if (!code.includes("case 'create'")) {
    throw new Error('create case not handled');
  }
  
  if (!code.includes("case 'update'")) {
    throw new Error('update case not handled');
  }
  
  if (!code.includes("case 'delete'")) {
    throw new Error('delete case not handled');
  }
  
  if (!code.includes("case 'createMany'")) {
    throw new Error('createMany case not handled');
  }
});

// Test 11: Server usage template
test('Generate server usage template', () => {
  const code = generateRealtimeServerUsage();
  
  if (!code.includes('import { RealtimeServer }')) {
    throw new Error('RealtimeServer import not found');
  }
  
  if (!code.includes('createServer')) {
    throw new Error('HTTP server creation not found');
  }
  
  if (!code.includes('new RealtimeServer(httpServer)')) {
    throw new Error('RealtimeServer instantiation not found');
  }
  
  if (!code.includes('export const realtimeServer')) {
    throw new Error('realtimeServer export not found');
  }
});

// Test 12: Connection error handling
test('Client handles connection errors', () => {
  const code = generateRealtimeHook('User');
  
  if (!code.includes("newSocket.on('connect_error'")) {
    throw new Error('connect_error handler not found');
  }
  
  if (!code.includes('setError')) {
    throw new Error('setError not called on error');
  }
  
  if (!code.includes('reconnection: true')) {
    throw new Error('reconnection not enabled');
  }
  
  if (!code.includes('reconnectionAttempts')) {
    throw new Error('reconnectionAttempts not configured');
  }
});

// Test 13: Model channel naming
test('Channels use lowercase model names', () => {
  const taskHook = generateRealtimeHook('Task');
  const orderHook = generateRealtimeHook('Order');
  
  if (!taskHook.includes("'task'")) {
    throw new Error('Task channel not lowercase');
  }
  
  if (!orderHook.includes("'order'")) {
    throw new Error('Order channel not lowercase');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4 Week 1: WebSocket Infrastructure COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}
