'use client';

import { useQuery } from '@tanstack/react-query';
import { sellerOrdersApi } from '@/lib/seller-api';
import { Badge } from '@/components/ui/badge';

const statusVariant: Record<string, 'success' | 'primary' | 'warning'> = {
  DELIVERED: 'success',
  OUT_FOR_DELIVERY: 'primary',
  SHIPPED: 'primary',
  PACKED: 'warning',
  CONFIRMED: 'warning',
};

export default function SellerOrdersPage() {
    const { data: response, isLoading } = useQuery({ queryKey: ['seller-orders'], queryFn: sellerOrdersApi.list });
  const orders = response?.data;

  if (isLoading) return <p className="text-text-muted">Loading orders...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Orders</h1>

      {orders?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          No orders yet.
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-bg text-left text-xs text-text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">COD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    #{o.orderId.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-text-primary">{o.customerName}</p>
                    <p className="text-xs text-text-muted">{o.city}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {o.items.map((i) => `${i.title} × ${i.qty}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">${o.total.toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[o.trackingStatus] ?? 'primary'}>
                      {o.trackingStatus.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {o.codCollected ? (
                      <Badge variant="success">Collected</Badge>
                    ) : (
                      <span className="text-xs text-text-muted">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}