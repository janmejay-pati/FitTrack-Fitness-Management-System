import api from './api';

export const bmiService = {
  getHistory: () => api.get('/BMIApi/GetHistory'),
  getLatest: () => api.get('/BMIApi/GetLatest'),
  calculateAndSave: (height, weight) => 
    api.post('/BMIApi/CalculateAndSave', { height, weight })
};

export default bmiService;
