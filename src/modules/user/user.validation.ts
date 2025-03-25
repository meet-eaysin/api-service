import { documentIdSchema } from '@/modules/validate';
import { z } from 'zod';

// Password validation regex (now allows special characters)
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;
const Id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid document ID format');

// User validation schema
export const userSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters long').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(passwordRegex, 'Password must contain at least one letter and one number'),

  role: Id.describe('Associated role ID'),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'OnLeave', 'Pending'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
  employee: z.union([Id, z.null()]).describe('Associated employee ID if applicable'),
  isEmailVerified: z.boolean().default(false).describe('Email verification status'),
});

// Schema for updating user (password is optional)
export const updateUserSchema = userSchema.partial();

// Schema for login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const userIdSchema = z.object({
  userId: documentIdSchema,
});

export const employeeIdSchema = z.object({
  employeeId: documentIdSchema,
});
