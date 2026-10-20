import api from './api';

export const achievementService = {
  get: () => api.get('/AchievementsApi/Get')
};

export default achievementService;
