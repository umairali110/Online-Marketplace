import { api } from './api-client';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface ProviderProfile {
  id: string;
  bio: string | null;
  skills: string[];
  tags: string[];
  city: string | null;
  country: string | null;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  categories: { id: string; name: string; slug: string }[];
  createdAt: string;
}

export interface VoiceExtractResult {
  bio: string;
  skills: string[];
  matchedCategories: { id: string; name: string; slug: string }[];
}

export const serviceCategoriesApi = {
  list: () => api.get<ServiceCategory[]>('/service-categories').then((r) => r.data),
};

export const providerProfileApi = {
  getMine: () => api.get<ProviderProfile | null>('/provider/profile').then((r) => r.data),
    create: (data: { bio?: string; skills?: string[]; categorySlugs: string[]; city: string; country: string; latitude?: number; longitude?: number }) =>
    api.post<ProviderProfile>('/provider/profile', data).then((r) => r.data),
  extractFromVoice: (transcript: string) =>
    api.post<VoiceExtractResult>('/provider/profile/extract-voice', { transcript }).then((r) => r.data),
};