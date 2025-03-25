import { TApiError, TApiResponse } from '@/types';
import { Response } from 'express';

export interface SendResponseOptions<T = any> {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
  error?: TApiError;
  [key: string]: any;
}

export const sendResponse = <T = any>(options: SendResponseOptions<T>) => {
  const { res, statusCode, message, data, error, ...rest } = options;

  const response: TApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data && { data }),
    ...(error && { error }),
    ...rest,
  };

  res.status(statusCode).json(response);
};
