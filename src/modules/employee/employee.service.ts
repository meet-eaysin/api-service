import { Employee, TEmployeeDoc, TEmployeeSchema, TUpdateEmployeeSchema } from '@/modules/employee';
import { ApiError, ErrorCode } from '@/modules/errors';
import { TOptions } from '@/modules/paginate';
import { TDocumentId } from '@/modules/validate';
import httpStatus from 'http-status';

/**
 * Create an employee
 * @param {EmployeeSchemaType} employeeBody - The employee body to create
 * @returns {Promise<IEmployeeDoc>} The created employee
 * @throws {ApiError} if email is already taken
 */
export const create = async (employeeBody: TEmployeeSchema): Promise<TEmployeeDoc> => {
  return Employee.create(employeeBody);
};

/**
 * Query for employees
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>} The query result
 */
export const query = async (filter: Record<string, any>, options: TOptions) => {
  return await Employee.paginate(filter, options);
};

/**
 * Get employee by id
 * @param {ObjectId} id - The employee id
 * @returns {Promise<IEmployeeDoc>} The employee
 * @throws {ApiError} if employee is not found
 */
export const queryById = async (id: TDocumentId): Promise<TEmployeeDoc> => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.EMPLOYEE_NOT_FOUND,
      message: 'Employee not found',
    });
  }
  return employee;
};

/**
 * Get employee by user id
 * @param {ObjectId} userId - The user id
 * @returns {Promise<IEmployeeDoc>} The employee
 * @throws {ApiError} if employee is not found
 */
export const queryByUserId = async (userId: TDocumentId): Promise<TEmployeeDoc> => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.EMPLOYEE_NOT_FOUND,
      message: 'Employee not found for this user',
    });
  }

  return employee;
};

/**
 * Replace employee by id
 * @param {ObjectId} employeeId - The employee id to replace
 * @param {EmployeeSchemaType} updateBody - The employee body to replace
 * @returns {Promise<IEmployeeDoc>} The replaced employee
 * @throws {ApiError} if employee is not found
 * @throws {ApiError} if email is already taken
 */
export const replaceById = async (employeeId: TDocumentId, updateBody: TEmployeeSchema): Promise<TEmployeeDoc> => {
  const employee = await queryById(employeeId);

  Object.assign(employee, updateBody);
  await employee.save();
  return employee;
};

/**
 * Update employee by id
 * @param {ObjectId} employeeId - The employee id to update
 * @param {UpdateEmployeeSchemaType} updateBody - The employee body to update
 * @returns {Promise<IEmployeeDoc>} The updated employee
 * @throws {ApiError} if employee is not found
 * @throws {ApiError} if email is already taken
 */
export const updateById = async (employeeId: TDocumentId, updateBody: TUpdateEmployeeSchema): Promise<TEmployeeDoc> => {
  const employee = await queryById(employeeId);

  Object.assign(employee, updateBody);
  await employee.save();
  return employee;
};

/**
 * Delete employee by id
 * @param {ObjectId} employeeId - The employee id to delete
 * @returns {Promise<IEmployeeDoc>} The deleted employee
 * @throws {ApiError} if employee is not found
 */
export const removeById = async (employeeId: TDocumentId): Promise<TEmployeeDoc> => {
  const employee = await queryById(employeeId);
  await employee.deleteOne();
  return employee;
};

export const employeeService = {
  create,
  query,
  queryById,
  replaceById,
  queryByUserId,
  updateById,
  removeById,
};
