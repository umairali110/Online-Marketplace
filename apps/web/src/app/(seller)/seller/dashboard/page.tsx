'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { sellerAnalyticsApi } from '@/lib/seller-api';
import { StatCard } from '@/components/ui/stat-card';

export default function SellerDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['seller-overview'],
    queryFn: sellerAnalyticsApi.overview,
  });

  if (isLoading) return <p className="text-text-muted">Loading dashboard...</p>;
  if (!data) return null;

  const chartData = data.salesOverTime.map((d) => ({
    date: d.date.slice(5), // MM-DD
    revenue: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sales" value={`$${data.revenue.toFixed(0)}`} />
        <StatCard label="Orders" value={String(data.orderCount)} />
        <StatCard
          label="Conversion"
          value={data.conversionRate !== null ? `${data.conversionRate}%` : '—'}
        />
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-4 text-sm font-bold text-text-primary">Sales Over Time (last 14 days)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748B" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#2F5DE0" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}