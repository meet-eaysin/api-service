import { ApiError } from '@/modules/errors';
import httpStatus from 'http-status';
import { ClientSession, FilterQuery } from 'mongoose';
import { IOptions, QueryResult } from '../paginate/paginate';
import { DocumentId } from '../validate';
import { IRoleDoc } from './role.interface';
import { Role } from './role.model';
import { RoleSchemaType, UpdateRoleSchemaType } from './role.validation';

/**
 * Checks if a role with the given name already exists.
 * @param {string} name - The role name to check
 * @param {DocumentId} [excludeId] - The id of the role to exclude from the check (for updating)
 * @param {ClientSession} [session] - Optional mongoose session for transactional operations
 * @returns {Promise<boolean>} Whether the role name is already taken
 */
const checkNameTaken = async (name: string, excludeId?: DocumentId, session?: ClientSession): Promise<boolean> => {
  const query: FilterQuery<IRoleDoc> = { name };
  if (excludeId) query._id = { $ne: excludeId };
  return !!(await Role.findOne(query).session(session || null));
};

/**
 * Create a new role.
 *
 * @param {RoleSchemaType} roleBody - The data for the role to be created.
 * @param {ClientSession} [session] - Optional mongoose session for transactional operations.
 * @returns {Promise<IRoleDoc>} The created role document.
 * @throws {ApiError} If the role name is already taken.
 */

const create = async (roleBody: RoleSchemaType, session?: ClientSession): Promise<IRoleDoc> => {
  if (await checkNameTaken(roleBody.name)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: 'ROLE_NAME_ALREADY_TAKEN',
      message: 'Role name already taken',
    });
  }

  const result = await Role.create([roleBody], { session });

  return result[0] as IRoleDoc;
};

/**
 * Query for roles with pagination
 * @param {FilterQuery<IRoleDoc>} filter - Mongo filter
 * @param {IOptions} options - Pagination options
 * @param {ClientSession} [session] - Optional mongoose session for transactional operations
 * @returns {Promise<QueryResult>} Paginated query result
 */

const query = async (
  filter: FilterQuery<IRoleDoc>,
  options: IOptions,
  session?: ClientSession,
): Promise<QueryResult<IRoleDoc>> => {
  return Role.paginate(filter, options, session);
};

/**
 * Get a role by ID.
 *
 * @param id - The ID of the role to retrieve
 * @param session - Optional mongoose session for transactional operations
 * @returns The role document
 * @throws ApiError if the role is not found
 */

const queryById = async (id: DocumentId, session?: ClientSession): Promise<IRoleDoc> => {
  const role = await Role.findById(id).session(session || null);
  if (!role)
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Role not found',
    });
  return role;
};

/**
 * Retrieves a role by its name.
 *
 * @param name - The name of the role to retrieve
 * @param session - Optional mongoose session for transactional operations
 * @returns The role document if found, otherwise null
 */

const queryByName = async (name: string, session?: ClientSession): Promise<IRoleDoc | null> => {
  return Role.findOne({ name }).session(session || null);
};

/**
 * Partially update a role
 * @param roleId - The ID of the role to update
 * @param updateBody - The partial role body
 * @param session - Optional mongoose session for transactional operations
 * @returns The updated role document
 * @throws ApiError if role not found or if the role name is already taken
 */
const updateById = async (
  roleId: DocumentId,
  updateBody: UpdateRoleSchemaType,
  session?: ClientSession,
): Promise<IRoleDoc> => {
  const role = await queryById(roleId, session);

  if (updateBody.name && updateBody.name !== role.name) {
    if (await checkNameTaken(updateBody.name, roleId, session)) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        code: 'ROLE_NAME_ALREADY_TAKEN',
        message: 'Role name already taken',
      });
    }
    role.name = updateBody.name;
  }

  if (typeof updateBody.description !== 'undefined') {
    role.description = updateBody.description;
  }

  await role.save({ session: session || null });
  return role;
};

/**
 * Completely replace a role document
 * @param roleId - The ID of the role to replace
 * @param replaceBody - The complete role data for replacement
 * @param session - Optional mongoose session for transactional operations
 * @returns The replaced role document
 * @throws ApiError if role not found or if the role name is already taken
 */
const replaceById = async (roleId: DocumentId, replaceBody: RoleSchemaType, session?: ClientSession): Promise<IRoleDoc> => {
  // Check if new name is already taken by another role
  if (await checkNameTaken(replaceBody.name, roleId, session)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: 'ROLE_NAME_ALREADY_TAKEN',
      message: 'Role name already taken',
    });
  }

  // Get existing role and completely replace its properties
  const role = await queryById(roleId, session);

  // Use Object.assign to maintain prototype and hooks
  Object.assign(role, {
    ...replaceBody,
    _id: roleId, // Ensure ID remains unchanged
  });

  // Validate and save through Mongoose middleware
  await role.save({ session: session || null });
  return role;
};

/**
 * Deletes a role by ID.
 *
 * @param roleId - ID of the role to delete
 * @param session - Optional mongoose session for transactional operations
 * @returns The deleted role document
 * @throws ApiError if the role is not found
 */
const removeById = async (roleId: DocumentId, session?: ClientSession): Promise<IRoleDoc> => {
  const role = await Role.findByIdAndDelete(roleId, { session: session || null });
  if (!role)
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Role not found',
    });
  return role;
};

export const roleService = {
  create,
  query,
  updateById,
  queryByName,
  replaceById,
  queryById,
  removeById,
};
