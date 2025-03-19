import express, { Router } from 'express';
import config from '../../config/config';
import authRoute from './auth.route';
import employeesRoute from './employee.route';
import permissionRoute from './permission.route';
import resourceRoute from './resource.route';
import rolePermissionRoute from './role-permissions.route';
import roleRoutes from './roles';
import docsRoute from './swagger.route';
import { default as userRoute } from './user.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
  resourceName?: string;
  allowedMethods?: string[];
}

export const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
    resourceName: 'auth',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    path: '/users',
    route: userRoute,
    resourceName: 'users',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    path: '/employees',
    route: employeesRoute,
    resourceName: 'employee',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    path: '/roles',
    route: roleRoutes,
    resourceName: 'role',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
  // {
  //   path: '/departments',
  //   route: departmentRoute,
  // },
  {
    path: '/permissions',
    route: permissionRoute,
    resourceName: 'permission',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    path: '/rolePermissions',
    route: rolePermissionRoute,
    resourceName: 'role-permission',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    path: '/resource',
    route: resourceRoute,
    resourceName: 'resource',
    allowedMethods: ['POST', 'GET', 'POST', 'PUT', 'DELETE'],
  },
];

export const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
