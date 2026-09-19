import type { Server } from 'socket.io';
import { getUnreadCount } from '../services/notification.service.js';
import type { AuthenticatedSocket } from './auth.socket.js';

export function registerNotificationHandlers(_io: Server, socket: AuthenticatedSocket): void {
  const user = socket.data.user;
  if (!user) {
    return;
  }

  void getUnreadCount(user.id).then((unreadCount) => {
    socket.emit('notification:count', { unreadCount });
  });
}
