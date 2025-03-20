import catchAsync from '@/modules/utils/catch-async';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { requestMiddleware } from '../auth';
import { ApiError } from '../errors';
import { ErrorCode } from '../errors/error-codes';
import { IOptions } from '../paginate/paginate';
import { pick } from '../utils';
import { sendResponse } from '../utils/send-response';
import { querySchema } from '../validate';
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
 */
const createHandler = catchAsync(async (req: Request<{}, {}, EmployeeSchemaType>, res: Response) => {
  const employee = await employeeService.create(req.body);

  sendResponse({
    res,
    statusCode: httpStatus.CREATED,
    message: 'Employee created successfully',
    data: employee,
  });
});

/**
 * @desc    Get all employees with pagination
 * @route   GET /employees
 * @access  Private/Admin
 */
const queryHandler = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['first_name', 'last_name', 'email', 'department', 'position']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await employeeService.query(filter, options);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Employees retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Get a single employee by ID
 * @route   GET /employees/:employeeId
 * @access  Private/Admin
 */
const queryByIdHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid Employee ID',
    });
  }

  const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
  const employee = await employeeService.queryById(employeeId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Employee retrieved successfully',
    data: employee,
  });
});

const queryByUserIdHandler = catchAsync(async (req: Request<{ userId: string }>, res: Response) => {
  const employee = await employeeService.queryByUserId(req.params.userId);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Employee retrieved successfully',
    data: employee,
  });
});

/**
 * @desc    Partially update an employee
 * @route   PATCH /employees/:employeeId
 * @access  Private/Admin
 */
const partialUpdateHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid Employee ID',
    });
  }

  const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
  const employee = await employeeService.updateById(employeeId, req.body);

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Employee updated successfully',
    data: employee,
  });
});

/**
 * @desc    Replace or create an employee
 * @route   PUT /employees/:employeeId
 * @access  Private/Admin
 */
const upsertHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid Employee ID',
    });
  }

  const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);

  try {
    const updatedEmployee = await employeeService.replaceById(employeeId, req.body);
    sendResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.NOT_FOUND) {
      const newEmployee = await employeeService.create(req.body);
      sendResponse({
        res,
        statusCode: httpStatus.CREATED,
        message: 'Employee created successfully',
        data: newEmployee,
      });
    } else {
      throw error;
    }
  }
});

/**
 * @desc    Delete an employee
 * @route   DELETE /employees/:employeeId
 * @access  Private/Admin
 */
const removeByIdHandler = catchAsync(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      code: ErrorCode.INVALID_ID,
      message: 'Invalid Employee ID',
    });
  }

  const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
  await employeeService.removeById(employeeId);

  sendResponse({
    res,
    statusCode: httpStatus.NO_CONTENT,
    message: 'Employee deleted successfully',
  });
});

// Middleware-wrapped exports remain unchanged
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
