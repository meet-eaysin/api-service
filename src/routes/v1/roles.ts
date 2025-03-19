import { roleController } from '@/modules/role';
import { Router } from 'express';

const roleRoutes = Router();

roleRoutes.route('/').get(roleController.query).post(roleController.create);

roleRoutes
  .route('/:id')
  .get(roleController.queryById)
  .put(roleController.upsert)
  .patch(roleController.partialUpdate)
  .delete(roleController.removeById);

export default roleRoutes;
