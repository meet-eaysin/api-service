import mongoose, { FilterQuery, model, Schema } from 'mongoose';
import { paginate } from '../paginate';
import { toJSON } from '../toJSON';
import { DocumentId } from '../validate';
import { IPermissionDoc, IPermissionModel, PermissionAction } from './permission.interface';

const permissionSchema = new Schema<IPermissionDoc, IPermissionModel>(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // Ensures one document per resource
      minlength: 3,
      maxlength: 50,
    },
    action: {
      type: [String], // Array of actions
      required: true,
      enum: Object.values(PermissionAction),
      set: (values: PermissionAction[]) => values.map((value) => value.toLowerCase()),
      validate: {
        validator: (actions: string[]) => new Set(actions).size === actions.length,
        message: 'Duplicate actions found in array',
      },
    },
  },
  {
    timestamps: true,
  },
);

permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

permissionSchema.static(
  'isResourceTaken',
  async function (resource: string, excludePermissionId?: DocumentId, session?: mongoose.ClientSession) {
    const query: FilterQuery<IPermissionDoc> = {
      resource: resource.toLowerCase(),
    };

    if (excludePermissionId) query._id = { $ne: excludePermissionId };

    const permission = await this.findOne(query).session(session || null);
    return !!permission;
  },
);

export const Permission = model<IPermissionDoc, IPermissionModel>('Permission', permissionSchema);
