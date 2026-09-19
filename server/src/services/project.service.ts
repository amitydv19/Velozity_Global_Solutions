import { type Prisma } from '@prisma/client';
import { UserRole } from '../config/enums.js';
import { prisma } from '../config/prisma.js';
import type { AuthUser } from '../types/express.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { assertProjectAccess, getAccessibleProjectIds } from './authorization.service.js';

export async function listProjects(user: AuthUser) {
  const projectIds = await getAccessibleProjectIds(user);

  const where: Prisma.ProjectWhereInput =
    projectIds === 'all' ? {} : { id: { in: projectIds.length ? projectIds : ['__none__'] } };

  return prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      client: true,
      manager: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function getProject(user: AuthUser, id: string) {
  await assertProjectAccess(user, id);
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      manager: { select: { id: true, name: true, email: true } },
      tasks: {
        include: {
          developer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  return project;
}

export async function createProject(
  user: AuthUser,
  data: { name: string; description?: string | null; clientId: string; managerId?: string },
) {
  if (user.role === UserRole.DEVELOPER) {
    throw new ForbiddenError();
  }

  const managerId = user.role === UserRole.ADMIN ? (data.managerId ?? user.id) : user.id;

  if (user.role === UserRole.PROJECT_MANAGER && data.managerId && data.managerId !== user.id) {
    throw new ForbiddenError();
  }

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      clientId: data.clientId,
      managerId,
    },
    include: {
      client: true,
      manager: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateProject(
  user: AuthUser,
  id: string,
  data: Partial<{ name: string; description: string | null; clientId: string }>,
) {
  await assertProjectAccess(user, id);
  if (user.role === UserRole.DEVELOPER) {
    throw new ForbiddenError();
  }
  return prisma.project.update({
    where: { id },
    data,
    include: {
      client: true,
      manager: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteProject(user: AuthUser, id: string) {
  const project = await assertProjectAccess(user, id);
  if (user.role === UserRole.DEVELOPER) {
    throw new ForbiddenError();
  }
  if (user.role === UserRole.PROJECT_MANAGER && project.managerId !== user.id) {
    throw new ForbiddenError();
  }
  return prisma.project.delete({ where: { id } });
}
