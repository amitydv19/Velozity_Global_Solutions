import { Router } from 'express';
import { UserRole } from '../config/enums.js';
import * as clientController from '../controllers/client.controller.js';
import { authMiddleware, requireRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  clientIdParamSchema,
  createClientSchema,
  updateClientSchema,
} from '../validators/client.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles(UserRole.ADMIN, UserRole.PROJECT_MANAGER), clientController.list);
router.get(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate(clientIdParamSchema, 'params'),
  clientController.get,
);

router.post(
  '/',
  requireRoles(UserRole.ADMIN),
  validate(createClientSchema),
  clientController.create,
);
router.patch(
  '/:id',
  requireRoles(UserRole.ADMIN),
  validate(clientIdParamSchema, 'params'),
  validate(updateClientSchema),
  clientController.update,
);
router.delete(
  '/:id',
  requireRoles(UserRole.ADMIN),
  validate(clientIdParamSchema, 'params'),
  clientController.remove,
);

export default router;
