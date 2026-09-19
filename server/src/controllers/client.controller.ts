import type { Request, Response, NextFunction } from 'express';
import * as clientService from '../services/client.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clients = await clientService.listClients();
    sendSuccess(res, { clients });
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = await clientService.getClient(req.params.id as string);
    sendSuccess(res, { client });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = await clientService.createClient(req.body);
    sendSuccess(res, { client }, 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = await clientService.updateClient(req.params.id as string, req.body);
    sendSuccess(res, { client });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await clientService.deleteClient(req.params.id as string);
    sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
}
