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
import { DocumentId, querySchema } from '../validate';
import { rolePermissionService } from './index';
import { rolePermissionParamsSchema, rolePermissionSchema, updateRolePermissionSchema } from './role-permission.validation';

/**
 * Create a new role-permission assignment
 * @route POST /role-permissions
 */
const createHandler = catchAsync(async (req: Request, res: Response) => {
  const rolePermission = await rolePermissionService.create(req.body);

  sendResponse({
    res,
    statusCode: httpStatus.CREATED,
    message: 'Role permission created successfully',
    data: rolePermission,
  });
});

/**
 * Get all role-permissions with filtering and pagination
 * @route GET /role-permissions
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['role', 'permission']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await rolePermissionService.query(filter, options);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role permissions retrieved successfully',
    data: result,
  });
});

/**
 * Get a role-permission by ID
 * @route GET /role-permissions/:rolePermissionId
 */
const queryByIdHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.rolePermissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role permission ID',
    });
  }

  const rolePermission = await rolePermissionService.queryById(req.params.rolePermissionId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role permission retrieved successfully',
    data: rolePermission,
  });
});

/**
 * Partially update a role-permission
 * @route PATCH /role-permissions/:rolePermissionId
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.rolePermissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role permission ID',
    });
  }

  const rolePermission = await rolePermissionService.updateById(req.params.rolePermissionId, req.body);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role permission updated successfully',
    data: rolePermission,
  });
});

/**
 * Replace a role-permission or create a new one if not found
 * @route PUT /role-permissions/:rolePermissionId
 */
const upsertHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.rolePermissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role permission ID',
    });
  }

  try {
    const updatedRolePermission = await rolePermissionService.replaceById(req.params.rolePermissionId, req.body);
    sendResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'Role permission updated successfully',
      data: updatedRolePermission,
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newRolePermission = await rolePermissionService.create(req.body);
      sendResponse({
        res,
        statusCode: httpStatus.CREATED,
        message: 'Role permission created successfully',
        data: newRolePermission,
      });
    } else {
      throw error;
    }
  }
});

/**
 * Delete a role-permission by ID
 * @route DELETE /role-permissions/:rolePermissionId
 */
const removeByIdHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.rolePermissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid role permission ID',
    });
  }

  await rolePermissionService.removeById(req.params.rolePermissionId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Role permission deleted successfully',
  });
});

// Middleware-wrapped controller methods with validation
export const create = requestMiddleware(createHandler, { validation: { body: rolePermissionSchema } });
export const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
export const queryById = requestMiddleware(queryByIdHandler, {
  validation: { params: rolePermissionParamsSchema },
});
export const partialUpdate = requestMiddleware(partialUpdateHandler, {
  validation: { params: rolePermissionParamsSchema, body: updateRolePermissionSchema },
});
export const upsert = requestMiddleware(upsertHandler, {
  validation: { params: rolePermissionParamsSchema, body: rolePermissionSchema },
});
export const removeById = requestMiddleware(removeByIdHandler, {
  validation: { params: rolePermissionParamsSchema },
});

export const rolePermissionController = {
  create,
  query,
  queryById,
  partialUpdate,
  upsert,
  removeById,
};
