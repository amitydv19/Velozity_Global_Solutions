import { Router } from 'express';
import { UserRole } from '../config/enums.js';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware, requireRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(authMiddleware, requireRoles(UserRole.ADMIN));

router.get('/', userController.list);
router.post('/', validate(createUserSchema), userController.create);
router.get('/:id', validate(userIdParamSchema, 'params'), userController.get);
router.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  userController.update,
);
router.delete('/:id', validate(userIdParamSchema, 'params'), userController.remove);

export default router;
