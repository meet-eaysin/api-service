// auth.schema.ts
import { z } from 'zod';
import { passwordSchema } from '../validate/custom.validation';

// Register
export const registerBodySchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required'),
});

// Login
export const loginBodySchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Logout
export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Refresh Tokens
export const refreshTokensBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Forgot Password
export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

// Reset Password
export const resetPasswordQuerySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const resetPasswordBodySchema = z.object({
  password: passwordSchema,
});

// Verify Email
export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// types
export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type LogoutBody = z.infer<typeof logoutBodySchema>;
export type RefreshTokensBody = z.infer<typeof refreshTokensBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type ResetPasswordQuery = z.infer<typeof resetPasswordQuerySchema>;

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;
