import { describe, expect, it } from 'vitest';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt.js';
import type { AuthUser } from '../types/express.js';

describe('jwt utils', () => {
  const user: AuthUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'DEVELOPER',
  };

  it('signs and verifies access tokens', () => {
    const token = signAccessToken(user);
    expect(typeof token).toBe('string');

    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.name).toBe(user.name);
    expect(payload.role).toBe('DEVELOPER');
  });

  it('signs and verifies refresh tokens', () => {
    const token = signRefreshToken(user.id);
    expect(typeof token).toBe('string');

    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe(user.id);
  });

  it('throws on tampered tokens', () => {
    const token = signAccessToken(user);
    const tampered = token.slice(0, -5) + 'abcde';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
