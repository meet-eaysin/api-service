import { requestMiddleware } from '@/middleware/request-middleware';
import catchAsync from '@/modules/utils/catchAsync';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ApiError } from '../errors';
import { IOptions } from '../paginate/paginate';
import { permissionParamsSchema, updatePermissionBody } from '../permission/permission.validation';
import { pick } from '../utils';
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
  res.status(httpStatus.CREATED).send(permission);
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
  res.send(result);
});

/**
 * @desc    Get a single permission resource by ID
 * @route   GET /permissions/:permissionId
 * @access  Private/Admin
 */
const queryByIdHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.queryById(permissionId);
  res.send(permission);
});

/**
 * @desc    Update a permission resource partially
 * @route   PATCH /permissions/:permissionId
 * @access  Private/Admin
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.updateById(permissionId, req.body);
  res.send(permission);
});

/**
 * @desc    Add actions to a permission resource
 * @route   POST /permissions/:permissionId/actions
 * @access  Private/Admin
 */
const addActionHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.addAction(permissionId, req.body.actions);
  res.status(httpStatus.OK).send(permission);
});

/**
 * @desc    Remove actions from a permission resource
 * @route   DELETE /permissions/:permissionId/actions
 * @access  Private/Admin
 */
const removeActionHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  const permission = await permissionService.removeAction(permissionId, req.body.actions);
  res.status(httpStatus.OK).send(permission);
});

/**
 * @desc    Replace or create a permission resource
 * @route   PUT /permissions/:permissionId
 * @access  Private/Admin
 */
const upsertHandler = catchAsync(async (req: Request<{ permissionId: string }>, res: Response) => {
  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  try {
    const updatedPermission = await permissionService.replaceById(permissionId, req.body);
    res.send(updatedPermission);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newPermission = await permissionService.create(req.body);
      res.status(httpStatus.CREATED).send(newPermission);
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
  const permissionId = new mongoose.Types.ObjectId(req.params.permissionId);
  await permissionService.removeById(permissionId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Middleware-wrapped controller methods with validation
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
