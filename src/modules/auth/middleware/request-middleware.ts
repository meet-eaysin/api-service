import config from '@/config/config';
import { THandlerOptions } from '@/modules/auth';
import { ApiError, ErrorCode } from '@/modules/errors';
import { logger } from '@/modules/logger';
import { pick } from '@/modules/utils';
import { TInvalidFields } from '@/types';

/**
 * Middleware to handle request validation and error handling for route handlers.
 *
 * @template P - Type for request parameters.
 * @template ResBody - Type for response body.
 * @template ReqBody - Type for request body.
 * @template ReqQuery - Type for request query.
 *
 * @param {Function} handler - The main controller function to handle the request.
 * @param {THandlerOptions} options - Optional settings for validation.
 * @param {Object} options.validation - Object containing validation schemas.
 * @param {ZodSchema} [options.validation.params] - Validation schema for request parameters.
 * @param {ZodSchema} [options.validation.query] - Validation schema for request query.
 * @param {ZodSchema} [options.validation.body] - Validation schema for request body.
 *
 * @returns {RequestHandler<P, ResBody, ReqBody, ReqQuery>} - An Express request handler.
 *
 * @description
 * This middleware validates the request using the specified Zod schemas if provided
 * in the options. If validation fails, it passes a validation error to the next
 * middleware. It also catches any errors thrown by the handler and logs them
 * in development mode.
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodError } from 'zod';

export const requestMiddleware = <P = {}, ResBody = any, ReqBody = any, ReqQuery = any>(
  handler: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void> | void,
  options?: THandlerOptions,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => {
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
        const invalidFields: TInvalidFields[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          messages: err.message,
        }));
        return next(
          new ApiError({
            statusCode: 400,
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
};
