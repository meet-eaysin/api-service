import { requestMiddleware } from '@/middleware/request-middleware';
import catchAsync from '@/modules/utils/catchAsync';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ApiError } from '../errors';
import { ErrorCode } from '../errors/error-codes';
import { IOptions } from '../paginate/paginate';
import { permissionParamsSchema, updatePermissionBody } from '../permission/permission.validation';
import { pick } from '../utils';
import { sendResponse } from '../utils/send-response';
import { querySchema } from '../validate/query';
import { permissionService } from './permission.service';
import { addActionBody, createPermissionBody, CreatePermissionBody, removeActionBody } from './permission.validation';

/**
 * @desc    Create a new permission resource with actions
 * @route   POST /permissions
 * @access  Private/Admin
 */
const createHandler = catchAsync(async (req: Request<{}, {}, CreatePermissionBody>, res: Response) => {
  const permission = await permissionService.create(req.body);

  sendResponse({
    res,
    statusCode: httpStatus.CREATED,
    message: 'Permission created successfully',
    data: permission,
  });
});

/**
 * @desc    Get all permission resources with pagination
 * @route   GET /permissions
 * @access  Private/Admin
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['resource', 'action']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await permissionService.query(filter, options);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Permissions retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Get a single permission resource by ID
 * @route   GET /permissions/:permissionId
 * @access  Private/Admin
 */
const queryByIdHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.permissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid permission ID',
    });
  }

  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.queryById(permissionId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Permission retrieved successfully',
    data: permission,
  });
});

/**
 * @desc    Update a permission resource partially
 * @route   PATCH /permissions/:permissionId
 * @access  Private/Admin
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.permissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid permission ID',
    });
  }

  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.updateById(permissionId, req.body);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Permission updated successfully',
    data: permission,
  });
});

/**
 * @desc    Add actions to a permission resource
 * @route   POST /permissions/:permissionId/actions
 * @access  Private/Admin
 */
const addActionHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.permissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid permission ID',
    });
  }

  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.addAction(permissionId, req.body.actions);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Actions added successfully',
    data: permission,
  });
});

/**
 * @desc    Remove actions from a permission resource
 * @route   DELETE /permissions/:permissionId/actions
 * @access  Private/Admin
 */
const removeActionHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.permissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid permission ID',
    });
  }

  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.removeAction(permissionId, req.body.actions);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Actions removed successfully',
    data: permission,
  });
});

/**
 * @desc    Replace or create a permission resource
 * @route   PUT /permissions/:permissionId
 * @access  Private/Admin
 */
const upsertHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.permissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid permission ID',
    });
  }

  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);

  try {
    const updatedPermission = await permissionService.replaceById(permissionId, req.body);
    sendResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'Permission updated successfully',
      data: updatedPermission,
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newPermission = await permissionService.create(req.body);
      sendResponse({
        res,
        statusCode: httpStatus.CREATED,
        message: 'Permission created successfully',
        data: newPermission,
      });
    } else {
      throw error;
    }
  }
});

/**
 * @desc    Delete a permission resource
 * @route   DELETE /permissions/:permissionId
 * @access  Private/Admin
 */
const removeByIdHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.permissionId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid permission ID',
    });
  }

  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  await permissionService.removeById(permissionId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Permission deleted successfully',
  });
});

// Middleware-wrapped exports remain unchanged
export const create = requestMiddleware(createHandler, {
  validation: { body: createPermissionBody },
});
export const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
export const queryById = requestMiddleware(queryByIdHandler, {
  validation: { params: permissionParamsSchema },
});
export const partialUpdate = requestMiddleware(partialUpdateHandler, {
  validation: { params: permissionParamsSchema, body: updatePermissionBody },
});
export const upsert = requestMiddleware(upsertHandler, {
  validation: { params: permissionParamsSchema, body: createPermissionBody },
});
export const addActions = requestMiddleware(addActionHandler, {
  validation: { params: permissionParamsSchema, body: addActionBody },
});
export const removeActions = requestMiddleware(removeActionHandler, {
  validation: { params: permissionParamsSchema, body: removeActionBody },
});
export const removeById = requestMiddleware(removeByIdHandler, {
  validation: { params: permissionParamsSchema },
});

export const permissionController = {
  create,
  query,
  queryById,
  partialUpdate,
  upsert,
  addActions,
  removeActions,
  removeById,
};
