'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalog-api';
import { ProductCard } from '@/components/customer/product-card';
import type { Metadata } from 'next';

const sortOptions = [
  { value: '', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', slug, sort],
    queryFn: () =>
      catalogApi.getProducts({
        categorySlug: slug,
        sort: sort || undefined,
      }),
  });

  const activeCategory = categories?.find((c) => c.slug === slug);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:block">
        <h3 className="mb-3 text-sm font-bold text-text-primary">
          All Categories
        </h3>

        <ul className="space-y-1">
          {categories?.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.slug}`}
                className={`block rounded-btn px-3 py-2 text-sm ${
                  c.slug === slug
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-text-muted hover:bg-bg'
                }`}
              >
                {c.icon} {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Product grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">
            {activeCategory?.name ?? 'Products'}
          </h1>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-btn border border-border bg-surface px-3 text-sm"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <p className="text-text-muted">Loading products...</p>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <p className="text-text-muted">
            No products found in this category yet.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data?.data?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}