import { TaskStatus, UserRole } from '../config/enums.js';
import { prisma } from '../config/prisma.js';
import type { AuthUser } from '../types/express.js';
import { getAccessibleProjectIds } from './authorization.service.js';
import { getOnlineUserCount } from './presence.service.js';
import { listActivity } from './activity.service.js';

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export async function getDashboard(user: AuthUser) {
  if (user.role === UserRole.ADMIN) {
    const [totalProjects, totalTasks, tasksByStatus, overdueCount, activity] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.task.count({ where: { status: TaskStatus.OVERDUE } }),
      listActivity(user),
    ]);

    return {
      role: user.role,
      stats: {
        totalProjects,
        totalTasks,
        tasksByStatus: Object.fromEntries(
          tasksByStatus.map((row) => [row.status, row._count._all]),
        ),
        overdueCount,
        onlineUsers: getOnlineUserCount(),
      },
      activity,
    };
  }

  if (user.role === UserRole.PROJECT_MANAGER) {
    const projectIds = await getAccessibleProjectIds(user);
    const ids = projectIds === 'all' ? undefined : projectIds;

    const [projects, tasks, tasksByPriority, upcoming, activity] = await Promise.all([
      prisma.project.findMany({
        where: ids ? { id: { in: ids } } : {},
        include: { _count: { select: { tasks: true } } },
      }),
      prisma.task.findMany({
        where: ids ? { projectId: { in: ids } } : {},
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: ids ? { projectId: { in: ids } } : {},
        _count: { _all: true },
      }),
      prisma.task.findMany({
        where: {
          ...(ids ? { projectId: { in: ids } } : {}),
          dueDate: {
            gte: startOfWeek(new Date()),
            lte: endOfWeek(new Date()),
          },
          status: { notIn: [TaskStatus.DONE] },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      listActivity(user),
    ]);

    const summary = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      inReview: tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      overdue: tasks.filter((t) => t.status === TaskStatus.OVERDUE).length,
    };

    return {
      role: user.role,
      stats: {
        projects,
        taskSummary: summary,
        tasksByPriority: Object.fromEntries(
          tasksByPriority.map((row) => [row.priority, row._count._all]),
        ),
        upcomingDueThisWeek: upcoming,
      },
      activity,
    };
  }

  const tasks = await prisma.task.findMany({
    where: { developerId: user.id },
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  tasks.sort((a, b) => {
    const p = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (p !== 0) return p;
    const aDue = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });

  return {
    role: user.role,
    stats: {
      assignedTasks: tasks,
    },
    activity: await listActivity(user),
  };
}
