import { PermissionAction } from '@/modules/permission';
import { documentIdSchema } from '@/modules/validate';
import { z } from 'zod';

export const permissionSchema = z.object({
  resource: z.string().min(3).max(50),
  action: z.array(z.nativeEnum(PermissionAction)).min(1),
});

export const updatePermissionSchema = permissionSchema.partial();

export const permissionIdSchema = z.object({
  permissionId: documentIdSchema,
});

// Action management schemas
export const addActionSchema = z.object({
  actions: z.array(z.nativeEnum(PermissionAction)).min(1),
});

export const removeActionSchema = z.object({
  actions: z.array(z.nativeEnum(PermissionAction)).min(1),
});
