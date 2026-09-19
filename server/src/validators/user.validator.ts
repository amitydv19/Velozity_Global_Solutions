import { UserRole } from '../config/enums.js';
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(200),
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(1).max(200).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().cuid(),
});
