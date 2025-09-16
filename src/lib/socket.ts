/* administra las conexiones de socket, el envío de mensajes y el manejo de eventos para una aplicación de chat. */
import { io, Socket } from 'socket.io-client';

interface MessageData {
  to: string;
  from: string;
  message: string;
  encrypted: string;
  timestamp: number;
  selfDestruct?: boolean;
  destructAfter?: number;
}

class SocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  
  connect(userId: string, userName: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }
    
    this.userId = userId;
    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.setupEventHandlers(userId, userName);
    return this.socket;
  }
  
  private setupEventHandlers(userId: string, userName: string) {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      
      this.socket?.emit('register', {
        id: userId,
        name: userName,
        timestamp: Date.now()
      });
      
      this.socket?.emit('check-messages', userId);
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });
    
    this.socket.on('receive-message', (data: MessageData) => {
      console.log('📨 Message received:', data);
      this.messageHandlers.forEach(handler => handler(data));
    });
    
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }
  
  sendMessage(data: MessageData) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return false;
    }
    
    this.socket.emit('send-message', {
      ...data,
      from: this.userId,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = new SocketManager();
export type { MessageData };