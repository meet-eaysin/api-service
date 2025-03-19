import { requestMiddleware } from '@/middleware/request-middleware';
import catchAsync from '@/modules/utils/catchAsync';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import { IOptions } from '../paginate/paginate';
import { pick } from '../utils';
import { DocumentId } from '../validate/id';
import { querySchema } from '../validate/query';
import { rolePermissionService } from './index';
import { rolePermissionParamsSchema, rolePermissionSchema, updateRolePermissionSchema } from './role-permission.validation';

/**
 * Create a new role-permission assignment
 * @route POST /role-permissions
 */
const createHandler = catchAsync(async (req: Request, res: Response) => {
  const rolePermission = await rolePermissionService.create(req.body);
  res.status(httpStatus.CREATED).send(rolePermission);
});

/**
 * Get all role-permissions with filtering and pagination
 * @route GET /role-permissions
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['role', 'permission']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await rolePermissionService.query(filter, options);
  res.send(result);
});

/**
 * Get a role-permission by ID
 * @route GET /role-permissions/:rolePermissionId
 */
const queryByIdHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  const rolePermission = await rolePermissionService.queryById(req.params.rolePermissionId);
  res.send(rolePermission);
});

/**
 * Partially update a role-permission
 * @route PATCH /role-permissions/:rolePermissionId
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  const rolePermission = await rolePermissionService.updateById(req.params.rolePermissionId, req.body);
  res.send(rolePermission);
});

/**
 * Replace a role-permission or create a new one if not found
 * @route PUT /role-permissions/:rolePermissionId
 */
const upsertHandler = catchAsync(async (req: Request<{ rolePermissionId: DocumentId }>, res: Response) => {
  try {
    const updatedRolePermission = await rolePermissionService.replaceById(req.params.rolePermissionId, req.body);
    res.send(updatedRolePermission);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newRolePermission = await rolePermissionService.create(req.body);
      res.status(httpStatus.CREATED).send(newRolePermission);
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
  await rolePermissionService.removeById(req.params.rolePermissionId);
  res.status(httpStatus.NO_CONTENT).send();
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
  validation: { params: rolePermissionParamsSchema, body: updateRolePermissionSchema },
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
