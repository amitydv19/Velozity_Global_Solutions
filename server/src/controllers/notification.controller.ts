import type { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [notifications, unreadCount] = await Promise.all([
      notificationService.listNotifications(req.user!.id),
      notificationService.getUnreadCount(req.user!.id),
    ]);
    sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await notificationService.markRead(req.params.id as string, req.user!.id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    const unreadCount = await notificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, { notification, unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const unreadCount = await notificationService.markAllRead(req.user!.id);
    sendSuccess(res, { unreadCount });
  } catch (error) {
    next(error);
  }
}
