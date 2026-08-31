'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ordersApi, Order } from '@/lib/orders-api';
import { useOrderTracking } from '@/hooks/use-order.tracking';
import { TrackingTimeline } from '@/components/customer/tracking-timeline';
import { TrackingMap } from '@/components/customer/tracking-map';
import { ReportIssueButton } from '@/components/customer/report-issue-button';
import { RequestReturnButton } from '@/components/customer/request-return-button';

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(id),
  });

  if (isLoading) return <p className="text-text-muted">Loading order...</p>;
  if (!data) return <p className="text-text-muted">Order not found.</p>;

  return <TrackingContent initialOrder={data} />;
}

function TrackingContent({ initialOrder }: { initialOrder: Order }) {
  const order = useOrderTracking(initialOrder);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <p className="text-sm text-text-muted">
          Placed on {new Date(order.createdAt).toLocaleDateString()} · Pay with Cash on Delivery
        </p>
      </div>

      {order.subOrders.map((so) => (
        <div
          key={so.id}
          className="grid grid-cols-1 gap-6 rounded-card border border-border bg-surface p-4 lg:grid-cols-[1fr_280px]"
        >
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-text-primary">{so.storeName}</h2>
              <Link href={`/store/${so.storeSlug}`} className="text-xs font-medium text-primary">
                Visit Store
              </Link>
            </div>

            <TrackingMap status={so.trackingStatus} />

            {so.trackingStatus === 'DELIVERED' && (
              <div className="mt-3 border-t border-border pt-3">
                <RequestReturnButton subOrderId={so.id} />
              </div>
            )}

            <div className="mt-4 space-y-2">
              {so.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-text-muted">
                  <span>{item.title} × {item.qty}</span>
                  <span>${(item.price * item.qty).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-text-primary">Status</h3>
            <TrackingTimeline status={so.trackingStatus} />
          </div>
        </div>
      ))}

      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Total (Cash on Delivery)</span>
          <span className="font-bold text-text-primary">${order.total.toFixed(0)}</span>
        </div>
        {order.couponDiscount > 0 && (
          <div className="mt-1 flex justify-between text-xs text-success">
            <span>Coupon ({order.couponCode})</span>
            <span>-${order.couponDiscount.toFixed(0)}</span>
          </div>
        )}
        {order.trustCoinsUsed > 0 && (
          <div className="mt-1 flex justify-between text-xs text-success">
            <span>TrustCoins used</span>
            <span>-${(order.trustCoinsUsed / 100).toFixed(2)}</span>
          </div>
        )}
        <p className="mt-1 text-xs text-text-muted">
          You earned {order.trustCoinsEarned} TrustCoins on this order.
        </p>
        <div className="mt-3 border-t border-border pt-3">
          <ReportIssueButton orderId={order.id} />
        </div>
      </div>
    </div>
  );
}