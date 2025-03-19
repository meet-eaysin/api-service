import { userService } from '@/modules/user/user.service';
import * as userController from './user.controller';
import * as userInterfaces from './user.interfaces';
import User from './user.model';
import * as userValidation from './user.validation';

export { User, userController, userInterfaces, userService, userValidation };
