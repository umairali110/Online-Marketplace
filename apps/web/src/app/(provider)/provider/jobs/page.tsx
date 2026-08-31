'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { jobFeedApi } from '@/lib/job-feed-api';
import { serviceCategoriesApi } from '@/lib/provider-api';
import { VirtualList } from '@/components/shared/virtual-list';

export default function JobFeedPage() {
  const [categorySlug, setCategorySlug] = useState('');
  const [city, setCity] = useState('');

  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: serviceCategoriesApi.list });
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['job-feed', categorySlug, city],
    queryFn: () => jobFeedApi.list({ categorySlug: categorySlug || undefined, city: city || undefined }),
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Job Feed</h1>

      <div className="mb-4 flex flex-wrap gap-2">
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
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city"
          className="h-10 rounded-btn border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {isLoading && <p className="text-text-muted">Loading jobs...</p>}
      {!isLoading && jobs?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          No open jobs match your filters right now.
        </div>
      )}

            {jobs && jobs.length > 0 && (
        <VirtualList
          items={jobs}
          estimateSize={140}
          height={Math.min(700, jobs.length * 140)}
          renderItem={(job) => (
            <div className="pb-3">
              <Link
                href={`/provider/jobs/${job.id}`}
                className="block rounded-card border border-border bg-surface p-4 hover:border-primary"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{job.title}</p>
                    <p className="text-xs text-text-muted">{job.category?.name} · {job.city}, {job.country}</p>
                  </div>
                  {job.budget && <span className="text-sm font-bold text-text-primary">${job.budget.toFixed(0)}</span>}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-text-muted">{job.description}</p>
                <p className="mt-2 text-xs text-text-muted">
                  {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''} so far
                </p>
              </Link>
            </div>
          )}
        />
      )}
    </div>
  );
}