import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  
  connect(userId: string, userName: string) {
    if (this.socket?.connected) return;
    
    this.userId = userId;
    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor');
      
      // Registrar usuario
      this.socket?.emit('register', {
        id: userId,
        name: userName,
        timestamp: Date.now()
      });
      
      // Verificar mensajes pendientes
      this.socket?.emit('check-messages', userId);
    });
    
    return this.socket;
  }
  
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
  
  sendMessage(to: string, message: string, encrypted: string) {
    this.socket?.emit('send-message', {
      to,
      from: this.userId,
      message,
      encrypted,
      timestamp: Date.now()
    });
  }
  
  onMessage(callback: (data: any) => void) {
    this.socket?.on('receive-message', callback);
  }
  
  onUserStatusChange(callback: (userId: string, status: 'online' | 'offline') => void) {
    this.socket?.on('user-online', (userId) => callback(userId, 'online'));
    this.socket?.on('user-offline', (userId) => callback(userId, 'offline'));
  }
}

export const socketManager = new SocketManager();