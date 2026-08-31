import { api } from './api-client';

export interface OrderSubOrder {
  id: string;
  storeName: string;
  storeSlug: string;
  trackingStatus: string;
  items: { title: string; qty: number; price: number }[];
}

export interface Order {
  id: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  trustCoinsEarned: number;
  couponCode: string | null;
  couponDiscount: number;
  trustCoinsUsed: number;
  createdAt: string;
  subOrders: OrderSubOrder[];
}

export const ordersApi = {
    checkout: (addressId: string, couponCode?: string, trustCoinsToRedeem?: number) =>
    api.post<Order>('/orders/checkout', { addressId, couponCode, trustCoinsToRedeem }).then((r) => r.data),
  list: () => api.get<Order[]>('/orders').then((r) => r.data),
  getOne: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
};