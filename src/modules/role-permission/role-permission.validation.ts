import { z } from 'zod';
import { documentId } from '../validate';

export const rolePermissionSchema = z.object({
  body: z.object({
    role: documentId,
    permission: documentId,
  }),
});

export const updateRolePermissionSchema = rolePermissionSchema.partial();

export const rolePermissionParamsSchema = z.object({
  params: z.object({
    rolePermissionId: documentId,
  }),
});

export type RolePermissionSchemaType = z.infer<typeof rolePermissionSchema>['body'];
export type UpdateRolePermissionSchemaType = z.infer<typeof updateRolePermissionSchema>['body'];
