import { z } from 'zod';
import { documentId } from '../validate';

// Base schema
export const roleSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
});

// Partial update schema (all fields optional)
export const updateRoleSchema = roleSchema.partial();

export const roleParamsSchema = z.object({
  roleId: documentId,
});

// Type definitions
export type RoleParamsSchemaType = z.infer<typeof roleParamsSchema>;
export type RoleSchemaType = z.infer<typeof roleSchema>;
export type UpdateRoleSchemaType = z.infer<typeof updateRoleSchema>;
