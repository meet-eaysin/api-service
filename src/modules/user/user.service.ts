import { ApiError, ErrorCode } from '@/modules/errors';
import { TOptions, TQueryResult } from '@/modules/paginate';
import { TUpdateUserSchema, TUserDoc, TUserSchema, User } from '@/modules/user';
import { TDocumentId } from '@/modules/validate';
import httpStatus from 'http-status';
import { ClientSession } from 'mongoose';

/**
 * Create a user
 * @param {UserSchemaType} userBody - User data
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<IUserDoc>} Created user
 */
const create = async (userBody: TUserSchema, session?: ClientSession): Promise<TUserDoc> => {
  if (await User.isEmailTaken(userBody.email, undefined, session)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.EMAIL_ALREADY_TAKEN,
      message: 'Email already taken',
    });
  }
  const [user] = await User.create([userBody], { session });
  return user as TUserDoc;
};

/**
 * Register a user
 * @param {UserSchemaType} userBody - User registration data
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<IUserDoc>} Registered user
 */
const register = async (userBody: TUserSchema, session?: ClientSession): Promise<TUserDoc> => {
  if (await User.isEmailTaken(userBody.email, undefined, session)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.EMAIL_ALREADY_TAKEN,
      message: 'Email already taken',
    });
  }
  const [user] = await User.create([userBody], { session });
  return user as TUserDoc;
};

/**
 * Query for users
 * @param {Record<string, any>} filter - Mongo filter
 * @param {IOptions} options - Query options
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<QueryResult>} Paginated users
 */
const query = async (
  filter: Record<string, any>,
  options: TOptions,
  session?: ClientSession,
): Promise<TQueryResult<TUserDoc>> => {
  return User.paginate(filter, options, session);
};

/**
 * Get user by ID
 * @param {TTDocumentId} id - User ID
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<IUserDoc | null>} User document
 */
const queryById = async (id: TDocumentId, session?: ClientSession): Promise<TUserDoc | null> => {
  return User.findById(id)
    .session(session || null)
    .populate('role');
};

/**
 * Get user by email
 * @param {string} email - User email
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<IUserDoc | null>} User document
 */
const getByEmail = async (email: string, session?: ClientSession): Promise<TUserDoc | null> => {
  return User.findOne({ email }).session(session || null);
};

/**
 * Update user by ID
 * @param {TDocumentId} userId - User ID
 * @param {UpdateUserSchemaType} updateBody - Update data
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<IUserDoc>} Updated user
 */
const updateById = async (
  userId: TDocumentId,
  updateBody: TUpdateUserSchema,
  session?: ClientSession,
): Promise<TUserDoc> => {
  const user = await queryById(userId, session);
  if (!user) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.NOT_FOUND,
      message: 'User not found',
    });
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId, session))) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.EMAIL_ALREADY_TAKEN,
      message: 'Email already taken',
    });
  }

  Object.assign(user, updateBody);
  await user.save({ session: session || null });
  return user;
};

/**
 * Delete user by ID
 * @param {TDocumentId} userId - User ID
 * @param {ClientSession} [session] - MongoDB transaction session
 * @returns {Promise<IUserDoc>} Deleted user
 */
const removeById = async (userId: TDocumentId, session?: ClientSession): Promise<TUserDoc> => {
  const user = await User.findByIdAndDelete(userId, { session: session || null });
  if (!user) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.NOT_FOUND,
      message: 'User not found',
    });
  }
  return user;
};

/**
 * Get users by employee ID (returns array for flexibility)
 * @param {TDocumentId | null} [employeeId=null] - Employee ID (null for unassigned)
 * @param {ClientSession} [session] - MongoDB session
 * @returns {Promise<IUserDoc[]>} Array of users
 */
const getByEmployeeId = async (employeeId: TDocumentId | null = null, session?: ClientSession): Promise<TUserDoc[]> => {
  return User.find({ employee: employeeId })
    .session(session || null)
    .populate('role');
};

export const userService = {
  query,
  create,
  register,
  getByEmployeeId,
  queryById,
  getByEmail,
  updateById,
  removeById,
};
