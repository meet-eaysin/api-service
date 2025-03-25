import { paginate } from '@/modules/paginate';
import { PermissionAction, TPermissionDoc, TPermissionModel } from '@/modules/permission';
import { toJSON } from '@/modules/toJSON';
import { TDocumentId } from '@/modules/validate';
import mongoose, { FilterQuery, model, Schema } from 'mongoose';

const permissionSchema = new Schema<TPermissionDoc, TPermissionModel>(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    action: {
      type: [String],
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
  async function (resource: string, excludePermissionId?: TDocumentId, session?: mongoose.ClientSession) {
    const query: FilterQuery<TPermissionDoc> = {
      resource: resource.toLowerCase(),
    };

    if (excludePermissionId) query._id = { $ne: excludePermissionId };

    const permission = await this.findOne(query).session(session || null);
    return !!permission;
  },
);

export const Permission = model<TPermissionDoc, TPermissionModel>('Permission', permissionSchema);
