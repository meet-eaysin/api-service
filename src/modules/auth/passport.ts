import config from '@/config/config';
import { TPayload } from '@/modules/token';
import { User } from '@/modules/user';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { TokenTypes } from '../token/token.model';

export const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (payload: TPayload, done) => {
    try {
      if (payload.type !== TokenTypes.ACCESS) {
        throw new Error('Invalid token type');
      }
      const user = await User.findById(payload.sub);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  },
);
