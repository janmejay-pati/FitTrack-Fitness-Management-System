import api from './api';

export const dashboardService = {
  getStats: () => api.get('/DashboardApi/GetStats'),
  getWeeklyProgress: () => api.get('/DashboardApi/GetWeeklyProgress'),
  getRecentActivity: () => api.get('/DashboardApi/GetRecentActivity')
};

export default dashboardService;
