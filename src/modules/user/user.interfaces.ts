import { ClientSession, Document, Model, Types } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from '../token/token.interfaces';
import { DocumentId } from '../validate';

export interface IUser {
  username: string;
  name: string;
  password: string;
  email: string;
  isEmailVerified: boolean;
  role: Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Suspended' | 'OnLeave' | 'Pending';
  employee: Types.ObjectId;
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>,
    session?: ClientSession,
  ): Promise<QueryResult<IUserDoc>>;
  isUsernameTaken(username: string, excludeUserId?: DocumentId, session?: ClientSession): Promise<boolean>;
  isEmailTaken(email: string, excludeUserId?: DocumentId, session?: ClientSession): Promise<boolean>;
}

export interface IUserWithTokens {
  user: IUserDoc;
  tokens: AccessAndRefreshTokens;
}
