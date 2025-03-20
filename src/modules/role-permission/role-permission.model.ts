import mongoose, { model, Schema, Types } from 'mongoose';
import { paginate } from '../paginate';
import { toJSON } from '../toJSON';
import { DocumentId } from '../validate';
import { IRolePermissionDoc, IRolePermissionModel } from './role-permission.interface';

const rolePermissionSchema = new Schema<IRolePermissionDoc, IRolePermissionModel>(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      validate: {
        validator: async function (value: Types.ObjectId) {
          const session = this.$session();
          const role = await mongoose
            .model('Role')
            .findById(value)
            .session(session || null);
          return !!role;
        },
        message: 'Role does not exist',
      },
    },
    permission: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
      validate: {
        validator: async function (value: Types.ObjectId) {
          const session = this.$session();
          const permission = await mongoose
            .model('Permission')
            .findById(value)
            .session(session || null);
          return !!permission;
        },
        message: 'Permission does not exist',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add plugins
rolePermissionSchema.plugin(toJSON);
rolePermissionSchema.plugin(paginate);

// Indexes
rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });
rolePermissionSchema.index({ createdAt: 1 });
rolePermissionSchema.index({ updatedAt: 1 });

// Static methods
rolePermissionSchema.static(
  'isRolePermissionExists',
  async function (roleId: DocumentId, permissionId: DocumentId, excludeId?: DocumentId): Promise<boolean> {
    const query: mongoose.FilterQuery<IRolePermissionDoc> = {
      role: roleId,
      permission: permissionId,
    };

    if (excludeId) query._id = { $ne: excludeId };

    const exists = await this.findOne(query);
    return !!exists;
  },
);

// Virtual
rolePermissionSchema.virtual('combined').get(function (this: IRolePermissionDoc) {
  return `${this.role}:${this.permission}`;
});

export const RolePermission = model<IRolePermissionDoc, IRolePermissionModel>('RolePermission', rolePermissionSchema);
