export { permissionController } from '@/modules/permission/permission.controller';
export { PermissionAction } from './permission.enum';
export { Permission } from './permission.model';
export { permissionService } from './permission.service';
export {
  type TAddActionBodySchema,
  type TPermission,
  type TPermissionDoc,
  type TPermissionModel,
  type TPermissionSchema,
  type TRemoveActionSchema,
  type TUpdatePermissionSchema,
} from './permission.types';
export {
  addActionSchema,
  permissionIdSchema,
  permissionSchema,
  removeActionSchema,
  updatePermissionSchema,
} from './permission.validation';
