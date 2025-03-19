import { ClientSession, Document, FilterQuery, Model, Types } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { IPermissionDoc } from '../permission/permission.interface';
import { IRoleDoc } from '../role/role.interface';
import { DocumentId } from '../validate/id';

export interface IRolePermission {
  role: Types.ObjectId | IRoleDoc;
  permission: Types.ObjectId | IPermissionDoc;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRolePermissionDoc extends IRolePermission, Document {}

export interface IRolePermissionModel extends Model<IRolePermissionDoc> {
  paginate(
    filter: FilterQuery<IRolePermissionDoc>,
    options: any,
    session?: ClientSession,
  ): Promise<QueryResult<IRolePermissionDoc>>;
  isRolePermissionExists(roleId: DocumentId, permissionId: DocumentId, excludeId?: DocumentId): Promise<boolean>;
}
