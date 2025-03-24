import { Response } from 'express';

export interface InvalidFields {
  field: string;
  messages: string;
}

export interface ResponseError {
  code: string;
  message: string;
  invalidFields?: InvalidFields[];
  data?: any;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ResponseError;
  [key: string]: any;
}

export interface SendResponseOptions<T = any> {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
  error?: ResponseError;
  [key: string]: any;
}

export interface ApiErrorOptions {
  statusCode: number;
  code: string;
  message: string;
  invalidFields?: InvalidFields[] | undefined;
  data?: any;
  [key: string]: any;
}
