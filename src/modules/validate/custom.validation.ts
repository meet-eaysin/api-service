import { z } from 'zod';

// Password Validation Schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((value) => /[0-9]/.test(value), {
    message: 'Password must contain at least 1 number',
  })
  .refine((value) => /[a-zA-Z]/.test(value), {
    message: 'Password must contain at least 1 letter',
  });

// Type exports
export type PasswordType = z.infer<typeof passwordSchema>;
