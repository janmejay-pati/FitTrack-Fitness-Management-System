import api from './api';

export const waterService = {
  getToday: () => api.get('/WaterApi/GetToday'),
  getHistory: () => api.get('/WaterApi/GetHistory'),
  addWater: (amountInMl) => api.post('/WaterApi/Add', { amountInMl }),
  deleteWater: (id) => api.post(`/WaterApi/Delete/${id}`)
};

export default waterService;
