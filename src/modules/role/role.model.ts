import mongoose, { model, Schema } from 'mongoose';
import { paginate } from '../paginate';
import { toJSON } from '../toJSON';
import { DocumentId } from '../validate';
import { IRoleDoc, IRoleModel } from './role.interface';

const roleSchema = new Schema<IRoleDoc, IRoleModel>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true },
);

// add plugin that converts mongoose to json
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

/**
 * Check if role name is taken
 * @param {string} name - The role name to check
 * @param {DocumentId} [excludeRoleId] - The id of the role to exclude from the check
 * @param {mongoose.ClientSession} [session] - Mongoose transaction session
 * @returns {Promise<boolean>} - Returns true if the name is already taken
 */
roleSchema.static(
  'isRoleNameTaken',
  async function (name: string, excludeRoleId?: DocumentId, session?: mongoose.ClientSession): Promise<boolean> {
    const role = await this.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      ...(excludeRoleId && { _id: { $ne: excludeRoleId } }),
    }).session(session || null);

    return !!role;
  },
);

export const Role = model<IRoleDoc, IRoleModel>('Role', roleSchema);
