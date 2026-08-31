import { api } from './api-client';
import { Role } from './auth-api';

export interface FullProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  avatar: string | null;
  role: Role;
  trustCoins: number;
  createdAt: string;
}

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function avatarUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
}

export const userApi = {
  getProfile: () => api.get<FullProfile>('/users/me').then((r) => r.data),
  updateProfile: (data: { name?: string; phone?: string; city?: string; country?: string }) =>
    api.patch<FullProfile>('/users/me', data).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<FullProfile>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};

export function isProfileComplete(profile: FullProfile | undefined | null) {
  return !!(profile?.phone && profile?.city && profile?.country);
}