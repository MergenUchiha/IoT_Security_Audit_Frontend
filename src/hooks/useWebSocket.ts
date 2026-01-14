import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      console.log('🔌 [WebSocket] Connecting to:', SOCKET_URL);
      
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
        autoConnect: true,
        forceNew: false,
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('✅ [WebSocket] Connected successfully');
        console.log('   Socket ID:', socketRef.current?.id);
        console.log('   Transport:', socketRef.current?.io.engine.transport.name);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      });

      socketRef.current.on('connected', (data) => {
        console.log('📨 [WebSocket] Welcome message:', data);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ [WebSocket] Disconnected:', reason);
        setIsConnected(false);

        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, reconnect manually
          setTimeout(() => {
            console.log('🔄 [WebSocket] Attempting manual reconnect...');
            socketRef.current?.connect();
          }, 1000);
        } else if (reason === 'transport close' || reason === 'transport error') {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              console.log(`🔄 [WebSocket] Reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
              connect();
            }, reconnectDelay);
          } else {
            console.error('❌ [WebSocket] Max reconnection attempts reached');
          }
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.warn('🔴 [WebSocket] Connection error:', error.message);
        setIsConnected(false);
        reconnectAttemptsRef.current++;
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          console.log(`⏳ [WebSocket] Will retry in ${reconnectDelay/1000}s...`);
        }
      });

      socketRef.current.on('error', (error) => {
        console.error('🔴 [WebSocket] Error:', error);
      });

      socketRef.current.io.on('reconnect', (attemptNumber) => {
        console.log('✅ [WebSocket] Reconnected after', attemptNumber, 'attempts');
        reconnectAttemptsRef.current = 0;
      });

      socketRef.current.io.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 [WebSocket] Reconnection attempt:', attemptNumber);
      });

      socketRef.current.io.on('reconnect_error', (error) => {
        console.error('🔴 [WebSocket] Reconnection error:', error.message);
      });

      socketRef.current.io.on('reconnect_failed', () => {
        console.error('❌ [WebSocket] Reconnection failed - max attempts reached');
      });

    } catch (error) {
      console.error('❌ [WebSocket] Failed to create connection:', error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        console.log('🔌 [WebSocket] Cleaning up connection');
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log('📤 [WebSocket] Emitted:', event, data);
    } else {
      console.warn('⚠️  [WebSocket] Cannot emit - not connected');
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      console.log('👂 [WebSocket] Listening to:', event);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
      console.log('👋 [WebSocket] Stopped listening to:', event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
};