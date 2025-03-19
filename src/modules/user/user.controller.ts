import { requestMiddleware } from '@/middleware/request-middleware';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { IOptions } from '../paginate/paginate';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { DocumentId } from '../validate/id';
import { querySchema } from '../validate/query';
import { userService } from './user.service';
import { queryByEmployeeIdSchema, userParamsSchema, userSchema } from './user.validation';

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Private/Admin
 * @body    {name, email, password, role}
 */
const createHandler = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.status(httpStatus.CREATED).send(user);
});

/**
 * @desc    Get all users with pagination
 * @route   GET /api/users
 * @access  Private/Admin
 * @query   {name?, role?, sortBy?, limit?, page?, projectBy?}
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'role', 'status', 'createdAt', 'updatedAt']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);

  const result = await userService.query(filter, options);
  res.send(result);
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:userId
 * @access  Private/Admin
 * @param   {string} userId - MongoDB ObjectId
 */
const queryByIdHandler = catchAsync(async (req: Request<{ userId: DocumentId }>, res: Response) => {
  if (typeof req.params.userId === 'string') {
    const userId = req.params.userId;

    const user = await userService.queryById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    res.send(user);
  }
});

/**
 * @desc    Update user details
 * @route   PATCH /api/users/:userId
 * @access  Private/Admin
 * @param   {string} userId - MongoDB ObjectId
 * @body    {name?, email?, role?}
 */
const updateHandler = catchAsync(async (req: Request<{ userId: DocumentId }>, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const userId = req.params.userId;
    const user = await userService.updateById(userId, req.body);
    res.send(user);
  }
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:userId
 * @access  Private/Admin
 * @param   {string} userId - MongoDB ObjectId
 */
const removeByIdHandler = catchAsync(async (req: Request<{ userId: DocumentId }>, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const userId = req.params.userId;
    await userService.removeById(userId);
    res.status(httpStatus.NO_CONTENT).send();
  }
});

const queryByEmployeeIdHandler = catchAsync(async (req: Request<{ employeeId: DocumentId }>, res: Response) => {
  const employeeId = req.query['employeeId'] as DocumentId | undefined;
  const users = await userService.getByEmployeeId(employeeId || null);
  res.status(httpStatus.OK).json({ users });
});

// Middleware-wrapped controller methods with validation
export const create = requestMiddleware(createHandler, { validation: { body: userSchema } });
export const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
export const queryById = requestMiddleware(queryByIdHandler, { validation: { params: userParamsSchema } });
export const update = requestMiddleware(updateHandler, {
  validation: { params: userParamsSchema, body: userSchema },
});
export const removeById = requestMiddleware(removeByIdHandler, { validation: { params: userParamsSchema } });
export const queryByEmployeeId = requestMiddleware(queryByEmployeeIdHandler, {
  validation: { params: queryByEmployeeIdSchema },
});

// Export controller object
export const userController = {
  create,
  query,
  queryById,
  update,
  removeById,
  queryByEmployeeId,
};
