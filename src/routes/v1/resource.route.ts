import { resourceController } from '@/modules/resource/resource.controller';
import express from 'express';

const resourceRoute = express.Router();

resourceRoute.route('/').get(resourceController.getResources);
resourceRoute.get('/allowed-http-method-actions', resourceController.getMethodActions);

export default resourceRoute;
