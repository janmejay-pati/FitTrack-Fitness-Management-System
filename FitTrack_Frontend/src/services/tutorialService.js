import api from './api';

export const tutorialService = {
  get: (category, search) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return api.get(`/TutorialsApi/Get?${params.toString()}`);
  }
};

export default tutorialService;
