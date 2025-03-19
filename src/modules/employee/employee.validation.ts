import { z } from 'zod';
import { documentId } from '../validate';

export const employeeSchema = z.object({
  user: z.string().min(1, { message: 'User ID is required' }),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().regex(/^\+\d{1,15}$/),
  date_of_birth: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zip_code: z.string(),
  date_of_hire: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()),
  job_title: z.string().optional(),
  department: z
    .object({
      department_id: z.string(),
    })
    .optional(),
  manager: z
    .object({
      manager_id: z.string(),
    })
    .optional(),
  position: z.object({
    position_id: z.string(),
  }),
  salary: z.number().positive(),
  employment_status: z.enum(['Active', 'Inactive', 'Suspended', 'Terminated']),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  // profile_picture: z.string().url().optional(),
});

export const updateEmployeeSchema = employeeSchema.partial();

export const employeeParamsSchema = z.object({
  employeeId: documentId,
});

export const employeeQueryByUserIdSchema = z.object({
  userId: documentId,
});

//types
export type EmployeeSchemaType = z.infer<typeof employeeSchema>;
export type UpdateEmployeeSchemaType = z.infer<typeof updateEmployeeSchema>;
