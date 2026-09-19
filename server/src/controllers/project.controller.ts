import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await projectService.listProjects(req.user!);
    sendSuccess(res, { projects });
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.getProject(req.user!, req.params.id as string);
    sendSuccess(res, { project });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.createProject(req.user!, req.body);
    sendSuccess(res, { project }, 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.updateProject(
      req.user!,
      req.params.id as string,
      req.body,
    );
    sendSuccess(res, { project });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectService.deleteProject(req.user!, req.params.id as string);
    sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
}
