'use client';

import { Check, Package, Truck, Home, ClipboardCheck } from 'lucide-react';
import { clsx } from 'clsx';

const STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: ClipboardCheck },
  { key: 'PACKED', label: 'Packed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export function TrackingTimeline({ status }: { status: string }) {
  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div>
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isDone = i <= currentIndex;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  isDone ? 'bg-success text-white' : 'bg-border text-text-muted',
                )}
              >
                {isDone ? <Check size={16} /> : <Icon size={14} />}
              </div>
              {!isLast && (
                <div
                  className={clsx('w-0.5 flex-1', isDone ? 'bg-success' : 'bg-border')}
                  style={{ minHeight: 28 }}
                />
              )}
            </div>
            <div className={clsx('pb-7 pt-1 text-sm', isDone ? 'font-medium text-text-primary' : 'text-text-muted')}>
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}