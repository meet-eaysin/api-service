/**
 * Role Controller - Handles CRUD operations for roles.
 */

import { requestMiddleware } from '@/middleware/request-middleware';
import catchAsync from '@/modules/utils/catchAsync';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ApiError } from '../errors';
import { IOptions } from '../paginate/paginate';
import { pick } from '../utils';
import { querySchema } from '../validate/query';
import { roleService } from './index';
import { roleParamsSchema, roleSchema, RoleSchemaType, updateRoleSchema } from './role.validation';

/**
 * Create a new role
 * @route POST /roles
 */
const createHandler = catchAsync(async (req: Request<{}, {}, RoleSchemaType>, res: Response) => {
  const role = await roleService.create(req.body);
  res.status(httpStatus.CREATED).send(role);
});

/**
 * Get all roles with filtering and pagination
 * @route GET /roles
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'description']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await roleService.query(filter, options);
  res.send(result);
});

/**
 * Get a role by ID
 * @route GET /roles/:roleId
 */
const queryByIdHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  const role = await roleService.queryById(roleId);
  res.send(role);
});

/**
 * Partially update a role
 * @route PATCH /roles/:roleId
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  const role = await roleService.updateById(roleId, req.body);
  res.send(role);
});

/**
 * Replace a role or create a new one if not found
 * @route PUT /roles/:roleId
 */
const upsertHandler = catchAsync(async (req: Request<{ roleId: string }>, res: Response) => {
  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  try {
    const updatedRole = await roleService.replaceById(roleId, req.body);
    res.send(updatedRole);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newRole = await roleService.create(req.body);
      res.status(httpStatus.CREATED).send(newRole);
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
  const roleId = new mongoose.Types.ObjectId(req.params.roleId);
  await roleService.removeById(roleId);
  res.status(httpStatus.NO_CONTENT).send();
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
