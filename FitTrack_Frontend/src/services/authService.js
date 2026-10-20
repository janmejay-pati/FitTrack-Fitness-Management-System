import api from './api';

export const authService = {
  login: (email, password) =>
    api.post('/Users/Login', { email, password }),

  register: (userData) =>
    api.post('/Users/Register', userData),

  logout: () =>
    api.post('/Users/Logout'),

  getCurrentUser: () =>
    api.get('/Users/CurrentUser'),

  changePassword: (oldPassword, newPassword) =>
    api.post('/Users/ChangePassword', {
      oldPassword,
      newPassword
    }),

  adminLogin: (email, password) =>
    api.post('/Users/AdminLogin', { email, password })
};

export default authService;