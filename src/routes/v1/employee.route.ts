import { employeeController } from '@/modules/employee';
import { Router } from 'express';

const employeesRoute = Router();

employeesRoute.route('/').get(employeeController.query).post(employeeController.create);

employeesRoute
  .route('/:id')
  .get(employeeController.queryById)
  .put(employeeController.upsert)
  .patch(employeeController.partialUpdate)
  .delete(employeeController.removeById);

employeesRoute.route('/users/:userId').get(employeeController.queryByUserId);

export default employeesRoute;
