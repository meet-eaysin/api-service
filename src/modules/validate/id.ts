import mongoose from 'mongoose';
import { z } from 'zod';

export const documentId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export type DocumentId = mongoose.Types.ObjectId | string;
