// permission.validation.ts
import { z } from 'zod';
import { documentId } from '../validate';
import { PermissionAction } from './permission.interface';

export const createPermissionBody = z.object({
  resource: z.string().min(3).max(50),
  action: z.array(z.nativeEnum(PermissionAction)).min(1),
});

export const updatePermissionBody = createPermissionBody.partial();

export const permissionParamsSchema = z.object({
  permissionId: documentId,
});

// Action management schemas
export const addActionBody = z.object({
  actions: z.array(z.nativeEnum(PermissionAction)).min(1),
});

export const removeActionBody = z.object({
  actions: z.array(z.nativeEnum(PermissionAction)).min(1),
});

export type CreatePermissionBody = z.infer<typeof createPermissionBody>;
export type UpdatePermissionBody = z.infer<typeof updatePermissionBody>;
export type AddActionBody = z.infer<typeof addActionBody>;
export type RemoveActionBody = z.infer<typeof removeActionBody>;
