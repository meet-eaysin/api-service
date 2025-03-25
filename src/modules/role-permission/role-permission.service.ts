import { ApiError } from '@/modules/errors';
import { TOptions, TQueryResult } from '@/modules/paginate';
import {
  RolePermission,
  TRolePermissionDoc,
  TRolePermissionSchema,
  TUpdateRolePermissionSchema,
} from '@/modules/role-permission';
import { TDocumentId } from '@/modules/validate';
import httpStatus from 'http-status';
import { ClientSession, Types } from 'mongoose';

/**
 * Checks if a role-permission combination already exists in the database.
 *
 * @param roleId - The ID of the role to check
 * @param permissionId - The ID of the permission to check
 * @param excludeId - Optional ID of a role-permission combination to exclude from the check
 * @param session - Optional mongoose session for transactional operations
 * @returns Whether the role-permission combination already exists
 */
const checkExists = async (
  roleId: Types.ObjectId,
  permissionId: Types.ObjectId,
  excludeId?: TDocumentId,
  session?: ClientSession,
): Promise<boolean> => {
  const query: any = { role: roleId, permission: permissionId };
  if (excludeId) query._id = { $ne: excludeId };
  return !!(await RolePermission.findOne(query).session(session || null));
};

/**
 * Creates a new role-permission assignment.
 *
 * @param payload - The role-permission body
 * @param session - Optional mongoose session for transactional operations
 * @returns The created role-permission assignment document
 * @throws ApiError if the role-permission combination already exists
 */
const create = async (payload: TRolePermissionSchema, session?: ClientSession): Promise<TRolePermissionDoc> => {
  const roleId = new Types.ObjectId(payload.role);
  const permissionId = new Types.ObjectId(payload.permission);

  if (await checkExists(roleId, permissionId, undefined, session)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: 'ROLE_PERMISSION_COMBINATION_ALREADY_EXISTS',
      message: 'Role-Permission combination already exists',
    });
  }

  const [assignment] = await RolePermission.create([payload], { session });
  return assignment as unknown as TRolePermissionDoc;
};

/**
 * Queries role-permissions with filtering and pagination.
 *
 * @param filter - The query filter
 * @param options - The pagination options
 * @param session - Optional mongoose session for transactional operations
 * @returns The paginated query result
 */
const query = async (
  filter: Record<string, any>,
  options: TOptions,
  session?: ClientSession,
): Promise<TQueryResult<TRolePermissionDoc>> => {
  return RolePermission.paginate(filter, options, session);
};

/**
 * Retrieves a role-permission assignment by ID.
 *
 * @param id - The ID of the role-permission assignment to retrieve
 * @param session - Optional mongoose session for transactional operations
 * @returns The role-permission assignment document
 * @throws ApiError if the role-permission assignment is not found
 */

const queryById = async (id: TDocumentId, session?: ClientSession): Promise<TRolePermissionDoc> => {
  const assignment = await RolePermission.findById(id).session(session || null);
  if (!assignment)
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Role-Permission assignment not found',
    });
  return assignment;
};

/**
 * Partially updates a role-permission assignment by ID.
 *
 * @param id - The ID of the role-permission assignment to update
 * @param updateBody - The partial role-permission assignment body
 * @param session - Optional mongoose session for transactional operations
 * @returns The updated role-permission assignment document
 * @throws ApiError if the role-permission assignment is not found or if the role-permission combination already exists
 */
const updateById = async (
  id: TDocumentId,
  updateBody: TUpdateRolePermissionSchema,
  session?: ClientSession,
): Promise<TRolePermissionDoc> => {
  const assignment = await queryById(id, session);

  const newRole = updateBody?.role ? new Types.ObjectId(updateBody.role) : (assignment.role as Types.ObjectId);

  const newPermission = updateBody?.permission
    ? new Types.ObjectId(updateBody.permission)
    : (assignment.permission as Types.ObjectId);

  if (await checkExists(newRole, newPermission, id, session)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: 'ROLE_PERMISSION_COMBINATION_ALREADY_EXISTS',
      message: 'Role-Permission combination already exists',
    });
  }

  Object.assign(assignment, updateBody);
  await assignment.save({ session: session || null });
  return assignment;
};

/**
 * Replaces a role-permission assignment by ID. If the assignment is not found,
 * a new one is created.
 *
 * @param id - The ID of the role-permission assignment to replace
 * @param replaceBody - The new role-permission assignment body
 * @param session - Optional mongoose session for transactional operations
 * @returns The replaced or created role-permission assignment document
 * @throws ApiError if the role-permission combination already exists
 */
const replaceById = async (
  id: TDocumentId,
  replaceBody: TRolePermissionSchema,
  session?: ClientSession,
): Promise<TRolePermissionDoc> => {
  try {
    const assignment = await queryById(id, session);

    const newRoleId = new Types.ObjectId(replaceBody.role);
    const newPermissionId = new Types.ObjectId(replaceBody.permission);

    if (await checkExists(newRoleId, newPermissionId, id, session)) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        code: 'ROLE_PERMISSION_COMBINATION_ALREADY_EXISTS',
        message: 'Role-Permission combination already exists',
      });
    }

    assignment.role = newRoleId;
    assignment.permission = newPermissionId;
    await assignment.save({ session: session || null });

    return assignment;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      return create(replaceBody, session);
    }
    throw error;
  }
};

/**
 * Deletes a role-permission assignment by ID.
 *
 * @param id - The ID of the role-permission assignment to delete
 * @param session - Optional mongoose session for transactional operations
 * @returns The deleted role-permission assignment document
 * @throws ApiError if the role-permission assignment is not found
 */
const removeById = async (id: TDocumentId, session?: ClientSession): Promise<TRolePermissionDoc> => {
  const assignment = await RolePermission.findByIdAndDelete(id, { session: session || null });
  if (!assignment)
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Role-Permission assignment not found',
    });
  return assignment;
};

export const rolePermissionService = {
  create,
  query,
  queryById,
  updateById,
  removeById,
  replaceById,
};
