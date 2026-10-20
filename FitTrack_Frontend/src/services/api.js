import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44365';


const baseURL = rawBaseURL.replace(/\/+$/, '');

console.log('FITTRACK API BASE URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data
    ) {
      if (!response.data.success) {
        return Promise.reject(
          new Error(response.data.message || 'Request failed')
        );
      }

      return response.data.data;
    }

    return response.data;
  },
  (error) => {
    console.error('FitTrack API error:', error);

    if (error.response) {
      const data = error.response.data;

      if (data && typeof data === 'object' && data.message) {
        return Promise.reject(new Error(data.message));
      }

      if (typeof data === 'string') {
        return Promise.reject(new Error(data));
      }

      return Promise.reject(
        new Error(
          `Request failed with HTTP ${error.response.status}`
        )
      );
    }

    if (error.request) {
      return Promise.reject(
        new Error(
          'Unable to connect to the FitTrack backend. Check backend, HTTPS certificate, CORS and API URL.'
        )
      );
    }

    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

export default api;
