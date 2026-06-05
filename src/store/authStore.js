import { create } from 'zustand';
import api from '../api/client';

const storedToken = () => localStorage.getItem('token');

const useAuthStore = create((set) => ({
  user: null,
  token: storedToken(),
  isAuthenticated: Boolean(storedToken()),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (full_name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { full_name, email, password, role });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchUser: async () => {
    const token = storedToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return null;
    }

    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, token, isAuthenticated: true, isLoading: false });
      return data;
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },
}));

export default useAuthStore;
