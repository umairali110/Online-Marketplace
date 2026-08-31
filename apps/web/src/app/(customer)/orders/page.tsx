'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/orders-api';
import { Badge } from '@/components/ui/badge';

const statusVariant: Record<string, 'success' | 'primary' | 'warning'> = {
  DELIVERED: 'success',
  OUT_FOR_DELIVERY: 'primary',
  SHIPPED: 'primary',
  PACKED: 'warning',
  CONFIRMED: 'warning',
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.list });

  if (isLoading) return <p className="text-text-muted">Loading orders...</p>;

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="text-text-muted">You haven&apos;t placed any orders yet.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">My Orders</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}/track`}
          className="block rounded-card border border-border bg-surface p-4 hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-text-muted">
                {new Date(order.createdAt).toLocaleDateString()} · {order.subOrders.length} store
                {order.subOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-text-primary">${order.total.toFixed(0)}</span>
              {order.subOrders[0] && (
                <Badge variant={statusVariant[order.subOrders[0].trackingStatus] ?? 'primary'}>
                  {order.subOrders[0].trackingStatus.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}