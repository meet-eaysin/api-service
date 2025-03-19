import config from '@/config/config';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/ApiError';
import { IPermission, IPermissionDoc } from '../permission/permission.interface';
import { rolePermissionService } from '../role-permission';
import { userService } from '../user';

const authenticateAndAuthorize = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Authentication Part
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header missing');

      const token = authHeader.split(' ')[1];
      if (!token) throw new ApiError(httpStatus.UNAUTHORIZED, 'Bearer token missing');

      const decoded = jwt.verify(token, config.jwt.secret!) as { sub: string };

      const user = await userService.queryById(decoded.sub);
      if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');

      req.user = user;

      // Authorization Part
      const resource = req.baseUrl.split('/').pop();
      if (!resource) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Resource not found');

      const httpMethod = req.method.toUpperCase();

      const action = config.httpMethodToActionMap[httpMethod];
      if (!action) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'HTTP method not supported');

      const rolePermissions = await rolePermissionService.query({ role: user.role }, { populate: 'permission' });

      const hasPermission = rolePermissions.results.some((rp) => {
        const permission = rp.permission as IPermissionDoc;
        return permission.resource === resource && permission.action.includes(action as IPermission['action'][number]);
      });

      if (!hasPermission) {
        throw new ApiError(httpStatus.FORBIDDEN, `Access denied. You do not have permission to ${action} ${resource}.`);
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
      } else if (error instanceof jwt.TokenExpiredError) {
        next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
      } else if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(httpStatus.FORBIDDEN, 'Authentication/Authorization failed'));
      }
    }
  };
};

export default authenticateAndAuthorize;
