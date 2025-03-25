import { ApiError, ErrorCode } from '@/modules/errors';
import { Token, tokenService } from '@/modules/token';
import { TUserDoc, TUserWithTokens, userService } from '@/modules/user';
import { getErrorData } from '@/modules/utils';
import httpStatus from 'http-status';
import { TokenTypes } from '../token/token.model';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<IUserDoc>}
 */
const loginUserWithEmailAndPassword = async (email: string, password: string): Promise<TUserDoc> => {
  const user = await userService.getByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError({
      statusCode: httpStatus.UNAUTHORIZED,
      code: ErrorCode.INVALID_CREDENTIALS,
      message: 'Incorrect email or password',
      data: getErrorData({ email }),
    });
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: TokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.TOKEN_NOT_FOUND,
      message: 'Refresh token not found',
    });
  }

  await refreshTokenDoc.deleteOne();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<TUserWithTokens>}
 */
const refreshAuth = async (refreshToken: string): Promise<TUserWithTokens> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TokenTypes.REFRESH);
    const user = await userService.queryById(refreshTokenDoc.user);

    if (!user) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User associated with token not found',
      });
    }

    await refreshTokenDoc.deleteOne();
    const tokens = await tokenService.generateAuthTokens(user);

    return { user, tokens };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new ApiError({
      statusCode: httpStatus.UNAUTHORIZED,
      code: ErrorCode.INVALID_TOKEN,
      message: 'Invalid refresh token',
      data: getErrorData({ error: errorMessage }),
    });
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const resetPassword = async (resetPasswordToken: string, newPassword: string): Promise<void> => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, TokenTypes.RESET_PASSWORD);
    const user = await userService.queryById(resetPasswordTokenDoc.user);

    if (!user) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User associated with token not found',
      });
    }

    await userService.updateById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: TokenTypes.RESET_PASSWORD });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    throw new ApiError({
      statusCode: httpStatus.UNAUTHORIZED,
      code: ErrorCode.PASSWORD_RESET_FAILED,
      message: 'Password reset failed',
      data: getErrorData({
        error: errorMessage,
        token: resetPasswordToken,
      }),
    });
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise<IUserDoc | null>}
 */
const verifyEmail = async (verifyEmailToken: string): Promise<TUserDoc | null> => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, TokenTypes.VERIFY_EMAIL);
    const user = await userService.queryById(verifyEmailTokenDoc.user);

    if (!user) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User associated with token not found',
      });
    }

    await Token.deleteMany({ user: user.id, type: TokenTypes.VERIFY_EMAIL });
    const updatedUser = await userService.updateById(user.id, {
      isEmailVerified: true,
    });

    return updatedUser;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    throw new ApiError({
      statusCode: httpStatus.UNAUTHORIZED,
      code: ErrorCode.EMAIL_VERIFICATION_FAILED,
      message: 'Email verification failed',
      data: getErrorData({
        error: errorMessage,
        token: verifyEmailToken,
      }),
    });
  }
};

export const authService = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
