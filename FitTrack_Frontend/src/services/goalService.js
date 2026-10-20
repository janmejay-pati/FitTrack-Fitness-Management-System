import api from './api';

export const goalService = {
  get: () => api.get('/GoalsApi/Get'),
  create: (goalData) => api.post('/GoalsApi/Create', goalData),
  toggleComplete: (id) => api.post(`/GoalsApi/ToggleComplete/${id}`),
  delete: (id) => api.post(`/GoalsApi/Delete/${id}`)
};

export default goalService;
