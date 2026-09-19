import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    sendError(res, 'VALIDATION_ERROR', message, 400);
    return;
  }

  if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
