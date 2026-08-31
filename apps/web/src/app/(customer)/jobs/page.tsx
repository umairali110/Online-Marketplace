'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { jobsApi } from '@/lib/jobs-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusVariant: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
  OPEN: 'warning',
  ASSIGNED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function MyJobsPage() {
  const { data: jobs, isLoading } = useQuery({ queryKey: ['my-jobs'], queryFn: jobsApi.listMine });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">My Job Posts</h1>
        <Link href="/jobs/new">
          <Button size="sm"><Plus size={16} className="mr-1 inline" /> Post a Job</Button>
        </Link>
      </div>

      {isLoading && <p className="text-text-muted">Loading...</p>}
      {!isLoading && jobs?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          You haven&apos;t posted any jobs yet.
        </div>
      )}

      <div className="space-y-3">
        {jobs?.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block rounded-card border border-border bg-surface p-4 hover:border-primary"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-text-primary">{job.title}</p>
                <p className="text-xs text-text-muted">{job.category?.name} · {job.city}, {job.country}</p>
              </div>
              <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}
              {job.budget && ` · Budget: $${job.budget.toFixed(0)}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}