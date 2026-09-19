import type { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dashboard = await dashboardService.getDashboard(req.user!);
    sendSuccess(res, dashboard);
  } catch (error) {
    next(error);
  }
}
