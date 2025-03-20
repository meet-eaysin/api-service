import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { requestMiddleware } from '../auth';
import { ApiError } from '../errors';
import { ErrorCode } from '../errors/error-codes';
import { IOptions } from '../paginate/paginate';
import { pick } from '../utils';
import { sendResponse } from '../utils/send-response';
import { DocumentId, querySchema } from '../validate';
import { userService } from './user.service';
import { queryByEmployeeIdSchema, userParamsSchema, userSchema } from './user.validation';

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createHandler = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  sendResponse({
    res,
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: user,
  });
};

/**
 * @desc    Get all users with pagination
 * @route   GET /api/users
 * @access  Private/Admin
 */
const queryHandler = async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'role', 'status', 'createdAt', 'updatedAt']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await userService.query(filter, options);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:userId
 * @access  Private/Admin
 */
const queryByIdHandler = async (req: Request<{ userId: DocumentId }>, res: Response) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid user ID',
    });
  }

  const user = await userService.queryById(userId);
  if (!user) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.USER_NOT_FOUND,
      message: 'User not found',
    });
  }

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'User retrieved successfully',
    data: user,
  });
};

/**
 * @desc    Update user details
 * @route   PATCH /api/users/:userId
 * @access  Private/Admin
 */
const updateHandler = async (req: Request<{ userId: DocumentId }>, res: Response) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid user ID',
    });
  }

  const user = await userService.updateById(userId, req.body);
  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: user,
  });
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:userId
 * @access  Private/Admin
 */
const removeByIdHandler = async (req: Request<{ userId: DocumentId }>, res: Response) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid user ID',
    });
  }

  await userService.removeById(userId);
  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
  });
};

/**
 * @desc    Get users by employee ID
 * @route   GET /api/users/by-employee
 * @access  Private/Admin
 */
const queryByEmployeeIdHandler = async (req: Request<{}, {}, {}, { employeeId: string }>, res: Response) => {
  const employeeId = req.query.employeeId;
  const users = await userService.getByEmployeeId(employeeId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: { users },
  });
};

// Middleware-wrapped controller methods with validation
export const create = requestMiddleware(createHandler, { validation: { body: userSchema } });
export const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
export const queryById = requestMiddleware(queryByIdHandler, { validation: { params: userParamsSchema } });
export const update = requestMiddleware(updateHandler, {
  validation: { params: userParamsSchema, body: userSchema },
});
export const removeById = requestMiddleware(removeByIdHandler, { validation: { params: userParamsSchema } });
export const queryByEmployeeId = requestMiddleware(queryByEmployeeIdHandler, {
  validation: { query: queryByEmployeeIdSchema },
});

export const userController = {
  create,
  query,
  queryById,
  update,
  removeById,
  queryByEmployeeId,
};
