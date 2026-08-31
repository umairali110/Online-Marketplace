'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { StoreDetail } from '@/lib/store-api';

const tabs = ['Store Home', 'Products', 'Deals', 'Reviews', 'About'] as const;
type Tab = (typeof tabs)[number];

function ProductGrid({ products }: { products: StoreDetail['products'] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <Link
          key={p.storeListingId}
          href={`/product/${p.canonicalSlug}`}
          className="rounded-card border border-border bg-surface p-3 hover:shadow-md"
        >
          <div className="relative mb-2 aspect-square overflow-hidden rounded-btn bg-bg">
            {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" />}
            {p.isBestDeal && (
              <span className="absolute left-2 top-2">
                <Badge variant="success">Best Deal</Badge>
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-sm font-medium text-text-primary">{p.title}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-bold text-text-primary">${p.price.toFixed(0)}</span>
            {p.compareAtPrice && (
              <span className="text-xs text-text-muted line-through">${p.compareAtPrice.toFixed(0)}</span>
            )}
          </div>
          <RatingStars rating={p.rating} count={p.reviewCount} />
        </Link>
      ))}
    </div>
  );
}

export function StoreTabs({ store }: { store: StoreDetail }) {
  const [active, setActive] = useState<Tab>('Store Home');

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
              active === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === 'Store Home' && (
        <div className="space-y-6">
          {store.deals.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-text-primary">Featured Deals</h3>
              <ProductGrid products={store.deals.slice(0, 4)} />
            </div>
          )}
          <div>
            <h3 className="mb-3 font-bold text-text-primary">All Products</h3>
            <ProductGrid products={store.products.slice(0, 8)} />
          </div>
        </div>
      )}

      {active === 'Products' && <ProductGrid products={store.products} />}

      {active === 'Deals' && (
        store.deals.length > 0 ? (
          <ProductGrid products={store.deals} />
        ) : (
          <p className="text-text-muted">No active deals right now.</p>
        )
      )}

      {active === 'Reviews' && (
        <div className="space-y-4">
          {store.reviews.length === 0 && <p className="text-text-muted">No reviews yet.</p>}
          {store.reviews.map((r) => (
            <div key={r.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{r.userName}</span>
                <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <RatingStars rating={r.rating} />
                <span className="text-xs text-text-muted">on {r.productTitle}</span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-text-muted">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {active === 'About' && (
        <div className="rounded-card border border-border bg-surface p-4 text-sm text-text-muted">
          <p>{store.description ?? 'This store has not added a description yet.'}</p>
          <div className="mt-4 flex items-center gap-2">
            <Star size={14} className="fill-warning text-warning" />
            <span className="text-text-primary">{store.rating.toFixed(1)}</span>
            <span>({store.reviewCount} reviews)</span>
          </div>
          <p className="mt-1">{store.followerCount} followers</p>
          {store.category && <p className="mt-1">Category: {store.category}</p>}
        </div>
      )}
    </div>
  );
}