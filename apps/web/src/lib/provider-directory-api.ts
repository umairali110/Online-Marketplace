import { api } from './api-client';
import { NearbyProvider } from './nearby-providers-api';

export interface ProviderPublicProfile extends Omit<NearbyProvider, 'distanceKm' | 'matchScore'> {
  gigs: {
    id: string;
    title: string;
    description: string;
    price: number;
    deliveryDays: number;
    images: string[];
    category: { id: string; name: string; slug: string };
  }[];
}

export const providerDirectoryApi = {
  listByCategory: (slug: string) => api.get<Omit<NearbyProvider, 'distanceKm' | 'matchScore'>[]>(`/providers/by-category/${slug}`).then((r) => r.data),
  getPublicProfile: (id: string) => api.get<ProviderPublicProfile>(`/providers/${id}/public`).then((r) => r.data),
};