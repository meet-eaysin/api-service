import mongoose, { ClientSession, Document, FilterQuery, Model } from 'mongoose';
import { IOptions, QueryResult } from '../paginate/paginate';
import { DocumentId } from '../validate';

export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface IPermission {
  resource: string;
  action: PermissionAction[]; // Changed to array
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPermissionDoc extends Document, IPermission {
  addAction(action: PermissionAction): Promise<this>;
  removeAction(action: PermissionAction): Promise<this>;
}

export interface IPermissionModel extends Model<IPermissionDoc> {
  paginate(
    filter: FilterQuery<IPermissionDoc>,
    options: IOptions,
    session?: ClientSession,
  ): Promise<QueryResult<IPermissionDoc>>;
  isPermissionTaken(resource: string, excludePermissionId?: DocumentId, session?: mongoose.ClientSession): Promise<boolean>;
}
