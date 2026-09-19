import { type Prisma } from '@prisma/client';
import { TaskStatus, UserRole } from '../config/enums.js';
import { prisma } from '../config/prisma.js';
import { getSocketServer } from '../sockets/socketRegistry.js';
import type { AuthUser } from '../types/express.js';
import { getAccessibleProjectIds, getAccessibleTaskIds } from './authorization.service.js';

export async function createStatusChangeActivity(params: {
  userId: string;
  projectId: string;
  taskId: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
}) {
  const activity = await prisma.activity.create({
    data: {
      userId: params.userId,
      projectId: params.projectId,
      taskId: params.taskId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      message: `Status changed from ${params.oldStatus} to ${params.newStatus}`,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true, developerId: true } },
      project: { select: { id: true, name: true, managerId: true } },
    },
  });

  await emitActivityToAuthorizedClients(activity);
  return activity;
}

export async function emitActivityToAuthorizedClients(
  activity: Prisma.ActivityGetPayload<{
    include: {
      user: { select: { id: true; name: true; role: true } };
      task: { select: { id: true; title: true; developerId: true } };
      project: { select: { id: true; name: true; managerId: true } };
    };
  }>,
) {
  try {
    const io = getSocketServer();

    io.to(`user:${activity.project.managerId}`).emit('activity:update', activity);

    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    });
    for (const admin of admins) {
      io.to(`user:${admin.id}`).emit('activity:update', activity);
    }

    if (activity.task?.developerId) {
      io.to(`user:${activity.task.developerId}`).emit('activity:update', activity);
    }
  } catch {
    // ignore if socket unavailable
  }
}

export async function listActivity(user: AuthUser, projectId?: string) {
  const projectIds = await getAccessibleProjectIds(user);
  const taskIds = await getAccessibleTaskIds(user);

  const where: Prisma.ActivityWhereInput = {};

  if (projectId) {
    where.projectId = projectId;
  } else if (projectIds !== 'all') {
    where.projectId = { in: projectIds.length ? projectIds : ['__none__'] };
  }

  if (user.role === UserRole.DEVELOPER) {
    if (taskIds !== 'all') {
      where.taskId = { in: taskIds.length ? taskIds : ['__none__'] };
    }
  }

  return prisma.activity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true } },
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getCatchUpActivities(user: AuthUser, limit = 20) {
  const projectIds = await getAccessibleProjectIds(user);
  const taskIds = await getAccessibleTaskIds(user);

  const where: Prisma.ActivityWhereInput = {};

  if (projectIds !== 'all') {
    where.projectId = { in: projectIds.length ? projectIds : ['__none__'] };
  }

  if (user.role === UserRole.DEVELOPER) {
    if (taskIds !== 'all') {
      where.taskId = { in: taskIds.length ? taskIds : ['__none__'] };
    }
  }

  return prisma.activity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true } },
      project: { select: { id: true, name: true } },
    },
  });
}
