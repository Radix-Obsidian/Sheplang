/**
 * Phase 4: Real-time Layer - Prisma Middleware Template
 * Automatically broadcasts database changes via Socket.io
 */

export function generatePrismaRealtimeMiddleware(): string {
  return `// Auto-generated Prisma Realtime Middleware
import { PrismaClient } from '@prisma/client';
import type { RealtimeServer } from './realtime-server';

export function setupRealtimeMiddleware(prisma: PrismaClient, realtimeServer: RealtimeServer) {
  prisma.$use(async (params, next) => {
    // Execute the query
    const result = await next(params);
    
    // Broadcast changes via Socket.io
    if (params.model) {
      const modelName = params.model;
      
      switch (params.action) {
        case 'create':
        case 'createMany':
          console.log(\`[Prisma Middleware] \${modelName} created\`);
          realtimeServer.emitModelCreated(modelName, result);
          break;
          
        case 'update':
        case 'updateMany':
        case 'upsert':
          console.log(\`[Prisma Middleware] \${modelName} updated\`);
          realtimeServer.emitModelUpdated(modelName, result);
          break;
          
        case 'delete':
        case 'deleteMany':
          console.log(\`[Prisma Middleware] \${modelName} deleted\`);
          const id = params.args?.where?.id || 'unknown';
          realtimeServer.emitModelDeleted(modelName, id);
          break;
      }
    }
    
    return result;
  });
  
  console.log('[Prisma Middleware] Realtime middleware installed');
}
`;
}
