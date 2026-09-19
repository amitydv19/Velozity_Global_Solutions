import type { Server } from 'socket.io';
import { UserRole } from '../config/enums.js';
import { assertProjectAccess } from '../services/authorization.service.js';
import { getCatchUpActivities } from '../services/activity.service.js';
import type { AuthenticatedSocket } from './auth.socket.js';

export function registerActivityHandlers(_io: Server, socket: AuthenticatedSocket): void {
  const user = socket.data.user;
  if (!user) {
    return;
  }

  socket.on(
    'project:join',
    async (payload: { projectId: string }, ack?: (result: unknown) => void) => {
      try {
        await assertProjectAccess(user, payload.projectId);
        await socket.join(`project:${payload.projectId}`);
        ack?.({ success: true });
      } catch (error) {
        ack?.({
          success: false,
          message: error instanceof Error ? error.message : 'Forbidden',
        });
      }
    },
  );

  socket.on('project:leave', (payload: { projectId: string }) => {
    void socket.leave(`project:${payload.projectId}`);
  });

  socket.on('activity:catchup', async (_payload: unknown, ack?: (result: unknown) => void) => {
    try {
      const activities = await getCatchUpActivities(user, 20);
      ack?.({ success: true, activities });
      socket.emit('activity:catchup', { activities });
    } catch (error) {
      ack?.({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch activity',
      });
    }
  });

  if (user.role === UserRole.ADMIN) {
    // admins receive global activity via user room + broadcast helpers
  }
}
