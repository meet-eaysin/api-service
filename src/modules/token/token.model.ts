import { toJSON } from '@/modules/toJSON';
import { TTokenDoc, TTokenModel } from '@/modules/token';
import mongoose from 'mongoose';

export enum TokenTypes {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

const tokenSchema = new mongoose.Schema<TTokenDoc, TTokenModel>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenTypes),
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

export const Token = mongoose.model<TTokenDoc, TTokenModel>('Token', tokenSchema);
