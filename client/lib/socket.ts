"use client";

import { io, Socket } from "socket.io-client";

// Force production URL since the backend is deployed
const BACKEND_URL = 'https://arleen-credit-repair-backend.onrender.com';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token?: string): Socket {
    if (!this.socket) {
      this.socket = io(BACKEND_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: {
          token: token
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Chat-specific methods
  public joinChat(chatId: string, userType: 'user' | 'agent'): void {
    if (this.socket) {
      this.socket.emit('join_chat', { chatId, userType });
    }
  }

  public leaveChat(chatId: string, userType: 'user' | 'agent'): void {
    if (this.socket) {
      this.socket.emit('leave_chat', { chatId, userType });
    }
  }

  public sendMessage(data: {
    chatId: string;
    text: string;
    sender: 'user' | 'agent';
    senderName: string;
  }): void {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  public startTyping(chatId: string, userType: 'user' | 'agent'): void {
    if (this.socket) {
      this.socket.emit('typing_start', { chatId, userType });
    }
  }

  public stopTyping(chatId: string, userType: 'user' | 'agent'): void {
    if (this.socket) {
      this.socket.emit('typing_stop', { chatId, userType });
    }
  }
}

export default SocketService;
