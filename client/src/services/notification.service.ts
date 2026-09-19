import { api } from '../lib/api';
import type { Notification } from '../types';

export async function fetchNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const { data } = await api.get('/notifications');
  return data.data as { notifications: Notification[]; unreadCount: number };
}

export async function markNotificationRead(id: string): Promise<number> {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return (data.data as { unreadCount: number }).unreadCount;
}

export async function markAllNotificationsRead(): Promise<number> {
  const { data } = await api.patch('/notifications/read-all');
  return (data.data as { unreadCount: number }).unreadCount;
}
