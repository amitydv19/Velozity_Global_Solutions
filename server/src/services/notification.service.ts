import { prisma } from '../config/prisma.js';
import { getSocketServer } from '../sockets/socketRegistry.js';
import type { AuthUser } from '../types/express.js';

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      task: { select: { id: true, title: true, projectId: true } },
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  });
}

export async function markRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, recipientId: userId },
  });
  if (!notification) {
    return null;
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
  return getUnreadCount(userId);
}

export async function createAndEmitNotification(params: {
  recipientId: string;
  message: string;
  taskId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      recipientId: params.recipientId,
      message: params.message,
      taskId: params.taskId,
    },
    include: {
      task: { select: { id: true, title: true, projectId: true } },
    },
  });

  const unreadCount = await getUnreadCount(params.recipientId);

  try {
    const io = getSocketServer();
    io.to(`user:${params.recipientId}`).emit('notification:new', {
      notification,
      unreadCount,
    });
  } catch {
    // socket may not be ready in tests
  }

  return notification;
}

export async function emitUnreadCount(user: AuthUser): Promise<void> {
  const unreadCount = await getUnreadCount(user.id);
  try {
    const io = getSocketServer();
    io.to(`user:${user.id}`).emit('notification:count', { unreadCount });
  } catch {
    // ignore
  }
}
