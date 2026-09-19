import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createProjectSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from '../validators/project.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', projectController.list);
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/:id', validate(projectIdParamSchema, 'params'), projectController.get);
router.patch(
  '/:id',
  validate(projectIdParamSchema, 'params'),
  validate(updateProjectSchema),
  projectController.update,
);
router.delete('/:id', validate(projectIdParamSchema, 'params'), projectController.remove);

export default router;
