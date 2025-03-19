import bcrypt from 'bcryptjs';
import mongoose, { ClientSession, Schema } from 'mongoose';
import validator from 'validator';
import paginate from '../paginate/paginate';
import toJSON from '../toJSON/toJSON';
import { DocumentId } from '../validate/id';
import { IUserDoc, IUserModel } from './user.interfaces';

const userSchema = new mongoose.Schema<IUserDoc, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'OnLeave', 'Pending'],
      default: 'Pending',
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.static(
  'isEmailTaken',
  async function (email: string, excludeUserId?: DocumentId, session?: ClientSession): Promise<boolean> {
    const query: any = { email: email.toLowerCase() };
    if (excludeUserId) query._id = { $ne: excludeUserId };

    const user = await this.findOne(query)
      .session(session || null)
      .select('_id')
      .lean();
    return !!user;
  },
);

userSchema.method('isPasswordMatch', async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.static(
  'isUsernameTaken',
  async function (username: string, excludeUserId?: DocumentId, session?: ClientSession): Promise<boolean> {
    const query: any = {
      username: { $regex: new RegExp(`^${username}$`, 'i') },
    };
    if (excludeUserId) query._id = { $ne: excludeUserId };

    const user = await this.findOne(query)
      .session(session || null)
      .select('_id')
      .lean();
    return !!user;
  },
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to exclude
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<boolean>} - True if email is taken, false otherwise
 */
userSchema.static(
  'isEmailTaken',
  async function (email: string, excludeUserId?: DocumentId, session?: ClientSession): Promise<boolean> {
    const query: any = {
      email: email.toLowerCase(),
      _id: { $ne: excludeUserId },
    };

    const user = await this.findOne(query)
      .session(session || null)
      .select('_id')
      .lean();

    return !!user;
  },
);

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export default User;
