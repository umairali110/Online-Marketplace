'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/search-api';
import { RatingStars } from '@/components/ui/rating-stars';

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['search-full', q],
    queryFn: () => searchApi.search(q),
    enabled: q.trim().length >= 2,
  });

  if (q.trim().length < 2) return <p className="text-text-muted">Type at least 2 characters to search.</p>;
  if (isLoading) return <p className="text-text-muted">Searching for &quot;{q}&quot;...</p>;

  const hasResults = data && (data.products.length > 0 || data.stores.length > 0 || data.gigs.length > 0);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-text-primary">Results for &quot;{q}&quot;</h1>

      {!hasResults && <p className="text-text-muted">No results found. Try a different search term.</p>}

      {data && data.products.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-primary">Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.products.map((p) => (
              <Link key={p.id} href={`/product/${p.canonicalSlug}`} className="rounded-card border border-border bg-surface p-3 hover:shadow-md">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-btn bg-bg">
                  {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" />}
                </div>
                <h3 className="line-clamp-2 text-sm font-medium text-text-primary">{p.title}</h3>
                {p.lowestPrice !== null && <p className="mt-1 font-bold text-text-primary">${p.lowestPrice.toFixed(0)}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {data && data.stores.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-primary">Stores</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.stores.map((s) => (
              <Link key={s.id} href={`/store/${s.slug}`} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 hover:border-primary">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-bg">
                  {s.logo && <Image src={s.logo} alt={s.name} fill className="object-cover" />}
                </div>
                <span className="truncate text-sm font-medium text-text-primary">{s.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data && data.gigs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-primary">Services</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.gigs.map((g) => (
              <Link key={g.id} href={`/services/providers/${g.providerId}`} className="rounded-card border border-border bg-surface p-3 hover:border-primary">
                <p className="text-sm font-medium text-text-primary">{g.title}</p>
                <p className="text-xs text-text-muted">{g.category} · {g.providerName}</p>
                <p className="mt-1 font-bold text-text-primary">${g.price.toFixed(0)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}