/**
 * Phase 4-04: Real-Time Features Tests
 * Following proper test creation protocol
 */

import { 
  generateSocketServer, 
  generateSocketClientHook, 
  generatePrismaRealtimeMiddleware,
  generateServerWithWebSocket 
} from './sheplang/packages/compiler/dist/realtime-templates.js';

console.log('🧪 Phase 4-04: Real-Time Features Tests\n');
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

// Test 1: Socket server generation
test('Socket.io server generates correctly', () => {
  const code = generateSocketServer();
  
  if (!code.includes('class RealtimeServer')) {
    throw new Error('RealtimeServer class not generated');
  }
  
  if (!code.includes('import { Server as SocketServer }')) {
    throw new Error('Socket.io import not found');
  }
  
  if (!code.includes('connection')) {
    throw new Error('Connection handler not found');
  }
  
  if (!code.includes('disconnect')) {
    throw new Error('Disconnect handler not found');
  }
});

// Test 2: Client hook generation
test('Socket.io client hook generates correctly', () => {
  const code = generateSocketClientHook('Task');
  
  if (!code.includes('function useTaskUpdates')) {
    throw new Error('Hook function not generated');
  }
  
  if (!code.includes('import { io, Socket }')) {
    throw new Error('Socket.io client import not found');
  }
  
  if (!code.includes('task_created')) {
    throw new Error('Created event not found');
  }
  
  if (!code.includes('task_updated')) {
    throw new Error('Updated event not found');
  }
  
  if (!code.includes('task_deleted')) {
    throw new Error('Deleted event not found');
  }
});

// Test 3: Subscribe/unsubscribe functionality
test('Subscribe and unsubscribe work correctly', () => {
  const serverCode = generateSocketServer();
  const clientCode = generateSocketClientHook('Order');
  
  if (!serverCode.includes('subscribe')) {
    throw new Error('Subscribe handler not in server');
  }
  
  if (!serverCode.includes('unsubscribe')) {
    throw new Error('Unsubscribe handler not in server');
  }
  
  if (!serverCode.includes('socket.join')) {
    throw new Error('Join room not implemented');
  }
  
  if (!serverCode.includes('socket.leave')) {
    throw new Error('Leave room not implemented');
  }
  
  if (!clientCode.includes('subscribe')) {
    throw new Error('Subscribe not in client');
  }
  
  if (!clientCode.includes('unsubscribe')) {
    throw new Error('Unsubscribe not in client');
  }
});

// Test 4: Prisma realtime middleware
test('Prisma realtime middleware generates correctly', () => {
  const code = generatePrismaRealtimeMiddleware();
  
  if (!code.includes('function setupRealtimeMiddleware')) {
    throw new Error('Middleware function not generated');
  }
  
  if (!code.includes('prisma.$use')) {
    throw new Error('Prisma middleware not used');
  }
  
  if (!code.includes('create')) {
    throw new Error('Create event not handled');
  }
  
  if (!code.includes('update')) {
    throw new Error('Update event not handled');
  }
  
  if (!code.includes('delete')) {
    throw new Error('Delete event not handled');
  }
  
  if (!code.includes('realtimeServer.emit')) {
    throw new Error('Emit not called');
  }
});

// Test 5: Server with WebSocket
test('Server with WebSocket generates correctly', () => {
  const code = generateServerWithWebSocket();
  
  if (!code.includes('import { createServer }')) {
    throw new Error('HTTP server import not found');
  }
  
  if (!code.includes('RealtimeServer')) {
    throw new Error('RealtimeServer not used');
  }
  
  if (!code.includes('setupRealtimeMiddleware')) {
    throw new Error('Middleware setup not called');
  }
  
  if (!code.includes('httpServer.listen')) {
    throw new Error('HTTP server not started');
  }
  
  if (!code.includes('realtime: true')) {
    throw new Error('Realtime status not indicated');
  }
});

// Test 6: Event emission
test('Event emission works correctly', () => {
  const serverCode = generateSocketServer();
  
  if (!serverCode.includes('emit(channel: string, event: string, data: any)')) {
    throw new Error('Emit method not defined');
  }
  
  if (!serverCode.includes('broadcast(event: string, data: any)')) {
    throw new Error('Broadcast method not defined');
  }
  
  if (!serverCode.includes('this.io.to(channel).emit')) {
    throw new Error('Channel-specific emit not implemented');
  }
  
  if (!serverCode.includes('this.io.emit')) {
    throw new Error('Broadcast emit not implemented');
  }
});

// Test 7: React hooks integration
test('React hooks integrate correctly', () => {
  const code = generateSocketClientHook('Product');
  
  if (!code.includes('useEffect')) {
    throw new Error('useEffect not used');
  }
  
  if (!code.includes('useState')) {
    throw new Error('useState not used');
  }
  
  if (!code.includes('return () =>')) {
    throw new Error('Cleanup function not defined');
  }
  
  if (!code.includes('newSocket.close()')) {
    throw new Error('Socket cleanup not called');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4-04: Real-Time Features COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}
