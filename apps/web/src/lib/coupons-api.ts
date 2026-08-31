import { api } from './api-client';

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  isActive: boolean;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
}

export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api.post<{ coupon: Coupon; discount: number }>('/coupons/validate', { code, subtotal }).then((r) => r.data),
  create: (data: { code: string; type: 'PERCENTAGE' | 'FIXED'; value: number; minOrderAmount?: number; maxUses?: number; expiresAt?: string }) =>
    api.post<Coupon>('/coupons', data).then((r) => r.data),
  list: () => api.get<Coupon[]>('/coupons').then((r) => r.data),
  setActive: (id: string, isActive: boolean) => api.patch(`/coupons/${id}/active`, { isActive }).then((r) => r.data),
};