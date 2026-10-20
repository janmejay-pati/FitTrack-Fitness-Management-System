import api from './api';

export const fitnessService = {
  /**
   * Fetches overall fitness intelligence:
   * - Personal Fitness Score (0-100) with category breakdown and trend vs last week
   * - Progress Intelligence (workout, hydration, nutrition, goal consistency % & 7-day trends)
   * - Goal Journey (active targets vs logged actuals, 25/50/75/100% milestones)
   * - Streaks (current, longest, active days)
   * - Adaptive Weekly Plan (7-day schedule with logged activities)
   */
  getIntelligence: async () => {
    return await api.get('/FitnessApi/GetIntelligence');
  },

  /**
   * Fetches unified fitness timeline events sorted chronologically (workouts, meals, water, bmi, goals, achievements)
   * @param {number} take - number of records (default 30)
   */
  getTimeline: async (take = 30) => {
    return await api.get(`/FitnessApi/GetTimeline?take=${take}`);
  },

  /**
   * Fetches real muscle group volume and activity distribution (Chest, Back, Shoulders, Arms, Legs, Core)
   */
  getMuscleActivity: async () => {
    return await api.get('/FitnessApi/GetMuscleActivity');
  }
};

export default fitnessService;
