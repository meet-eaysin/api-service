import { TOptions, TQueryResult } from '@/modules/paginate';
import {
  addActionSchema,
  PermissionAction,
  permissionSchema,
  removeActionSchema,
  updatePermissionSchema,
} from '@/modules/permission';
import { TDocumentId } from '@/modules/validate';
import mongoose, { ClientSession, Document, FilterQuery, Model } from 'mongoose';
import { z } from 'zod';

export type TPermission = {
  resource: string;
  action: PermissionAction[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type TPermissionDoc = Document &
  TPermission & {
    addAction(action: PermissionAction): Promise<TPermissionDoc>;
    removeAction(action: PermissionAction): Promise<TPermissionDoc>;
  };

export type TPermissionModel = Model<TPermissionDoc> & {
  paginate(
    filter: FilterQuery<TPermissionDoc>,
    options: TOptions,
    session?: ClientSession,
  ): Promise<TQueryResult<TPermissionDoc>>;
  isPermissionTaken(resource: string, excludePermissionId?: TDocumentId, session?: mongoose.ClientSession): Promise<boolean>;
};

export type TPermissionSchema = z.infer<typeof permissionSchema>;
export type TUpdatePermissionSchema = z.infer<typeof updatePermissionSchema>;
export type TAddActionBodySchema = z.infer<typeof addActionSchema>;
export type TRemoveActionSchema = z.infer<typeof removeActionSchema>;
