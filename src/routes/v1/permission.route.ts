import { permissionController } from '@/modules/permission';
import { Router } from 'express';

const permissionRoute = Router();

permissionRoute.route('/').get(permissionController.query).post(permissionController.create);

permissionRoute
  .route('/:id')
  .get(permissionController.queryById)
  .put(permissionController.upsert)
  .patch(permissionController.partialUpdate)
  .delete(permissionController.removeById);

export default permissionRoute;
