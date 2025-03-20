import catchAsync from '@/modules/utils/catch-async';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { requestMiddleware } from '../auth';
import { ApiError } from '../errors';
import { ErrorCode } from '../errors/error-codes';
import { IOptions } from '../paginate/paginate';
import { pick } from '../utils';
import { sendResponse } from '../utils/send-response';
import { querySchema } from '../validate';
import { roleService } from './index';
import { roleParamsSchema, roleSchema, RoleSchemaType, updateRoleSchema } from './role.validation';

/**
 * Create a new role
 * @route POST /roles
 */
const createHandler = catchAsync(async (req: Request<{}, {}, RoleSchemaType>, res: Response) => {
  const role = await roleService.create(req.body);

  sendResponse({
    res,
    statusCode: httpStatus.CREATED,
    message: 'Role created successfully',
    data: role,
  });
});

/**
 * Get all roles with filtering and pagination
 * @route GET /roles
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'description']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await roleService.query(filter, options);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Roles retrieved successfully',
    data: result,
  });
});

/**
 * Get a role by ID
 * @route GET /roles/:roleId
 */
const queryByIdHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.roleId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role ID',
    });
  }

  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  const role = await roleService.queryById(roleId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role retrieved successfully',
    data: role,
  });
});

/**
 * Partially update a role
 * @route PATCH /roles/:roleId
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.roleId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role ID',
    });
  }

  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  const role = await roleService.updateById(roleId, req.body);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role updated successfully',
    data: role,
  });
});

/**
 * Replace a role or create a new one if not found
 * @route PUT /roles/:roleId
 */
const upsertHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.roleId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role ID',
    });
  }

  const roleId = new mongoose.Types.ObjectId(req.params.roleId);

  try {
    const updatedRole = await roleService.replaceById(roleId, req.body);
    sendResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newRole = await roleService.create(req.body);
      sendResponse({
        res,
        statusCode: httpStatus.CREATED,
        message: 'Role created successfully',
        data: newRole,
      });
    } else {
      throw error;
    }
  }
});

/**
 * Delete a role by ID
 * @route DELETE /roles/:roleId
 */
const removeByIdHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.roleId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role ID',
    });
  }

  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  await roleService.removeById(roleId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role deleted successfully',
  });
});

// Middleware-wrapped controller methods with validation
export const create = requestMiddleware(createHandler, { validation: { body: roleSchema } });
export const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
export const queryById = requestMiddleware(queryByIdHandler, { validation: { params: roleParamsSchema } });
export const partialUpdate = requestMiddleware(partialUpdateHandler, {
  validation: { params: roleParamsSchema, body: updateRoleSchema },
});
export const upsert = requestMiddleware(upsertHandler, {
  validation: { params: roleParamsSchema, body: roleSchema },
});
export const removeById = requestMiddleware(removeByIdHandler, { validation: { params: roleParamsSchema } });

export const roleController = {
  create,
  query,
  queryById,
  partialUpdate,
  upsert,
  removeById,
};
