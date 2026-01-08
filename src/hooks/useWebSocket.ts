import { useEffect, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

interface WebSocketMessage {
  event: string;
  data: any;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    console.log('🔌 Connecting to WebSocket:', WS_URL);
    
    // Use Socket.IO client library format for NestJS WebSocket Gateway
    const wsUrl = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://');
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setConnected(true);
        };

        ws.onclose = () => {
          console.log('❌ WebSocket disconnected, reconnecting in 3s...');
          setConnected(false);
          
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('🔴 WebSocket error:', error);
          setConnected(false);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket message:', message);
            setLastMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        setSocket(ws);
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    };

    connect();

    return () => {
      console.log('🔌 Closing WebSocket connection');
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = useCallback((event: string, data: any) => {
    if (socket && connected && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, [socket, connected]);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const message = JSON.parse(e.data);
        if (message.event === event) {
          callback(message.data);
        }
      } catch (error) {
        console.error('Failed to handle message:', error);
      }
    };

    socket?.addEventListener('message', handleMessage);

    return () => {
      socket?.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  return {
    socket,
    connected,
    lastMessage,
    sendMessage,
    subscribe,
  };
};