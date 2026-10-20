import api from './api';

export const workoutPlanService = {
  getWorkoutPlans: (category, intensity) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (intensity) params.append('intensity', intensity);
    return api.get(`/PlansApi/GetWorkoutPlans?${params.toString()}`);
  },
  getRecommendedPlans: () => api.get('/PlansApi/GetRecommendedPlans')
};

export default workoutPlanService;
