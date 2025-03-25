import {
  authService,
  forgotPasswordSchema,
  logoutSchema,
  refreshTokensSchema,
  registerSchema,
  resetPasswordQuerySchema,
  resetPasswordSchema,
  verifyEmailQuerySchema,
} from '@/modules/auth';
import { requestMiddleware } from '@/modules/auth/middleware/request-middleware';
import { emailService } from '@/modules/email';
import { tokenService } from '@/modules/token';
import { loginSchema, TUserDoc, userService } from '@/modules/user';
import { catchAsync, sendResponse } from '@/modules/utils';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

/**
 * @desc Register a new user
 * @route POST /auth/register
 * @access Public
 */
const registerHandler = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.register(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  sendResponse({
    res,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: { user, tokens },
  });
});

/**
 * @desc Login a user
 * @route POST /auth/login
 * @access Public
 */
const loginHandler = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: { user, tokens },
  });
});

/**
 * @desc Logout a user
 * @route POST /auth/logout
 * @access Private
 */
const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Logged out successfully',
  });
});

/**
 * @desc Refresh authentication tokens
 * @route POST /auth/refresh-tokens
 * @access Public
 */
const refreshTokensHandler = catchAsync(async (req: Request, res: Response) => {
  const userWithTokens = await authService.refreshAuth(req.body.refreshToken);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Tokens refreshed successfully',
    data: userWithTokens,
  });
});

/**
 * @desc Request password reset link
 * @route POST /auth/forgot-password
 * @access Public
 */
const forgotPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Password reset email sent successfully',
  });
});

/**
 * @desc Reset password
 * @route POST /auth/reset-password
 * @access Public
 */
const resetPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query['token'] as string, req.body.password);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Password reset successful',
  });
});

/**
 * @desc Send email verification link
 * @route POST /auth/send-verification-email
 * @access Private
 */
const sendVerificationEmailHandler = catchAsync(async (req: Request, res: Response) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken, req.user.name);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Verification email sent successfully',
  });
});

/**
 * @desc Verify user email
 * @route POST /auth/verify-email
 * @access Public
 */
const verifyEmailHandler = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.query['token'] as string);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Email verified successfully',
  });
});

/**
 * @desc Get current user's information
 * @route GET /auth/me
 * @access Private
 */
const meHandler = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as TUserDoc;

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'User profile retrieved successfully',
    data: user,
  });
});

// Middleware-wrapped controller methods with validation
const register = requestMiddleware(registerHandler, { validation: { body: registerSchema } });
const login = requestMiddleware(loginHandler, { validation: { body: loginSchema } });
const logout = requestMiddleware(logoutHandler, { validation: { body: logoutSchema } });
const refreshTokens = requestMiddleware(refreshTokensHandler, {
  validation: { body: refreshTokensSchema },
});
const forgotPassword = requestMiddleware(forgotPasswordHandler, {
  validation: { body: forgotPasswordSchema },
});
const resetPassword = requestMiddleware(resetPasswordHandler, {
  validation: { body: resetPasswordSchema, query: resetPasswordQuerySchema },
});
const sendVerificationEmail = requestMiddleware(sendVerificationEmailHandler);
const verifyEmail = requestMiddleware(verifyEmailHandler, {
  validation: { query: verifyEmailQuerySchema },
});
const me = requestMiddleware(meHandler);

export const authController = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  me,
};
