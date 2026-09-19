import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import type { AuthUser } from '../types/express.js';
import { toUserRole } from '../config/enums.js';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: AuthUser;
  };
}

export async function authenticateSocket(socket: AuthenticatedSocket): Promise<AuthUser> {
  const token =
    (socket.handshake.auth?.token as string | undefined) ??
    (socket.handshake.headers.authorization?.replace('Bearer ', '') as string | undefined);

  if (!token) {
    throw new Error('Socket authentication token required');
  }

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new Error('Socket user not found');
  }

  const authUser: AuthUser = { ...user, role: toUserRole(user.role) };
  socket.data.user = authUser;
  return authUser;
}
