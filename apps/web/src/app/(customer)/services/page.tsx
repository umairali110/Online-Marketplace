'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, BadgeCheck, Search, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { serviceCategoriesApi } from '@/lib/provider-api';
import { providerDirectoryApi } from '@/lib/provider-directory-api';
import { avatarUrl } from '@/lib/user-api';

export default function ServicesPage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: serviceCategoriesApi.list,
  });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Auto-select the first category once categories arrive, so the page never
  // opens on an empty "pick a category" state — same behavior real directories use.
  useEffect(() => {
    if (!activeSlug && categories && categories.length > 0) {
      setActiveSlug(categories[0].slug);
    }
  }, [categories, activeSlug]);

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers-by-category', activeSlug],
    queryFn: () => providerDirectoryApi.listByCategory(activeSlug!),
    enabled: !!activeSlug,
  });

  const activeCategory = categories?.find((c) => c.slug === activeSlug);

  // Client-side filter over the already-fetched list — no extra network calls.
  const filteredProviders = useMemo(() => {
    if (!providers) return providers;
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }, [providers, search]);

  return (
    <div>
      {/* ================= PAGE HERO ================= */}
      <div className="relative overflow-hidden rounded-card bg-navy px-4 py-10 sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-success/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Browse Local Services
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/70 sm:text-base">
            Verified plumbers, electricians, tutors, and more — pick a category and find someone
            trustworthy, nearby.
          </p>

          {/* search, filters the already-loaded provider list client-side */}
          <div className="mt-6 flex items-center gap-2 rounded-btn bg-white/10 px-4 py-3 backdrop-blur-sm sm:max-w-md">
            <Search size={16} className="shrink-0 text-white/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or city"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ================= CATEGORY STRIP ================= */}
      <div className="relative mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoriesLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] w-24 shrink-0 animate-pulse rounded-card border border-border bg-surface"
              />
            ))}

          {categories?.map((c) => {
            const isActive = activeSlug === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setActiveSlug(c.slug)}
                className={`flex shrink-0 flex-col items-center gap-1.5 rounded-card border px-4 py-3 text-center transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
        {/* fade hint that the row scrolls, without adding new behavior */}
        <div className="pointer-events-none absolute bottom-2 right-0 top-0 w-8 bg-gradient-to-l from-bg to-transparent sm:hidden" />
      </div>

      {/* ================= RESULTS HEADER ================= */}
      {activeSlug && (
        <div className="mt-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
            {activeCategory?.icon} {activeCategory?.name ?? 'Providers'}
          </h2>
          {!providersLoading && (
            <span className="flex items-center gap-1 text-xs font-medium text-text-muted">
              <SlidersHorizontal size={13} />
              {filteredProviders?.length ?? 0} found
            </span>
          )}
        </div>
      )}

      {/* ================= EMPTY STATES ================= */}
      {!activeSlug && !categoriesLoading && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-border bg-surface py-16 text-center">
          <span className="text-3xl">🔍</span>
          <p className="mt-3 text-sm font-medium text-text-primary">Pick a category above to see providers</p>
          <p className="mt-1 text-xs text-text-muted">We'll show verified pros near you.</p>
        </div>
      )}

      {activeSlug && !providersLoading && filteredProviders?.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-card border border-dashed border-border bg-surface py-16 text-center">
          <span className="text-3xl">🗂️</span>
          <p className="mt-3 text-sm font-medium text-text-primary">
            {search ? 'No providers match your search' : 'No providers in this category yet'}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {search ? 'Try a different name, skill, or city.' : 'Check back soon, or try another category.'}
          </p>
        </div>
      )}

      {/* ================= PROVIDER GRID ================= */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeSlug &&
          providersLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-card border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-full bg-bg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-bg" />
                  <div className="h-2.5 w-1/2 rounded bg-bg" />
                </div>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-bg" />
              <div className="mt-1.5 h-3 w-4/5 rounded bg-bg" />
            </div>
          ))}

        {filteredProviders?.map((p) => {
          const avatar = avatarUrl(p.avatar);
          return (
            <Link
              key={p.providerId}
              href={`/services/providers/${p.providerId}`}
              className="group flex flex-col rounded-card border border-border bg-surface p-4 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg ring-2 ring-transparent transition-all group-hover:ring-primary/30">
                  {avatar ? (
                    <Image src={avatar} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-bold text-primary">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate font-semibold text-text-primary">{p.name}</p>
                    {p.verified && <BadgeCheck size={14} className="shrink-0 text-primary" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                    <Star size={12} className="fill-warning text-warning" />
                    <span className="font-medium text-text-primary">
                      {p.ratingCount > 0 ? p.ratingAvg.toFixed(1) : 'New'}
                    </span>
                    <span className="mx-0.5">·</span>
                    <MapPin size={12} /> {p.city}
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
                />
              </div>

              {p.bio && <p className="mt-3 line-clamp-2 text-sm text-text-muted">{p.bio}</p>}

              {p.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {s}
                    </span>
                  ))}
                  {p.skills.length > 3 && (
                    <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-text-muted">
                      +{p.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}