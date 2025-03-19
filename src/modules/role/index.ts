import { Role } from '@/modules/role/role.model';
import { roleService } from '@/modules/role/role.service';
import { roleController } from './role.controller';
import * as roleValidation from './role.validation';

export { Role, roleController, roleService, roleValidation };
