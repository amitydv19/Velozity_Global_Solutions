import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { notificationIdParamSchema } from '../validators/notification.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  notificationController.markRead,
);

export default router;
