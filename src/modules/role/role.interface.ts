import mongoose, { Document, FilterQuery, Model } from 'mongoose';
import { IOptions, QueryResult } from '../paginate/paginate';
import { DocumentId } from '../validate';

export interface IRole {
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoleDoc extends IRole, Document {}

export interface IRoleModel extends Model<IRoleDoc> {
  paginate(
    filter: FilterQuery<IRoleDoc>,
    options: IOptions,
    session?: mongoose.ClientSession,
  ): Promise<QueryResult<IRoleDoc>>;
  isRoleNameTaken(name: string, excludeRoleId?: DocumentId, session?: mongoose.ClientSession): Promise<boolean>;
}
