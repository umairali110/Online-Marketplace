'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/lib/jobs-api';
import { jobApplicationsApi } from '@/lib/job-applications-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import { useToast } from '@/components/ui/toast';
import { avatarUrl } from '@/lib/user-api';

const statusVariant: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
  OPEN: 'warning',
  ASSIGNED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { data: job, isLoading } = useQuery({ queryKey: ['job', id], queryFn: () => jobsApi.getOne(id) });

  const handleAccept = async (applicationId: string) => {
    await jobApplicationsApi.updateStatus(applicationId, 'ACCEPTED');
    queryClient.invalidateQueries({ queryKey: ['job', id] });
    show('Provider hired for this job');
  };

  const handleReject = async (applicationId: string) => {
    await jobApplicationsApi.updateStatus(applicationId, 'REJECTED');
    queryClient.invalidateQueries({ queryKey: ['job', id] });
  };

  const handleMarkComplete = async () => {
    await jobsApi.updateStatus(id, 'COMPLETED');
    queryClient.invalidateQueries({ queryKey: ['job', id] });
    show('Job marked as completed');
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this job post?')) return;
    await jobsApi.updateStatus(id, 'CANCELLED');
    queryClient.invalidateQueries({ queryKey: ['job', id] });
    router.push('/jobs');
  };

  if (isLoading) return <p className="text-text-muted">Loading...</p>;
  if (!job) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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

        {job.status === 'ASSIGNED' && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleMarkComplete}>Mark as Completed</Button>
          </div>
        )}
        {job.status === 'OPEN' && (
          <div className="mt-4">
            <Button size="sm" variant="danger" onClick={handleCancel}>Cancel Job</Button>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-bold text-text-primary">Applications ({job.applications.length})</h2>
        {job.applications.length === 0 && <p className="text-sm text-text-muted">No applications yet.</p>}
        <div className="space-y-3">
          {job.applications.map((app) => {
            const avatar = avatarUrl(app.provider.avatar);
            return (
              <div key={app.id} className="rounded-card border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-bg">
                      {avatar ? (
                        <Image src={avatar} alt={app.provider.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                          {app.provider.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{app.provider.name}</p>
                      <RatingStars rating={app.provider.ratingAvg} count={app.provider.ratingCount} />
                    </div>
                  </div>
                  <Badge variant={statusVariant[app.status]}>{app.status}</Badge>
                </div>
                {app.message && <p className="mt-2 text-sm text-text-muted">{app.message}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {app.provider.skills.map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{s}</span>
                  ))}
                </div>
                {app.status === 'PENDING' && job.status === 'OPEN' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(app.id)}>Accept & Hire</Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(app.id)}>Decline</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}