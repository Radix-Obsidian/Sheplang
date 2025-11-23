/**
 * Phase 4-04: Real-Time Features - Code Generation
 * Generates WebSocket/Socket.io code for real-time updates
 */

/**
 * Generate Socket.io server setup
 */
export function generateSocketServer(): string {
  return `// Auto-generated Socket.io Server
import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class RealtimeServer {
  private io: SocketServer;
  
  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
      
      socket.on('subscribe', (channel: string) => {
        console.log(\`Client \${socket.id} subscribed to \${channel}\`);
        socket.join(channel);
      });
      
      socket.on('unsubscribe', (channel: string) => {
        console.log(\`Client \${socket.id} unsubscribed from \${channel}\`);
        socket.leave(channel);
      });
    });
  }
  
  // Emit update to specific channel
  emit(channel: string, event: string, data: any) {
    this.io.to(channel).emit(event, data);
  }
  
  // Broadcast to all clients
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}
`;
}

/**
 * Generate Socket.io client hook for React
 */
export function generateSocketClientHook(modelName: string): string {
  return `// Auto-generated Socket.io Client Hook for ${modelName}
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function use${modelName}Updates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001');
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to realtime server');
      newSocket.emit('subscribe', '${modelName.toLowerCase()}');
    });
    
    newSocket.on('${modelName.toLowerCase()}_created', (data: any) => {
      console.log('${modelName} created:', data);
      setUpdates(prev => [...prev, { type: 'created', data }]);
    });
    
    newSocket.on('${modelName.toLowerCase()}_updated', (data: any) => {
      console.log('${modelName} updated:', data);
      setUpdates(prev => [...prev, { type: 'updated', data }]);
    });
    
    newSocket.on('${modelName.toLowerCase()}_deleted', (data: any) => {
      console.log('${modelName} deleted:', data);
      setUpdates(prev => [...prev, { type: 'deleted', data }]);
    });
    
    return () => {
      newSocket.emit('unsubscribe', '${modelName.toLowerCase()}');
      newSocket.close();
    };
  }, []);
  
  return { updates, socket };
}
`;
}

/**
 * Generate Prisma middleware for automatic realtime updates
 */
export function generatePrismaRealtimeMiddleware(): string {
  return `// Auto-generated Prisma Realtime Middleware
import { PrismaClient } from '@prisma/client';

export function setupRealtimeMiddleware(prisma: PrismaClient, realtimeServer: any) {
  prisma.$use(async (params, next) => {
    const result = await next(params);
    
    // Emit realtime events for CRUD operations
    if (params.action === 'create') {
      realtimeServer.emit(
        params.model?.toLowerCase() || 'unknown',
        \`\${params.model?.toLowerCase()}_created\`,
        result
      );
    } else if (params.action === 'update' || params.action === 'updateMany') {
      realtimeServer.emit(
        params.model?.toLowerCase() || 'unknown',
        \`\${params.model?.toLowerCase()}_updated\`,
        result
      );
    } else if (params.action === 'delete' || params.action === 'deleteMany') {
      realtimeServer.emit(
        params.model?.toLowerCase() || 'unknown',
        \`\${params.model?.toLowerCase()}_deleted\`,
        params.args
      );
    }
    
    return result;
  });
}
`;
}

/**
 * Update server.ts to include Socket.io
 */
export function generateServerWithWebSocket(): string {
  return `// Auto-generated Express + Socket.io Server
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { RealtimeServer } from './realtime/server';
import { PrismaClient } from '@prisma/client';
import { setupRealtimeMiddleware } from './realtime/middleware';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Setup Socket.io
const realtimeServer = new RealtimeServer(httpServer);

// Setup Prisma middleware for automatic realtime updates
setupRealtimeMiddleware(prisma, realtimeServer);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', realtime: true });
});

// Start server with WebSocket support
httpServer.listen(PORT, () => {
  console.log(\`Server running on port \${PORT} with realtime support\`);
});

export { app, httpServer, realtimeServer };
`;
}
