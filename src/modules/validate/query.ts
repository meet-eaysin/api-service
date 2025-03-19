import { z } from 'zod';

export const querySchema = z.object({
  sortBy: z.string().default('-createdAt'),
  projectBy: z.string().optional(),
  populate: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
});

export type QuerySchema = z.infer<typeof querySchema>;
