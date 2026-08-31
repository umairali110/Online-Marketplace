'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminApi } from '@/lib/admin-api';
import { StatCard } from '@/components/ui/stat-card';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.dashboardOverview });

  if (isLoading) return <p className="text-text-muted">Loading dashboard...</p>;
  if (!data) return null;

  const chartData = data.gmvOverTime.map((d) => ({ date: d.date.slice(5), gmv: d.gmv }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Platform Overview</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="GMV" value={`$${data.gmv.toFixed(0)}`} />
        <StatCard label="Active Merchants" value={String(data.activeMerchants)} />
        <StatCard label="Total Merchants" value={String(data.totalMerchants)} />
        <StatCard label="Total Customers" value={String(data.totalCustomers)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-bold text-text-primary">GMV Over Time (last 14 days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, 'GMV']} />
              <Line type="monotone" dataKey="gmv" stroke="#2F5DE0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-bold text-text-primary">Top Countries</h2>
          <div className="space-y-3">
            {data.topCountries.length === 0 && <p className="text-sm text-text-muted">No orders yet.</p>}
            {data.topCountries.map((c) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{c.country}</span>
                <div className="text-right">
                  <span className="font-medium text-text-primary">${c.gmv.toFixed(0)}</span>
                  <span className="ml-2 text-xs text-text-muted">{c.orders} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}