'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { searchApi } from '@/lib/search-api';

export function HeaderSearch({ className, autoFocus }: { className?: string; autoFocus?: boolean })  {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(term, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchApi.search(debounced),
    enabled: debounced.trim().length >= 2,
  });

  const hasResults = !!data && (data.products.length > 0 || data.stores.length > 0 || data.gigs.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim().length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
        <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <form onSubmit={handleSubmit}>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search products, brands, and stores"
          className="h-10 w-full rounded-btn border border-border bg-bg pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
        />
      </form>

      {open && debounced.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-card border border-border bg-surface shadow-md">
          {isLoading && <p className="p-4 text-sm text-text-muted">Searching...</p>}

          {!isLoading && !hasResults && <p className="p-4 text-sm text-text-muted">No results for &quot;{debounced}&quot;</p>}

          {data?.products.length ? (
            <div className="border-b border-border p-2">
              <p className="px-2 py-1 text-xs font-bold text-text-muted">Products</p>
              {data.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.canonicalSlug}`}
                  className="flex items-center gap-3 rounded-btn px-2 py-2 hover:bg-bg"
                >
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-btn bg-bg">
                    {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" />}
                  </div>
                  <span className="flex-1 truncate text-sm text-text-primary">{p.title}</span>
                  {p.lowestPrice !== null && <span className="text-xs font-medium text-text-muted">${p.lowestPrice.toFixed(0)}</span>}
                </Link>
              ))}
            </div>
          ) : null}

          {data?.stores.length ? (
            <div className="border-b border-border p-2">
              <p className="px-2 py-1 text-xs font-bold text-text-muted">Stores</p>
              {data.stores.map((s) => (
                <Link key={s.id} href={`/store/${s.slug}`} className="flex items-center gap-3 rounded-btn px-2 py-2 hover:bg-bg">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg">
                    {s.logo && <Image src={s.logo} alt={s.name} fill className="object-cover" />}
                  </div>
                  <span className="truncate text-sm text-text-primary">{s.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {data?.gigs.length ? (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-bold text-text-muted">Services</p>
              {data.gigs.map((g) => (
                <Link key={g.id} href={`/services/providers/${g.providerId}`} className="flex items-center justify-between rounded-btn px-2 py-2 hover:bg-bg">
                  <span className="truncate text-sm text-text-primary">{g.title}</span>
                  <span className="text-xs font-medium text-text-muted">${g.price.toFixed(0)}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {hasResults && (
            <Link
              href={`/search?q=${encodeURIComponent(debounced)}`}
              className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-bg"
            >
              See all results for &quot;{debounced}&quot;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}