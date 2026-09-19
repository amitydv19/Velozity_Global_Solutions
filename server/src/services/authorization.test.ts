import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UserRole } from '../config/enums.js';
import { assertProjectAccess, assertTaskAccess } from './authorization.service.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { prisma } from '../config/prisma.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    task: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('authorization service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProject = {
    id: 'proj-1',
    name: 'Apollo Project',
    description: 'A mock project description',
    clientId: 'client-1',
    managerId: 'pm-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask = {
    id: 'task-1',
    title: 'Design API',
    description: 'Specs',
    projectId: 'proj-1',
    developerId: 'dev-1',
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('assertProjectAccess', () => {
    it('allows ADMIN full access to any project', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

      const adminUser = {
        id: 'admin-1',
        email: 'admin@dash.local',
        name: 'Admin',
        role: UserRole.ADMIN,
      };
      const res = await assertProjectAccess(adminUser, 'proj-1');
      expect(res.id).toBe('proj-1');
    });

    it('allows PM access only to projects they own', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

      const ownerPm = {
        id: 'pm-1',
        email: 'pm@dash.local',
        name: 'PM Owner',
        role: UserRole.PROJECT_MANAGER,
      };
      const res = await assertProjectAccess(ownerPm, 'proj-1');
      expect(res.id).toBe('proj-1');
    });

    it('rejects PM attempting to access another PM project with 403 Forbidden', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

      const otherPm = {
        id: 'pm-other',
        email: 'other@dash.local',
        name: 'Other PM',
        role: UserRole.PROJECT_MANAGER,
      };
      await expect(assertProjectAccess(otherPm, 'proj-1')).rejects.toThrow(ForbiddenError);
    });

    it('throws NotFoundError if project does not exist', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(null);

      const adminUser = {
        id: 'admin-1',
        email: 'admin@dash.local',
        name: 'Admin',
        role: UserRole.ADMIN,
      };
      await expect(assertProjectAccess(adminUser, 'proj-missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('assertTaskAccess', () => {
    it('allows DEVELOPER access to their assigned task', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValueOnce(mockTask);

      const devUser = {
        id: 'dev-1',
        email: 'dev1@dash.local',
        name: 'Dev 1',
        role: UserRole.DEVELOPER,
      };
      const res = await assertTaskAccess(devUser, 'task-1');
      expect(res.id).toBe('task-1');
    });

    it('rejects DEVELOPER attempting to access another developer task with 403 Forbidden', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValueOnce(mockTask);

      const otherDev = {
        id: 'dev-other',
        email: 'dev2@dash.local',
        name: 'Dev 2',
        role: UserRole.DEVELOPER,
      };
      await expect(assertTaskAccess(otherDev, 'task-1')).rejects.toThrow(ForbiddenError);
    });

    it('allows PM access to task in their project', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValueOnce(mockTask);
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

      const ownerPm = {
        id: 'pm-1',
        email: 'pm@dash.local',
        name: 'PM Owner',
        role: UserRole.PROJECT_MANAGER,
      };
      const res = await assertTaskAccess(ownerPm, 'task-1');
      expect(res.id).toBe('task-1');
    });

    it('rejects PM access to task in another PM project with 403 Forbidden', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValueOnce(mockTask);
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

      const otherPm = {
        id: 'pm-other',
        email: 'pmother@dash.local',
        name: 'Other PM',
        role: UserRole.PROJECT_MANAGER,
      };
      await expect(assertTaskAccess(otherPm, 'task-1')).rejects.toThrow(ForbiddenError);
    });
  });
});
