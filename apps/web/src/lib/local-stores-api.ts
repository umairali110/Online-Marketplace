import { api } from './api-client';

export interface LocalStore {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  city: string | null;
  country: string | null;
  rating: number;
  productCount: number;
  previewProducts: { title: string; image: string | null; price: number }[];
  distanceKm: number | null;
}

export const localStoresApi = {
  list: (params: { city?: string; categorySlug?: string; lat?: number; lng?: number; radiusKm?: number }) =>
    api.get<LocalStore[]>('/stores/local', { params }).then((r) => r.data),
};