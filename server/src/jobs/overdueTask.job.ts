import cron from 'node-cron';
import { TaskStatus } from '../config/enums.js';
import { prisma } from '../config/prisma.js';
import { emitActivityToAuthorizedClients } from '../services/activity.service.js';

const SYSTEM_USER_ID = 'system-overdue-job';

export function startOverdueTaskJob(): void {
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const overdueCandidates = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: [TaskStatus.DONE, TaskStatus.OVERDUE] },
      },
    });

    for (const task of overdueCandidates) {
      const oldStatus = task.status;
      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.task.update({
          where: { id: task.id },
          data: { status: TaskStatus.OVERDUE },
        });

        let userId = SYSTEM_USER_ID;
        const admin = await tx.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
        if (admin) {
          userId = admin.id;
        }

        await tx.activity.create({
          data: {
            userId,
            projectId: task.projectId,
            taskId: task.id,
            oldStatus,
            newStatus: TaskStatus.OVERDUE,
            message: `Task marked OVERDUE by scheduled job`,
          },
        });

        return result;
      });

      const activity = await prisma.activity.findFirst({
        where: { taskId: updated.id },
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
    }
  });
}
