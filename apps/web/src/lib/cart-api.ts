import { api } from './api-client';

export interface CartItemDto {
  id: string;
  storeListingId: string;
  productTitle: string;
  productImage: string | null;
  storeName: string;
  price: number;
  stock: number;
  qty: number;
}

export interface CartSummary {
  items: CartItemDto[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const cartApi = {
  getCart: () => api.get<CartSummary>('/cart').then((r) => r.data),
  addItem: (storeListingId: string, qty = 1) =>
    api.post<CartSummary>('/cart/items', { storeListingId, qty }).then((r) => r.data),
  updateQty: (itemId: string, qty: number) =>
    api.patch<CartSummary>(`/cart/items/${itemId}`, { qty }).then((r) => r.data),
  removeItem: (itemId: string) => api.delete<CartSummary>(`/cart/items/${itemId}`).then((r) => r.data),
};