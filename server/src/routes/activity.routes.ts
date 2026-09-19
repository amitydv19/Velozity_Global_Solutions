import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', activityController.list);

export default router;
