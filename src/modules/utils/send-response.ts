import { ApiResponse, SendResponseOptions } from '../auth/auth.interface';

export const sendResponse = <T = any>(options: SendResponseOptions<T>) => {
  const { res, statusCode, message, data, error, ...rest } = options;

  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data && { data }),
    ...(error && { error }),
    ...rest,
  };

  res.status(statusCode).json(response);
};
