import config from '@/config/config';
import { requestMiddleware } from '@/modules/auth/middleware/request-middleware';
import { TConfigMethodActions, THttpAction, THttpMethod } from '@/modules/resource';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/send-response';
import { resourceService } from './resource.service';

/**
 * @desc    Get available resources
 * @route   GET /resources
 * @access  Public
 */
const getResourcesHandler = catchAsync(async (_req: Request, res: Response) => {
  const resources = resourceService.getResources();

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Resources retrieved successfully',
    data: { resources },
  });
});

/**
 * @desc    Get HTTP method to action mappings
 * @route   GET /resources/method-actions
 * @access  Public
 */
const getMethodActionsHandler = catchAsync(async (_req: Request, res: Response) => {
  const response: TConfigMethodActions = {
    mappings: config.httpMethodToActionMap as Record<THttpMethod, THttpAction>,
    allowedMethods: Object.keys(config.httpMethodToActionMap) as THttpMethod[],
  };

  sendResponse({
    res,
    statusCode: httpStatus.OK,
    message: 'Method to action mappings retrieved successfully',
    data: response,
  });
});

// Middleware-wrapped controllers
const getResources = requestMiddleware(getResourcesHandler);
const getMethodActions = requestMiddleware(getMethodActionsHandler);

export const resourceController = {
  getResources,
  getMethodActions,
};
