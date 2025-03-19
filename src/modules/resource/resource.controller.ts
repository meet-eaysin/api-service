import config from '@/config/config';
import { requestMiddleware } from '@/middleware/request-middleware';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils';
import { ConfigMethodActions, HttpAction, HttpMethod } from './resource.interface';
import { resourceService } from './resource.service';

const getResourcesHandler = catchAsync(async (_req: Request, res: Response) => {
  const resources = resourceService.getResources();
  res.status(httpStatus.OK).json({ resources });
});

const getMethodActionsHandler = catchAsync(async (_req: Request, res: Response) => {
  const response: ConfigMethodActions = {
    mappings: config.httpMethodToActionMap as Record<HttpMethod, HttpAction>,
    allowedMethods: Object.keys(config.httpMethodToActionMap) as HttpMethod[],
  };

  res.status(httpStatus.OK).json(response);
});

const getResources = requestMiddleware(getResourcesHandler);
const getMethodActions = requestMiddleware(getMethodActionsHandler);

export const resourceController = {
  getResources,
  getMethodActions,
};
