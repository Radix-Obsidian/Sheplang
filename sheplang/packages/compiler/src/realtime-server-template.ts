/**
 * Phase 4: Real-time Layer - Socket.io Server Template
 * Following official Socket.io v4 + TypeScript patterns
 * Reference: https://socket.io/docs/v4/typescript/
 */

export function generateRealtimeServer(): string {
  return `// Auto-generated Socket.io Server
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

// TypeScript interfaces for Socket.io events (official pattern)
interface ServerToClientEvents {
  // Model CRUD events
  model_created: (model: string, data: any) => void;
  model_updated: (model: string, data: any) => void;
  model_deleted: (model: string, id: string) => void;
  
  // Custom broadcast events
  notification: (message: string, data?: any) => void;
  
  // Connection status
  connected: () => void;
}

interface ClientToServerEvents {
  // Channel subscription
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  
  // Ping for health checks
  ping: (callback: () => void) => void;
}

interface InterServerEvents {
  // For multi-server setups (future)
  ping: () => void;
}

interface SocketData {
  userId?: string;
  channels: Set<string>;
}

export class RealtimeServer {
  private io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  
  constructor(httpServer: HttpServer) {
    // Initialize Socket.io with TypeScript types
    this.io = new SocketServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      },
      // Performance optimizations
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('[Realtime] Client connected:', socket.id);
      
      // Initialize socket data
      socket.data.channels = new Set();
      
      // Emit connected event
      socket.emit('connected');
      
      // Handle channel subscription
      socket.on('subscribe', (channel: string) => {
        console.log(\`[Realtime] Client \${socket.id} subscribed to \${channel}\`);
        socket.join(channel);
        socket.data.channels.add(channel);
      });
      
      // Handle channel unsubscription
      socket.on('unsubscribe', (channel: string) => {
        console.log(\`[Realtime] Client \${socket.id} unsubscribed from \${channel}\`);
        socket.leave(channel);
        socket.data.channels.delete(channel);
      });
      
      // Handle ping for health checks
      socket.on('ping', (callback) => {
        callback();
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('[Realtime] Client disconnected:', socket.id);
      });
    });
  }
  
  // Emit model creation event to channel
  emitModelCreated(modelName: string, data: any) {
    const channel = modelName.toLowerCase();
    this.io.to(channel).emit('model_created', modelName, data);
    console.log(\`[Realtime] Emitted model_created for \${modelName} to channel \${channel}\`);
  }
  
  // Emit model update event to channel
  emitModelUpdated(modelName: string, data: any) {
    const channel = modelName.toLowerCase();
    this.io.to(channel).emit('model_updated', modelName, data);
    console.log(\`[Realtime] Emitted model_updated for \${modelName} to channel \${channel}\`);
  }
  
  // Emit model deletion event to channel
  emitModelDeleted(modelName: string, id: string) {
    const channel = modelName.toLowerCase();
    this.io.to(channel).emit('model_deleted', modelName, id);
    console.log(\`[Realtime] Emitted model_deleted for \${modelName} to channel \${channel}\`);
  }
  
  // Broadcast notification to all clients
  broadcastNotification(message: string, data?: any) {
    this.io.emit('notification', message, data);
    console.log('[Realtime] Broadcast notification:', message);
  }
  
  // Broadcast to specific channel
  broadcastToChannel(channel: string, event: string, data: any) {
    this.io.to(channel).emit(event as any, data);
    console.log(\`[Realtime] Broadcast to channel \${channel}:\`, event);
  }
  
  // Get connected client count
  getConnectedCount(): number {
    return this.io.engine.clientsCount;
  }
}
`;
}

export function generateRealtimeServerUsage(): string {
  return `// Auto-generated Realtime Server Usage
import { createServer } from 'http';
import express from 'express';
import { RealtimeServer } from './realtime-server';

const app = express();
const httpServer = createServer(app);

// Initialize realtime server
export const realtimeServer = new RealtimeServer(httpServer);

// Export for use in routes and middleware
export { httpServer, app };
`;
}
