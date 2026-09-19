import type { Server } from 'socket.io';
import {
  addOnlineUser,
  getOnlineUserCount,
  removeOnlineUser,
} from '../services/presence.service.js';
import type { AuthenticatedSocket } from './auth.socket.js';
import { UserRole } from '../config/enums.js';

export function registerPresenceHandlers(io: Server, socket: AuthenticatedSocket): void {
  const user = socket.data.user;
  if (!user) {
    return;
  }

  const count = addOnlineUser(user.id);
  emitPresenceUpdate(io, count);

  socket.on('disconnect', () => {
    const newCount = removeOnlineUser(user.id);
    emitPresenceUpdate(io, newCount);
  });
}

export function emitPresenceUpdate(io: Server, count?: number): void {
  const onlineUsers = count ?? getOnlineUserCount();
  io.emit('presence:update', { onlineUsers });
}

export function emitPresenceToAdmins(io: Server): void {
  emitPresenceUpdate(io);
}

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}
