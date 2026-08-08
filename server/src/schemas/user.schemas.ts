import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().transform(v => v.toUpperCase()).pipe(
    z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'])
  ),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.string().transform(v => v.toUpperCase()).pipe(
    z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'])
  ).optional(),
  isActive: z.boolean().optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
