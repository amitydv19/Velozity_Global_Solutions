import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '../lib/api';
import type { ActivityItem, Notification } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export type SocketHandlers = {
  onActivityUpdate?: (activity: ActivityItem) => void;
  onActivityCatchup?: (activities: ActivityItem[]) => void;
  onNotificationNew?: (payload: { notification: Notification; unreadCount: number }) => void;
  onNotificationCount?: (payload: { unreadCount: number }) => void;
  onPresenceUpdate?: (payload: { onlineUsers: number }) => void;
};

export function connectSocket(handlers: SocketHandlers): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    withCredentials: true,
    auth: {
      token: getAccessToken(),
    },
  });

  socket.on('activity:update', (activity: ActivityItem) => {
    handlers.onActivityUpdate?.(activity);
  });

  socket.on('activity:catchup', (payload: { activities: ActivityItem[] }) => {
    handlers.onActivityCatchup?.(payload.activities);
  });

  socket.on('notification:new', (payload: { notification: Notification; unreadCount: number }) => {
    handlers.onNotificationNew?.(payload);
  });

  socket.on('notification:count', (payload: { unreadCount: number }) => {
    handlers.onNotificationCount?.(payload);
  });

  socket.on('presence:update', (payload: { onlineUsers: number }) => {
    handlers.onPresenceUpdate?.(payload);
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinProjectRoom(projectId: string): void {
  socket?.emit('project:join', { projectId });
}

export function leaveProjectRoom(projectId: string): void {
  socket?.emit('project:leave', { projectId });
}

export function getSocket(): Socket | null {
  return socket;
}
