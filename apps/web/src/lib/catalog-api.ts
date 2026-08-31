import { api } from './api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface ProductCardData {
  id: string;
  title: string;
  brand?: string | null;
  images: string[];
  categorySlug: string;
  canonicalSlug: string;
  lowestPrice: number | null;
  compareAtPrice: number | null;
  storeCount: number;
  rating: number;
  isBestDeal: boolean;
}

export interface BestDeal {
  id: string;
  title: string;
  images: string[];
  canonicalSlug: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  storeName: string;
}

export interface TopStore {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  rating: number;
}

export interface ProductListing {
  id: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isBestDeal: boolean;
  freeDelivery: boolean;
  rating: number;
  reviewCount: number;
}

export interface ProductDetail {
  id: string;
  title: string;
  brand?: string | null;
  images: string[];
  canonicalSlug: string;
  category: Category;
  listings: ProductListing[];
}

export const catalogApi = {
  getCategories: () => api.get<Category[]>('/categories').then((r) => r.data),

  getBestDeals: () => api.get<BestDeal[]>('/products/best-deals').then((r) => r.data),

  getTopStores: () => api.get<TopStore[]>('/stores/top').then((r) => r.data),

  getProducts: (params: { categorySlug?: string; search?: string; sort?: string; page?: number }) =>
    api
      .get<{ data: ProductCardData[]; total: number; page: number; limit: number }>('/products', { params })
      .then((r) => r.data),

  getProduct: (slug: string) => api.get<ProductDetail>(`/products/${slug}`).then((r) => r.data),
    getFeaturedGigs: () => api.get<any[]>('/gigs/by-category/plumbing').then((r) => r.data),
      getRelated: (slug: string) => api.get<ProductCardData[]>(`/products/${slug}/related`).then((r) => r.data), // placeholder single-category fetch, replaced below
};