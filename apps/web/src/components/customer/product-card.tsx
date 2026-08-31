'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { ProductCardData } from '@/lib/catalog-api';

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.canonicalSlug}`}
      className="group block rounded-card border border-border bg-surface p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-btn bg-bg">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
        )}
        {product.isBestDeal && (
          <span className="absolute left-2 top-2">
            <Badge variant="success">Best Deal</Badge>
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 text-sm font-medium text-text-primary">{product.title}</h3>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-base font-bold text-text-primary">
          {product.lowestPrice !== null ? `$${product.lowestPrice.toFixed(0)}` : '—'}
        </span>
        {product.compareAtPrice && (
          <span className="text-xs text-text-muted line-through">${product.compareAtPrice.toFixed(0)}</span>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <RatingStars rating={product.rating} />
        {product.storeCount > 1 && (
          <span className="text-xs font-medium text-primary">Compare {product.storeCount}</span>
        )}
      </div>
    </Link>
  );
}