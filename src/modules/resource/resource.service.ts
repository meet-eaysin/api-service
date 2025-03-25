// resource.service.ts

import config from '@/config/config';
import { TResource } from '@/modules/resource';
import { defaultIRoute } from '@/routes/v1';

const mapMethodToAction = (method: string): string => {
  return config.httpMethodToActionMap[method] || 'read';
};

const getResources = (): TResource[] => {
  return defaultIRoute.map((route) => ({
    name: route.resourceName || route.path.replace(/^\//, '').replace(/\//g, '-'),
    path: route.path,
    methods: route.allowedMethods || ['GET'],
    actions: [...new Set((route.allowedMethods || ['GET']).map((method) => mapMethodToAction(method)))],
  }));
};

export const resourceService = {
  getResources,
};
