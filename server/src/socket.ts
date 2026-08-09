import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env, getAllowedOrigins } from './config/env';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(userId);
    console.log(`Socket connected: ${userId} (${socket.id})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${userId} (${socket.id})`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
