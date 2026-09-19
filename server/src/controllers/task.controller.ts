import type { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import type { TaskPriority, TaskStatus } from '../config/enums.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as {
      status?: TaskStatus;
      priority?: TaskPriority;
      dueFrom?: Date;
      dueTo?: Date;
      projectId?: string;
    };
    const tasks = await taskService.listTasks(req.user!, query);
    sendSuccess(res, { tasks });
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.getTask(req.user!, req.params.id as string);
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.createTask(req.user!, req.body);
    sendSuccess(res, { task }, 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.updateTask(req.user!, req.params.id as string, req.body);
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.updateTaskStatus(
      req.user!,
      req.params.id as string,
      req.body.status,
    );
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.deleteTask(req.user!, req.params.id as string);
    sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
}
