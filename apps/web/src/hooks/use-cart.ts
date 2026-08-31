'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/cart-api';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/ui/toast';

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { show } = useToast();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const onError = (err: any) => {
    const message = err?.response?.data?.message ?? err?.message ?? 'Something went wrong';
    show(Array.isArray(message) ? message.join(', ') : message, 'error');
  };

  const addItem = useMutation({
    mutationFn: ({ storeListingId, qty }: { storeListingId: string; qty?: number }) =>
      cartApi.addItem(storeListingId, qty),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError,
  });

  const updateQty = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) => cartApi.updateQty(itemId, qty),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError,
  });

  return { ...query, invalidate, addItem, updateQty, removeItem };
}