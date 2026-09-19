import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  taskIdParamSchema,
  taskListQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(taskListQuerySchema, 'query'), taskController.list);
router.post('/', validate(createTaskSchema), taskController.create);
router.get('/:id', validate(taskIdParamSchema, 'params'), taskController.get);
router.patch(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema),
  taskController.update,
);
router.patch(
  '/:id/status',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskStatusSchema),
  taskController.updateStatus,
);
router.delete('/:id', validate(taskIdParamSchema, 'params'), taskController.remove);

export default router;
