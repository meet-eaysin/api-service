import { RolePermission } from '@/modules/role-permission/role-permission.model';
import * as rolePermissionService from '@/modules/role-permission/role-permission.service';
import * as rolePermissionValidation from '@/modules/role-permission/role-permission.validation';
import { rolePermissionController } from './role-permission.controller';

export { RolePermission, rolePermissionController, rolePermissionService, rolePermissionValidation };
