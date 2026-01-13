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
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (socketRef.current?.connected) {
      console.log('🔵 WebSocket already connected');
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    console.log('🔵 Attempting to connect to WebSocket:', SOCKET_URL);

    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 10000,
        autoConnect: true,
      });

      // Connection successful
      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        console.log('   Socket ID:', socketRef.current?.id);
        console.log('   Transport:', socketRef.current?.io.engine.transport.name);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      });

      // Welcome message from server
      socketRef.current.on('connected', (data) => {
        console.log('📨 Welcome message received:', data);
      });

      // Disconnection
      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        setIsConnected(false);

        // Handle different disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect manually
          console.log('🔄 Server disconnected, attempting manual reconnect...');
          socketRef.current?.connect();
        } else if (reason === 'transport close' || reason === 'transport error') {
          // Connection issue, schedule reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            console.log(`🔄 Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts}...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, reconnectDelay);
          } else {
            console.error('❌ Max reconnection attempts reached. Please check if backend is running on', SOCKET_URL);
          }
        }
      });

      // Connection error
      socketRef.current.on('connect_error', (error) => {
        console.warn('🔴 WebSocket connection error:', error.message);
        setIsConnected(false);

        // Increment reconnect attempts
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('❌ Failed to connect after', maxReconnectAttempts, 'attempts');
          console.error('   Please ensure backend is running on', SOCKET_URL);
          console.error('   Check .env file: VITE_WS_URL=', SOCKET_URL);
        }
      });

      // General error handler
      socketRef.current.on('error', (error) => {
        console.error('🔴 WebSocket error:', error);
      });

      // Reconnection attempt
      socketRef.current.io.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 Reconnection attempt ${attempt}...`);
      });

      // Reconnection successful
      socketRef.current.io.on('reconnect', (attempt) => {
        console.log(`✅ Reconnected after ${attempt} attempts`);
        reconnectAttemptsRef.current = 0;
      });

      // Reconnection failed
      socketRef.current.io.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after all attempts');
      });

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      console.log(`📤 Emitting event: ${event}`, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️  Cannot emit '${event}': WebSocket not connected`);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      console.log(`👂 Listening to event: ${event}`);
      socketRef.current.on(event, handler);
    } else {
      console.warn(`⚠️  Cannot listen to '${event}': WebSocket not initialized`);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      console.log(`🔇 Removing listener for event: ${event}`);
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
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