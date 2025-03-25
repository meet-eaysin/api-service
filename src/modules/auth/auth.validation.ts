// auth.schema.ts
import { z } from 'zod';
import { passwordSchema } from '../validate/custom.validation';

// Register
export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required'),
});

// Login
export const loginSchema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Logout
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Refresh Tokens
export const refreshTokensSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Reset Password
export const resetPasswordQuerySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

// Verify Email
export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
