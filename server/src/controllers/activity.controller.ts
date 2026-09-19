import type { Request, Response, NextFunction } from 'express';
import * as activityService from '../services/activity.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { z } from 'zod';

const activityQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = activityQuerySchema.parse(req.query);
    const activity = await activityService.listActivity(req.user!, query.projectId);
    sendSuccess(res, { activity });
  } catch (error) {
    next(error);
  }
}
