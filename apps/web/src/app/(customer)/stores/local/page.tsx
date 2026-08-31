'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star } from 'lucide-react';
import { localStoresApi } from '@/lib/local-stores-api';
import { catalogApi } from '@/lib/catalog-api';

export default function LocalStoresPage() {
  const [city, setCity] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories });

  const { data: stores, isLoading } = useQuery({
    queryKey: ['local-stores', city, categorySlug],
    queryFn: () => localStoresApi.list({ city: city || undefined, categorySlug: categorySlug || undefined }),
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-text-primary">Shops Near You</h1>
      <p className="mb-4 text-sm text-text-muted">Search by city to find local shops and their inventory.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g. Rawalpindi)"
          className="h-10 flex-1 min-w-[200px] rounded-btn border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
        />
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="h-10 rounded-btn border border-border bg-surface px-3 text-sm"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-text-muted">Loading shops...</p>}
      {!isLoading && stores?.length === 0 && (
        <p className="text-sm text-text-muted">No shops found — try a different city or category.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores?.map((store) => (
          <Link key={store.id} href={`/store/${store.slug}`} className="overflow-hidden rounded-card border border-border bg-surface hover:border-primary">
            <div className="relative h-24 bg-gradient-to-r from-primary/20 to-transparent">
              {store.banner && <Image src={store.banner} alt={store.name} fill className="object-cover" />}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-bg">
                  {store.logo ? (
                    <Image src={store.logo} alt={store.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                      {store.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{store.name}</p>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <MapPin size={11} /> {store.city}
                    {store.distanceKm !== null && <span className="ml-1">· {store.distanceKm}km</span>}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                <Star size={11} className="fill-warning text-warning" /> {store.rating.toFixed(1)} · {store.productCount} products
              </div>
              {store.previewProducts.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {store.previewProducts.slice(0, 3).map((p, i) => (
                    <div key={i} className="relative h-10 w-10 overflow-hidden rounded-btn bg-bg">
                      {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}