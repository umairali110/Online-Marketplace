'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function AdminCommissionsPage() {
  const [tab, setTab] = useState<'products' | 'services'>('products');
  const queryClient = useQueryClient();
  const { show } = useToast();

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: adminApi.commissionsOverview,
  });
  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['admin-service-commissions'],
    queryFn: adminApi.serviceCommissionsOverview,
  });

  const handleSettleProduct = async (storeId: string) => {
    await adminApi.settleCommission(storeId);
    queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
    show('Marked as settled');
  };

  const handleSettleService = async (providerId: string) => {
    await adminApi.settleServiceCommission(providerId);
    queryClient.invalidateQueries({ queryKey: ['admin-service-commissions'] });
    show('Marked as settled');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Payouts & Settlements</h1>
      <p className="text-sm text-text-muted">
        Cash on Delivery / direct payment means merchants and providers collect payment
        directly — this tracks the platform commission they owe back.
      </p>

      <div className="flex gap-1 border-b border-border">
        {(['products', 'services'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <>
          {productLoading && <p className="text-text-muted">Loading...</p>}
          {productData && (
            <>
              <StatCard label="Total Commission Owed (Products)" value={`$${productData.totalOwed.toFixed(0)}`} />
              <div className="overflow-hidden rounded-card border border-border bg-surface">
                <table className="w-full text-sm">
                  <thead className="bg-bg text-left text-xs text-text-muted">
                    <tr><th className="px-4 py-3">Store</th><th className="px-4 py-3">Owed</th><th className="px-4 py-3">Settled</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productData.byStore.map((s) => (
                      <tr key={s.storeId}>
                        <td className="px-4 py-3 font-medium text-text-primary">{s.storeName}</td>
                        <td className="px-4 py-3">${s.owed.toFixed(0)}</td>
                        <td className="px-4 py-3 text-text-muted">${s.settled.toFixed(0)}</td>
                        <td className="px-4 py-3">
                          {s.owed > 0 && <Button size="sm" onClick={() => handleSettleProduct(s.storeId)}>Mark Settled</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'services' && (
        <>
          {serviceLoading && <p className="text-text-muted">Loading...</p>}
          {serviceData && (
            <>
              <StatCard label="Total Commission Owed (Services)" value={`$${serviceData.totalOwed.toFixed(0)}`} />
              {serviceData.byProvider.length === 0 && (
                <p className="text-sm text-text-muted">No service commissions yet — these accrue when a job with a budget gets accepted or direct-hired.</p>
              )}
              {serviceData.byProvider.length > 0 && (
                <div className="overflow-hidden rounded-card border border-border bg-surface">
                  <table className="w-full text-sm">
                    <thead className="bg-bg text-left text-xs text-text-muted">
                      <tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Owed</th><th className="px-4 py-3">Settled</th><th className="px-4 py-3">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {serviceData.byProvider.map((p) => (
                        <tr key={p.providerId}>
                          <td className="px-4 py-3 font-medium text-text-primary">{p.providerName}</td>
                          <td className="px-4 py-3">${p.owed.toFixed(0)}</td>
                          <td className="px-4 py-3 text-text-muted">${p.settled.toFixed(0)}</td>
                          <td className="px-4 py-3">
                            {p.owed > 0 && <Button size="sm" onClick={() => handleSettleService(p.providerId)}>Mark Settled</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}