import config from '@/config/config';
import { ApiError, ErrorCode } from '@/modules/errors';
import { TPermission, TPermissionDoc } from '@/modules/permission';
import { rolePermissionService, TRolePermission } from '@/modules/role-permission';
import { userService } from '@/modules/user';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

/**
 * This middleware authenticates a user using the Authorization header and
 * authorizes the user to access the requested resource based on their role.
 *
 * The following steps are performed in order:
 * 1. Verify the Authorization header is present and contains a valid Bearer token.
 * 2. Decode the Bearer token to obtain the user's ID.
 * 3. Query the user by their ID and store the user in the request object.
 * 4. Query the role-permissions for the user's role and store the results in the request object.
 * 5. Check if the user has permission to access the requested resource based on their role.
 *    If the user does not have permission, an error is thrown.
 * 6. If the user has permission, the request is passed to the next middleware.
 */
export const authenticateAndAuthorize = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Authentication Part
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApiError({
          statusCode: httpStatus.UNAUTHORIZED,
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authorization header missing',
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new ApiError({
          statusCode: httpStatus.UNAUTHORIZED,
          code: ErrorCode.INVALID_TOKEN,
          message: 'Bearer token missing',
        });
      }

      const decoded = jwt.verify(token, config.jwt.secret!) as { sub: string };
      const user = await userService.queryById(decoded.sub);

      if (!user) {
        throw new ApiError({
          statusCode: httpStatus.UNAUTHORIZED,
          code: ErrorCode.USER_NOT_FOUND,
          message: 'User not found',
        });
      }

      req.user = user;

      // Authorization Part
      const resource = req.baseUrl.split('/').pop();
      if (!resource) {
        throw new ApiError({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Resource not found',
        });
      }

      const httpMethod = req.method.toUpperCase();
      const action = config.httpMethodToActionMap[httpMethod];
      if (!action) {
        throw new ApiError({
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'HTTP method not supported',
        });
      }

      const rolePermissions = await rolePermissionService.query({ role: user.role }, { populate: 'permission' });

      const hasPermission = rolePermissions.results.some((rp: TRolePermission) => {
        const permission = rp.permission as TPermissionDoc;
        return permission.resource === resource && permission.action.includes(action as TPermission['action'][number]);
      });

      if (!hasPermission) {
        throw new ApiError({
          statusCode: httpStatus.FORBIDDEN,
          code: ErrorCode.FORBIDDEN,
          message: `Access denied. You do not have permission to ${action} ${resource}.`,
        });
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(
          new ApiError({
            statusCode: httpStatus.UNAUTHORIZED,
            code: ErrorCode.INVALID_TOKEN,
            message: 'Invalid token',
          }),
        );
      } else if (error instanceof jwt.TokenExpiredError) {
        next(
          new ApiError({
            statusCode: httpStatus.UNAUTHORIZED,
            code: ErrorCode.TOKEN_EXPIRED,
            message: 'Token expired',
          }),
        );
      } else if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Authentication/Authorization failed',
          }),
        );
      }
    }
  };
};
