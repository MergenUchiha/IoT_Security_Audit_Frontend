import { io, Socket } from 'socket.io-client';

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    this.socket = io(WS_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('connection', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection', { status: 'error', error: 'Max reconnection attempts reached' });
      }
    });

    // Application-specific events
    this.socket.on('audit:started', (data) => {
      this.emit('audit:started', data);
    });

    this.socket.on('audit:completed', (data) => {
      this.emit('audit:completed', data);
    });

    this.socket.on('audit:progress', (data) => {
      this.emit('audit:progress', data);
    });

    this.socket.on('vulnerability:detected', (data) => {
      this.emit('vulnerability:detected', data);
    });

    this.socket.on('device:status', (data) => {
      this.emit('device:status', data);
    });

    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('report:generated', (data) => {
      this.emit('report:generated', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket disconnected');
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: EventCallback) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  send(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('WebSocket not connected');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Specific methods for application events
  subscribeToDevice(deviceId: string) {
    this.send('subscribe:device', { deviceId });
  }

  unsubscribeFromDevice(deviceId: string) {
    this.send('unsubscribe:device', { deviceId });
  }

  subscribeToAudit(auditId: string) {
    this.send('subscribe:audit', { auditId });
  }

  unsubscribeFromAudit(auditId: string) {
    this.send('unsubscribe:audit', { auditId });
  }
}

export default new WebSocketService();