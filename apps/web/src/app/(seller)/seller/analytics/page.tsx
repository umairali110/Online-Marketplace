'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sellerAnalyticsApi } from '@/lib/seller-api';
import { StatCard } from '@/components/ui/stat-card';

const COLORS = ['#2F5DE0', '#16A34A', '#F59E0B', '#DC2626', '#64748B'];

export default function SellerAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['seller-overview'], queryFn: sellerAnalyticsApi.overview });

  if (isLoading) return <p className="text-text-muted">Loading analytics...</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Revenue" value={`$${data.revenue.toFixed(0)}`} />
        <StatCard label="Visitors" value={String(data.visitorCount)} />
        <StatCard label="Orders" value={String(data.orderCount)} />
        <StatCard label="Conversion" value={data.conversionRate !== null ? `${data.conversionRate}%` : '—'} />
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-4 text-sm font-bold text-text-primary">Traffic Source</h2>
        {data.trafficSource.length === 0 ? (
          <p className="text-sm text-text-muted">No visits recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.trafficSource}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.source}
              >
                {data.trafficSource.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}