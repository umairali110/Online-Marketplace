import { api } from './api-client';

export interface WishlistItem {
  wishlistId: string;
  storeListingId: string;
  productTitle: string;
  productSlug: string;
  productImage: string | null;
  storeName: string;
  price: number;
}

export const wishlistApi = {
  list: () => api.get<WishlistItem[]>('/wishlist').then((r) => r.data),
  listIds: () => api.get<string[]>('/wishlist/ids').then((r) => r.data),
  toggle: (storeListingId: string) =>
    api.post<{ wishlisted: boolean }>(`/wishlist/${storeListingId}`).then((r) => r.data),
};