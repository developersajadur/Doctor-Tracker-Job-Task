import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { AnalyticsService } from './analytics.service';

const getDashboardAnalytics = catchAsync(async (_req, res) => {
  const result = await AnalyticsService.getDashboardAnalyticsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard analytics retrieved successfully!',
    data: result,
  });
});

export const AnalyticsController = {
  getDashboardAnalytics,
};
