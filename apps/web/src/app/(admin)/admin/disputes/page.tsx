'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { VirtualList } from '@/components/shared/virtual-list';

const tabs = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;
const statusVariant: Record<string, 'warning' | 'primary' | 'success'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'primary',
  RESOLVED: 'success',
};

export default function AdminDisputesPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('OPEN');
  const queryClient = useQueryClient();
  const { show } = useToast();

    const { data: response, isLoading } = useQuery({
    queryKey: ['admin-disputes', tab],
    queryFn: () => adminApi.listDisputes(tab),
  });
  const disputes = response?.data;

  const advance = async (id: string, status: string) => {
    await adminApi.updateDisputeStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    show('Dispute updated');
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Dispute Management</h1>

      <div className="mb-4 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-text-muted'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-text-muted">Loading disputes...</p>}

      {!isLoading && disputes?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          No {tab.toLowerCase().replace('_', ' ')} disputes.
        </div>
      )}

            {disputes && disputes.length > 0 && (
        <VirtualList
          items={disputes}
          estimateSize={160}
          height={Math.min(700, disputes.length * 160)}
          renderItem={(d) => (
            <div className="pb-3">
              <div className="rounded-card border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-text-primary">
                      Order #{d.orderId.slice(-8).toUpperCase()} — ${d.orderTotal.toFixed(0)}
                    </p>
                    <p className="text-xs text-text-muted">{d.customerName} · {d.customerEmail}</p>
                  </div>
                  <Badge variant={statusVariant[d.status]}>{d.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-2 text-sm text-text-muted">{d.reason}</p>
                <div className="mt-3 flex gap-2">
                  {d.status === 'OPEN' && <Button size="sm" onClick={() => advance(d.id, 'IN_PROGRESS')}>Start Reviewing</Button>}
                  {d.status === 'IN_PROGRESS' && <Button size="sm" onClick={() => advance(d.id, 'RESOLVED')}>Mark Resolved</Button>}
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}