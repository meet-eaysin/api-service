import { Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../errors';

export const handleZodValidationError = (error: ZodError, res: Response, type: 'body' | 'query' | 'params') => {
  const message = `Invalid ${type} data`;
  const details = error.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));

  // Create ApiError and send it
  const apiError = new ApiError(400, message, false, JSON.stringify(details));
  return res.status(400).json({
    code: apiError.statusCode,
    message: apiError.message,
    details: apiError.stack,
  });
};
