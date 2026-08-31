'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'danger',
};

export default function AdminMerchantsPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();
    const { data: response, isLoading } = useQuery({ queryKey: ['admin-merchants'], queryFn: adminApi.listMerchants });
  const merchants = response?.data;

  const handleApprove = async (id: string) => {
    await adminApi.approveMerchant(id);
    queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
    show('Merchant approved');
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend this merchant? Their store will stop being visible to customers.')) return;
    await adminApi.suspendMerchant(id);
    queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
    show('Merchant suspended');
  };

  if (isLoading) return <p className="text-text-muted">Loading merchants...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Merchant Management</h1>

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-bg text-left text-xs text-text-muted">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {merchants?.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-text-primary">{m.name}</td>
                <td className="px-4 py-3">
                  <p className="text-text-primary">{m.sellerName}</p>
                  <p className="text-xs text-text-muted">{m.sellerEmail}</p>
                </td>
                <td className="px-4 py-3">{m.productCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">{new Date(m.joinedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {m.status !== 'ACTIVE' && (
                      <Button size="sm" onClick={() => handleApprove(m.id)}>Approve</Button>
                    )}
                    {m.status !== 'SUSPENDED' && (
                      <Button size="sm" variant="danger" onClick={() => handleSuspend(m.id)}>Suspend</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}