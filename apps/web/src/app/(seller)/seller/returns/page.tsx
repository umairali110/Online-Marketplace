'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { returnsApi } from '@/lib/returns-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'primary'> = {
  REQUESTED: 'warning',
  APPROVED: 'primary',
  REJECTED: 'danger',
  COMPLETED: 'success',
};

export default function SellerReturnsPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { data: returns, isLoading } = useQuery({ queryKey: ['seller-returns'], queryFn: returnsApi.listForSeller });

  const handleUpdate = async (id: string, status: string) => {
    await returnsApi.updateStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ['seller-returns'] });
    show('Return updated');
  };

  if (isLoading) return <p className="text-text-muted">Loading returns...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Return Requests</h1>
      {returns?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">No return requests.</div>
      )}
      <div className="space-y-3">
        {returns?.map((r) => (
          <div key={r.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <p className="font-medium text-text-primary">{r.items.join(', ')}</p>
              <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-text-muted">{r.reason}</p>
            {r.status === 'REQUESTED' && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(r.id, 'APPROVED')}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleUpdate(r.id, 'REJECTED')}>Reject</Button>
              </div>
            )}
            {r.status === 'APPROVED' && (
              <Button size="sm" className="mt-3" onClick={() => handleUpdate(r.id, 'COMPLETED')}>Mark Completed</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}