import { api } from './api-client';

export interface MyStore {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  logo: string | null;
  banner: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export interface SellerProduct {
  storeListingId: string;
  title: string;
  brand: string | null;
  image: string | null;
  canonicalSlug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isBestDeal: boolean;
  freeDelivery: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface SellerSubOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  city: string;
  trackingStatus: string;
  codCollected: boolean;
  createdAt: string;
  items: { title: string; qty: number; price: number }[];
  total: number;
}

export interface SellerOverview {
  storeStatus: string;
  revenue: number;
  orderCount: number;
  customerCount: number;
  visitorCount: number;
  conversionRate: number | null;
  salesOverTime: { date: string; revenue: number }[];
  trafficSource: { source: string; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sellerStoreApi = {
  getMyStore: () => api.get<MyStore | null>('/seller/store').then((r) => r.data),
  create: (data: {
    name: string;
    category?: string;
    description?: string;
    logo?: string;
    banner?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => api.post<MyStore>('/seller/store', data).then((r) => r.data),
  update: (data: {
    name?: string;
    category?: string;
    description?: string;
    logo?: string;
    banner?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => api.patch<MyStore>('/seller/store', data).then((r) => r.data),
};

export const sellerProductsApi = {
  list: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<SellerProduct>>('/seller/products', { params: { page, limit } }).then((r) => r.data),
  create: (data: {
    title: string;
    brand?: string;
    categorySlug: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    images?: string[];
  }) => api.post<SellerProduct>('/seller/products', data).then((r) => r.data),
  update: (
    id: string,
    data: Partial<{
      price: number;
      compareAtPrice: number;
      stock: number;
      isBestDeal: boolean;
      freeDelivery: boolean;
      images: string[];
    }>,
  ) => api.patch<SellerProduct>(`/seller/products/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/seller/products/${id}`).then((r) => r.data),
};

export const sellerOrdersApi = {
  list: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<SellerSubOrder>>('/seller/orders', { params: { page, limit } }).then((r) => r.data),
};

export const sellerAnalyticsApi = {
  overview: () => api.get<SellerOverview>('/seller/analytics/overview').then((r) => r.data),
};