import api from './api';

export const userService = {
  getProfile: () => api.get('/Profile/Get'),
  updateProfile: (profileData) => api.post('/Profile/Update', profileData),
  uploadImage: (formData) => api.post('/Profile/UploadImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default userService;
