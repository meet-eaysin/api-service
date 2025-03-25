export { RolePermission } from '@/modules/role-permission/role-permission.model';
export { rolePermissionService } from '@/modules/role-permission/role-permission.service';
export {
  rolePermissionIdSchema,
  rolePermissionSchema,
  updateRolePermissionSchema,
} from '@/modules/role-permission/role-permission.validation';
export { rolePermissionController } from './role-permission.controller';
export {
  TRolePermission,
  TRolePermissionDoc,
  TRolePermissionIdSchema,
  TRolePermissionModel,
  TRolePermissionSchema,
  TUpdateRolePermissionSchema,
} from './role-permission.types';
