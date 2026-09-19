import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { setSocketServer } from './socketRegistry.js';
import { authenticateSocket, type AuthenticatedSocket } from './auth.socket.js';
import { registerActivityHandlers } from './activity.socket.js';
import { registerNotificationHandlers } from './notification.socket.js';
import { registerPresenceHandlers } from './presence.socket.js';
import { getCatchUpActivities } from '../services/activity.service.js';

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  setSocketServer(io);

  io.use(async (socket, next) => {
    try {
      await authenticateSocket(socket as AuthenticatedSocket);
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    void socket.join(`user:${user.id}`);

    registerPresenceHandlers(io, authSocket);
    registerActivityHandlers(io, authSocket);
    registerNotificationHandlers(io, authSocket);

    void getCatchUpActivities(user, 20).then((activities) => {
      socket.emit('activity:catchup', { activities });
    });

    socket.emit('connected', { userId: user.id });
  });

  return io;
}
