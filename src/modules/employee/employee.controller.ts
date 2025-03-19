import { requestMiddleware } from '@/middleware/request-middleware';
import catchAsync from '@/modules/utils/catchAsync';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ApiError } from '../errors';
import { IOptions } from '../paginate/paginate';
import { pick } from '../utils';
import { querySchema } from '../validate/query';
import {
  employeeParamsSchema,
  employeeQueryByUserIdSchema,
  employeeSchema,
  EmployeeSchemaType,
  updateEmployeeSchema,
} from './employee.validation';
import { employeeService } from './index';

/**
 * @desc    Create a new employee
 * @route   POST /employees
 * @access  Private/Admin
 * @body    { first_name, last_name, email, department, position }
 */
const createHandler = catchAsync(async (req: Request<{}, {}, EmployeeSchemaType>, res: Response) => {
  const employee = await employeeService.create(req.body);
  res.status(httpStatus.CREATED).send(employee);
});

/**
 * @desc    Get all employees with pagination
 * @route   GET /employees
 * @access  Private/Admin
 * @query   { first_name?, last_name?, email?, department?, position?, sortBy?, limit?, page?, projectBy? }
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['first_name', 'last_name', 'email', 'department', 'position']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await employeeService.query(filter, options);
  res.send(result);
});

/**
 * @desc    Get a single employee by ID
 * @route   GET /employees/:employeeId
 * @access  Private/Admin
 * @param   {string} employeeId - MongoDB ObjectId
 */
const queryByIdHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
    const employee = await employeeService.queryById(employeeId);
    res.send(employee);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Employee ID');
  }
});

const queryByUserIdHandler = catchAsync(async (req: Request<{ userId: string }>, res: Response) => {
  const employee = await employeeService.queryByUserId(req.params.userId);
  res.status(httpStatus.OK).json(employee);
});

/**
 * @desc    Partially update an employee
 * @route   PATCH /employees/:employeeId
 * @access  Private/Admin
 * @param   {string} employeeId - MongoDB ObjectId
 * @body    { first_name?, last_name?, email?, department?, position? }
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
    const employee = await employeeService.updateById(employeeId, req.body);
    res.send(employee);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Employee ID');
  }
});

/**
 * @desc    Replace or create an employee
 * @route   PUT /employees/:employeeId
 * @access  Private/Admin
 * @param   {string} employeeId - MongoDB ObjectId
 * @body    { first_name, last_name, email, department, position }
 */
const upsertHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
    try {
      const updatedEmployee = await employeeService.replaceById(employeeId, req.body);
      res.send(updatedEmployee);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
        const newEmployee = await employeeService.create(req.body);
        res.status(httpStatus.CREATED).send(newEmployee);
      } else {
        throw error;
      }
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Employee ID');
  }
});

/**
 * @desc    Delete an employee
 * @route   DELETE /employees/:employeeId
 * @access  Private/Admin
 * @param   {string} employeeId - MongoDB ObjectId
 */
const removeByIdHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
    await employeeService.removeById(employeeId);
    res.status(httpStatus.NO_CONTENT).send();
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Employee ID');
  }
});

// Middleware-wrapped controller methods with validation
export const create = requestMiddleware(createHandler, { validation: { body: employeeSchema } });
export const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
export const queryById = requestMiddleware(queryByIdHandler, {
  validation: { params: employeeParamsSchema },
});
export const queryByUserId = requestMiddleware(queryByUserIdHandler, {
  validation: { params: employeeQueryByUserIdSchema },
});
export const partialUpdate = requestMiddleware(partialUpdateHandler, {
  validation: { params: employeeParamsSchema, body: updateEmployeeSchema },
});
export const upsert = requestMiddleware(upsertHandler, {
  validation: { params: employeeParamsSchema, body: employeeSchema },
});
export const removeById = requestMiddleware(removeByIdHandler, {
  validation: { params: employeeParamsSchema },
});

export const employeeController = {
  create,
  query,
  queryById,
  partialUpdate,
  upsert,
  removeById,
};
