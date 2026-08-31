'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function AdminProvidersPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { data: providers, isLoading } = useQuery({ queryKey: ['admin-providers'], queryFn: adminApi.listProviders });

  const handleVerify = async (id: string, verified: boolean) => {
    if (verified) await adminApi.unverifyProvider(id);
    else await adminApi.verifyProvider(id);
    queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
    show(verified ? 'Provider unverified' : 'Provider verified');
  };

  if (isLoading) return <p className="text-text-muted">Loading providers...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Service Providers</h1>
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-bg text-left text-xs text-text-muted">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {providers?.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.email}</p>
                </td>
                <td className="px-4 py-3 text-text-muted">{p.city}, {p.country}</td>
                <td className="px-4 py-3 text-text-muted">{p.categories.join(', ')}</td>
                <td className="px-4 py-3">{p.ratingAvg > 0 ? p.ratingAvg.toFixed(1) : '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.verified ? 'success' : 'warning'}>{p.verified ? 'Verified' : 'Unverified'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant={p.verified ? 'outline' : 'primary'} onClick={() => handleVerify(p.id, p.verified)}>
                    {p.verified ? 'Unverify' : 'Verify'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}