'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { jobApplicationsApi } from '@/lib/job-applications-api';
import { Badge } from '@/components/ui/badge';

const statusVariant: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
};

export default function MyApplicationsPage() {
  const { data: applications, isLoading } = useQuery({ queryKey: ['my-applications'], queryFn: jobApplicationsApi.listMine });

  if (isLoading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">My Applications</h1>

      {applications?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          You haven&apos;t applied to any jobs yet.
          <div className="mt-3">
            <Link href="/provider/jobs" className="text-sm font-medium text-primary">Browse the job feed</Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {applications?.map((app) => (
          <div key={app.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-text-primary">{app.job.title}</p>
                <p className="text-xs text-text-muted">{app.job.category} · {app.job.city}</p>
              </div>
              <Badge variant={statusVariant[app.status]}>{app.status}</Badge>
            </div>
            {app.message && <p className="mt-2 text-sm text-text-muted">{app.message}</p>}
            {app.job.budget && <p className="mt-2 text-xs text-text-muted">Budget: ${app.job.budget.toFixed(0)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}