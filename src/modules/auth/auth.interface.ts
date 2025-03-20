import { InvalidFields } from '@/types';
import { ZodSchema } from 'zod';

export interface ErrorOptions {
  statusCode: number;
  code: string;
  message: string;
  invalidFields?: InvalidFields[] | undefined;
  data?: any;
  [key: string]: any;
}

export interface HandlerOptions {
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  };
}
