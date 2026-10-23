import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.get(
  '/overview',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  AnalyticsController.getDashboardAnalytics,
);

export const AnalyticsRoutes = router;
