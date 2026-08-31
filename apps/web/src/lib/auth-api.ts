import { api } from './api-client';

export type Role = 'CUSTOMER' | 'SELLER' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const authApi = {
    register: (data: { name: string; email: string; password: string; role?: 'CUSTOMER' | 'SELLER' | 'PROVIDER' }) =>
    api.post('/auth/register', data).then((r) => r.data),

  verifyOtp: (data: { email: string; code: string }) =>
    api.post('/auth/verify-otp', data).then((r) => r.data),

  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User }>('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    api.post('/auth/reset-password', data).then((r) => r.data),
  logoutAll: () => api.post('/auth/logout-all').then((r) => r.data),
};