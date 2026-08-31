'use client';

import { useQuery } from '@tanstack/react-query';
import { riskApi } from '@/lib/risk-api';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';

const levelVariant: Record<string, 'danger' | 'warning' | 'primary'> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'primary',
};

export default function FraudRiskPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-risk'], queryFn: riskApi.overview });

  if (isLoading) return <p className="text-text-muted">Loading...</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Fraud & Risk Monitoring</h1>
      <p className="text-sm text-text-muted">
        Rule-based flags (order value spikes, repeat disputes) — not an ML model. A learned
        risk model is a reasonable phase-2 upgrade once there's enough order history.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatCard label="High Risk" value={String(data.highRiskCount)} />
        <StatCard label="Medium Risk" value={String(data.mediumRiskCount)} />
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-bold text-text-primary">Risk by Country</h2>
        {data.riskByCountry.length === 0 ? (
          <p className="text-sm text-text-muted">No flags recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.riskByCountry.map((c) => (
              <div key={c.country} className="flex justify-between text-sm">
                <span className="text-text-primary">{c.country}</span>
                <span className="text-text-muted">{c.count} flag{c.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-bold text-text-primary">Recent Alerts</h2>
        {data.recentAlerts.length === 0 && <p className="text-sm text-text-muted">No alerts yet.</p>}
        <div className="space-y-3">
          {data.recentAlerts.map((a) => (
            <div key={a.id} className="flex items-start justify-between border-b border-border pb-3 last:border-b-0">
              <div>
                <p className="text-sm text-text-primary">{a.reason}</p>
                <p className="text-xs text-text-muted">
                  {a.country ?? 'Unknown'} · {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant={levelVariant[a.level]}>{a.level}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}