import { ApiError } from '@/modules/errors';
import { IPermission } from '@/modules/permission/permission.interface';
import { RolePermission } from '@/modules/role-permission';
import { User } from '@/modules/user';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

const httpMethodToActionMap: { [key: string]: string } = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  DELETE: 'delete',
  PATCH: 'update',
};

const authorization = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');

      const user = await User.findById(userId).populate('role');
      if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

      const resource = req.baseUrl.split('/').pop();
      if (!resource) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Resource not found');

      const httpMethod = req.method.toUpperCase();
      const action = httpMethodToActionMap[httpMethod];
      if (!action) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'HTTP method not supported');

      const rolePermissions = await RolePermission.find({
        role: user.role,
      }).populate<{ permission: IPermission }>('permission');

      const hasPermission = rolePermissions.some((rp) => {
        return rp.permission.resource === resource && rp.permission.action.includes(action as IPermission['action'][number]);
      });

      if (!hasPermission) {
        throw new ApiError(httpStatus.FORBIDDEN, `Access denied. You do not have permission to ${action} ${resource}.`);
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error); // Use Express error handling middleware
      }
      next(new ApiError(httpStatus.FORBIDDEN, 'Authorization failed'));
    }
  };
};

export default authorization;
