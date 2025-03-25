import { TQueryResult } from '@/modules/paginate';
import { TPermissionDoc } from '@/modules/permission';
import { TRoleDoc } from '@/modules/role';
import { rolePermissionIdSchema, rolePermissionSchema, updateRolePermissionSchema } from '@/modules/role-permission';
import { TDocumentId } from '@/modules/validate';

import { ClientSession, Document, FilterQuery, Model, Types } from 'mongoose';
import { z } from 'zod';

export type TRolePermission = {
  role: Types.ObjectId | TRoleDoc;
  permission: Types.ObjectId | TPermissionDoc;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TRolePermissionDoc = TRolePermission & Document;

export type TRolePermissionModel = Model<TRolePermissionDoc> & {
  paginate(
    filter: FilterQuery<TRolePermissionDoc>,
    options: any,
    session?: ClientSession,
  ): Promise<TQueryResult<TRolePermissionDoc>>;
  isRolePermissionExists(roleId: TDocumentId, permissionId: TDocumentId, excludeId?: TDocumentId): Promise<boolean>;
};

export type TRolePermissionSchema = z.infer<typeof rolePermissionSchema>;
export type TUpdateRolePermissionSchema = z.infer<typeof updateRolePermissionSchema>;
export type TRolePermissionIdSchema = z.infer<typeof rolePermissionIdSchema>;
