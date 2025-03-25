import { paginate } from '@/modules/paginate';
import { TRolePermissionDoc, TRolePermissionModel } from '@/modules/role-permission';
import { toJSON } from '@/modules/toJSON';
import { TDocumentId } from '@/modules/validate';
import mongoose, { model, Schema, Types } from 'mongoose';

const rolePermissionSchema = new Schema<TRolePermissionDoc, TRolePermissionModel>(
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
  async function (roleId: TDocumentId, permissionId: TDocumentId, excludeId?: TDocumentId): Promise<boolean> {
    const query: mongoose.FilterQuery<TRolePermissionDoc> = {
      role: roleId,
      permission: permissionId,
    };

    if (excludeId) query._id = { $ne: excludeId };

    const exists = await this.findOne(query);
    return !!exists;
  },
);

// Virtual
rolePermissionSchema.virtual('combined').get(function (this: TRolePermissionDoc) {
  return `${this.role}:${this.permission}`;
});

export const RolePermission = model<TRolePermissionDoc, TRolePermissionModel>('RolePermission', rolePermissionSchema);
