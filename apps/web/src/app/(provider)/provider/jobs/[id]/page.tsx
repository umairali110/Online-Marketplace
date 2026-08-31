'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { jobFeedApi } from '@/lib/job-feed-api';
import { jobApplicationsApi } from '@/lib/job-applications-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

const statusVariant: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
  OPEN: 'warning',
  ASSIGNED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function ProviderJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { show } = useToast();
  const { data: job, isLoading } = useQuery({ queryKey: ['job-feed-item', id], queryFn: () => jobFeedApi.getOne(id) });

  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobApplicationsApi.apply(id, message || undefined);
      setApplied(true);
      show('Application submitted!');
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not apply', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return <p className="text-text-muted">Loading...</p>;
  if (!job) return null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{job.title}</h1>
            <p className="text-xs text-text-muted">{job.category?.name} · {job.city}, {job.country}</p>
          </div>
          <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
        </div>
        <p className="mt-3 text-sm text-text-muted">{job.description}</p>
        {job.budget && <p className="mt-2 text-sm font-medium text-text-primary">Budget: ${job.budget.toFixed(0)}</p>}
      </div>

      {job.status === 'OPEN' && !applied && (
        <div className="mt-4 rounded-card border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-bold text-text-primary">Apply for this job</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain why you're a good fit (optional)"
            rows={3}
            className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none"
          />
          <Button className="mt-3" loading={applying} onClick={handleApply}>Submit Application</Button>
        </div>
      )}
      {(applied || job.status !== 'OPEN') && (
        <p className="mt-4 text-sm text-text-muted">
          {applied ? 'Your application has been submitted.' : 'This job is no longer accepting applications.'}
        </p>
      )}
    </div>
  );
}