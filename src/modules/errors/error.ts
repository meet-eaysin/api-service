import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { sendResponse } from '../utils/send-response';
import { ApiError } from './ApiError';
import { ErrorCode } from './error-codes';

export const errorConverter = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode as keyof typeof httpStatus];
    const code = error.code || ErrorCode.INTERNAL_SERVER_ERROR;

    error = new ApiError({
      statusCode,
      code,
      message,
      invalidFields: error.invalidFields,
      data: error.data,
      ...error,
    });
  }

  next(error);
};

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, code, message, invalidFields, data, ...rest } = err;

  sendResponse({
    res,
    statusCode,
    message,
    error: {
      code,
      message,
      ...(invalidFields && { invalidFields }),
      ...(data && { data }),
      ...rest,
    },
  });
};
