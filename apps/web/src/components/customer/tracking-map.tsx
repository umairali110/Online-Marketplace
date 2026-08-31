'use client';

import { MapPin } from 'lucide-react';

const STAGES = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function TrackingMap({ status }: { status: string }) {
  const index = STAGES.indexOf(status);
  const progress = STAGES.length > 1 ? (Math.max(index, 0) / (STAGES.length - 1)) * 100 : 0;

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
        <span>Store</span>
        <span>Your address</span>
      </div>
      <div className="relative h-2 rounded-full bg-border">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute -top-2.5 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all duration-700"
          style={{ left: `${progress}%` }}
        >
          <MapPin size={14} />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-text-muted">
        Live tracking updates automatically as your order moves.
      </p>
    </div>
  );
}