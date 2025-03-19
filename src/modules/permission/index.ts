import { permissionController } from '@/modules/permission/permission.controller';
import { Permission } from './permission.model';
import { permissionService } from './permission.service';
import * as permissionValidation from './permission.validation';

export { Permission, permissionController, permissionService, permissionValidation };
