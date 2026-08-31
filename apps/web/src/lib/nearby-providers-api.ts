import { api } from './api-client';

export interface NearbyProvider {
  providerId: string;
  userId: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  skills: string[];
  city: string | null;
  country: string | null;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  categories: { id: string; name: string; slug: string }[];
  distanceKm: number;
  matchScore: number;
}

export const nearbyProvidersApi = {
  list: (params: { lat: number; lng: number; radiusKm?: number; categorySlug?: string; skill?: string }) =>
    api.get<NearbyProvider[]>('/providers/nearby', { params }).then((r) => r.data),
};