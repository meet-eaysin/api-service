import config from '@/config/config';
import { ApiError } from '@/modules/errors';
import { InvalidFields } from '@/types';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';
import { ErrorCode } from '../errors/error-codes';
import { logger } from '../logger';
import { IPermission, IPermissionDoc } from '../permission/permission.interface';
import { rolePermissionService } from '../role-permission';
import { userService } from '../user';
import { pick } from '../utils';
import { HandlerOptions } from './auth.interface';

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

      const hasPermission = rolePermissions.results.some((rp) => {
        const permission = rp.permission as IPermissionDoc;
        return permission.resource === resource && permission.action.includes(action as IPermission['action'][number]);
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

export const requestMiddleware =
  <P = {}, ResBody = any, ReqBody = any, ReqQuery = any>(
    handler: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void> | void,
    options?: HandlerOptions,
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  async (req: Request<P, ResBody, ReqBody, ReqQuery>, res, next) => {
    try {
      if (options?.validation) {
        const validSchema = pick(options.validation, ['params', 'query', 'body']);
        const validationSchema = z.object(validSchema);

        await validationSchema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      }

      await handler(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const invalidFields: InvalidFields[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          messages: err.message,
        }));

        return next(
          new ApiError({
            statusCode: httpStatus.BAD_REQUEST,
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            invalidFields,
            data: {
              receivedValues: {
                body: req.body,
                query: req.query,
                params: req.params,
              },
            },
          }),
        );
      }

      if (config?.env === 'development') {
        logger.error('Request handler error', {
          error,
          url: req.originalUrl,
          method: req.method,
          body: req.body,
          params: req.params,
        });
      }

      next(error);
    }
  };
