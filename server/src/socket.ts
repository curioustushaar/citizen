import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'grievance-system-secret-key-2024';

type SocketUser = {
  userId?: string;
  role?: string;
  department?: string | null;
  name?: string;
};

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as any)?.token ||
      (typeof socket.handshake.headers.authorization === 'string'
        ? socket.handshake.headers.authorization.replace('Bearer ', '')
        : undefined);

    if (!token) {
      return next();
    }

    if (token === 'demo-token-active-citizen') {
      (socket.data as any).user = {
        userId: '65f1a2b3c4d5e6f7a8b9c0d1',
        role: 'PUBLIC',
        department: null,
        name: 'Demo Citizen',
      } satisfies SocketUser;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (socket.data as any).user = decoded satisfies SocketUser;
      return next();
    } catch {
      return next();
    }
  });

  io.on('connection', (socket) => {
    const user = (socket.data as any).user as SocketUser | undefined;
    if (user?.userId) {
      socket.join(`user:${user.userId}`);
    }
    if (user?.department) {
      socket.join(`dept:${user.department}`);
    }

    console.log('⚡ Socket connected:', socket.id, user?.userId ? `(user:${user.userId})` : '');

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

export const emitToDepartment = (department: string, event: string, data: any) => {
  if (io && department) {
    io.to(`dept:${department}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};
