import api from './api';

export const adminService = {
  getStats: () => api.get('/AdminApi/GetStats'),
  getUsers: () => api.get('/AdminApi/GetUsers'),
  deleteUser: (id) => api.post(`/AdminApi/DeleteUser/${id}`),
  saveDietPlan: (plan) => api.post('/AdminApi/SaveDietPlan', plan),
  deleteDietPlan: (id) => api.post(`/AdminApi/DeleteDietPlan/${id}`),
  saveWorkoutPlan: (plan) => api.post('/AdminApi/SaveWorkoutPlan', plan),
  deleteWorkoutPlan: (id) => api.post(`/AdminApi/DeleteWorkoutPlan/${id}`),
  saveTutorial: (tutorial) => api.post('/AdminApi/SaveTutorial', tutorial),
  deleteTutorial: (id) => api.post(`/AdminApi/DeleteTutorial/${id}`),
  broadcastNotification: (notification) => api.post('/AdminApi/SendBroadcastNotification', notification)
};

export default adminService;
