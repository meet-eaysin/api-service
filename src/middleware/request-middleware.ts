import config from '@/config/config';
import { InvalidFields } from '@/modules/auth/auth.interface';
import { ApiError } from '@/modules/errors/ApiError';
import { ErrorCode } from '@/modules/errors/error-codes';
import { logger } from '@/modules/logger';
import { pick } from '@/modules/utils';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { z, ZodError, ZodSchema } from 'zod';

interface HandlerOptions {
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  };
}

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
