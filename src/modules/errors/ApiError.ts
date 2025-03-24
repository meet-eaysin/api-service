import { ApiErrorOptions, InvalidFields } from '../auth/auth.interface';

export class ApiError extends Error {
  statusCode: number;
  code: string;
  invalidFields?: InvalidFields[];
  data?: any;
  [key: string]: any;

  constructor(options: ApiErrorOptions) {
    super(options.message);

    this.name = 'ApplicationError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.invalidFields = options.invalidFields || [];
    this.data = options.data;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Assign additional properties
    Object.entries(options).forEach(([key, value]) => {
      if (!Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value;
      }
    });
  }
}
