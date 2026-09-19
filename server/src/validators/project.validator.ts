import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  clientId: z.string().cuid(),
  managerId: z.string().cuid().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  clientId: z.string().cuid().optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().cuid(),
});
