import api from './api';

export const mealService = {
  getMyMeals: (mealType, search) => {
    const params = new URLSearchParams();
    if (mealType) params.append('mealType', mealType);
    if (search) params.append('search', search);
    return api.get(`/MealsApi/GetMyMeals?${params.toString()}`);
  },
  create: (mealData) => api.post('/MealsApi/Create', mealData),
  update: (mealData) => api.post('/MealsApi/Update', mealData),
  delete: (id) => api.post(`/MealsApi/Delete/${id}`)
};

export default mealService;
