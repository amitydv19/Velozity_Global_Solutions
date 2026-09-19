import { type Prisma } from '@prisma/client';
import { TaskPriority, TaskStatus, UserRole } from '../config/enums.js';
import { prisma } from '../config/prisma.js';
import type { AuthUser } from '../types/express.js';
import { ForbiddenError } from '../utils/errors.js';
import {
  assertProjectAccess,
  assertTaskAccess,
  getAccessibleProjectIds,
} from './authorization.service.js';
import { emitActivityToAuthorizedClients } from './activity.service.js';
import { createAndEmitNotification } from './notification.service.js';

const priorityOrder: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export async function listTasks(
  user: AuthUser,
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    dueFrom?: Date;
    dueTo?: Date;
    projectId?: string;
  },
) {
  const projectIds = await getAccessibleProjectIds(user);

  const where: Prisma.TaskWhereInput = {};

  if (user.role === UserRole.DEVELOPER) {
    where.developerId = user.id;
  } else if (projectIds !== 'all') {
    where.projectId = { in: projectIds.length ? projectIds : ['__none__'] };
  }

  if (filters.projectId) {
    await assertProjectAccess(user, filters.projectId);
    where.projectId = filters.projectId;
  }

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.dueFrom || filters.dueTo) {
    where.dueDate = {};
    if (filters.dueFrom) {
      where.dueDate.gte = filters.dueFrom;
    }
    if (filters.dueTo) {
      where.dueDate.lte = filters.dueTo;
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, managerId: true } },
      developer: { select: { id: true, name: true, email: true } },
    },
  });

  if (user.role === UserRole.DEVELOPER) {
    tasks.sort((a, b) => {
      const p = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (p !== 0) return p;
      const aDue = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });
  } else {
    tasks.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return tasks;
}

export async function getTask(user: AuthUser, id: string) {
  await assertTaskAccess(user, id);
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      developer: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createTask(
  user: AuthUser,
  data: {
    title: string;
    description?: string | null;
    projectId: string;
    developerId?: string | null;
    status?: TaskStatus;
    priority?: Prisma.TaskCreateInput['priority'];
    dueDate?: Date | null;
  },
) {
  if (user.role === UserRole.DEVELOPER) {
    throw new ForbiddenError();
  }

  const project = await assertProjectAccess(user, data.projectId);
  if (user.role === UserRole.PROJECT_MANAGER && project.managerId !== user.id) {
    throw new ForbiddenError();
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      developerId: data.developerId,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
    },
    include: {
      project: true,
      developer: { select: { id: true, name: true, email: true } },
    },
  });

  if (task.developerId) {
    await createAndEmitNotification({
      recipientId: task.developerId,
      message: `You were assigned task "${task.title}"`,
      taskId: task.id,
    });
  }

  return task;
}

export async function updateTask(
  user: AuthUser,
  id: string,
  data: Partial<{
    title: string;
    description: string | null;
    developerId: string | null;
    status: TaskStatus;
    priority: Prisma.TaskUpdateInput['priority'];
    dueDate: Date | null;
  }>,
) {
  const existing = await assertTaskAccess(user, id);

  if (user.role === UserRole.DEVELOPER) {
    throw new ForbiddenError('Developers must use status endpoint');
  }

  const previousDeveloperId = existing.developerId;

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      project: true,
      developer: { select: { id: true, name: true, email: true } },
    },
  });

  if (data.developerId && data.developerId !== previousDeveloperId) {
    await createAndEmitNotification({
      recipientId: data.developerId,
      message: `You were assigned task "${task.title}"`,
      taskId: task.id,
    });
  }

  return task;
}

export async function updateTaskStatus(user: AuthUser, id: string, status: TaskStatus) {
  const existing = await assertTaskAccess(user, id);

  if (user.role === UserRole.DEVELOPER && existing.developerId !== user.id) {
    throw new ForbiddenError();
  }

  if (existing.status === status) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        developer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  const oldStatus = existing.status;

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id },
      data: { status },
      include: {
        project: true,
        developer: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.activity.create({
      data: {
        userId: user.id,
        projectId: updated.projectId,
        taskId: updated.id,
        oldStatus,
        newStatus: status,
        message: `Status changed from ${oldStatus} to ${status}`,
      },
    });

    return updated;
  });

  const activity = await prisma.activity.findFirst({
    where: { taskId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true, developerId: true } },
      project: { select: { id: true, name: true, managerId: true } },
    },
  });

  if (activity) {
    await emitActivityToAuthorizedClients(activity);
  }

  if (status === TaskStatus.IN_REVIEW && task.project) {
    await createAndEmitNotification({
      recipientId: task.project.managerId,
      message: `Task "${task.title}" moved to IN_REVIEW`,
      taskId: task.id,
    });
  }

  return task;
}

export async function deleteTask(user: AuthUser, id: string) {
  await assertTaskAccess(user, id);
  if (user.role === UserRole.DEVELOPER) {
    throw new ForbiddenError();
  }
  return prisma.task.delete({ where: { id } });
}
