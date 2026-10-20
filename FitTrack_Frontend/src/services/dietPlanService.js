import api from './api';

export const dietPlanService = {
  getDietPlans: (category) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    return api.get(`/PlansApi/GetDietPlans?${params.toString()}`);
  },
  getRecommendedPlans: () => api.get('/PlansApi/GetRecommendedPlans')
};

export default dietPlanService;
