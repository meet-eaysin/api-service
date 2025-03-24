import { ApiError } from '@/modules/errors';
import httpStatus from 'http-status';
import { ErrorCode } from '../errors/error-codes';
import { IOptions } from '../paginate/paginate';
import { DocumentId } from '../validate/id';
import { IEmployeeDoc } from './employee.interface';
import Employee from './employee.model';
import { EmployeeSchemaType, UpdateEmployeeSchemaType } from './employee.validation';

/**
 * Create an employee
 * @param {EmployeeSchemaType} employeeBody - The employee body to create
 * @returns {Promise<IEmployeeDoc>} The created employee
 * @throws {ApiError} if email is already taken
 */
export const create = async (employeeBody: EmployeeSchemaType): Promise<IEmployeeDoc> => {
  return Employee.create(employeeBody);
};

/**
 * Query for employees
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>} The query result
 */
export const query = async (filter: Record<string, any>, options: IOptions) => {
  return await Employee.paginate(filter, options);
};

/**
 * Get employee by id
 * @param {ObjectId} id - The employee id
 * @returns {Promise<IEmployeeDoc>} The employee
 * @throws {ApiError} if employee is not found
 */
export const queryById = async (id: DocumentId): Promise<IEmployeeDoc> => {
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
export const queryByUserId = async (userId: DocumentId): Promise<IEmployeeDoc> => {
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
export const replaceById = async (employeeId: DocumentId, updateBody: EmployeeSchemaType): Promise<IEmployeeDoc> => {
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
export const updateById = async (employeeId: DocumentId, updateBody: UpdateEmployeeSchemaType): Promise<IEmployeeDoc> => {
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
export const removeById = async (employeeId: DocumentId): Promise<IEmployeeDoc> => {
  const employee = await queryById(employeeId);
  await employee.deleteOne();
  return employee;
};

export const employeeService = {
  create,
  query,
  queryById,
  replaceById,
  updateById,
  removeById,
};
