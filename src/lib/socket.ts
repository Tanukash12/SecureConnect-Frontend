import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:5000';
const SOCKET_URL = 'https://finalbackend-02as.onrender.com';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('user_online', { token });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Re-emit events to listeners
    this.socket.onAny((event, data) => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
    });
  }

  disconnect(token: string) {
    if (this.socket) {
      this.socket.emit('user_offline', { token });
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: unknown) {
    this.socket?.emit(event, data);
  }

  sendMessage(data: {
    sender_id: number;
    receiver_id?: number;
    team_id?: number;
    content: string;
    type?: string;
  }) {
    this.socket?.emit('send_message', data);
  }

  joinTeam(teamId: number) {
    this.socket?.emit('join_team', { team_id: teamId });
  }

  leaveTeam(teamId: number) {
    this.socket?.emit('leave_team', { team_id: teamId });
  }

  sendTyping(senderId: number, receiverId: number, typing: boolean) {
    this.socket?.emit('typing', { sender_id: senderId, receiver_id: receiverId, typing });
  }
}

export const socketClient = new SocketClient();
