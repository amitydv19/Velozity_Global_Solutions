import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { comparePassword, hashPassword, hashToken } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { AuthUser } from '../types/express.js';
import { UnauthorizedError } from '../utils/errors.js';
import { toUserRole } from '../config/enums.js';

const REFRESH_COOKIE = 'refreshToken';

export function getRefreshCookieName(): string {
  return REFRESH_COOKIE;
}

export function getRefreshCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: maxAgeMs,
    path: '/api/auth',
  };
}

function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}

export async function login(
  email: string,
  password: string,
): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  refreshMaxAge: number;
}> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: toUserRole(user.role),
  };

  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    user: authUser,
    accessToken,
    refreshToken,
    refreshMaxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  };
}

export async function refresh(refreshToken: string): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  refreshMaxAge: number;
}> {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    throw new UnauthorizedError('Refresh token revoked or expired');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const newRefresh = signRefreshToken(user.id);
  const newHash = hashToken(newRefresh);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
    },
  });

  return {
    user: { ...user, role: toUserRole(user.role) },
    accessToken: signAccessToken({ ...user, role: toUserRole(user.role) }),
    refreshToken: newRefresh,
    refreshMaxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  };
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { userId: payload.sub, tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // ignore invalid token on logout
  }
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  return { ...user, role: toUserRole(user.role) };
}

export { hashPassword };
