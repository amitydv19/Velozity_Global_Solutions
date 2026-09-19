import { UserRole } from '../config/enums.js';
import type { Project, Task } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type { AuthUser } from '../types/express.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export async function getProjectOrThrow(projectId: string): Promise<Project> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  return project;
}

export async function assertProjectAccess(user: AuthUser, projectId: string): Promise<Project> {
  const project = await getProjectOrThrow(projectId);

  if (user.role === UserRole.ADMIN) {
    return project;
  }

  if (user.role === UserRole.PROJECT_MANAGER) {
    if (project.managerId !== user.id) {
      throw new ForbiddenError();
    }
    return project;
  }

  const assigned = await prisma.task.findFirst({
    where: { projectId, developerId: user.id },
  });
  if (!assigned) {
    throw new ForbiddenError();
  }
  return project;
}

export async function getTaskOrThrow(taskId: string): Promise<Task> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  return task;
}

export async function assertTaskAccess(user: AuthUser, taskId: string): Promise<Task> {
  const task = await getTaskOrThrow(taskId);

  if (user.role === UserRole.ADMIN) {
    return task;
  }

  if (user.role === UserRole.PROJECT_MANAGER) {
    const project = await getProjectOrThrow(task.projectId);
    if (project.managerId !== user.id) {
      throw new ForbiddenError();
    }
    return task;
  }

  if (task.developerId !== user.id) {
    throw new ForbiddenError();
  }
  return task;
}

export async function getAccessibleProjectIds(user: AuthUser): Promise<string[] | 'all'> {
  if (user.role === UserRole.ADMIN) {
    return 'all';
  }
  if (user.role === UserRole.PROJECT_MANAGER) {
    const projects = await prisma.project.findMany({
      where: { managerId: user.id },
      select: { id: true },
    });
    return projects.map((p) => p.id);
  }
  const tasks = await prisma.task.findMany({
    where: { developerId: user.id },
    select: { projectId: true },
    distinct: ['projectId'],
  });
  return tasks.map((t) => t.projectId);
}

export async function getAccessibleTaskIds(user: AuthUser): Promise<string[] | 'all'> {
  if (user.role === UserRole.ADMIN) {
    return 'all';
  }
  if (user.role === UserRole.PROJECT_MANAGER) {
    const projectIds = await getAccessibleProjectIds(user);
    if (projectIds === 'all') {
      return 'all';
    }
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });
    return tasks.map((t) => t.id);
  }
  const tasks = await prisma.task.findMany({
    where: { developerId: user.id },
    select: { id: true },
  });
  return tasks.map((t) => t.id);
}
