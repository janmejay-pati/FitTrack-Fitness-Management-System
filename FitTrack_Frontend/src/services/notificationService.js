import api from './api';

export const notificationService = {
  get: () => api.get('/NotificationsApi/Get'),
  markAsRead: (id) => api.post(`/NotificationsApi/MarkAsRead/${id}`),
  markAllAsRead: () => api.post('/NotificationsApi/MarkAllAsRead')
};

export default notificationService;
