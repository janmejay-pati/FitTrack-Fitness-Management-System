import api from './api';

export const workoutService = {
  getMyWorkouts: (category, search) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return api.get(`/WorkoutsApi/GetMyWorkouts?${params.toString()}`);
  },
  create: (workoutData) => api.post('/WorkoutsApi/Create', workoutData),
  update: (workoutData) => api.post('/WorkoutsApi/Update', workoutData),
  delete: (id) => api.post(`/WorkoutsApi/Delete/${id}`)
};

export default workoutService;
