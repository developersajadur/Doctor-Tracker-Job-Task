import api from '../lib/api';
import { IApiResponse, IUser } from '../types';

export const AuthService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<IApiResponse<{ user: IUser; token: string }>>(
      '/auth/login',
      credentials,
    );
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // Also set token in cookie for Next.js middleware
      document.cookie = `token=${response.data.data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<IApiResponse<IUser>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/login';
    }
  },

  getCurrentUser: (): IUser | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};
