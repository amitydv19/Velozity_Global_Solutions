import { describe, expect, it } from 'vitest';
import { AppError, ForbiddenError, UnauthorizedError } from './errors.js';

describe('AppError hierarchy', () => {
  it('creates forbidden error with correct status', () => {
    const error = new ForbiddenError();
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('creates unauthorized error', () => {
    const error = new UnauthorizedError('bad token');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('bad token');
  });
});
