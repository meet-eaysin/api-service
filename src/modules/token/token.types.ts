import { JwtPayload } from 'jsonwebtoken';
import { Document, Model } from 'mongoose';

export type TToken = {
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
};

export type TNewToken = Omit<TToken, 'blacklisted'>;

export type TTokenDoc = TToken & Document;
export type TTokenModel = Model<TTokenDoc>;
export type TPayload = JwtPayload & {
  sub: string;
  iat: number;
  exp: number;
  type: string;
};

export type TTokenPayload = {
  token: string;
  expires: Date;
};

export type TAccessAndRefreshTokens = {
  access: TTokenPayload;
  refresh: TTokenPayload;
};
