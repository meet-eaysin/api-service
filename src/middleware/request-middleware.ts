import config from '@/config/config';
import { ApiError } from '@/modules/errors';
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
      // Extract and validate provided schemas
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
        const errorMessages = error.errors.map((err) => `${err.message} (${err.path.join('.')})`).join(', ');
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessages));
      }

      if (config?.env === 'development') {
        logger.error('Error in request handler', { error });
      }

      next(error);
    }
  };
