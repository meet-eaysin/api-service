import { requestMiddleware } from '@/middleware/request-middleware';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { emailService } from '../email';
import { tokenService } from '../token';
import { userService } from '../user';
import { IUserDoc } from '../user/user.interfaces';
import catchAsync from '../utils/catchAsync';
import { authService } from './auth.service';
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshTokensBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  resetPasswordQuerySchema,
  verifyEmailQuerySchema,
} from './auth.validation';

/**
 * @desc Register a new user
 * @route POST /auth/register
 * @access Public
 */
const registerHandler = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.register(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
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
  res.send({ user, tokens });
});

/**
 * @desc Logout a user
 * @route POST /auth/logout
 * @access Private
 */
const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @desc Refresh authentication tokens
 * @route POST /auth/refresh-tokens
 * @access Public
 */
const refreshTokensHandler = catchAsync(async (req: Request, res: Response) => {
  const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
  res.send(userWithTokens);
});

/**
 * @desc Request password reset link
 * @route POST /auth/forgot-password
 * @access Public
 */
const forgotPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @desc Reset password
 * @route POST /auth/reset-password
 * @access Public
 */
const resetPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query['token'] as string, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @desc Send email verification link
 * @route POST /auth/send-verification-email
 * @access Private
 */
const sendVerificationEmailHandler = catchAsync(async (req: Request, res: Response) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken, req.user.name);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @desc Verify user email
 * @route POST /auth/verify-email
 * @access Public
 */
const verifyEmailHandler = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.query['token'] as string);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @desc Get current user's information
 * @route GET /auth/me
 * @access Private
 */
const meHandler = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDoc;
  res.send(user);
});

// Middleware-wrapped controller methods with validation
export const register = requestMiddleware(registerHandler, { validation: { body: registerBodySchema } });
export const login = requestMiddleware(loginHandler, { validation: { body: loginBodySchema } });
export const logout = requestMiddleware(logoutHandler, { validation: { body: logoutBodySchema } });
export const refreshTokens = requestMiddleware(refreshTokensHandler, {
  validation: { body: refreshTokensBodySchema },
});
export const forgotPassword = requestMiddleware(forgotPasswordHandler, {
  validation: { body: forgotPasswordBodySchema },
});
export const resetPassword = requestMiddleware(resetPasswordHandler, {
  validation: { body: resetPasswordBodySchema, query: resetPasswordQuerySchema },
});
export const sendVerificationEmail = requestMiddleware(sendVerificationEmailHandler);
export const verifyEmail = requestMiddleware(verifyEmailHandler, {
  validation: { query: verifyEmailQuerySchema },
});
export const me = requestMiddleware(meHandler);
