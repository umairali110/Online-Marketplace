import { api } from './api-client';

export interface PlatformStats {
  totalCustomers: number;
  totalStores: number;
  totalProviders: number;
  totalOrders: number;
}

export const platformApi = {
  getStats: () => api.get<PlatformStats>('/platform/stats').then((r) => r.data),
};