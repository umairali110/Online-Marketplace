'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  storeListingId: string;
  productTitle: string;
  productImage: string | null;
  storeName: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (storeListingId: string) => void;
  updateQty: (storeListingId: string, qty: number) => void;
  clear: () => void;
  totalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.storeListingId === item.storeListingId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.storeListingId === item.storeListingId ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }),
      removeItem: (storeListingId) =>
        set((state) => ({ items: state.items.filter((i) => i.storeListingId !== storeListingId) })),
      updateQty: (storeListingId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.storeListingId === storeListingId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      totalCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'om-cart' },
  ),
);