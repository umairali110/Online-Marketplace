'use client';

import { Heart, Truck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductListing } from '@/lib/catalog-api';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/providers/auth-provider';
import { wishlistApi } from '@/lib/wishlist-api';

interface CompareTableProps {
  productTitle: string;
  productImage: string | null;
  listings: ProductListing[];
  wishlistedIds: string[];
}

export function CompareTable({ listings, wishlistedIds }: CompareTableProps) {
  const { addItem } = useCart();
  const { show } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(new Set(wishlistedIds));

  const requireAuth = () => {
    if (!user) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleAddToCart = (listing: ProductListing) => {
    if (!requireAuth()) return;
    addItem.mutate(
      { storeListingId: listing.id },
      { onSuccess: () => show(`Added from ${listing.storeName} to cart`) },
    );
  };

  const handleWishlist = async (storeListingId: string) => {
    if (!requireAuth()) return;
    const { wishlisted: nowWishlisted } = await wishlistApi.toggle(storeListingId);
    setWishlisted((prev) => {
      const next = new Set(prev);
      nowWishlisted ? next.add(storeListingId) : next.delete(storeListingId);
      return next;
    });
  };

  return (
    <div className="rounded-card border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-text-primary">
          Compare prices from {listings.length} store{listings.length !== 1 ? 's' : ''}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {listings.map((listing) => (
          <div key={listing.id} className="flex items-center gap-4 px-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{listing.storeName}</span>
                {listing.isBestDeal && <Badge variant="success">Best Deal</Badge>}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                <RatingStars rating={listing.rating} count={listing.reviewCount} />
                {listing.freeDelivery && (
                  <span className="flex items-center gap-1">
                    <Truck size={12} /> Free delivery
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} /> Buyer protected
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-text-primary">${listing.price.toFixed(0)}</div>
              {listing.compareAtPrice && (
                <div className="text-xs text-text-muted line-through">${listing.compareAtPrice.toFixed(0)}</div>
              )}
              {listing.stock === 0 && <div className="text-xs text-danger">Out of stock</div>}
            </div>

            <button
              onClick={() => handleWishlist(listing.id)}
              className="text-text-muted hover:text-danger"
              aria-label="Add to wishlist"
            >
              <Heart size={18} className={wishlisted.has(listing.id) ? 'fill-danger text-danger' : ''} />
            </button>

            <Button
              size="sm"
              disabled={listing.stock === 0}
              loading={addItem.isPending}
              onClick={() => handleAddToCart(listing)}
            >
              Add to Cart
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}