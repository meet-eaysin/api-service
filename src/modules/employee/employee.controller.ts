import { requestMiddleware } from '@/modules/auth/middleware/request-middleware';
import { ApiError, ErrorCode } from '@/modules/errors';
import { TOptions } from '@/modules/paginate';
import { pick, sendResponse } from '@/modules/utils';
import { catchAsync } from '@/modules/utils/catch-async';
import { querySchema } from '@/modules/validate';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import {
  employeeByUserIdSchema,
  employeeIdSchema,
  employeeSchema,
  employeeService,
  updateEmployeeSchema,
  type TEmployeeSchema,
} from './index';

/**
 * @desc    Create a new employee
 * @route   POST /employees
 * @access  Private/Admin
 */
const createHandler = catchAsync(async (req: Request<{}, {}, TEmployeeSchema>, res: Response) => {
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
  const options: TOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
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
const create = requestMiddleware(createHandler, { validation: { body: employeeSchema } });
const query = requestMiddleware(queryHandler, { validation: { query: querySchema } });
const queryById = requestMiddleware(queryByIdHandler, {
  validation: { params: employeeIdSchema },
});
const queryByUserId = requestMiddleware(queryByUserIdHandler, {
  validation: { params: employeeByUserIdSchema },
});
const partialUpdate = requestMiddleware(partialUpdateHandler, {
  validation: { params: employeeIdSchema, body: updateEmployeeSchema },
});
const upsert = requestMiddleware(upsertHandler, {
  validation: { params: employeeIdSchema, body: employeeSchema },
});
const removeById = requestMiddleware(removeByIdHandler, {
  validation: { params: employeeIdSchema },
});

export const employeeController = {
  create,
  query,
  queryById,
  partialUpdate,
  queryByUserId,
  upsert,
  removeById,
};
