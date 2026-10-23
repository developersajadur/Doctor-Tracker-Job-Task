import api from '../lib/api';
import { IApiResponse, IDashboardAnalytics } from '../types';

export const AnalyticsService = {
  getDashboardAnalytics: async () => {
    const response = await api.get<IApiResponse<IDashboardAnalytics>>(
      '/analytics/overview',
    );
    return response.data;
  },
};
