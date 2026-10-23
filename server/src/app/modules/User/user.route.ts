import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';

const router = express.Router();

router.post(
  '/login',
  validateRequest(UserValidation.loginUserValidationSchema),
  UserController.loginUser,
);

router.post(
  '/create-user',
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser,
);

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  UserController.getMe,
);

router.post(
  '/logout',
  UserController.logoutUser,
);

export const UserRoutes = router;
