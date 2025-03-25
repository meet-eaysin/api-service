import { requestMiddleware } from '@/modules/auth/middleware/request-middleware';
import { employeeIdSchema } from '@/modules/employee';
import { ApiError, ErrorCode } from '@/modules/errors';
import { TOptions } from '@/modules/paginate';
import { userIdSchema, userSchema, userService } from '@/modules/user';
import { pick, sendResponse } from '@/modules/utils';
import { TDocumentId, querySchema } from '@/modules/validate';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

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
  const options: TOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
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
const queryByIdHandler = async (req: Request<{ userId: TDocumentId }>, res: Response) => {
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
const updateHandler = async (req: Request<{ userId: TDocumentId }>, res: Response) => {
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
const removeByIdHandler = async (req: Request<{ userId: TDocumentId }>, res: Response) => {
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
const create = requestMiddleware(createHandler, { validation: { body: userSchema } });
const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
const queryById = requestMiddleware(queryByIdHandler, { validation: { params: userIdSchema } });
const update = requestMiddleware(updateHandler, {
  validation: { params: userIdSchema, body: userSchema },
});
const removeById = requestMiddleware(removeByIdHandler, { validation: { params: userIdSchema } });
const queryByEmployeeId = requestMiddleware(queryByEmployeeIdHandler, {
  validation: { query: employeeIdSchema },
});

export const userController = {
  create,
  query,
  queryById,
  update,
  removeById,
  queryByEmployeeId,
};
