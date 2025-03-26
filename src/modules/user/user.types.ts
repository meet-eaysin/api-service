import { TQueryResult } from '@/modules/paginate';
import { TAccessAndRefreshTokens } from '@/modules/token';
import { updateUserSchema, userIdSchema, userSchema } from '@/modules/user';
import { TDocumentId } from '@/modules/validate';
import { ClientSession, Document, Model, Types } from 'mongoose';
import { z } from 'zod';
import { employeeIdSchema } from '../employee';

export type TUser = {
  username: string;
  name: string;
  password: string;
  email: string;
  isEmailVerified: boolean;
  role: Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Suspended' | 'OnLeave' | 'Pending';
  employee: Types.ObjectId;
};

export type TUserDoc = TUser &
  Document & {
    isPasswordMatch(password: string): Promise<boolean>;
  };

export type TUserModel = Model<TUserDoc> & {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>,
    session?: ClientSession,
  ): Promise<TQueryResult<TUserDoc>>;
  isUsernameTaken(username: string, excludeUserId?: TDocumentId, session?: ClientSession): Promise<boolean>;
  isEmailTaken(email: string, excludeUserId?: TDocumentId, session?: ClientSession): Promise<boolean>;
};

export type TUserWithTokens = {
  user: TUserDoc;
  tokens: TAccessAndRefreshTokens;
};

// Type definitions
export type TUserIdSchema = z.infer<typeof userIdSchema>;
export type TUserSchema = z.infer<typeof userSchema>;
export type TUpdateUserSchema = z.infer<typeof updateUserSchema>;
export type TEmployeeIdSchema = z.infer<typeof employeeIdSchema>;
