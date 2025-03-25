import { TOptions, TQueryResult } from '@/modules/paginate';
import { roleIdSchema, roleSchema, updateRoleSchema } from '@/modules/role';
import { TDocumentId } from '@/modules/validate';
import mongoose, { Document, FilterQuery, Model } from 'mongoose';
import { z } from 'zod';

export type TRole = {
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TRoleDoc = TRole & Document;

export type TRoleModel = Model<TRoleDoc> & {
  paginate(
    filter: FilterQuery<TRoleDoc>,
    options: TOptions,
    session?: mongoose.ClientSession,
  ): Promise<TQueryResult<TRoleDoc>>;
  isRoleNameTaken(name: string, excludeRoleId?: TDocumentId, session?: mongoose.ClientSession): Promise<boolean>;
};

export type TRoleIdSchema = z.infer<typeof roleIdSchema>;
export type TRoleSchema = z.infer<typeof roleSchema>;
export type TUpdateRoleSchema = z.infer<typeof updateRoleSchema>;
