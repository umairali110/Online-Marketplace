import { api } from './api-client';
import { PaginatedResponse } from './seller-api';

export interface AdminOverview {
  gmv: number;
  activeMerchants: number;
  totalMerchants: number;
  totalCustomers: number;
  gmvOverTime: { date: string; gmv: number }[];
  topCountries: { country: string; orders: number; gmv: number }[];
}

export interface AdminMerchant {
  id: string;
  name: string;
  slug: string;
  sellerName: string;
  sellerEmail: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  productCount: number;
  joinedAt: string;
}

export interface AdminDispute {
  id: string;
  orderId: string;
  orderTotal: number;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface CommissionOverview {
  totalOwed: number;
  byStore: { storeId: string; storeName: string; storeSlug: string; owed: number; settled: number }[];
}

export const adminApi = {
  dashboardOverview: () => api.get<AdminOverview>('/admin/dashboard/overview').then((r) => r.data),

  listMerchants: () => api.get<AdminMerchant[]>('/admin/merchants').then((r) => r.data),
  approveMerchant: (id: string) => api.post(`/admin/merchants/${id}/approve`).then((r) => r.data),
  suspendMerchant: (id: string) => api.post(`/admin/merchants/${id}/suspend`).then((r) => r.data),

  listDisputes: (status?: string) =>
    api.get<AdminDispute[]>('/admin/disputes', { params: status ? { status } : {} }).then((r) => r.data),
  updateDisputeStatus: (id: string, status: string) =>
    api.patch(`/admin/disputes/${id}/status`, { status }).then((r) => r.data),

  commissionsOverview: () => api.get<CommissionOverview>('/admin/commissions/overview').then((r) => r.data),
  settleCommission: (storeId: string) => api.post(`/admin/commissions/${storeId}/settle`).then((r) => r.data),
    listProviders: () => api.get<{ id: string; name: string; email: string; city: string | null; country: string | null; skills: string[]; categories: string[]; ratingAvg: number; verified: boolean; createdAt: string }[]>('/admin/providers').then((r) => r.data),
  verifyProvider: (id: string) => api.post(`/admin/providers/${id}/verify`).then((r) => r.data),
  unverifyProvider: (id: string) => api.post(`/admin/providers/${id}/unverify`).then((r) => r.data),
  createServiceCategory: (data: { name: string; icon?: string }) => api.post('/admin/service-categories', data).then((r) => r.data),
  deleteServiceCategory: (id: string) => api.delete(`/admin/service-categories/${id}`).then((r) => r.data),
    serviceCommissionsOverview: () => api.get<{ totalOwed: number; byProvider: { providerId: string; providerName: string; owed: number; settled: number }[] }>('/admin/service-commissions/overview').then((r) => r.data),
  settleServiceCommission: (providerId: string) => api.post(`/admin/service-commissions/${providerId}/settle`).then((r) => r.data),
  listAuditLog: () => api.get<{ id: string; actorName: string; action: string; targetType: string; targetId: string | null; createdAt: string }[]>('/admin/audit-log').then((r) => r.data),
    listMerchants: () => api.get<PaginatedResponse<AdminMerchant>>('/admin/merchants').then((r) => r.data),
  listDisputes: (status?: string) => api.get<PaginatedResponse<AdminDispute>>('/admin/disputes', { params: status ? { status } : {} }).then((r) => r.data),
};