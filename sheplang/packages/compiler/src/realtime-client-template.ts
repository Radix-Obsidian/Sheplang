/**
 * Phase 4: Real-time Layer - React Client Hooks Template  
 * Following official Socket.io client patterns
 * Reference: https://socket.io/docs/v4/client-api/
 */

export function generateRealtimeHook(modelName: string): string {
  const channelName = modelName.toLowerCase();
  
  return `// Auto-generated React Hook for ${modelName} real-time updates
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// TypeScript interfaces matching server (reversed)
interface ServerToClientEvents {
  model_created: (model: string, data: any) => void;
  model_updated: (model: string, data: any) => void;
  model_deleted: (model: string, id: string) => void;
  notification: (message: string, data?: any) => void;
  connected: () => void;
}

interface ClientToServerEvents {
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  ping: (callback: () => void) => void;
}

export interface ${modelName}Update {
  type: 'created' | 'updated' | 'deleted';
  data: any;
  timestamp: number;
}

export function use${modelName}Realtime() {
  const [updates, setUpdates] = useState<${modelName}Update[]>([]);
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Create socket connection
    const socketUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('[Realtime] Connected to server');
      setIsConnected(true);
      setError(null);
      
      // Subscribe to ${modelName} channel
      newSocket.emit('subscribe', '${channelName}');
    });
    
    newSocket.on('connected', () => {
      console.log('[Realtime] Server acknowledged connection');
    });
    
    newSocket.on('disconnect', () => {
      console.log('[Realtime] Disconnected from server');
      setIsConnected(false);
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('[Realtime] Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });
    
    // Model event handlers
    newSocket.on('model_created', (model: string, data: any) => {
      if (model === '${modelName}') {
        console.log('[Realtime] ${modelName} created:', data);
        setUpdates(prev => [...prev, {
          type: 'created',
          data,
          timestamp: Date.now()
        }]);
      }
    });
    
    newSocket.on('model_updated', (model: string, data: any) => {
      if (model === '${modelName}') {
        console.log('[Realtime] ${modelName} updated:', data);
        setUpdates(prev => [...prev, {
          type: 'updated',
          data,
          timestamp: Date.now()
        }]);
      }
    });
    
    newSocket.on('model_deleted', (model: string, id: string) => {
      if (model === '${modelName}') {
        console.log('[Realtime] ${modelName} deleted:', id);
        setUpdates(prev => [...prev, {
          type: 'deleted',
          data: { id },
          timestamp: Date.now()
        }]);
      }
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      console.log('[Realtime] Cleaning up ${modelName} realtime connection');
      newSocket.emit('unsubscribe', '${channelName}');
      newSocket.close();
    };
  }, []);
  
  // Ping function for health check
  const ping = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (!socket) {
        resolve(false);
        return;
      }
      
      socket.emit('ping', () => {
        resolve(true);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  }, [socket]);
  
  // Clear updates history
  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);
  
  return {
    updates,
    socket,
    isConnected,
    error,
    ping,
    clearUpdates
  };
}
`;
}

export function generateRealtimeContext(): string {
  return `// Auto-generated Realtime Context for React
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface ServerToClientEvents {
  model_created: (model: string, data: any) => void;
  model_updated: (model: string, data: any) => void;
  model_deleted: (model: string, id: string) => void;
  notification: (message: string, data?: any) => void;
  connected: () => void;
}

interface ClientToServerEvents {
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  ping: (callback: () => void) => void;
}

interface RealtimeContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  error: string | null;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    newSocket.on('connect', () => {
      console.log('[Realtime Context] Connected');
      setIsConnected(true);
      setError(null);
    });
    
    newSocket.on('connected', () => {
      console.log('[Realtime Context] Server acknowledged');
    });
    
    newSocket.on('disconnect', () => {
      console.log('[Realtime Context] Disconnected');
      setIsConnected(false);
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('[Realtime Context] Error:', err);
      setError(err.message);
      setIsConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      console.log('[Realtime Context] Cleanup');
      newSocket.close();
    };
  }, []);
  
  const subscribe = (channel: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe', channel);
      console.log(\`[Realtime Context] Subscribed to \${channel}\`);
    }
  };
  
  const unsubscribe = (channel: string) => {
    if (socket) {
      socket.emit('unsubscribe', channel);
      console.log(\`[Realtime Context] Unsubscribed from \${channel}\`);
    }
  };
  
  return (
    <RealtimeContext.Provider value={{ socket, isConnected, error, subscribe, unsubscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
`;
}
