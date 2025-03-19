import { rolePermissionController } from '@/modules/role-permission';
import { Router } from 'express';

const rolePermissionRoute = Router();

rolePermissionRoute.route('/').get(rolePermissionController.query).post(rolePermissionController.create);

rolePermissionRoute
  .route('/:id')
  .get(rolePermissionController.queryById)
  .put(rolePermissionController.upsert)
  .patch(rolePermissionController.partialUpdate)
  .delete(rolePermissionController.removeById);

export default rolePermissionRoute;
