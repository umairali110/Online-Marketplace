import { api } from './api-client';

export interface StoreProduct {
  storeListingId: string;
  productId: string;
  title: string;
  canonicalSlug: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isBestDeal: boolean;
  rating: number;
  reviewCount: number;
}

export interface StoreReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  productTitle: string;
}

export interface StoreDetail {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: string | null;
  category: string | null;
  status: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  products: StoreProduct[];
  deals: StoreProduct[];
  reviews: StoreReview[];
}

export const storeApi = {
  getBySlug: (slug: string) => api.get<StoreDetail>(`/stores/${slug}`).then((r) => r.data),
  toggleFollow: (storeId: string) =>
    api.post<{ following: boolean }>(`/stores/${storeId}/follow`).then((r) => r.data),
  followStatus: (storeId: string) =>
    api.get<{ following: boolean }>(`/stores/${storeId}/follow-status`).then((r) => r.data),
  logVisit: (storeId: string, source: string) =>
    api.post(`/stores/${storeId}/visit`, { source }).then((r) => r.data),
};