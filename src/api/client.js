import axios from 'axios';

const localApiBaseUrl = (() => {
  if (typeof window === 'undefined') return '/api';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return 'http://localhost:3001/api';
  }
  return '/api';
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || localApiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  },
);

export default api;
