import { TOptions, TQueryResult } from '@/modules/paginate';
import {
  Permission,
  PermissionAction,
  TPermissionDoc,
  TPermissionSchema,
  TUpdatePermissionSchema,
} from '@/modules/permission';
import { TDocumentId } from '@/modules/validate';
// permission.service.ts
import { ApiError } from '@/modules/errors';
import httpStatus from 'http-status';
import { ClientSession, FilterQuery } from 'mongoose';

/**
 * Checks if a permission with the specified resource already exists in the database.
 *
 * @param resource - The resource name to check for existence
 * @param excludeId - Optional ID of a permission to exclude from the check (useful for updates)
 * @param session - Optional mongoose session for transactional operations
 * @returns A promise that resolves to true if the resource exists, false otherwise
 */

const checkExists = async (resource: string, excludeId?: TDocumentId, session?: ClientSession): Promise<boolean> => {
  const query: FilterQuery<TPermissionDoc> = { resource };
  if (excludeId) query._id = { $ne: excludeId };
  return !!(await Permission.findOne(query).session(session || null));
};

/**
 * Queries permissions with filtering and pagination.
 *
 * @param filter - The query filter for permissions
 * @param options - Pagination options
 * @param session - Optional mongoose session for transactional operations
 * @returns A promise resolving to the paginated query result
 */

export const query = async (
  filter: FilterQuery<TPermissionDoc>,
  options: TOptions,
  session?: ClientSession,
): Promise<TQueryResult<TPermissionDoc>> => {
  return Permission.paginate(filter, options, session);
};

/**
 * Creates a new permission resource.
 *
 * @param body - The data for the permission to be created
 * @param session - Optional mongoose session for transactional operations
 * @returns The created permission document
 * @throws ApiError if the resource already exists
 */

export const create = async (body: TPermissionSchema, session?: ClientSession): Promise<TPermissionDoc> => {
  if (await checkExists(body.resource, undefined, session)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: 'RESOURCE_ALREADY_EXISTS',
      message: 'Resource already exists',
    });
  }
  const [permission] = await Permission.create([body], { session });
  return permission as unknown as TPermissionDoc;
};

/**
 * Retrieves a permission document by its ID.
 *
 * @param id - The ID of the permission to retrieve
 * @param session - Optional mongoose session for transactional operations
 * @returns The permission document
 * @throws ApiError if the permission is not found
 */

export const queryById = async (id: TDocumentId, session?: ClientSession): Promise<TPermissionDoc> => {
  const permission = await Permission.findById(id).session(session || null);
  if (!permission)
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Permission not found',
    });
  return permission;
};

/**
 * Replaces a permission resource by ID. If the resource name is changed,
 * ensures that the new name is not taken by another permission.
 *
 * @param id - The ID of the permission to replace
 * @param updateBody - The new permission data
 * @param session - Optional mongoose session for transactional operations
 * @returns The replaced permission document
 * @throws ApiError if the resource name is already taken
 */
export const replaceById = async (
  id: TDocumentId,
  updateBody: TPermissionSchema,
  session?: ClientSession,
): Promise<TPermissionDoc> => {
  const permission = await queryById(id, session);

  if (updateBody.resource !== permission.resource) {
    if (await checkExists(updateBody.resource, id, session)) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        code: 'RESOURCE_ALREADY_EXISTS',
        message: 'Resource already exists',
      });
    }
    permission.resource = updateBody.resource;
  }

  permission.action = updateBody.action;
  await permission.save({ session: session || null });
  return permission;
};

/**
 * Partially update a permission resource by ID.
 *
 * @param id - The ID of the permission to update
 * @param updateBody - The partial permission body
 * @param session - Optional mongoose session for transactional operations
 * @returns The updated permission document
 * @throws ApiError if the permission is not found or if the resource name is already taken
 */
export const updateById = async (
  id: TDocumentId,
  updateBody: TUpdatePermissionSchema,
  session?: ClientSession,
): Promise<TPermissionDoc> => {
  const permission = await queryById(id, session);

  if (updateBody.resource && updateBody.resource !== permission.resource) {
    if (await checkExists(updateBody.resource, id, session)) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        code: 'RESOURCE_ALREADY_EXISTS',
        message: 'Resource already exists',
      });
    }
    permission.resource = updateBody.resource;
  }

  if (updateBody.action) {
    permission.action = updateBody.action;
  }

  await permission.save({ session: session || null });
  return permission;
};

/**
 * Deletes a permission resource by ID.
 *
 * @param id - The ID of the permission to delete
 * @param session - Optional mongoose session for transactional operations
 * @returns The deleted permission document
 * @throws ApiError if the permission is not found
 */
export const removeById = async (id: TDocumentId, session?: ClientSession): Promise<TPermissionDoc> => {
  const permission = await Permission.findByIdAndDelete(id, { session: session || null });
  if (!permission)
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Permission not found',
    });
  return permission;
};

/**
 * Adds an action to a permission resource.
 *
 * @param id - The ID of the permission to update
 * @param action - The action to add to the permission
 * @param session - Optional mongoose session for transactional operations
 * @returns The updated permission document
 */
export const addAction = async (
  id: TDocumentId,
  action: PermissionAction,
  session?: ClientSession,
): Promise<TPermissionDoc> => {
  const permission = await queryById(id, session);

  if (!permission.action.includes(action)) {
    permission.action = [...permission.action, action];
    await permission.save({ session: session || null });
  }

  return permission;
};

/**
 * Removes an action from a permission resource.
 *
 * @param id - The ID of the permission to update
 * @param action - The action to remove from the permission
 * @param session - Optional mongoose session for transactional operations
 * @returns The updated permission document
 */
export const removeAction = async (
  id: TDocumentId,
  action: PermissionAction,
  session?: ClientSession,
): Promise<TPermissionDoc> => {
  const permission = await queryById(id, session);

  if (permission.action.includes(action)) {
    permission.action = permission.action.filter((a) => a !== action);
    await permission.save({ session: session || null });
  }

  return permission;
};

export const permissionService = {
  query,
  create,
  queryById,
  updateById,
  replaceById,
  removeById,
  addAction,
  removeAction,
};
