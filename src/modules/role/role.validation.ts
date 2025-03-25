import { documentIdSchema } from '@/modules/validate';
import { z } from 'zod';

// Base schema
export const roleSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
});

// Partial update schema (all fields optional)
export const updateRoleSchema = roleSchema.partial();

export const roleIdSchema = z.object({
  roleId: documentIdSchema,
});
