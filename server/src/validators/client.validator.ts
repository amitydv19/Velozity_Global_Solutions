import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  company: z.string().max(200).optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

export const clientIdParamSchema = z.object({
  id: z.string().cuid(),
});
