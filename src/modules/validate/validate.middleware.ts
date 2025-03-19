import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { AnyZodObject, z, ZodError } from 'zod';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';

const validate =
  (schema: Record<string, AnyZodObject>) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const validationSchema = z.object(validSchema);

    try {
      await validationSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((err) => {
            const field = err.path[err.path.length - 1];
            return `${err.message}${field ? ` (${field})` : ''}`;
          })
          .join(', ');
        next(new ApiError(httpStatus.BAD_REQUEST, errorMessages));
      } else {
        next(error);
      }
    }
  };

export default validate;
