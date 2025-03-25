export { authController } from '@/modules/auth/auth.controller';
export { authService } from '@/modules/auth/auth.service';
export type {
  TErrorOptions,
  TForgotPasswordSchema,
  THandlerOptions,
  TLoginSchema,
  TLogoutSchema,
  TRefreshTokensSchema,
  TRegisterSchema,
  TResetPasswordQuerySchema,
  TResetPasswordSchema,
  TVerifyEmailQuerySchema,
} from '@/modules/auth/auth.types';
export {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokensSchema,
  registerSchema,
  resetPasswordQuerySchema,
  resetPasswordSchema,
  verifyEmailQuerySchema,
} from '@/modules/auth/auth.validation';
export { jwtStrategy } from '@/modules/auth/passport';
