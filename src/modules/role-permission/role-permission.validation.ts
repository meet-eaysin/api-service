import { documentIdSchema } from '@/modules/validate';
import { z } from 'zod';

export const rolePermissionSchema = z.object({
  role: documentIdSchema,
  permission: documentIdSchema,
});

export const updateRolePermissionSchema = rolePermissionSchema.partial();

export const rolePermissionIdSchema = z.object({
  rolePermissionId: documentIdSchema,
});
