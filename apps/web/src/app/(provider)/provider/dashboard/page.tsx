'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, ClipboardList } from 'lucide-react';
import { providerProfileApi } from '@/lib/provider-api';
import { jobApplicationsApi } from '@/lib/job-applications-api';
import { StatCard } from '@/components/ui/stat-card';

export default function ProviderDashboardPage() {
  const { data: profile } = useQuery({ queryKey: ['provider-profile'], queryFn: providerProfileApi.getMine });
  const { data: applications } = useQuery({ queryKey: ['my-applications'], queryFn: jobApplicationsApi.listMine });

  if (!profile) return null;

  const pending = applications?.filter((a) => a.status === 'PENDING').length ?? 0;
  const accepted = applications?.filter((a) => a.status === 'ACCEPTED').length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Welcome back</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending Applications" value={String(pending)} />
        <StatCard label="Jobs Hired For" value={String(accepted)} />
        <StatCard label="Rating" value={profile.ratingCount > 0 ? `${profile.ratingAvg.toFixed(1)} ★` : '—'} />
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="text-sm text-text-muted">{profile.bio}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.skills.map((s) => (
            <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{s}</span>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-muted">
          {profile.city}, {profile.country} · {profile.categories.map((c) => c.name).join(', ')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/provider/jobs" className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 hover:border-primary">
          <Briefcase size={20} className="text-primary" />
          <div>
            <p className="font-medium text-text-primary">Browse Job Feed</p>
            <p className="text-xs text-text-muted">Find new jobs to apply for</p>
          </div>
        </Link>
        <Link href="/provider/applications" className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 hover:border-primary">
          <ClipboardList size={20} className="text-primary" />
          <div>
            <p className="font-medium text-text-primary">My Applications</p>
            <p className="text-xs text-text-muted">Track your application status</p>
          </div>
        </Link>
      </div>
    </div>
  );
}