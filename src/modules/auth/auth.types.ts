import { TInvalidFields } from '@/types';
import { z, ZodSchema } from 'zod';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokensSchema,
  registerSchema,
  resetPasswordQuerySchema,
  resetPasswordSchema,
  verifyEmailQuerySchema,
} from './auth.validation';

export interface TErrorOptions {
  statusCode: number;
  code: string;
  message: string;
  invalidFields?: TInvalidFields[] | undefined;
  data?: any;
  [key: string]: any;
}

export interface THandlerOptions {
  validation?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  };
}

// types
export type TRegisterSchema = z.infer<typeof registerSchema>;
export type TLoginSchema = z.infer<typeof loginSchema>;
export type TLogoutSchema = z.infer<typeof logoutSchema>;
export type TRefreshTokensSchema = z.infer<typeof refreshTokensSchema>;
export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type TResetPasswordQuerySchema = z.infer<typeof resetPasswordQuerySchema>;
export type TVerifyEmailQuerySchema = z.infer<typeof verifyEmailQuerySchema>;
