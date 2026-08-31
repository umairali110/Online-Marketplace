'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/lib/wishlist-api';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.list });

  const handleRemove = async (storeListingId: string) => {
    await wishlistApi.toggle(storeListingId);
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
  };

  if (isLoading) return <p className="text-text-muted">Loading wishlist...</p>;

  if (!items || items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
        Your wishlist is empty.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">My Wishlist</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.wishlistId} className="rounded-card border border-border bg-surface p-3">
            <Link href={`/product/${item.productSlug}`}>
              <div className="relative mb-2 aspect-square overflow-hidden rounded-btn bg-bg">
                {item.productImage && <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />}
              </div>
              <h3 className="line-clamp-2 text-sm font-medium text-text-primary">{item.productTitle}</h3>
              <p className="text-xs text-text-muted">{item.storeName}</p>
              <p className="mt-1 font-bold text-text-primary">${item.price.toFixed(0)}</p>
            </Link>
            <button
              onClick={() => handleRemove(item.storeListingId)}
              className="mt-2 flex items-center gap-1 text-xs text-danger"
            >
              <Heart size={12} className="fill-danger" /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}