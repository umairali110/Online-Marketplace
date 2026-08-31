import { api } from './api-client';

export interface ReturnRequest {
  id: string;
  reason: string;
  images: string[];
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
}

export interface SellerReturnRequest extends ReturnRequest {
  items: string[];
}

export const returnsApi = {
  create: (data: { subOrderId: string; reason: string; images?: string[] }) => api.post('/returns', data).then((r) => r.data),
  listMine: () => api.get<ReturnRequest[]>('/returns/mine').then((r) => r.data),
  listForSeller: () => api.get<SellerReturnRequest[]>('/seller/returns').then((r) => r.data),
  updateStatus: (id: string, status: string) => api.patch(`/seller/returns/${id}/status`, { status }).then((r) => r.data),
};