import { Router } from 'express';
import { UserRole } from '../config/enums.js';
import { authMiddleware, requireRoles } from '../middleware/auth.middleware.js';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRoles(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  async (_req, res, next) => {
    try {
      const developers = await userService.listDevelopers();
      sendSuccess(res, { developers });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
