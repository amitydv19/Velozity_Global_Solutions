import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    res.cookie(
      authService.getRefreshCookieName(),
      result.refreshToken,
      authService.getRefreshCookieOptions(result.refreshMaxAge),
    );
    sendSuccess(res, { user: result.user, accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[authService.getRefreshCookieName()] as string | undefined;
    const result = await authService.refresh(token ?? '');
    res.cookie(
      authService.getRefreshCookieName(),
      result.refreshToken,
      authService.getRefreshCookieOptions(result.refreshMaxAge),
    );
    sendSuccess(res, { user: result.user, accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[authService.getRefreshCookieName()] as string | undefined;
    await authService.logout(token);
    res.clearCookie(authService.getRefreshCookieName(), { path: '/api/auth' });
    sendSuccess(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}
